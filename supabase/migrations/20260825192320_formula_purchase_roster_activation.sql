-- Continuously reconcile clean attendee purchases into the Formula 2026 roster.
-- Ambiguous purchases remain review-only; no partner or unnamed seats are
-- auto-enrolled. Verified Firebase users are linked by a separate scoped RPC.

insert into public.formula_events (
  id, slug, display_name, starts_at, ends_at, timezone, state,
  registry_version, registry_hash, capture_write_from, capture_write_until,
  dashboard_read_until
) values (
  'formula-2026',
  'w26',
  'Formula 2026',
  '2026-10-14 08:00:00-04'::timestamptz,
  '2026-10-16 23:00:00-04'::timestamptz,
  'America/New_York',
  'active',
  1,
  'e848e7a952badb1e1c072fc81050cafafca597ea45189f91cf30645fcfc5e404',
  '2026-08-25 00:00:00-04'::timestamptz,
  '2026-10-31 23:59:59-04'::timestamptz,
  '2026-12-31 23:59:59-05'::timestamptz
)
on conflict (id) do nothing;

do $block$
declare
  event_record public.formula_events%rowtype;
begin
  select * into event_record from public.formula_events where id = 'formula-2026';
  if event_record.registry_version <> 1
     or event_record.registry_hash <> 'e848e7a952badb1e1c072fc81050cafafca597ea45189f91cf30645fcfc5e404' then
    raise exception using errcode = '23514', message = 'formula_2026_registry_mismatch';
  end if;
end;
$block$;

create or replace function formula_private.reconcile_formula_purchase(
  p_purchase_id uuid
)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $function$
declare
  purchase_record public.purchases%rowtype;
  source_record public.formula_registration_sources%rowtype;
  registration_record public.formula_event_registrations%rowtype;
  entitlement_record public.formula_entitlements%rowtype;
  member_id_value uuid;
  agency_id_value uuid;
  normalized_email_value text;
  invited_name_value text;
  payload_hash_value text;
  email_hash_value text;
  reconciliation_state_value text;
  event_role_value text;
  membership_role_value text;
  identity_subject_value text;
  is_owner boolean;
  membership_exists boolean;
begin
  select * into purchase_record
    from public.purchases
   where id = p_purchase_id;

  if not found then
    return 'purchase_not_found';
  end if;
  if purchase_record.pass_type = 'partner' then
    return 'partner_purchase_ignored';
  end if;

  invited_name_value := nullif(btrim(purchase_record.name), '');
  normalized_email_value := lower(nullif(btrim(purchase_record.email), ''));
  payload_hash_value := encode(
    extensions.digest(
      convert_to(jsonb_build_object(
        'id', purchase_record.id,
        'email', purchase_record.email,
        'name', purchase_record.name,
        'quantity', purchase_record.quantity,
        'passType', purchase_record.pass_type,
        'tier', purchase_record.tier,
        'createdAt', purchase_record.created_at
      )::text, 'UTF8'),
      'sha256'
    ),
    'hex'
  );

  reconciliation_state_value := case
    when greatest(coalesce(purchase_record.quantity, 0), 0) <> 1 then 'quantity_without_names'
    when invited_name_value is null then 'quantity_without_names'
    when normalized_email_value is null then 'missing_email'
    when normalized_email_value !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then 'missing_email'
    when purchase_record.pass_type not in ('agencyOwner', 'team') then 'unclassified_pass_type'
    else 'named_ready'
  end;

  select * into source_record
    from public.formula_registration_sources
   where event_id = 'formula-2026'
     and source_type = 'purchase'
     and source_id = purchase_record.id::text
     and source_ordinal = 1;

  if found and source_record.registration_id is not null then
    if source_record.source_payload_hash <> payload_hash_value then
      update public.formula_registration_sources
         set reconciliation_state = 'manual_review',
             review_reason = 'source_changed_after_registration',
             updated_at = now()
       where id = source_record.id;
      return 'manual_review';
    end if;
    return 'already_registered';
  end if;

  insert into public.formula_registration_sources (
    event_id, source_type, source_id, source_ordinal, source_payload_hash,
    invited_name, invited_email, normalized_email, reconciliation_state,
    review_reason
  ) values (
    'formula-2026', 'purchase', purchase_record.id::text, 1,
    payload_hash_value, invited_name_value, purchase_record.email,
    normalized_email_value, reconciliation_state_value,
    case
      when reconciliation_state_value = 'named_ready' then null
      when reconciliation_state_value = 'missing_email'
        and normalized_email_value is not null then 'invalid_email'
      else reconciliation_state_value
    end
  )
  on conflict (event_id, source_type, source_id, source_ordinal) do update
    set source_payload_hash = excluded.source_payload_hash,
        invited_name = excluded.invited_name,
        invited_email = excluded.invited_email,
        normalized_email = excluded.normalized_email,
        reconciliation_state = excluded.reconciliation_state,
        review_reason = excluded.review_reason,
        updated_at = now()
  returning * into source_record;

  if reconciliation_state_value <> 'named_ready' then
    return reconciliation_state_value;
  end if;

  perform pg_advisory_xact_lock(hashtextextended('formula-email:' || normalized_email_value, 0));

  select e.member_id into member_id_value
    from public.formula_member_emails e
    join public.formula_members m on m.id = e.member_id
   where e.normalized_email = normalized_email_value
     and e.state = 'verified'
     and m.status = 'active';

  if member_id_value is null then
    insert into public.formula_members default values returning id into member_id_value;
    insert into public.formula_member_emails (
      member_id, original_email, normalized_email, state, is_primary,
      verified_at, source_type, source_id
    ) values (
      member_id_value, purchase_record.email, normalized_email_value,
      'verified', true, now(), 'purchase', purchase_record.id::text
    );
  end if;

  select membership.agency_id into agency_id_value
    from public.formula_agency_memberships membership
    join public.formula_agencies agency on agency.id = membership.agency_id
   where membership.member_id = member_id_value
     and membership.state = 'confirmed'
     and membership.is_primary
     and agency.status = 'active'
   order by membership.created_at
   limit 1;

  email_hash_value := encode(
    extensions.digest(convert_to(normalized_email_value, 'UTF8'), 'sha256'),
    'hex'
  );
  if agency_id_value is null then
    insert into public.formula_agencies (
      kind, display_name, source_type, source_id
    ) values (
      'solo', invited_name_value || ' Formula Workspace',
      'purchase_email_sha256', email_hash_value
    )
    on conflict (source_type, source_id) do update
      set display_name = excluded.display_name,
          updated_at = now()
    returning id into agency_id_value;
  end if;

  is_owner := purchase_record.pass_type = 'agencyOwner';
  membership_role_value := case when is_owner then 'owner' else 'member' end;
  event_role_value := case when is_owner then 'agency_owner' else 'team_member' end;

  select exists (
    select 1 from public.formula_agency_memberships membership
     where membership.agency_id = agency_id_value
       and membership.member_id = member_id_value
       and membership.state = 'confirmed'
       and membership.is_primary
  ) into membership_exists;

  if membership_exists then
    update public.formula_agency_memberships
       set membership_role = case
             when membership_role = 'owner' or is_owner then 'owner'
             else 'member'
           end,
           updated_at = now()
     where agency_id = agency_id_value
       and member_id = member_id_value
       and state = 'confirmed'
       and is_primary;
  else
    insert into public.formula_agency_memberships (
      agency_id, member_id, membership_role, state, is_primary,
      source_type, source_id
    ) values (
      agency_id_value, member_id_value, membership_role_value,
      'confirmed', true, 'purchase', purchase_record.id::text
    );
  end if;

  select * into registration_record
    from public.formula_event_registrations registration
   where registration.event_id = 'formula-2026'
     and registration.member_id = member_id_value
     and registration.registration_state in ('invited', 'claimed', 'checked_in')
   order by registration.created_at
   limit 1;

  if not found then
    insert into public.formula_event_registrations (
      event_id, member_id, agency_id, source_record_id, invited_name,
      invited_email, normalized_email, seat_type, event_role
    ) values (
      'formula-2026', member_id_value, agency_id_value, source_record.id,
      invited_name_value, purchase_record.email, normalized_email_value,
      purchase_record.pass_type, event_role_value
    ) returning * into registration_record;
  elsif is_owner and registration_record.event_role <> 'agency_owner' then
    update public.formula_event_registrations
       set agency_id = agency_id_value,
           seat_type = 'agencyOwner',
           event_role = 'agency_owner',
           updated_at = now()
     where id = registration_record.id
     returning * into registration_record;
  end if;

  update public.formula_registration_sources
     set registration_id = registration_record.id,
         reconciliation_state = case
           when source_record.id = registration_record.source_record_id then 'resolved'
           else 'already_registered'
         end,
         review_reason = null,
         updated_at = now()
   where id = source_record.id;

  select * into entitlement_record
    from public.formula_entitlements entitlement
   where entitlement.event_registration_id = registration_record.id;

  if not found then
    insert into public.formula_entitlements (
      event_registration_id, access_state, personal_module_slugs,
      agency_business_module_slugs, publisher_module_slugs,
      event_attendance_allowed, ai_capture_allowed, dashboard_read_allowed,
      partner_hub_allowed, capture_write_from, capture_write_until,
      dashboard_read_until, projection_version
    ) values (
      registration_record.id, 'active', array['map','s3','s6','s8']::text[],
      array['s1','s2','s4','s5','s7']::text[],
      case when is_owner then array['s1','s2','s4','s5','s7']::text[] else array[]::text[] end,
      true, true, true, true,
      '2026-08-25 00:00:00-04'::timestamptz,
      '2026-10-31 23:59:59-04'::timestamptz,
      '2026-12-31 23:59:59-05'::timestamptz,
      1
    ) returning * into entitlement_record;
  elsif is_owner and cardinality(entitlement_record.publisher_module_slugs) = 0 then
    update public.formula_entitlements
       set publisher_module_slugs = array['s1','s2','s4','s5','s7']::text[],
           projection_version = projection_version + 1,
           updated_at = now()
     where id = entitlement_record.id
     returning * into entitlement_record;
  end if;

  select identity.provider_subject into identity_subject_value
    from public.formula_auth_identities identity
   where identity.member_id = member_id_value
     and identity.provider = 'firebase'
     and identity.link_state = 'active';

  if identity_subject_value is not null then
    update public.formula_event_registrations
       set registration_state = case when registration_state = 'checked_in' then 'checked_in' else 'claimed' end,
           claim_state = 'active',
           claimed_at = coalesce(claimed_at, now()),
           updated_at = now()
     where id = registration_record.id;
    perform formula_private.enqueue_event_access_projection(registration_record.id);
  end if;

  return case when source_record.id = registration_record.source_record_id
              then 'registered' else 'consolidated' end;
end;
$function$;

create or replace function formula_private.reconcile_formula_purchase_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  perform formula_private.reconcile_formula_purchase(new.id);
  return new;
end;
$function$;

drop trigger if exists formula_purchase_roster_reconcile on public.purchases;
create trigger formula_purchase_roster_reconcile
after insert or update of email, name, quantity, pass_type, tier
on public.purchases
for each row execute function formula_private.reconcile_formula_purchase_trigger();

create or replace function public.formula_bridge_link_firebase_identity(
  p_integration_secret text,
  p_firebase_uid text,
  p_email text,
  p_email_verified boolean
)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $function$
declare
  normalized_email_value text;
  member_id_value uuid;
  existing_identity record;
  registration_record record;
  linked_count integer := 0;
  identity_was_existing boolean := false;
begin
  perform formula_private.verify_projection_bridge_secret(p_integration_secret);

  if p_email_verified is not true then
    return 'email_unverified';
  end if;
  if p_firebase_uid is null or char_length(btrim(p_firebase_uid)) not between 1 and 128 then
    raise exception using errcode = '22023', message = 'formula_firebase_uid_invalid';
  end if;
  normalized_email_value := lower(nullif(btrim(p_email), ''));
  if normalized_email_value is null or char_length(normalized_email_value) > 320 then
    raise exception using errcode = '22023', message = 'formula_email_invalid';
  end if;
  if normalized_email_value !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = '22023', message = 'formula_email_invalid';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('formula-email:' || normalized_email_value, 0));
  perform pg_advisory_xact_lock(hashtextextended('formula-uid:' || p_firebase_uid, 0));

  select email.member_id into member_id_value
    from public.formula_member_emails email
    join public.formula_members member on member.id = email.member_id
   where email.normalized_email = normalized_email_value
     and email.state = 'verified'
     and member.status = 'active';

  if member_id_value is null then
    return 'not_eligible';
  end if;

  select identity.member_id, identity.provider_subject into existing_identity
    from public.formula_auth_identities identity
   where identity.provider = 'firebase'
     and identity.link_state = 'active'
     and (identity.provider_subject = p_firebase_uid or identity.member_id = member_id_value)
   order by identity.created_at
   limit 1;

  if found and (existing_identity.member_id <> member_id_value
      or existing_identity.provider_subject <> p_firebase_uid) then
    return 'identity_conflict';
  end if;

  identity_was_existing := found;
  if not identity_was_existing then
    insert into public.formula_auth_identities (
      member_id, provider, provider_subject, link_state, linked_at
    ) values (
      member_id_value, 'firebase', p_firebase_uid, 'active', now()
    );
  end if;

  for registration_record in
    select registration.id
      from public.formula_event_registrations registration
     where registration.event_id = 'formula-2026'
       and registration.member_id = member_id_value
       and registration.registration_state in ('invited', 'claimed', 'checked_in')
     order by registration.created_at
  loop
    update public.formula_event_registrations
       set registration_state = case when registration_state = 'checked_in' then 'checked_in' else 'claimed' end,
           claim_state = 'active',
           claimed_at = coalesce(claimed_at, now()),
           updated_at = now()
     where id = registration_record.id
       and (registration_state = 'invited' or claim_state <> 'active' or claimed_at is null);

    update public.formula_entitlements
       set access_state = 'active',
           event_attendance_allowed = true,
           ai_capture_allowed = true,
           dashboard_read_allowed = true,
           partner_hub_allowed = true,
           projection_version = projection_version + 1,
           updated_at = now()
     where event_registration_id = registration_record.id
       and (
         access_state <> 'active'
         or not event_attendance_allowed
         or not ai_capture_allowed
         or not dashboard_read_allowed
         or not partner_hub_allowed
       );

    perform formula_private.enqueue_event_access_projection(registration_record.id);
    linked_count := linked_count + 1;
  end loop;

  if linked_count = 0 then
    return 'not_eligible';
  end if;
  return case when identity_was_existing then 'existing' else 'linked' end;
end;
$function$;

revoke all on function formula_private.reconcile_formula_purchase(uuid)
  from public, anon, authenticated;
revoke all on function formula_private.reconcile_formula_purchase_trigger()
  from public, anon, authenticated;
grant execute on function formula_private.reconcile_formula_purchase(uuid)
  to service_role;

revoke execute on function public.formula_bridge_link_firebase_identity(text, text, text, boolean)
  from public, authenticated;
grant execute on function public.formula_bridge_link_firebase_identity(text, text, text, boolean)
  to anon, service_role;

do $block$
declare
  purchase_id_value uuid;
begin
  for purchase_id_value in
    select id from public.purchases order by created_at, id
  loop
    perform formula_private.reconcile_formula_purchase(purchase_id_value);
  end loop;
end;
$block$;
