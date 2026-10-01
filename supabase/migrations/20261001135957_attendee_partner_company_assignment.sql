-- Explicit admin roster assignments. Firebase remains the company authority;
-- the catalog is a private, short-lived mirror, never an email-domain match.
create table formula_private.partner_company_catalog (
  id text primary key check (id ~ '^[A-Za-z0-9_-]{1,128}$'),
  business_name text not null check (char_length(business_name) between 1 and 200),
  active boolean not null,
  member_emails text[] not null default array[]::text[],
  synced_at timestamptz not null default now()
);
create table formula_private.attendee_partner_assignments (
  registration_id uuid primary key references public.formula_event_registrations(id),
  partner_org_id text references formula_private.partner_company_catalog(id),
  assignment_version bigint not null default 1 check (assignment_version > 0),
  state text not null default 'pending' check (state in ('pending','waiting_for_sign_in','connected','needs_attention','not_assigned')),
  result_code text,
  firebase_uid text,
  actor_id text not null,
  lease_token uuid,
  lease_expires_at timestamptz,
  next_attempt_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((lease_token is null) = (lease_expires_at is null))
);
alter table formula_private.partner_company_catalog enable row level security;
alter table formula_private.attendee_partner_assignments enable row level security;
revoke all on formula_private.partner_company_catalog, formula_private.attendee_partner_assignments from public, anon, authenticated, service_role;

create function public.formula_bridge_sync_partner_catalog(p_integration_secret text, p_companies jsonb)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  perform formula_private.verify_projection_bridge_secret(p_integration_secret);
  if jsonb_typeof(p_companies) is distinct from 'array' or jsonb_array_length(p_companies) > 1000 then
    raise exception 'formula_partner_catalog_invalid';
  end if;
  if exists (select 1 from jsonb_array_elements(p_companies) c where
      coalesce(c->>'id','') !~ '^[A-Za-z0-9_-]{1,128}$'
      or char_length(coalesce(c->>'businessName','')) not between 1 and 200
      or jsonb_typeof(c->'active') is distinct from 'boolean'
      or jsonb_typeof(coalesce(c->'memberEmails','[]'::jsonb)) is distinct from 'array') then
    raise exception 'formula_partner_catalog_invalid';
  end if;
  -- A complete snapshot disables removed companies, including blocked vendors.
  update formula_private.partner_company_catalog set active = false, synced_at = now();
  insert into formula_private.partner_company_catalog(id, business_name, active, member_emails, synced_at)
    select c->>'id', c->>'businessName', (c->>'active')::boolean,
      array(select lower(btrim(email)) from jsonb_array_elements_text(coalesce(c->'memberEmails','[]'::jsonb)) emails(email)), now()
    from jsonb_array_elements(p_companies) c
  on conflict(id) do update set business_name = excluded.business_name,
    active = excluded.active, member_emails = excluded.member_emails, synced_at = excluded.synced_at;
end $$;

-- A distinct name keeps old clients compatible and avoids overloaded RPCs.
create function public.formula_admin_upsert_attendee_with_partner(
  p_actor_id text, p_name text, p_email text, p_seat_type text,
  p_registration_id uuid default null, p_agency_id uuid default null,
  p_agency_display_name text default null, p_purchase_id uuid default null,
  p_source_ordinal integer default null, p_partner_org_id text default null,
  p_partner_assignment_provided boolean default true
) returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_result jsonb; v_id uuid; v_assignment formula_private.attendee_partner_assignments%rowtype;
  v_partner_org_id text := p_partner_org_id;
begin
  if p_registration_id is not null then
    -- Same lock order as the original attendee RPC, then the assignment row.
    perform pg_advisory_xact_lock(hashtextextended('formula-email:' || lower(btrim(p_email)), 0));
    perform 1 from public.formula_event_registrations where id = p_registration_id for update;
    select * into v_assignment from formula_private.attendee_partner_assignments
      where registration_id = p_registration_id for update;
    if p_partner_assignment_provided is not true then v_partner_org_id := v_assignment.partner_org_id; end if;
    if v_assignment.lease_expires_at > now() then raise exception 'formula_partner_connection_syncing'; end if;
    -- A connected identity cannot be silently replaced by editing an email.
    if v_assignment.firebase_uid is not null and exists (
      select 1 from public.formula_event_registrations where id = p_registration_id
      and normalized_email <> lower(btrim(p_email))
    ) then raise exception 'formula_partner_connected_email_change'; end if;
    -- Company moves/removals for connected members use the existing Hub controls.
    if v_assignment.firebase_uid is not null and v_assignment.result_code is distinct from 'membership_removed'
      and v_assignment.partner_org_id is distinct from v_partner_org_id then
      raise exception 'formula_partner_membership_change_requires_hub';
    end if;
  end if;
  if v_partner_org_id is not null and p_partner_assignment_provided is true and not exists (
    select 1 from formula_private.partner_company_catalog
    where id = v_partner_org_id and active and synced_at > now() - interval '15 minutes'
  ) then raise exception 'formula_partner_company_unavailable'; end if;
  v_result := public.formula_admin_upsert_attendee(p_actor_id, p_name, p_email, p_seat_type,
    p_registration_id, p_agency_id, p_agency_display_name, p_purchase_id, p_source_ordinal);
  v_id := (v_result->>'registrationId')::uuid;
  if v_partner_org_id is not null or v_assignment.registration_id is not null then
    insert into formula_private.attendee_partner_assignments(registration_id, partner_org_id, actor_id, state)
      values(v_id, v_partner_org_id, p_actor_id, case when v_partner_org_id is null then 'not_assigned' else 'pending' end)
    on conflict(registration_id) do update set
      partner_org_id = excluded.partner_org_id, actor_id = excluded.actor_id,
      assignment_version = formula_private.attendee_partner_assignments.assignment_version + 1,
      state = excluded.state, result_code = null, next_attempt_at = now(),
      lease_token = null, lease_expires_at = null, updated_at = now();
  end if;
  return v_result || jsonb_build_object('partnerOrgId', v_partner_org_id,
    'partnerConnectionState', case when v_partner_org_id is null then 'not_assigned' else 'pending' end);
end $$;

create function public.formula_admin_roster_snapshot_with_partners()
returns jsonb language sql stable security definer set search_path = '' as $$
  select snapshot || jsonb_build_object(
    'partnerCompanies', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'businessName', business_name) order by business_name)
      from formula_private.partner_company_catalog where active and synced_at > now() - interval '15 minutes'), '[]'::jsonb),
    'attendees', coalesce((select jsonb_agg(attendee || jsonb_build_object(
      'partnerOrgId', coalesce(a.partner_org_id, existing.id), 'partnerCompanyName', coalesce(c.business_name, existing.business_name),
      'partnerConnectionState', case when a.partner_org_id is not null then a.state
        when existing.id is not null then 'connected' else 'not_assigned' end, 'partnerConnectionCode', a.result_code)
      order by ordinal)
      from jsonb_array_elements(snapshot->'attendees') with ordinality rows(attendee, ordinal)
      left join formula_private.attendee_partner_assignments a on a.registration_id = (attendee->>'id')::uuid
      left join formula_private.partner_company_catalog c on c.id = a.partner_org_id
      left join lateral (select id, business_name from formula_private.partner_company_catalog
        where active and synced_at > now() - interval '15 minutes'
          and lower(btrim(attendee->>'email')) = any(member_emails)
        order by id limit 1) existing on true), '[]'::jsonb))
  from (select public.formula_admin_roster_snapshot() snapshot) base;
$$;

create function public.formula_bridge_claim_partner_assignments(p_integration_secret text, p_batch_size integer default 20)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_rows jsonb;
begin
  perform formula_private.verify_projection_bridge_secret(p_integration_secret);
  if p_batch_size is null or p_batch_size not between 1 and 50 then raise exception 'formula_partner_batch_invalid'; end if;
  with candidates as (
    select a.registration_id from formula_private.attendee_partner_assignments a
    join public.formula_event_registrations r on r.id = a.registration_id
    join public.formula_entitlements e on e.event_registration_id = r.id
    join public.formula_members m on m.id = r.member_id
    where a.partner_org_id is not null and a.next_attempt_at <= now()
      and (a.lease_expires_at is null or a.lease_expires_at <= now())
      and r.event_id = 'formula-2026' and r.registration_state in ('invited','claimed','checked_in')
      and e.access_state in ('pending','active') and m.status = 'active'
    order by a.next_attempt_at, a.registration_id limit p_batch_size for update of a skip locked
  ), claimed as (
    update formula_private.attendee_partner_assignments a set lease_token = gen_random_uuid(),
      lease_expires_at = now() + interval '120 seconds' from candidates q
    where a.registration_id = q.registration_id returning a.*
  ) select coalesce(jsonb_agg(jsonb_build_object('registrationId', a.registration_id,
      'partnerOrgId', a.partner_org_id, 'assignmentVersion', a.assignment_version,
      'leaseToken', a.lease_token, 'email', r.normalized_email, 'firebaseUid', i.provider_subject)), '[]'::jsonb)
    into v_rows from claimed a join public.formula_event_registrations r on r.id = a.registration_id
    left join public.formula_auth_identities i on i.member_id = r.member_id
      and i.provider = 'firebase' and i.link_state = 'active';
  return v_rows;
end $$;

create function public.formula_bridge_complete_partner_assignment(p_integration_secret text,
  p_registration_id uuid, p_assignment_version bigint, p_lease_token uuid,
  p_state text, p_result_code text, p_firebase_uid text default null)
returns boolean language plpgsql volatile security definer set search_path = '' as $$
begin
  perform formula_private.verify_projection_bridge_secret(p_integration_secret);
  if p_state is null or p_state not in ('connected','waiting_for_sign_in','needs_attention')
    or p_result_code is null or p_result_code not in ('connected','waiting_for_account','waiting_for_profile','email_verification_required',
      'identity_conflict','org_inactive','user_in_other_org','account_disabled','retryable','waiting_for_access','membership_removed')
    or (p_state = 'connected' and (p_firebase_uid is null or char_length(p_firebase_uid) not between 1 and 128)) then
    raise exception 'formula_partner_result_invalid';
  end if;
  update formula_private.attendee_partner_assignments set state = p_state, result_code = p_result_code,
    firebase_uid = coalesce(p_firebase_uid, firebase_uid), lease_token = null, lease_expires_at = null,
    next_attempt_at = now() + case when p_state = 'connected' then interval '5 minutes' else interval '1 minute' end,
    updated_at = now()
    where registration_id = p_registration_id and assignment_version = p_assignment_version
      and lease_token = p_lease_token and lease_expires_at > now();
  return found;
end $$;

revoke all on function public.formula_admin_upsert_attendee_with_partner(text,text,text,text,uuid,uuid,text,uuid,integer,text,boolean) from public, anon, authenticated;
revoke all on function public.formula_admin_roster_snapshot_with_partners() from public, anon, authenticated;
grant execute on function public.formula_admin_upsert_attendee_with_partner(text,text,text,text,uuid,uuid,text,uuid,integer,text,boolean) to service_role;
grant execute on function public.formula_admin_roster_snapshot_with_partners() to service_role;
revoke all on function public.formula_bridge_sync_partner_catalog(text,jsonb) from public, authenticated;
revoke all on function public.formula_bridge_claim_partner_assignments(text,integer) from public, authenticated;
revoke all on function public.formula_bridge_complete_partner_assignment(text,uuid,bigint,uuid,text,text,text) from public, authenticated;
grant execute on function public.formula_bridge_sync_partner_catalog(text,jsonb) to anon, service_role;
grant execute on function public.formula_bridge_claim_partner_assignments(text,integer) to anon, service_role;
grant execute on function public.formula_bridge_complete_partner_assignment(text,uuid,bigint,uuid,text,text,text) to anon, service_role;
