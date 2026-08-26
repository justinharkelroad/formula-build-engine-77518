-- Admin-only Formula 2026 roster management.
--
-- Historical multi-seat purchases remain financial source records. Admins may
-- assign each purchased seat by ordinal, or create a clearly labeled manual
-- registration for complimentary/imported attendees. All mutations are
-- service-role-only and emit bounded, PII-free audit events.

create or replace function public.formula_admin_upsert_attendee(
  p_actor_id text,
  p_name text,
  p_email text,
  p_seat_type text,
  p_registration_id uuid default null,
  p_agency_id uuid default null,
  p_agency_display_name text default null,
  p_purchase_id uuid default null,
  p_source_ordinal integer default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $function$
declare
  v_name text := nullif(btrim(p_name), '');
  v_email text := nullif(btrim(p_email), '');
  v_normalized_email text := lower(nullif(btrim(p_email), ''));
  v_agency_name text := nullif(btrim(p_agency_display_name), '');
  v_source_type text;
  v_source_id text;
  v_source_ordinal integer;
  v_source_hash text;
  v_member_id uuid;
  v_agency_id uuid;
  v_registration public.formula_event_registrations%rowtype;
  v_source public.formula_registration_sources%rowtype;
  v_purchase public.purchases%rowtype;
  v_entitlement public.formula_entitlements%rowtype;
  v_identity_subject text;
  v_existing_registration_id uuid;
  v_email_owner uuid;
  v_membership_id uuid;
  v_is_owner boolean;
  v_correlation_id uuid := gen_random_uuid();
  v_result text;
begin
  if p_actor_id is null
     or p_actor_id <> btrim(p_actor_id)
     or char_length(p_actor_id) not between 1 and 128 then
    raise exception using errcode = '22023', message = 'formula_admin_actor_invalid';
  end if;
  if v_name is null or char_length(v_name) > 200 then
    raise exception using errcode = '22023', message = 'formula_attendee_name_invalid';
  end if;
  if v_normalized_email is null
     or char_length(v_normalized_email) > 320
     or v_normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = '22023', message = 'formula_attendee_email_invalid';
  end if;
  if p_seat_type not in ('agencyOwner', 'team') then
    raise exception using errcode = '22023', message = 'formula_attendee_seat_type_invalid';
  end if;
  if v_agency_name is not null and char_length(v_agency_name) > 200 then
    raise exception using errcode = '22023', message = 'formula_agency_name_invalid';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('formula-email:' || v_normalized_email, 0));

  if p_registration_id is not null then
    select registration.* into v_registration
      from public.formula_event_registrations registration
     where registration.id = p_registration_id
       and registration.event_id = 'formula-2026'
     for update;
    if not found then
      raise exception using errcode = 'P0001', message = 'formula_attendee_registration_not_found';
    end if;
    if v_registration.registration_state = 'revoked' then
      raise exception using errcode = 'P0001', message = 'formula_attendee_registration_revoked';
    end if;

    select source.* into v_source
      from public.formula_registration_sources source
     where source.id = v_registration.source_record_id
     for update;
    v_member_id := v_registration.member_id;
    v_source_type := v_source.source_type;
    v_source_id := v_source.source_id;
    v_source_ordinal := v_source.source_ordinal;
    v_source_hash := v_source.source_payload_hash;
    v_result := 'updated';
  else
    if p_purchase_id is not null then
      select purchase.* into v_purchase
        from public.purchases purchase
       where purchase.id = p_purchase_id
       for share;
      if not found or v_purchase.pass_type = 'partner' then
        raise exception using errcode = '22023', message = 'formula_purchase_not_assignable';
      end if;
      if v_purchase.pass_type not in ('agencyOwner', 'team')
         or v_purchase.pass_type <> p_seat_type then
        raise exception using errcode = '22023', message = 'formula_purchase_seat_type_mismatch';
      end if;

      v_source_ordinal := coalesce(p_source_ordinal, 1);
      if v_source_ordinal < 1
         or v_source_ordinal > greatest(coalesce(v_purchase.quantity, 0), 0) then
        raise exception using errcode = '22023', message = 'formula_purchase_seat_ordinal_invalid';
      end if;

      v_source_type := 'purchase';
      v_source_id := v_purchase.id::text;
      v_source_hash := encode(
        extensions.digest(
          convert_to(jsonb_build_object(
            'id', v_purchase.id,
            'email', v_purchase.email,
            'name', v_purchase.name,
            'quantity', v_purchase.quantity,
            'passType', v_purchase.pass_type,
            'tier', v_purchase.tier,
            'createdAt', v_purchase.created_at
          )::text, 'UTF8'),
          'sha256'
        ),
        'hex'
      );

      select source.* into v_source
        from public.formula_registration_sources source
       where source.event_id = 'formula-2026'
         and source.source_type = v_source_type
         and source.source_id = v_source_id
         and source.source_ordinal = v_source_ordinal
       for update;
      if found and v_source.registration_id is not null then
        raise exception using errcode = 'P0001', message = 'formula_purchase_seat_already_assigned';
      end if;
    else
      if p_source_ordinal is not null then
        raise exception using errcode = '22023', message = 'formula_manual_source_ordinal_invalid';
      end if;
      v_source_type := 'manual';
      v_source_id := 'manual:' || gen_random_uuid()::text;
      v_source_ordinal := 1;
      v_source_hash := encode(
        extensions.digest(
          convert_to(jsonb_build_object(
            'name', v_name,
            'email', v_normalized_email,
            'seatType', p_seat_type,
            'agencyId', p_agency_id,
            'agencyName', v_agency_name
          )::text, 'UTF8'),
          'sha256'
        ),
        'hex'
      );
    end if;

    select email.member_id into v_member_id
      from public.formula_member_emails email
      join public.formula_members member on member.id = email.member_id
     where email.normalized_email = v_normalized_email
       and email.state = 'verified'
       and member.status = 'active';

    if v_member_id is not null then
      select registration.id into v_existing_registration_id
        from public.formula_event_registrations registration
       where registration.event_id = 'formula-2026'
         and registration.member_id = v_member_id
       order by registration.created_at
       limit 1;
      if v_existing_registration_id is not null then
        raise exception using errcode = 'P0001', message = 'formula_attendee_email_already_registered';
      end if;
    else
      insert into public.formula_members default values returning id into v_member_id;
      insert into public.formula_member_emails (
        member_id, original_email, normalized_email, state, is_primary,
        verified_at, source_type, source_id
      ) values (
        v_member_id, v_email, v_normalized_email, 'verified', true,
        now(), v_source_type, v_source_id
      );
    end if;

    insert into public.formula_registration_sources (
      event_id, source_type, source_id, source_ordinal, source_payload_hash,
      invited_name, invited_email, normalized_email, reconciliation_state,
      review_reason
    ) values (
      'formula-2026', v_source_type, v_source_id, v_source_ordinal, v_source_hash,
      v_name, v_email, v_normalized_email, 'named_ready',
      case when v_source_type = 'manual' then 'admin_manual_entry' else 'admin_seat_assignment' end
    )
    on conflict (event_id, source_type, source_id, source_ordinal) do update
      set source_payload_hash = excluded.source_payload_hash,
          invited_name = excluded.invited_name,
          invited_email = excluded.invited_email,
          normalized_email = excluded.normalized_email,
          reconciliation_state = 'named_ready',
          review_reason = excluded.review_reason,
          updated_at = now()
      where public.formula_registration_sources.registration_id is null
    returning * into v_source;

    if v_source.id is null then
      raise exception using errcode = 'P0001', message = 'formula_purchase_seat_already_assigned';
    end if;
    v_result := case when v_source_type = 'purchase' then 'seat_assigned' else 'manual_added' end;
  end if;

  -- Email edits are safe for the Formula roster. Existing Firebase identities
  -- remain linked by UID; unlinked members will match this new address later.
  select email.member_id into v_email_owner
    from public.formula_member_emails email
   where email.normalized_email = v_normalized_email
     and email.state = 'verified'
     and email.member_id <> v_member_id;
  if v_email_owner is not null then
    raise exception using errcode = '23505', message = 'formula_attendee_email_in_use';
  end if;

  if not exists (
    select 1 from public.formula_member_emails email
     where email.member_id = v_member_id
       and email.normalized_email = v_normalized_email
       and email.state = 'verified'
       and email.is_primary
  ) then
    update public.formula_member_emails
       set state = 'revoked', is_primary = false, verified_at = null, updated_at = now()
     where member_id = v_member_id
       and state = 'verified'
       and is_primary;
    insert into public.formula_member_emails (
      member_id, original_email, normalized_email, state, is_primary,
      verified_at, source_type, source_id
    ) values (
      v_member_id, v_email, v_normalized_email, 'verified', true,
      now(), 'manual', 'admin-edit:' || coalesce(p_registration_id::text, v_source.id::text)
    );
  end if;

  if p_agency_id is not null then
    select agency.id into v_agency_id
      from public.formula_agencies agency
     where agency.id = p_agency_id and agency.status = 'active';
    if v_agency_id is null then
      raise exception using errcode = '22023', message = 'formula_agency_not_found';
    end if;
  elsif v_agency_name is not null then
    select agency.id into v_agency_id
      from public.formula_agencies agency
     where lower(btrim(agency.display_name)) = lower(v_agency_name)
       and agency.status = 'active'
     order by agency.kind = 'standard' desc, agency.created_at
     limit 1;
    if v_agency_id is null then
      insert into public.formula_agencies (
        kind, display_name, source_type, source_id
      ) values (
        'standard', v_agency_name, 'manual',
        'admin-agency:' || encode(
          extensions.digest(convert_to(lower(v_agency_name), 'UTF8'), 'sha256'),
          'hex'
        )
      )
      on conflict (source_type, source_id) do update
        set display_name = excluded.display_name, status = 'active', updated_at = now()
      returning id into v_agency_id;
    end if;
  elsif p_registration_id is not null and v_registration.agency_id is not null then
    v_agency_id := v_registration.agency_id;
  else
    select membership.agency_id into v_agency_id
      from public.formula_agency_memberships membership
      join public.formula_agencies agency on agency.id = membership.agency_id
     where membership.member_id = v_member_id
       and membership.state = 'confirmed'
       and membership.is_primary
       and agency.status = 'active'
     order by membership.created_at
     limit 1;
  end if;

  if v_agency_id is null then
    insert into public.formula_agencies (
      kind, display_name, source_type, source_id
    ) values (
      'solo', v_name || ' Formula Workspace', 'manual_email_sha256',
      encode(extensions.digest(convert_to(v_normalized_email, 'UTF8'), 'sha256'), 'hex')
    )
    on conflict (source_type, source_id) do update
      set display_name = excluded.display_name, status = 'active', updated_at = now()
    returning id into v_agency_id;
  end if;

  v_is_owner := p_seat_type = 'agencyOwner';

  update public.formula_agency_memberships
     set is_primary = false, updated_at = now()
   where member_id = v_member_id
     and state = 'confirmed'
     and is_primary;

  select membership.id into v_membership_id
    from public.formula_agency_memberships membership
   where membership.member_id = v_member_id
     and membership.agency_id = v_agency_id
   order by membership.created_at
   limit 1;

  if v_membership_id is null then
    insert into public.formula_agency_memberships (
      agency_id, member_id, membership_role, state, is_primary,
      source_type, source_id
    ) values (
      v_agency_id, v_member_id,
      case when v_is_owner then 'owner' else 'member' end,
      'confirmed', true, v_source_type, v_source_id
    ) returning id into v_membership_id;
  else
    update public.formula_agency_memberships
       set membership_role = case when v_is_owner then 'owner' else 'member' end,
           state = 'confirmed', is_primary = true, updated_at = now()
     where id = v_membership_id;
  end if;

  select identity.provider_subject into v_identity_subject
    from public.formula_auth_identities identity
   where identity.member_id = v_member_id
     and identity.provider = 'firebase'
     and identity.link_state = 'active';

  if p_registration_id is null then
    insert into public.formula_event_registrations (
      event_id, member_id, agency_id, source_record_id, invited_name,
      invited_email, normalized_email, seat_type, event_role,
      registration_state, claim_state, claimed_at
    ) values (
      'formula-2026', v_member_id, v_agency_id, v_source.id, v_name,
      v_email, v_normalized_email, p_seat_type,
      case when v_is_owner then 'agency_owner' else 'team_member' end,
      case when v_identity_subject is null then 'invited' else 'claimed' end,
      case when v_identity_subject is null then 'unclaimed' else 'active' end,
      case when v_identity_subject is null then null else now() end
    ) returning * into v_registration;
  else
    update public.formula_event_registrations
       set agency_id = v_agency_id,
           invited_name = v_name,
           invited_email = v_email,
           normalized_email = v_normalized_email,
           seat_type = p_seat_type,
           event_role = case when v_is_owner then 'agency_owner' else 'team_member' end,
           registration_state = case
             when registration_state = 'suspended' then 'suspended'
             when v_identity_subject is not null then 'claimed'
             else 'invited'
           end,
           claim_state = case
             when registration_state = 'suspended' then claim_state
             when v_identity_subject is not null then 'active'
             else 'unclaimed'
           end,
           claimed_at = case
             when v_identity_subject is not null then coalesce(claimed_at, now())
             else claimed_at
           end,
           updated_at = now()
     where id = p_registration_id
     returning * into v_registration;
  end if;

  update public.formula_registration_sources
     set invited_name = v_name,
         invited_email = v_email,
         normalized_email = v_normalized_email,
         registration_id = v_registration.id,
         reconciliation_state = 'resolved',
         review_reason = null,
         updated_at = now()
   where id = v_source.id;

  select entitlement.* into v_entitlement
    from public.formula_entitlements entitlement
   where entitlement.event_registration_id = v_registration.id
   for update;

  if not found then
    insert into public.formula_entitlements (
      event_registration_id, access_state, personal_module_slugs,
      agency_business_module_slugs, publisher_module_slugs,
      event_attendance_allowed, ai_capture_allowed, dashboard_read_allowed,
      partner_hub_allowed, capture_write_from, capture_write_until,
      dashboard_read_until, projection_version
    ) values (
      v_registration.id, 'active', array['map','s3','s6','s8']::text[],
      array['s1','s2','s4','s5','s7']::text[],
      case when v_is_owner then array['s1','s2','s4','s5','s7']::text[] else array[]::text[] end,
      true, true, true, true,
      '2026-08-25 00:00:00-04'::timestamptz,
      '2026-10-31 23:59:59-04'::timestamptz,
      '2026-12-31 23:59:59-05'::timestamptz,
      1
    ) returning * into v_entitlement;
  else
    update public.formula_entitlements
       set personal_module_slugs = array['map','s3','s6','s8']::text[],
           agency_business_module_slugs = array['s1','s2','s4','s5','s7']::text[],
           publisher_module_slugs = case
             when v_is_owner then array['s1','s2','s4','s5','s7']::text[]
             else array[]::text[]
           end,
           event_attendance_allowed = true,
           ai_capture_allowed = true,
           dashboard_read_allowed = true,
           partner_hub_allowed = true,
           projection_version = projection_version + 1,
           updated_at = now()
     where id = v_entitlement.id
     returning * into v_entitlement;
  end if;

  if v_identity_subject is not null then
    perform formula_private.enqueue_event_access_projection(v_registration.id);
  end if;

  insert into formula_private.audit_events (
    actor_type, actor_id, event_type, entity_type, entity_id,
    reason_code, correlation_id, state_summary
  ) values (
    'admin', p_actor_id, 'formula_attendee_upserted', 'event_registration',
    v_registration.id::text, v_result, v_correlation_id,
    jsonb_build_object(
      'sourceType', v_source_type,
      'seatType', p_seat_type,
      'identityLinked', v_identity_subject is not null,
      'agencyAssigned', v_agency_id is not null
    )
  );

  return jsonb_build_object(
    'ok', true,
    'result', v_result,
    'registrationId', v_registration.id,
    'sourceType', v_source_type,
    'sourceOrdinal', v_source_ordinal,
    'identityLinked', v_identity_subject is not null
  );
end;
$function$;

create or replace function public.formula_admin_set_attendee_access(
  p_actor_id text,
  p_registration_id uuid,
  p_action text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $function$
declare
  v_registration public.formula_event_registrations%rowtype;
  v_entitlement public.formula_entitlements%rowtype;
  v_identity_subject text;
  v_correlation_id uuid := gen_random_uuid();
begin
  if p_actor_id is null
     or p_actor_id <> btrim(p_actor_id)
     or char_length(p_actor_id) not between 1 and 128 then
    raise exception using errcode = '22023', message = 'formula_admin_actor_invalid';
  end if;
  if p_action not in ('activate', 'suspend', 'revoke') then
    raise exception using errcode = '22023', message = 'formula_attendee_access_action_invalid';
  end if;

  select registration.* into v_registration
    from public.formula_event_registrations registration
   where registration.id = p_registration_id
     and registration.event_id = 'formula-2026'
   for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'formula_attendee_registration_not_found';
  end if;

  select entitlement.* into v_entitlement
    from public.formula_entitlements entitlement
   where entitlement.event_registration_id = v_registration.id
   for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'formula_attendee_entitlement_not_found';
  end if;

  select identity.provider_subject into v_identity_subject
    from public.formula_auth_identities identity
   where identity.member_id = v_registration.member_id
     and identity.provider = 'firebase'
     and identity.link_state = 'active';

  if p_action = 'revoke' then
    update public.formula_event_registrations
       set registration_state = 'revoked', revoked_at = now(), updated_at = now()
     where id = v_registration.id;
    update public.formula_entitlements
       set access_state = 'revoked', revoked_at = now(),
           projection_version = projection_version + 1,
           revocation_version = revocation_version + 1,
           updated_at = now()
     where id = v_entitlement.id;
  elsif p_action = 'suspend' then
    if v_registration.registration_state = 'revoked'
       or v_entitlement.access_state = 'revoked' then
      raise exception using errcode = 'P0001', message = 'formula_attendee_registration_revoked';
    end if;
    update public.formula_event_registrations
       set registration_state = 'suspended', updated_at = now()
     where id = v_registration.id;
    update public.formula_entitlements
       set access_state = 'suspended', projection_version = projection_version + 1,
           updated_at = now()
     where id = v_entitlement.id;
  else
    if v_registration.registration_state = 'revoked'
       or v_entitlement.access_state = 'revoked' then
      raise exception using errcode = 'P0001', message = 'formula_attendee_registration_revoked';
    end if;
    update public.formula_event_registrations
       set registration_state = case when v_identity_subject is null then 'invited' else 'claimed' end,
           claim_state = case when v_identity_subject is null then 'unclaimed' else 'active' end,
           claimed_at = case when v_identity_subject is null then claimed_at else coalesce(claimed_at, now()) end,
           updated_at = now()
     where id = v_registration.id;
    update public.formula_entitlements
       set access_state = 'active', revoked_at = null,
           projection_version = projection_version + 1,
           updated_at = now()
     where id = v_entitlement.id;
  end if;

  if v_identity_subject is not null then
    perform formula_private.enqueue_event_access_projection(v_registration.id);
  end if;

  insert into formula_private.audit_events (
    actor_type, actor_id, event_type, entity_type, entity_id,
    reason_code, correlation_id, state_summary
  ) values (
    'admin', p_actor_id, 'formula_attendee_access_changed', 'event_registration',
    v_registration.id::text, p_action, v_correlation_id,
    jsonb_build_object('action', p_action, 'identityLinked', v_identity_subject is not null)
  );

  return jsonb_build_object(
    'ok', true,
    'registrationId', v_registration.id,
    'action', p_action,
    'identityLinked', v_identity_subject is not null
  );
end;
$function$;

create or replace function public.formula_admin_roster_snapshot()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $function$
  with purchase_rows as (
    select purchase.id, purchase.name, purchase.email, purchase.quantity,
           purchase.pass_type, purchase.tier, purchase.created_at,
           coalesce(array_agg(source.source_ordinal order by source.source_ordinal)
             filter (where source.registration_id is not null), array[]::integer[]) as assigned_ordinals
      from public.purchases purchase
      left join public.formula_registration_sources source
        on source.event_id = 'formula-2026'
       and source.source_type = 'purchase'
       and source.source_id = purchase.id::text
     where purchase.pass_type <> 'partner'
     group by purchase.id
  ),
  attendee_rows as (
    select registration.id, registration.invited_name, registration.invited_email,
           registration.seat_type, registration.event_role,
           registration.registration_state, registration.claim_state,
           registration.created_at, registration.updated_at,
           entitlement.access_state, agency.id as agency_id,
           agency.display_name as agency_name, agency.kind as agency_kind,
           source.source_type, source.source_id, source.source_ordinal,
           identity.provider_subject is not null as identity_linked
      from public.formula_event_registrations registration
      join public.formula_registration_sources source on source.id = registration.source_record_id
      left join public.formula_entitlements entitlement
        on entitlement.event_registration_id = registration.id
      left join public.formula_agencies agency on agency.id = registration.agency_id
      left join public.formula_auth_identities identity
        on identity.member_id = registration.member_id
       and identity.provider = 'firebase'
       and identity.link_state = 'active'
     where registration.event_id = 'formula-2026'
  ),
  agency_rows as (
    select agency.id, agency.display_name, agency.kind, agency.status,
           count(registration.id)::integer as attendee_count
      from public.formula_agencies agency
      left join public.formula_event_registrations registration
        on registration.agency_id = agency.id
       and registration.event_id = 'formula-2026'
       and registration.registration_state <> 'revoked'
     where agency.status = 'active'
     group by agency.id
  ),
  totals as (
    select
      coalesce((select sum(greatest(quantity, 0)) from purchase_rows), 0)::integer as purchased_seats,
      coalesce((select sum(cardinality(assigned_ordinals)) from purchase_rows), 0)::integer as assigned_purchase_seats,
      (select count(*) from attendee_rows where registration_state <> 'revoked')::integer as active_roster,
      (select count(*) from attendee_rows where identity_linked and registration_state <> 'revoked')::integer as linked_accounts,
      (select count(*) from attendee_rows where source_type = 'manual' and registration_state <> 'revoked')::integer as manual_attendees
  )
  select jsonb_build_object(
    'summary', jsonb_build_object(
      'purchasedSeats', totals.purchased_seats,
      'assignedPurchaseSeats', totals.assigned_purchase_seats,
      'unassignedPurchaseSeats', greatest(totals.purchased_seats - totals.assigned_purchase_seats, 0),
      'activeRoster', totals.active_roster,
      'linkedAccounts', totals.linked_accounts,
      'manualAttendees', totals.manual_attendees
    ),
    'attendees', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', attendee.id,
        'name', attendee.invited_name,
        'email', attendee.invited_email,
        'seatType', attendee.seat_type,
        'eventRole', attendee.event_role,
        'registrationState', attendee.registration_state,
        'claimState', attendee.claim_state,
        'accessState', attendee.access_state,
        'agencyId', attendee.agency_id,
        'agencyName', attendee.agency_name,
        'agencyKind', attendee.agency_kind,
        'sourceType', attendee.source_type,
        'sourceId', attendee.source_id,
        'sourceOrdinal', attendee.source_ordinal,
        'identityLinked', attendee.identity_linked,
        'createdAt', attendee.created_at,
        'updatedAt', attendee.updated_at
      ) order by attendee.created_at desc)
      from attendee_rows attendee
    ), '[]'::jsonb),
    'purchases', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', purchase.id,
        'name', purchase.name,
        'email', purchase.email,
        'quantity', purchase.quantity,
        'passType', purchase.pass_type,
        'tier', purchase.tier,
        'assignedOrdinals', to_jsonb(purchase.assigned_ordinals),
        'unassignedCount', greatest(purchase.quantity - cardinality(purchase.assigned_ordinals), 0),
        'createdAt', purchase.created_at
      ) order by purchase.created_at desc)
      from purchase_rows purchase
    ), '[]'::jsonb),
    'agencies', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', agency.id,
        'displayName', agency.display_name,
        'kind', agency.kind,
        'attendeeCount', agency.attendee_count
      ) order by agency.kind = 'standard' desc, agency.display_name)
      from agency_rows agency
    ), '[]'::jsonb)
  )
  from totals
$function$;

revoke all on function public.formula_admin_upsert_attendee(
  text, text, text, text, uuid, uuid, text, uuid, integer
) from public, anon, authenticated;
revoke all on function public.formula_admin_set_attendee_access(text, uuid, text)
  from public, anon, authenticated;
revoke all on function public.formula_admin_roster_snapshot()
  from public, anon, authenticated;

grant execute on function public.formula_admin_upsert_attendee(
  text, text, text, text, uuid, uuid, text, uuid, integer
) to service_role;
grant execute on function public.formula_admin_set_attendee_access(text, uuid, text)
  to service_role;
grant execute on function public.formula_admin_roster_snapshot()
  to service_role;

comment on function public.formula_admin_upsert_attendee(
  text, text, text, text, uuid, uuid, text, uuid, integer
) is 'Service-role-only audited Formula attendee creation, purchase-seat assignment, and roster editing.';
comment on function public.formula_admin_set_attendee_access(text, uuid, text)
  is 'Service-role-only audited Formula attendee activation, suspension, and revocation.';
comment on function public.formula_admin_roster_snapshot()
  is 'Service-role-only Formula 2026 admin roster, purchase-seat, account-link, and agency snapshot.';