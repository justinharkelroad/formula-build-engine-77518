-- Formula 2026 registry transition. This function is deliberately owner-only:
-- the release operator must coordinate backend, bundled Flow, database and
-- projector rollout while the event is pre-event or paused.
create or replace function formula_private.transition_formula_2026_registry()
returns integer
language plpgsql
volatile
set search_path = ''
as $function$
declare
  accepted_source_registry_hashes constant text[] := array[
    'e848e7a952badb1e1c072fc81050cafafca597ea45189f91cf30645fcfc5e404',
    'e6d64ba4b9b13f1d577d7ace6a8e406e67cdccc6cf03af8290caee21c1b49faa'
  ];
  new_registry_hash constant text := 'bcbb5db2c7e4234400cfeb63aa3ea2043e4bc7985d028b109b968226b946f9b1';
  event_record record;
  registration_record record;
  reprojected_count integer := 0;
begin
  perform pg_advisory_xact_lock(hashtextextended('formula-registry:formula-2026', 0));

  select event.registry_version, event.registry_hash
    into event_record
    from public.formula_events event
   where event.id = 'formula-2026'
   for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'formula_2026_event_missing';
  end if;
  if event_record.registry_version is distinct from 1 then
    raise exception using errcode = '23514', message = 'formula_2026_registry_version_unexpected';
  end if;
  if event_record.registry_hash = new_registry_hash then
    return 0;
  end if;
  if not (event_record.registry_hash = any (accepted_source_registry_hashes)) then
    raise exception using errcode = '23514', message = 'formula_2026_registry_hash_unexpected';
  end if;

  update public.formula_events
     set registry_hash = new_registry_hash,
         updated_at = now()
   where id = 'formula-2026';

  for registration_record in
    select registration.id
      from public.formula_event_registrations registration
      join public.formula_entitlements entitlement
        on entitlement.event_registration_id = registration.id
     where registration.event_id = 'formula-2026'
       and exists (
         select 1
           from public.formula_auth_identities identity
          where identity.member_id = registration.member_id
            and identity.provider = 'firebase'
            and identity.link_state = 'active'
       )
     order by registration.id
     for update of entitlement
  loop
    update public.formula_entitlements
       set projection_version = projection_version + 1,
           updated_at = now()
     where event_registration_id = registration_record.id;

    perform formula_private.enqueue_event_access_projection(registration_record.id);
    reprojected_count := reprojected_count + 1;
  end loop;

  return reprojected_count;
end;
$function$;

revoke all on function formula_private.transition_formula_2026_registry()
  from public, anon, authenticated, service_role;

comment on function formula_private.transition_formula_2026_registry() is
  'Owner-only guarded and idempotent Formula 2026 registry transition with linked-identity reprojection.';

select formula_private.transition_formula_2026_registry();