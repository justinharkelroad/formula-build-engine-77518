-- A password proves control of a Firebase account, but a newly created account
-- does not prove control of the email address assigned to a Formula ticket.
-- Require Firebase's server-verified email claim for the first identity link.
-- Preserve exact active links so legacy accounts are not locked out if their
-- provider later reports email_verified=false.
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
  eligible_registration_id uuid;
  existing_identity record;
  registration_record record;
  linked_count integer := 0;
  identity_was_existing boolean := false;
begin
  perform formula_private.verify_projection_bridge_secret(p_integration_secret);

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
  if not identity_was_existing and p_email_verified is not true then
    return 'email_verification_required';
  end if;

  -- Lock the eligible ticket and its entitlement before creating a new identity.
  -- Suspended and revoked access is an explicit operator decision and must never
  -- be revived by a login. The partial unique index on event/member guarantees
  -- at most one invited/claimed/checked-in Formula 2026 registration here.
  select registration.id into eligible_registration_id
    from public.formula_event_registrations registration
    join public.formula_entitlements entitlement
      on entitlement.event_registration_id = registration.id
   where registration.event_id = 'formula-2026'
     and registration.member_id = member_id_value
     and registration.registration_state in ('invited', 'claimed', 'checked_in')
     and entitlement.access_state in ('pending', 'active')
   order by registration.created_at
   limit 1
   for update of registration, entitlement;

  if eligible_registration_id is null then
    return 'not_eligible';
  end if;

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
       and registration.id = eligible_registration_id
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
       and access_state = 'pending';

    perform formula_private.enqueue_event_access_projection(registration_record.id);
    linked_count := linked_count + 1;
  end loop;

  if linked_count = 0 then
    return 'not_eligible';
  end if;
  return case when identity_was_existing then 'existing' else 'linked' end;
end;
$function$;

revoke execute on function public.formula_bridge_link_firebase_identity(text, text, text, boolean)
  from public, authenticated;
grant execute on function public.formula_bridge_link_firebase_identity(text, text, text, boolean)
  to anon, service_role;

comment on function public.formula_bridge_link_firebase_identity(text, text, text, boolean) is
  'Links a verified first Firebase claimant to an eligible Formula member; exact active links remain usable for legacy accounts.';
