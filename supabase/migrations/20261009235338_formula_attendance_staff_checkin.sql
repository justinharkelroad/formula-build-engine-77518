-- Arrival is independent of app claim/access. Only trusted staff servers can call
-- the two public wrappers; the native wrapper uses the existing scoped secret.
create or replace function formula_private.attendance_row(p_id uuid)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'registrationId', r.id, 'eventId', r.event_id,
    'name', coalesce(r.invited_name, ''), 'email', coalesce(r.invited_email, ''),
    'company', coalesce(a.display_name, ''), 'seatType', r.seat_type,
    'registrationState', r.registration_state, 'checkedInAt', r.checked_in_at,
    'eligible', r.registration_state in ('invited','claimed','checked_in')
      and coalesce(e.access_state = 'active' and e.event_attendance_allowed, false)
      and (r.member_id is null or m.status = 'active'),
    'needsHelpReason', case
      when r.registration_state not in ('invited','claimed','checked_in') then r.registration_state
      when r.member_id is not null and m.status <> 'active' then 'member_inactive'
      when e.id is null or e.access_state <> 'active' or not e.event_attendance_allowed then 'attendance_not_allowed'
      else null end)
  from public.formula_event_registrations r
  left join public.formula_entitlements e on e.event_registration_id = r.id
  left join public.formula_members m on m.id = r.member_id
  left join public.formula_agencies a on a.id = r.agency_id
  where r.id = p_id;
$$;
revoke all on function formula_private.attendance_row(uuid) from public, anon, authenticated;

-- Read-only counterpart of the identity-link bridge: verified canonical email
-- may resolve a newly installed account immediately, but never activates claims.
create or replace function formula_private.attendance_resolve(p_event text, p_uid text, p_email text)
returns uuid language plpgsql stable security invoker set search_path = '' as $$
declare v_member uuid; v_email_member uuid; v_id uuid; v_count integer;
begin
  if p_uid is null or char_length(p_uid) not between 1 and 128
     or p_email is null or char_length(p_email) > 320 then return null; end if;
  select em.member_id into v_email_member
    from public.formula_member_emails em join public.formula_members m on m.id = em.member_id
    where em.normalized_email = lower(btrim(p_email)) and em.state = 'verified' and m.status = 'active';
  select i.member_id into v_member from public.formula_auth_identities i
    where i.provider = 'firebase' and i.provider_subject = p_uid and i.link_state = 'active';
  if v_member is not null then
    -- Auth email must still belong to that canonical identity.
    if v_member is distinct from v_email_member then return null; end if;
  else
    if exists (select 1 from public.formula_auth_identities i
      where i.provider = 'firebase' and i.provider_subject = p_uid) then return null; end if;
    v_member := v_email_member;
    if v_member is null or exists (select 1 from public.formula_auth_identities i
      where i.member_id = v_member and i.provider = 'firebase' and i.link_state = 'active') then return null; end if;
  end if;
  select count(*), (array_agg(r.id order by r.id))[1] into v_count, v_id
    from public.formula_event_registrations r where r.event_id = p_event and r.member_id = v_member;
  -- Never guess among separate/historical seats, even if only one is eligible.
  if v_count <> 1 then return null; end if;
  return v_id;
end;
$$;
revoke all on function formula_private.attendance_resolve(text,text,text) from public, anon, authenticated;

create unique index formula_attendance_audit_retry_unique
  on formula_private.audit_events(actor_id, correlation_id)
  where event_type in ('formula_attendance_check_in','formula_attendance_undo');

create or replace function formula_private.attendance_operation(
  p_actor text, p_channel text, p_request jsonb, p_uid text default null, p_email text default null)
returns jsonb language plpgsql volatile security invoker set search_path = '' as $$
declare
  v_action text := p_request->>'action';
  v_event text := coalesce(nullif(p_request->>'eventId',''),'formula-2026');
  v_offset integer := coalesce((p_request->>'offset')::integer,0);
  v_limit integer := coalesce((p_request->>'limit')::integer,50);
  v_query text := lower(btrim(coalesce(p_request->>'query','')));
  v_filter text := coalesce(p_request->>'filter','all');
  v_id uuid; v_resolved uuid; v_row jsonb; v_rows jsonb; v_counts jsonb;
  v_registration public.formula_event_registrations%rowtype;
  v_previous timestamptz; v_status text; v_reason text := nullif(btrim(p_request->>'reason'),'');
  v_method text := coalesce(p_request->>'method','manual');
  v_correlation uuid; v_prior record; v_count integer; v_replayed boolean := false; v_expected timestamptz;
begin
  if p_actor is null or char_length(p_actor) not between 1 and 160
     or p_channel not in ('firebase','web') then raise exception 'formula_admin_actor_invalid'; end if;
  if v_event <> 'formula-2026' then raise exception 'formula_attendance_event_invalid'; end if;
  if v_offset < 0 or v_offset > 100000 or v_limit not between 1 and 100
     or char_length(v_query) > 200 or v_filter not in ('all','checked-in','not-arrived','needs-help') then
    raise exception 'formula_attendance_query_invalid'; end if;
  if v_action = 'list' then
    with rows as (
      select r.id, formula_private.attendance_row(r.id) as item
      from public.formula_event_registrations r where r.event_id = v_event
    ), filtered as (
      select * from rows where (v_query = '' or position(v_query in lower(item->>'name')) > 0
        or position(v_query in lower(item->>'email')) > 0 or position(v_query in lower(item->>'company')) > 0)
        and (v_filter = 'all' or (v_filter = 'checked-in' and item->>'checkedInAt' is not null)
          or (v_filter = 'not-arrived' and item->>'checkedInAt' is null)
          or (v_filter = 'needs-help' and not (item->>'eligible')::boolean))
    ), page as (select item from filtered order by lower(item->>'name'),id offset v_offset limit v_limit)
    select (select coalesce(jsonb_agg(item),'[]'::jsonb) from page),
      (select jsonb_build_object('total',count(*),'checkedIn',count(*) filter(where item->>'checkedInAt' is not null),
        'notArrived',count(*) filter(where item->>'checkedInAt' is null),
        'needsHelp',count(*) filter(where not (item->>'eligible')::boolean)) from rows),
      (select count(*) from filtered) into v_rows,v_counts,v_count;
    return jsonb_build_object('eventId',v_event,'attendees',v_rows,'counts',v_counts,
      'offset',v_offset,'limit',v_limit,'nextOffset',case when v_offset + v_limit < v_count then v_offset + v_limit else null end);
  end if;
  if v_action = 'resolve' then
    v_id := formula_private.attendance_resolve(v_event,p_uid,p_email);
    if v_id is null then return jsonb_build_object('status','needs_help','reasonCode','identity_unmatched_or_ambiguous','attendee',null); end if;
    v_row := formula_private.attendance_row(v_id);
    return jsonb_build_object('status',case when (v_row->>'eligible')::boolean then 'ready' else 'needs_help' end,
      'reasonCode',v_row->>'needsHelpReason','attendee',v_row);
  end if;
  v_id := (p_request->>'registrationId')::uuid;
  if v_id is null then raise exception 'formula_attendance_registration_invalid'; end if;
  if v_action = 'history' then
    if not exists(select 1 from public.formula_event_registrations where id=v_id and event_id=v_event) then
      raise exception 'formula_attendance_registration_invalid'; end if;
    v_limit := least(v_limit,50);
    select count(*) into v_count from formula_private.audit_events
      where entity_type='event_registration' and entity_id=v_id::text
      and event_type in ('formula_attendance_check_in','formula_attendance_undo');
    select coalesce(jsonb_agg(item),'[]'::jsonb) into v_rows from (
      select jsonb_build_object('action',case when event_type='formula_attendance_undo' then 'undo' else 'check-in' end,
        'actorId',actor_id,'method',state_summary->>'method','reason',state_summary->>'reason',
        'previousCheckedInAt',state_summary->'previousCheckedInAt','checkedInAt',state_summary->'checkedInAt',
        'correlationId',correlation_id,'createdAt',created_at) as item
      from formula_private.audit_events where entity_type='event_registration' and entity_id=v_id::text
        and event_type in ('formula_attendance_check_in','formula_attendance_undo')
      order by created_at desc,id desc offset v_offset limit v_limit) history;
    return jsonb_build_object('history',v_rows,'offset',v_offset,'limit',v_limit,
      'nextOffset',case when v_offset+v_limit<v_count then v_offset+v_limit else null end);
  end if;
  if v_action not in ('check-in','undo') or v_method not in ('manual','qr')
     or (v_method='qr' and p_channel<>'firebase') then raise exception 'formula_attendance_action_invalid'; end if;
  if v_action='undo' then
    if v_reason is null or char_length(v_reason)>500 then raise exception 'formula_attendance_reason_required'; end if;
    if nullif(p_request->>'expectedCheckedInAt','') is null then raise exception 'formula_attendance_expected_timestamp_required'; end if;
    if p_request->>'expectedCheckedInAt' !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$' then
      raise exception 'formula_attendance_expected_timestamp_invalid'; end if;
    begin v_expected := (p_request->>'expectedCheckedInAt')::timestamptz;
    exception when invalid_datetime_format or datetime_field_overflow then
      raise exception 'formula_attendance_expected_timestamp_invalid'; end;
  end if;
  v_correlation := coalesce((p_request->>'correlationId')::uuid,gen_random_uuid());
  -- Serialize correlation replay as well as the seat, so undo retries cannot
  -- undo a later arrival and reusing a key for a different request fails closed.
  perform pg_advisory_xact_lock(hashtextextended('formula-arrival:'||p_actor||':'||v_correlation,0));
  select entity_id,event_type,state_summary into v_prior from formula_private.audit_events
    where actor_id=p_actor and correlation_id=v_correlation
      and event_type in ('formula_attendance_check_in','formula_attendance_undo');
  v_replayed := found;
  if v_replayed and (v_prior.entity_id<>v_id::text
      or v_prior.event_type<>'formula_attendance_'||replace(v_action,'-','_')
      or v_prior.state_summary->>'method' is distinct from v_method
      or (v_action='undo' and (v_prior.state_summary->>'previousCheckedInAt')::timestamptz is distinct from v_expected)) then
    raise exception 'formula_attendance_correlation_conflict'; end if;
  if v_method='qr' then
    -- Use the identity-linker's advisory lock order before taking the seat lock.
    perform pg_advisory_xact_lock(hashtextextended('formula-email:'||lower(btrim(p_email)),0));
    perform pg_advisory_xact_lock(hashtextextended('formula-uid:'||p_uid,0));
  end if;
  select * into v_registration from public.formula_event_registrations where id=v_id and event_id=v_event for update;
  if not found then return jsonb_build_object('status','needs_help','reasonCode','registration_not_found','attendee',null); end if;
  -- Access changes also lock the registration before entitlement. Follow that
  -- lock order and hold both until the attendance write commits.
  perform 1 from public.formula_entitlements where event_registration_id=v_id for update;
  -- Keep member/identity eligibility stable for the duration of this write.
  perform 1 from public.formula_members where id=v_registration.member_id for share;
  if v_method='qr' then
    perform 1 from public.formula_auth_identities
      where provider='firebase' and (provider_subject=p_uid or member_id=v_registration.member_id) for share;
    perform 1 from public.formula_member_emails where member_id=v_registration.member_id for share;
  end if;
  if v_method='qr' then
    v_resolved := formula_private.attendance_resolve(v_event,p_uid,p_email);
    if v_resolved is distinct from v_id then return jsonb_build_object('status','needs_help','reasonCode','identity_unmatched_or_ambiguous','attendee',null); end if;
  end if;
  v_row := formula_private.attendance_row(v_id);
  if v_action='check-in' and not (v_row->>'eligible')::boolean then
    return jsonb_build_object('status','needs_help','reasonCode',v_row->>'needsHelpReason','attendee',v_row); end if;
  -- Replays must pass the same current eligibility/identity gates and locks as
  -- first attempts. A previous successful arrival never authorizes admission
  -- after revocation or identity changes.
  if v_replayed then
    if v_row->'checkedInAt' is distinct from v_prior.state_summary->'checkedInAt' then
      return jsonb_build_object('status','needs_help','reasonCode','attendance_changed_since_request','attendee',v_row,'replayed',true);
    end if;
    return jsonb_build_object('status',v_prior.state_summary->>'status','attendee',v_row,'replayed',true);
  end if;
  v_previous := v_registration.checked_in_at;
  if v_action='undo' and v_previous is distinct from v_expected then
    return jsonb_build_object('status','needs_help','reasonCode','attendance_changed_since_request','attendee',v_row);
  end if;
  if v_action='check-in' then
    v_status := case when v_previous is null then 'checked_in' else 'already_checked_in' end;
    update public.formula_event_registrations set checked_in_at=coalesce(checked_in_at,clock_timestamp()),updated_at=now() where id=v_id and checked_in_at is null;
  else
    v_status := case when v_previous is null then 'already_not_arrived' else 'undone' end;
    -- Only the legacy checked_in state requires a compatibility transition.
    update public.formula_event_registrations set checked_in_at=null,
      registration_state=case when registration_state='checked_in' then 'claimed' else registration_state end,
      updated_at=now() where id=v_id and checked_in_at is not null;
  end if;
  v_row := formula_private.attendance_row(v_id);
  insert into formula_private.audit_events(actor_type,actor_id,event_type,entity_type,entity_id,reason_code,correlation_id,state_summary)
    values('admin',p_actor,'formula_attendance_'||replace(v_action,'-','_'),'event_registration',v_id::text,
      case when v_action='undo' then 'staff_undo' else 'staff_arrival' end,v_correlation,
      jsonb_build_object('method',v_method,'channel',p_channel,'reason',v_reason,'status',v_status,
        'previousCheckedInAt',v_previous,'checkedInAt',v_row->'checkedInAt','eventId',v_event));
  return jsonb_build_object('status',v_status,'attendee',v_row);
end;
$$;
revoke all on function formula_private.attendance_operation(text,text,jsonb,text,text) from public, anon, authenticated;

create or replace function public.formula_bridge_attendance(
  p_integration_secret text,p_actor_firebase_uid text,p_request jsonb,p_firebase_uid text default null,p_email text default null)
returns jsonb language plpgsql volatile security definer set search_path='' as $$
begin
  perform formula_private.verify_projection_bridge_secret(p_integration_secret);
  if p_actor_firebase_uid is null or char_length(p_actor_firebase_uid) not between 1 and 128 then
    raise exception 'formula_admin_actor_invalid'; end if;
  return formula_private.attendance_operation('firebase:'||p_actor_firebase_uid,'firebase',p_request,p_firebase_uid,p_email);
end;
$$;
revoke all on function public.formula_bridge_attendance(text,text,jsonb,text,text) from public, authenticated;
grant execute on function public.formula_bridge_attendance(text,text,jsonb,text,text) to anon,service_role;

create or replace function public.formula_admin_attendance(p_actor_id uuid,p_request jsonb)
returns jsonb language plpgsql volatile security definer set search_path='' as $$
begin
  if not exists(select 1 from public.user_roles where user_id=p_actor_id and role='admin') then
    raise exception using errcode='42501',message='formula_admin_unauthorized'; end if;
  if p_request->>'action'='resolve' or p_request->>'method'='qr' then raise exception 'formula_attendance_action_invalid'; end if;
  return formula_private.attendance_operation('supabase:'||p_actor_id::text,'web',p_request);
end;
$$;
revoke all on function public.formula_admin_attendance(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.formula_admin_attendance(uuid,jsonb) to service_role;
