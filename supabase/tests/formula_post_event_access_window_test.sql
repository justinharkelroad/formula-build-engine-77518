create extension if not exists pgtap with schema extensions;

begin;
set local search_path = public, extensions;
select no_plan();

select is(
  (select capture_write_until from public.formula_events where id = 'formula-2026'),
  '2027-04-02T03:59:59.999Z'::timestamptz,
  'Formula 2026 capture remains available through April 1 Eastern'
);

select is(
  (select dashboard_read_until from public.formula_events where id = 'formula-2026'),
  '2027-04-02T03:59:59.999Z'::timestamptz,
  'Formula 2026 dashboard remains available through April 1 Eastern'
);

insert into public.formula_events (
  id, slug, display_name, starts_at, ends_at, timezone, state,
  registry_version, registry_hash, capture_write_from, capture_write_until,
  dashboard_read_until
) values (
  'formula-custom-window-test', 'custom-window-test', 'Custom window test',
  '2027-05-01T12:00:00Z', '2027-05-01T20:00:00Z', 'America/New_York', 'active',
  1, repeat('c', 64), '2027-04-01T12:00:00Z',
  '2027-05-02T03:59:59Z', '2027-06-02T03:59:59Z'
);

insert into public.formula_members (id, status) values
  ('fa100000-0000-0000-0000-000000000001', 'active'),
  ('fa100000-0000-0000-0000-000000000002', 'active'),
  ('fa100000-0000-0000-0000-000000000003', 'active'),
  ('fa100000-0000-0000-0000-000000000004', 'active'),
  ('fa100000-0000-0000-0000-000000000005', 'active');

insert into public.formula_auth_identities (
  id, member_id, provider, provider_subject, link_state, linked_at
) values
  ('fa110000-0000-0000-0000-000000000001', 'fa100000-0000-0000-0000-000000000001', 'firebase', 'firebase-window-active', 'active', now()),
  ('fa110000-0000-0000-0000-000000000003', 'fa100000-0000-0000-0000-000000000003', 'firebase', 'firebase-window-suspended', 'active', now()),
  ('fa110000-0000-0000-0000-000000000004', 'fa100000-0000-0000-0000-000000000004', 'firebase', 'firebase-window-revoked', 'active', now()),
  ('fa110000-0000-0000-0000-000000000005', 'fa100000-0000-0000-0000-000000000005', 'firebase', 'firebase-window-custom', 'active', now());

insert into public.formula_registration_sources (
  id, event_id, source_type, source_id, source_ordinal,
  source_payload_hash, reconciliation_state
) values
  ('fa120000-0000-0000-0000-000000000001', 'formula-2026', 'manual', 'window-active', 1, repeat('1', 64), 'resolved'),
  ('fa120000-0000-0000-0000-000000000002', 'formula-2026', 'manual', 'window-pending', 1, repeat('2', 64), 'resolved'),
  ('fa120000-0000-0000-0000-000000000003', 'formula-2026', 'partner_profile', 'window-suspended', 1, repeat('3', 64), 'resolved'),
  ('fa120000-0000-0000-0000-000000000004', 'formula-2026', 'partner_profile', 'window-revoked', 1, repeat('4', 64), 'resolved'),
  ('fa120000-0000-0000-0000-000000000005', 'formula-custom-window-test', 'manual', 'window-custom', 1, repeat('5', 64), 'resolved');

insert into public.formula_event_registrations (
  id, event_id, member_id, source_record_id, seat_type, event_role,
  registration_state, claim_state, claimed_at, revoked_at
) values
  ('fa130000-0000-0000-0000-000000000001', 'formula-2026', 'fa100000-0000-0000-0000-000000000001', 'fa120000-0000-0000-0000-000000000001', 'agencyOwner', 'agency_owner', 'claimed', 'active', now(), null),
  ('fa130000-0000-0000-0000-000000000002', 'formula-2026', 'fa100000-0000-0000-0000-000000000002', 'fa120000-0000-0000-0000-000000000002', 'team', 'team_member', 'invited', 'unclaimed', null, null),
  ('fa130000-0000-0000-0000-000000000003', 'formula-2026', 'fa100000-0000-0000-0000-000000000003', 'fa120000-0000-0000-0000-000000000003', 'partner', 'partner_sponsor', 'suspended', 'active', now(), null),
  ('fa130000-0000-0000-0000-000000000004', 'formula-2026', 'fa100000-0000-0000-0000-000000000004', 'fa120000-0000-0000-0000-000000000004', 'partner', 'partner_sponsor', 'revoked', 'active', now(), now()),
  ('fa130000-0000-0000-0000-000000000005', 'formula-custom-window-test', 'fa100000-0000-0000-0000-000000000005', 'fa120000-0000-0000-0000-000000000005', 'team', 'team_member', 'claimed', 'active', now(), null);

update public.formula_registration_sources source
   set registration_id = registration.id
  from public.formula_event_registrations registration
 where registration.source_record_id = source.id;

insert into public.formula_entitlements (
  id, event_registration_id, access_state, personal_module_slugs,
  event_attendance_allowed, ai_capture_allowed, dashboard_read_allowed,
  partner_hub_allowed, capture_write_from, capture_write_until,
  dashboard_read_until, projection_version, revocation_version, revoked_at
) values
  ('fa140000-0000-0000-0000-000000000001', 'fa130000-0000-0000-0000-000000000001', 'active', array['map']::text[], true, true, true, true, '2026-08-25T04:00:00Z', '2026-10-31T03:59:59Z', '2027-01-01T04:59:59Z', 7, 0, null),
  ('fa140000-0000-0000-0000-000000000002', 'fa130000-0000-0000-0000-000000000002', 'pending', array['map']::text[], true, true, true, true, '2026-08-25T04:00:00Z', '2026-10-31T03:59:59Z', '2027-01-01T04:59:59Z', 7, 0, null),
  ('fa140000-0000-0000-0000-000000000003', 'fa130000-0000-0000-0000-000000000003', 'suspended', array['map']::text[], true, true, true, true, '2026-08-25T04:00:00Z', '2026-10-31T03:59:59Z', '2027-01-01T04:59:59Z', 7, 0, null),
  ('fa140000-0000-0000-0000-000000000004', 'fa130000-0000-0000-0000-000000000004', 'revoked', array['map']::text[], false, false, false, false, '2026-08-25T04:00:00Z', '2026-10-31T03:59:59Z', '2027-01-01T04:59:59Z', 7, 1, now()),
  ('fa140000-0000-0000-0000-000000000005', 'fa130000-0000-0000-0000-000000000005', 'active', array['map']::text[], true, true, true, true, '2027-04-01T12:00:00Z', '2027-05-02T03:59:59Z', '2027-06-02T03:59:59Z', 7, 0, null);

select is(
  (select capture_write_until from public.formula_entitlements where id = 'fa140000-0000-0000-0000-000000000001'),
  '2027-04-02T03:59:59.999Z'::timestamptz,
  'new eligible Formula 2026 entitlements inherit the event capture cutoff'
);

select is(
  (select dashboard_read_until from public.formula_entitlements where id = 'fa140000-0000-0000-0000-000000000002'),
  '2027-04-02T03:59:59.999Z'::timestamptz,
  'new eligible Formula 2026 entitlements inherit the event dashboard cutoff'
);

update public.formula_events
   set capture_write_until = '2026-10-31T03:59:59Z',
       dashboard_read_until = '2027-01-01T04:59:59Z'
 where id = 'formula-2026';

update public.formula_entitlements
   set capture_write_until = '2026-10-31T03:59:59Z',
       dashboard_read_until = '2027-01-01T04:59:59Z'
 where id in (
   'fa140000-0000-0000-0000-000000000001',
   'fa140000-0000-0000-0000-000000000002'
 );

select is(
  formula_private.extend_formula_2026_post_event_access(),
  2,
  'refresh changes only eligible Formula 2026 entitlements with stale windows'
);

select results_eq(
  $$select id, access_state, capture_write_until, dashboard_read_until, projection_version
      from public.formula_entitlements
     where id in (
       'fa140000-0000-0000-0000-000000000001',
       'fa140000-0000-0000-0000-000000000002'
     ) order by id$$,
  $$values
    ('fa140000-0000-0000-0000-000000000001'::uuid, 'active'::text, '2027-04-02T03:59:59.999Z'::timestamptz, '2027-04-02T03:59:59.999Z'::timestamptz, 8::bigint),
    ('fa140000-0000-0000-0000-000000000002'::uuid, 'pending'::text, '2027-04-02T03:59:59.999Z'::timestamptz, '2027-04-02T03:59:59.999Z'::timestamptz, 8::bigint)$$,
  'refresh changes both cutoffs and increments projection versions without changing eligible states'
);

select results_eq(
  $$select id, access_state, capture_write_until, dashboard_read_until, projection_version
      from public.formula_entitlements
     where id in (
       'fa140000-0000-0000-0000-000000000003',
       'fa140000-0000-0000-0000-000000000004',
       'fa140000-0000-0000-0000-000000000005'
     ) order by id$$,
  $$values
    ('fa140000-0000-0000-0000-000000000003'::uuid, 'suspended'::text, '2026-10-31T03:59:59Z'::timestamptz, '2027-01-01T04:59:59Z'::timestamptz, 7::bigint),
    ('fa140000-0000-0000-0000-000000000004'::uuid, 'revoked'::text, '2026-10-31T03:59:59Z'::timestamptz, '2027-01-01T04:59:59Z'::timestamptz, 7::bigint),
    ('fa140000-0000-0000-0000-000000000005'::uuid, 'active'::text, '2027-05-02T03:59:59Z'::timestamptz, '2027-06-02T03:59:59Z'::timestamptz, 7::bigint)$$,
  'refresh leaves suspended, revoked, and unrelated-event entitlements untouched'
);

select is(
  (select count(*) from formula_private.projection_outbox
    where event_registration_id in (
      'fa130000-0000-0000-0000-000000000001',
      'fa130000-0000-0000-0000-000000000002',
      'fa130000-0000-0000-0000-000000000003',
      'fa130000-0000-0000-0000-000000000004',
      'fa130000-0000-0000-0000-000000000005'
    )),
  1::bigint,
  'refresh enqueues only the changed entitlement with an active Firebase identity'
);

select ok(
  (select (payload ->> 'captureWriteUntil')::timestamptz = '2027-04-02T03:59:59.999Z'::timestamptz
       and (payload ->> 'dashboardReadUntil')::timestamptz = '2027-04-02T03:59:59.999Z'::timestamptz
     from formula_private.projection_outbox
    where event_registration_id = 'fa130000-0000-0000-0000-000000000001'
    order by projection_version desc limit 1),
  'queued projection carries both exact cutoffs'
);

select is(
  formula_private.extend_formula_2026_post_event_access(),
  0,
  'refresh replay is idempotent'
);

select is(
  (select count(*) from formula_private.projection_outbox
    where event_registration_id = 'fa130000-0000-0000-0000-000000000001'),
  1::bigint,
  'idempotent replay creates no duplicate projection'
);

select ok(
  not has_function_privilege(
    'service_role',
    'formula_private.extend_formula_2026_post_event_access()',
    'execute'
  ),
  'access-window refresh remains owner-only'
);

select * from finish();
rollback;
