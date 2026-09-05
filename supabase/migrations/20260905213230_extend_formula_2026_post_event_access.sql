-- Keep Formula 2026 capture and dashboard access available through the end of
-- April 1, 2027 in America/New_York. The exact inclusive UTC instant is
-- 2027-04-02T03:59:59.999Z (April is daylight time, UTC-04:00).
--
-- This migration is additive. It does not rewrite the purchase or roster
-- migrations that originally seeded shorter windows.

create or replace function formula_private.apply_formula_2026_access_window_defaults()
returns trigger
language plpgsql
set search_path = ''
as $function$
declare
  event_record record;
begin
  if new.access_state not in ('pending', 'active') then
    return new;
  end if;

  select event.capture_write_until, event.dashboard_read_until
    into event_record
    from public.formula_event_registrations registration
    join public.formula_events event on event.id = registration.event_id
   where registration.id = new.event_registration_id
     and event.id = 'formula-2026';

  if found then
    new.capture_write_until := event_record.capture_write_until;
    new.dashboard_read_until := event_record.dashboard_read_until;
  end if;

  return new;
end;
$function$;

revoke all on function formula_private.apply_formula_2026_access_window_defaults()
  from public, anon, authenticated, service_role;

drop trigger if exists formula_2026_entitlement_access_window_defaults
  on public.formula_entitlements;
create trigger formula_2026_entitlement_access_window_defaults
before insert on public.formula_entitlements
for each row execute function formula_private.apply_formula_2026_access_window_defaults();

comment on function formula_private.apply_formula_2026_access_window_defaults() is
  'Applies the Formula 2026 event access-window defaults to newly eligible entitlements without changing access state.';

create or replace function formula_private.extend_formula_2026_post_event_access()
returns integer
language plpgsql
volatile
set search_path = ''
as $function$
declare
  access_until constant timestamptz := '2027-04-02 03:59:59.999+00'::timestamptz;
  entitlement_record record;
  refreshed_count integer := 0;
begin
  perform pg_advisory_xact_lock(hashtextextended('formula-access-window:formula-2026', 0));

  perform 1
    from public.formula_events event
   where event.id = 'formula-2026'
   for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'formula_2026_event_missing';
  end if;

  update public.formula_events
     set capture_write_until = access_until,
         dashboard_read_until = access_until,
         updated_at = now()
   where id = 'formula-2026'
     and (capture_write_until is distinct from access_until
       or dashboard_read_until is distinct from access_until);

  for entitlement_record in
    select entitlement.id, registration.id as registration_id,
           exists (
             select 1
               from public.formula_auth_identities identity
              where identity.member_id = registration.member_id
                and identity.provider = 'firebase'
                and identity.link_state = 'active'
           ) as has_active_firebase_identity
      from public.formula_entitlements entitlement
      join public.formula_event_registrations registration
        on registration.id = entitlement.event_registration_id
     where registration.event_id = 'formula-2026'
       and entitlement.access_state in ('pending', 'active')
       and (entitlement.capture_write_until is distinct from access_until
         or entitlement.dashboard_read_until is distinct from access_until)
     order by entitlement.id
     for update of entitlement
  loop
    update public.formula_entitlements
       set capture_write_until = access_until,
           dashboard_read_until = access_until,
           projection_version = projection_version + 1,
           updated_at = now()
     where id = entitlement_record.id;

    if entitlement_record.has_active_firebase_identity then
      perform formula_private.enqueue_event_access_projection(entitlement_record.registration_id);
    end if;

    refreshed_count := refreshed_count + 1;
  end loop;

  return refreshed_count;
end;
$function$;

revoke all on function formula_private.extend_formula_2026_post_event_access()
  from public, anon, authenticated, service_role;

comment on function formula_private.extend_formula_2026_post_event_access() is
  'Owner-only idempotent Formula 2026 access-window refresh; reprojects changed eligible linked entitlements.';

select formula_private.extend_formula_2026_post_event_access();
