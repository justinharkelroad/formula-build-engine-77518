-- Read-only pre-arrival readiness. No seat assignment, identity linking, or access changes.
-- Firebase verifies the caller (and admin role for roster) before using this scoped secret.

create or replace function formula_private.orlando_purchase_readiness(
  p_verified_email text default null, p_all boolean default false
)
returns table (
  id uuid, name text, email text, purchased integer, assigned integer,
  unassigned integer, unresolved integer, status text
)
language sql stable security definer set search_path = ''
as $function$
  with counts as (
    select p.id, p.name, p.email, p.pass_type,
           greatest(coalesce(p.quantity, 0), 0) as purchased,
           count(distinct s.source_ordinal) filter (
             where r.id is not null and s.source_ordinal between 1 and p.quantity
           )::integer as assigned,
           count(distinct s.source_ordinal) filter (
             where s.source_ordinal between 1 and p.quantity
               and (s.reconciliation_state in ('missing_email', 'duplicate_email',
                 'conflicting_source', 'unclassified_pass_type', 'manual_review')
                 or r.registration_state in ('suspended', 'revoked'))
           )::integer as unresolved,
           bool_or(s.source_ordinal > p.quantity) as invalid_ordinal
      from public.purchases p
      left join public.formula_registration_sources s
        on s.event_id = 'formula-2026' and s.source_type = 'purchase'
       and s.source_id = p.id::text
      left join public.formula_event_registrations r
        on r.id = s.registration_id and r.event_id = 'formula-2026'
     where p.pass_type <> 'partner'
       and (p_all or (nullif(btrim(p_verified_email), '') is not null
         and lower(btrim(p.email)) = lower(btrim(p_verified_email))))
     group by p.id
  )
  select id, name, email, purchased, assigned, purchased - assigned,
         case when pass_type not in ('agencyOwner', 'team') then greatest(purchased, 1)
              when purchased = 0 or invalid_ordinal then greatest(unresolved, 1)
              else unresolved end,
         case when pass_type not in ('agencyOwner', 'team') or purchased = 0
                or invalid_ordinal or unresolved > 0 then 'needs_review'
              when assigned < purchased then 'needs_names' else 'assigned' end
    from counts;
$function$;

revoke all on function formula_private.orlando_purchase_readiness(text, boolean)
  from public, anon, authenticated;

create or replace function public.formula_bridge_orlando_readiness(
  p_integration_secret text, p_firebase_uid text, p_verified_email text default null
)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $function$
declare
  v_member_id uuid;
  v_registration jsonb;
  v_agency jsonb;
  v_purchases jsonb;
begin
  perform formula_private.verify_projection_bridge_secret(p_integration_secret);
  if p_firebase_uid is null or p_firebase_uid <> btrim(p_firebase_uid)
     or char_length(p_firebase_uid) not between 1 and 128 then
    raise exception using errcode = '22023', message = 'formula_readiness_uid_invalid';
  end if;
  if p_verified_email is not null and (char_length(p_verified_email) > 320
     or btrim(p_verified_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') then
    raise exception using errcode = '22023', message = 'formula_readiness_email_invalid';
  end if;

  select i.member_id into v_member_id
    from public.formula_auth_identities i
    join public.formula_members m on m.id = i.member_id and m.status = 'active'
   where i.provider = 'firebase' and i.provider_subject = p_firebase_uid
     and i.link_state = 'active';

  select jsonb_build_object(
           'id', r.id, 'name', r.invited_name, 'role', r.event_role, 'seatType', r.seat_type,
           'status', r.registration_state, 'agencyId', r.agency_id,
           'email', r.invited_email, 'accessState', e.access_state),
         case when a.id is null then null else jsonb_build_object(
           'id', a.id, 'name', a.display_name,
           'confirmed', a.kind = 'standard' and a.status = 'active' and exists (
             select 1 from public.formula_agency_memberships am
              where am.agency_id = a.id and am.member_id = v_member_id
                and am.state = 'confirmed' and am.is_primary
           )) end
    into v_registration, v_agency
    from public.formula_event_registrations r
    left join public.formula_entitlements e on e.event_registration_id = r.id
    left join public.formula_agencies a on a.id = r.agency_id
   where r.event_id = 'formula-2026' and r.member_id = v_member_id
   order by (r.registration_state in ('invited', 'claimed', 'checked_in')) desc,
            r.created_at desc, r.id
   limit 1;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', p.id, 'purchased', p.purchased, 'assigned', p.assigned,
    'unassigned', p.unassigned, 'unresolved', p.unresolved, 'status', p.status
  ) order by p.id), '[]'::jsonb) into v_purchases
    from formula_private.orlando_purchase_readiness(p_verified_email, false) p;

  return jsonb_build_object('memberId', v_member_id,
    'registration', v_registration, 'agency', v_agency, 'purchases', v_purchases);
end;
$function$;

create or replace function public.formula_bridge_orlando_roster(
  p_integration_secret text, p_offset integer default 0, p_limit integer default 50
)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $function$
declare v_rows jsonb; v_has_more boolean;
begin
  perform formula_private.verify_projection_bridge_secret(p_integration_secret);
  if p_offset is null or p_offset < 0 or p_offset > 1000000
     or p_limit is null or p_limit < 1 or p_limit > 100 then
    raise exception using errcode = '22023', message = 'formula_readiness_page_invalid';
  end if;

  with attendee_rows as (
    select 'registration:' || r.id::text as id, i.provider_subject as uid,
           coalesce(nullif(btrim(r.invited_name), ''), 'Unnamed attendee') as display_name,
           r.invited_email as email,
           case r.event_role when 'agency_owner' then 'owner'
             when 'team_member' then 'team' when 'partner' then 'partner'
             when 'staff' then 'staff' else 'unknown' end as role,
           a.display_name as organization_name,
           (case when nullif(btrim(r.invited_name), '') is null
                   or r.registration_state in ('suspended', 'revoked')
                   or e.access_state is distinct from 'active'
             then jsonb_build_array(jsonb_build_object('key', 'named_seat',
               'detail', 'Named seat or active registration needs staff review.')) else '[]'::jsonb end)
           || (case when nullif(btrim(r.invited_email), '') is null
             then jsonb_build_array(jsonb_build_object('key', 'email',
               'detail', 'Registration is missing an email.')) else '[]'::jsonb end)
           || (case when i.provider_subject is null
             then jsonb_build_array(jsonb_build_object('key', 'sign_in',
               'detail', 'No active sign-in is linked to this registration.')) else '[]'::jsonb end)
           || (case when r.event_role not in ('agency_owner', 'team_member', 'partner', 'staff')
             then jsonb_build_array(jsonb_build_object('key', 'role',
               'detail', 'Registration role needs confirmation.')) else '[]'::jsonb end)
           || (case when r.event_role in ('agency_owner', 'team_member') and
              (a.id is null or a.kind <> 'standard' or a.status <> 'active' or not exists (
                select 1 from public.formula_agency_memberships am
                 where am.agency_id = a.id and am.member_id = r.member_id
                   and am.state = 'confirmed' and am.is_primary))
             then jsonb_build_array(jsonb_build_object('key', 'organization',
               'detail', 'Confirm the attendee connection to their agency.')) else '[]'::jsonb end)
           || (case when m.status is distinct from 'active'
             then jsonb_build_array(jsonb_build_object('key', 'member',
               'detail', 'Member record is missing or inactive.')) else '[]'::jsonb end) as issues
      from public.formula_event_registrations r
      left join public.formula_members m on m.id = r.member_id
      left join public.formula_auth_identities i on i.member_id = r.member_id
        and i.provider = 'firebase' and i.link_state = 'active'
      left join public.formula_entitlements e on e.event_registration_id = r.id
      left join public.formula_agencies a on a.id = r.agency_id
     where r.event_id = 'formula-2026'
  ), purchase_rows as (
    select 'purchase:' || p.id::text as id, null::text as uid,
           coalesce(nullif(btrim(p.name), ''), 'Purchase needing seat names') as display_name,
           p.email, 'owner'::text as role, null::text as organization_name,
           (case when p.unassigned > 0 then jsonb_build_array(jsonb_build_object(
             'key', 'unassigned_seats', 'detail', p.unassigned::text || ' purchased seat(s) need attendee names.'))
             else '[]'::jsonb end)
           || (case when p.unresolved > 0 then jsonb_build_array(jsonb_build_object(
             'key', 'purchase_review', 'detail', p.unresolved::text || ' seat(s) need registration review.'))
             else '[]'::jsonb end) as issues
      from formula_private.orlando_purchase_readiness(null, true) p
     where p.unassigned > 0 or p.unresolved > 0
  ), page as (
    select * from (select * from attendee_rows union all select * from purchase_rows) all_rows
     order by id offset p_offset limit p_limit + 1
  ), numbered as (
    select *, row_number() over (order by id) as rn from page
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'uid', uid, 'displayName', display_name, 'email', email,
    'role', role, 'organizationName', organization_name, 'issues', issues
  ) order by id) filter (where rn <= p_limit), '[]'::jsonb), count(*) > p_limit
    into v_rows, v_has_more from numbered;

  return jsonb_build_object('rows', v_rows,
    'nextOffset', case when v_has_more then p_offset + p_limit else null end);
end;
$function$;

revoke all on function public.formula_bridge_orlando_readiness(text, text, text)
  from public, authenticated;
revoke all on function public.formula_bridge_orlando_roster(text, integer, integer)
  from public, authenticated;
grant execute on function public.formula_bridge_orlando_readiness(text, text, text)
  to anon, service_role;
grant execute on function public.formula_bridge_orlando_roster(text, integer, integer)
  to anon, service_role;
