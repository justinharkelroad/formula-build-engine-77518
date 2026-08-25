create extension if not exists pgtap with schema extensions;

begin;
set local search_path = public, extensions;
select no_plan();

insert into public.formula_members (id, status, superseded_by_member_id) values
  ('00000000-0000-0000-0000-000000000001', 'active', null),
  ('00000000-0000-0000-0000-000000000002', 'active', null),
  ('00000000-0000-0000-0000-000000000003', 'active', null),
  ('00000000-0000-0000-0000-000000000005', 'active', null),
  ('00000000-0000-0000-0000-000000000006', 'active', null),
  ('00000000-0000-0000-0000-000000000007', 'active', null),
  ('00000000-0000-0000-0000-000000000008', 'active', null),
  ('00000000-0000-0000-0000-000000000004', 'superseded', '00000000-0000-0000-0000-000000000001');

insert into public.formula_auth_identities (
  id, member_id, provider_subject, link_state, linked_at
) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'firebase-alpha', 'active', now()),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'firebase-beta', 'active', now()),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'firebase-superseded', 'active', now()),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'firebase-candidate', 'active', now()),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', 'firebase-revoked-membership', 'active', now()),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', 'firebase-pending', 'active', now()),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', 'firebase-revoked', 'active', now());

select throws_ok(
  $$insert into public.formula_auth_identities (member_id, provider_subject, link_state, linked_at)
    values ('00000000-0000-0000-0000-000000000002', 'firebase-alpha', 'active', now())$$,
  '23505', null,
  'one active Firebase UID cannot link to two members'
);

select throws_ok(
  $$insert into public.formula_auth_identities (member_id, provider_subject, link_state, linked_at)
    values ('00000000-0000-0000-0000-000000000001', 'firebase-alpha-second', 'active', now())$$,
  '23505', null,
  'one member cannot receive two active Firebase identities'
);

insert into public.formula_member_emails (
  id, member_id, original_email, normalized_email, state, is_primary, verified_at, source_type, source_id
) values (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  ' ALPHA ', 'alpha', 'verified', true, now(), 'manual', 'email-alpha'
);

select throws_ok(
  $$insert into public.formula_member_emails
      (member_id, original_email, normalized_email, state, verified_at, source_type, source_id)
    values
      ('00000000-0000-0000-0000-000000000002', 'Alpha', 'alpha', 'verified', now(), 'manual', 'email-beta')$$,
  '23505', null,
  'verified normalized identity is unique'
);

select lives_ok(
  $$insert into public.formula_member_emails
      (member_id, original_email, normalized_email, state, source_type, source_id)
    values
      ('00000000-0000-0000-0000-000000000002', 'ALPHA', 'alpha', 'candidate', 'manual', 'candidate-alpha'),
      ('00000000-0000-0000-0000-000000000003', 'alpha', 'alpha', 'disputed', 'manual', 'disputed-alpha')$$,
  'candidate and disputed email evidence can coexist'
);

insert into public.formula_agencies (id, kind, display_name, status, source_type, source_id)
values ('30000000-0000-0000-0000-000000000001', 'standard', 'Fixture Agency', 'active', 'manual', 'agency-fixture');

insert into public.formula_agency_memberships (
  id, agency_id, member_id, membership_role, state, is_primary, source_type, source_id
) values
  ('31000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'owner', 'confirmed', true, 'manual', 'membership-confirmed'),
  ('31000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'member', 'candidate', false, 'manual', 'membership-candidate'),
  ('31000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'member', 'revoked', false, 'manual', 'membership-revoked');

insert into public.formula_events (
  id, slug, display_name, starts_at, ends_at, timezone, state,
  registry_version, registry_hash, capture_write_from, capture_write_until, dashboard_read_until
) values (
  'formula-2026', 'w26', 'Formula fixture',
  '2026-10-14T12:00:00Z', '2026-10-16T22:00:00Z', 'America/New_York', 'active',
  4, repeat('a', 64), '2026-10-14T10:00:00Z', '2026-10-17T00:00:00Z', '2026-11-16T00:00:00Z'
);

insert into public.formula_registration_sources (
  id, event_id, source_type, source_id, source_ordinal, source_payload_hash,
  reconciliation_state
) values
  ('40000000-0000-0000-0000-000000000001', 'formula-2026', 'purchase', 'purchase-alpha', 1, repeat('1', 64), 'named_ready'),
  ('40000000-0000-0000-0000-000000000002', 'formula-2026', 'purchase', 'purchase-beta', 1, repeat('2', 64), 'named_ready'),
  ('40000000-0000-0000-0000-000000000003', 'formula-2026', 'manual', 'manual-no-identity', 1, repeat('3', 64), 'named_ready'),
  ('40000000-0000-0000-0000-000000000004', 'formula-2026', 'legacy_registration', 'legacy-superseded', 1, repeat('4', 64), 'already_registered'),
  ('40000000-0000-0000-0000-000000000005', 'formula-2026', 'manual', 'manual-candidate', 1, repeat('5', 64), 'named_ready'),
  ('40000000-0000-0000-0000-000000000006', 'formula-2026', 'manual', 'manual-revoked-membership', 1, repeat('6', 64), 'named_ready'),
  ('40000000-0000-0000-0000-000000000007', 'formula-2026', 'partner_profile', 'partner-roster', 1, repeat('7', 64), 'partner_roster_missing_email'),
  ('40000000-0000-0000-0000-000000000008', 'formula-2026', 'purchase', 'purchase-revoked', 1, repeat('8', 64), 'named_ready'),
  ('40000000-0000-0000-0000-000000000009', 'formula-2026', 'purchase', 'purchase-quantity-five', 1, repeat('9', 64), 'quantity_without_names');

select lives_ok(
  $$insert into public.formula_registration_sources
      (event_id, source_type, source_id, source_ordinal, source_payload_hash, reconciliation_state)
    values
      ('formula-2026', 'purchase', 'purchase-quantity-five', 2, repeat('a', 64), 'quantity_without_names'),
      ('formula-2026', 'purchase', 'purchase-quantity-five', 3, repeat('b', 64), 'quantity_without_names'),
      ('formula-2026', 'purchase', 'purchase-quantity-five', 4, repeat('c', 64), 'quantity_without_names'),
      ('formula-2026', 'purchase', 'purchase-quantity-five', 5, repeat('d', 64), 'quantity_without_names')$$,
  'one quantity-five purchase can preserve five ordinal source records'
);

select is(
  (select count(*) from public.formula_registration_sources
    where source_type = 'purchase' and source_id = 'purchase-quantity-five'),
  5::bigint,
  'purchase quantity is represented as evidence ordinals, not fake people'
);

select is(
  (select count(*) from public.formula_members),
  8::bigint,
  'quantity-without-names source does not create fake members'
);

select throws_ok(
  $$insert into public.formula_registration_sources
      (event_id, source_type, source_id, source_ordinal, source_payload_hash, reconciliation_state)
    values ('formula-2026', 'purchase', 'purchase-quantity-five', 1, repeat('f', 64), 'quantity_without_names')$$,
  '23505', null,
  'duplicate source ordinal fails'
);

select is(
  (select count(*) from public.formula_agency_memberships where source_type = 'partner_profile'),
  0::bigint,
  'partner profile evidence does not infer agency membership'
);

insert into public.formula_event_registrations (
  id, event_id, member_id, agency_id, source_record_id, seat_type, event_role,
  registration_state, claim_state, claimed_at, revoked_at
) values
  ('50000000-0000-0000-0000-000000000001', 'formula-2026', '00000000-0000-0000-0000-000000000001', null, '40000000-0000-0000-0000-000000000001', 'personal', 'opaque_owner_label', 'claimed', 'active', now(), null),
  ('50000000-0000-0000-0000-000000000002', 'formula-2026', '00000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'business', 'opaque_partner_full', 'claimed', 'active', now(), null),
  ('50000000-0000-0000-0000-000000000003', 'formula-2026', '00000000-0000-0000-0000-000000000003', null, '40000000-0000-0000-0000-000000000003', 'personal', 'opaque_future_role', 'claimed', 'active', now(), null),
  ('50000000-0000-0000-0000-000000000004', 'formula-2026', '00000000-0000-0000-0000-000000000004', null, '40000000-0000-0000-0000-000000000004', 'personal', 'legacy', 'claimed', 'active', now(), null),
  ('50000000-0000-0000-0000-000000000005', 'formula-2026', '00000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000005', 'business', 'candidate_member', 'claimed', 'active', now(), null),
  ('50000000-0000-0000-0000-000000000006', 'formula-2026', '00000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000006', 'business', 'revoked_member', 'claimed', 'active', now(), null),
  ('50000000-0000-0000-0000-000000000007', 'formula-2026', '00000000-0000-0000-0000-000000000007', null, '40000000-0000-0000-0000-000000000007', 'personal', 'opaque_pending', 'claimed', 'active', now(), null),
  ('50000000-0000-0000-0000-000000000008', 'formula-2026', '00000000-0000-0000-0000-000000000008', null, '40000000-0000-0000-0000-000000000008', 'personal', 'opaque_revoked', 'revoked', 'active', now(), now());

select is(
  (select event_role from public.formula_event_registrations where id = '50000000-0000-0000-0000-000000000003'),
  'opaque_future_role',
  'unknown event role remains opaque'
);

select throws_ok(
  $$insert into public.formula_event_registrations
      (event_id, member_id, source_record_id, seat_type, event_role, registration_state, claim_state, claimed_at)
    values
      ('formula-2026', null, '40000000-0000-0000-0000-000000000001', 'personal', 'second_human', 'invited', 'unclaimed', null)$$,
  '23505', null,
  'one source record cannot resolve to two registrations'
);

select throws_ok(
  $$insert into public.formula_event_registrations
      (event_id, member_id, source_record_id, seat_type, event_role, registration_state, claim_state)
    values
      ('formula-2026', '00000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000009', 'personal', 'duplicate_member', 'invited', 'unclaimed')$$,
  '23505', null,
  'one active member registration per event'
);

insert into public.formula_entitlements (
  id, event_registration_id, access_state,
  personal_module_slugs, agency_business_module_slugs, publisher_module_slugs,
  event_attendance_allowed, ai_capture_allowed, dashboard_read_allowed,
  projection_version, revocation_version, revoked_at
) values
  ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'active', array['personal-a','personal-b'], array[]::text[], array[]::text[], true, true, true, 5, 1, null),
  ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', 'active', array['personal-a'], array['business-a','publisher-a'], array['publisher-a'], true, true, true, 7, 2, null),
  ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', 'active', array['personal-a'], array[]::text[], array[]::text[], true, true, true, 1, 0, null),
  ('60000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000004', 'active', array['personal-a'], array[]::text[], array[]::text[], true, true, true, 1, 0, null),
  ('60000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000007', 'pending', array['personal-pending'], array[]::text[], array[]::text[], false, false, false, 1, 0, null),
  ('60000000-0000-0000-0000-000000000008', '50000000-0000-0000-0000-000000000008', 'revoked', array['personal-revoked'], array[]::text[], array[]::text[], false, false, false, 3, 4, now());

select lives_ok(
  $$select formula_private.build_event_access_projection('50000000-0000-0000-0000-000000000001')$$,
  'personal-only registration may have no agency'
);

select throws_ok(
  $$insert into public.formula_entitlements
      (event_registration_id, access_state, agency_business_module_slugs)
    values ('50000000-0000-0000-0000-000000000005', 'active', array['business-a'])$$,
  '23514', 'formula_confirmed_agency_membership_required',
  'candidate membership does not permit business entitlement'
);

select throws_ok(
  $$insert into public.formula_entitlements
      (event_registration_id, access_state, agency_business_module_slugs)
    values ('50000000-0000-0000-0000-000000000006', 'active', array['business-a'])$$,
  '23514', 'formula_confirmed_agency_membership_required',
  'revoked membership does not permit business entitlement'
);

select throws_ok(
  $$insert into public.formula_entitlements
      (event_registration_id, access_state, personal_module_slugs)
    values ('50000000-0000-0000-0000-000000000007', 'active', array['personal-a'])$$,
  '23505', null,
  'exactly one entitlement record exists per registration'
);

select throws_ok(
  $$update public.formula_entitlements
       set publisher_module_slugs = array['outside']
     where id = '60000000-0000-0000-0000-000000000002'$$,
  '23514', null,
  'publisher modules outside agency modules fail'
);

select throws_ok(
  $$update public.formula_entitlements
       set personal_module_slugs = array['zeta','alpha','alpha']
     where id = '60000000-0000-0000-0000-000000000001'$$,
  '23514', null,
  'module arrays must be sorted and unique'
);

select throws_ok(
  $$update public.formula_entitlements set projection_version = 4
     where id = '60000000-0000-0000-0000-000000000001'$$,
  '23514', 'formula_projection_version_cannot_decrease',
  'projection version cannot decrease'
);

select throws_ok(
  $$update public.formula_entitlements set revocation_version = 0
     where id = '60000000-0000-0000-0000-000000000001'$$,
  '23514', 'formula_revocation_version_cannot_decrease',
  'revocation version cannot decrease'
);

select throws_ok(
  $$update public.formula_entitlements
       set access_state = 'active', revoked_at = null
     where id = '60000000-0000-0000-0000-000000000008'$$,
  '23514', 'formula_revoked_access_cannot_reactivate',
  'revoked entitlement cannot reactivate'
);

select throws_ok(
  $$select formula_private.build_event_access_projection('50000000-0000-0000-0000-000000000003')$$,
  'P0001', 'formula_missing_firebase_identity',
  'missing Firebase identity prevents access projection'
);

select throws_ok(
  $$select formula_private.build_event_access_projection('50000000-0000-0000-0000-000000000004')$$,
  'P0001', 'formula_member_not_active',
  'superseded member cannot receive active access'
);

select is(
  formula_private.build_event_access_projection('50000000-0000-0000-0000-000000000007') ->> 'accessState',
  'pending',
  'pending entitlement produces pending access'
);

select is(
  formula_private.build_event_access_projection('50000000-0000-0000-0000-000000000008') ->> 'accessState',
  'revoked',
  'revoked entitlement produces revoked access'
);

select is(
  formula_private.build_event_access_projection('50000000-0000-0000-0000-000000000001') -> 'allowedModuleSlugs',
  '["personal-a", "personal-b"]'::jsonb,
  'active personal entitlement contains personal modules only'
);

select is(
  formula_private.build_event_access_projection('50000000-0000-0000-0000-000000000002') -> 'allowedModuleSlugs',
  '["business-a", "personal-a", "publisher-a"]'::jsonb,
  'confirmed agency membership permits sorted agency modules'
);

select is(
  formula_private.build_event_access_projection('50000000-0000-0000-0000-000000000002') ->> 'agencyId',
  '30000000-0000-0000-0000-000000000001',
  'agency projection uses the confirmed assigned agency'
);

select ok(
  formula_private.build_event_access_projection('50000000-0000-0000-0000-000000000001')
    ?& array[
      'accessContractVersion','eventId','firebaseUid','memberId','registrationId','accessState',
      'captureWriteAllowed','captureWriteFrom','captureWriteUntil','dashboardReadAllowed',
      'dashboardReadUntil','revokedAt','revocationVersion','projectionVersion',
      'registryVersion','registryHash','allowedModuleSlugs','agencyId','agencyWorkspaceId',
      'publisherModuleSlugs','seatType','eventRole','sourceUpdatedAt'
    ],
  'projection matches the Increment 6 field contract'
);

select ok(
  not (
    formula_private.build_event_access_projection('50000000-0000-0000-0000-000000000001')
      ?| array['email','name','displayName','sourcePayload','stripeSessionId','claimToken']
  ),
  'projection omits name, email, source JSON, Stripe, and claim data'
);

select is(
  formula_private.build_event_access_projection('50000000-0000-0000-0000-000000000001') ->> 'registryVersion',
  '4',
  'registry version comes from the event record'
);

select is(
  formula_private.build_event_access_projection('50000000-0000-0000-0000-000000000001') ->> 'registryHash',
  repeat('a', 64),
  'registry hash comes from the event record'
);

select is(
  formula_private.build_event_access_projection('50000000-0000-0000-0000-000000000001') ->> 'eventRole',
  'opaque_owner_label',
  'event role remains an opaque string in the payload'
);

select is(
  formula_private.build_event_access_projection('50000000-0000-0000-0000-000000000001') ->> 'seatType',
  'personal',
  'seat type remains independent from application role'
);

select is(
  formula_private.enqueue_event_access_projection('50000000-0000-0000-0000-000000000001'),
  formula_private.enqueue_event_access_projection('50000000-0000-0000-0000-000000000001'),
  'exact projection retry is idempotent'
);

select is(
  (select target_path from formula_private.projection_outbox
    where event_registration_id = '50000000-0000-0000-0000-000000000001'),
  'formulaEvents/formula-2026/access/firebase-alpha',
  'target path matches the Formula 2026 Firebase contract'
);

insert into formula_private.projection_outbox (
  aggregate_id, event_registration_id, projection_version, revocation_version,
  target_path, payload, payload_sha256
) values (
  '50000000-0000-0000-0000-000000000007',
  '50000000-0000-0000-0000-000000000007',
  2, 0, 'formulaEvents/formula-2026/access/firebase-pending', '{}'::jsonb, repeat('0', 64)
);

select throws_ok(
  $$select formula_private.enqueue_event_access_projection('50000000-0000-0000-0000-000000000007')$$,
  'P0001', 'formula_projection_version_regression',
  'enqueue rejects a lower projection version'
);

insert into formula_private.projection_outbox (
  aggregate_id, event_registration_id, projection_version, revocation_version,
  target_path, payload, payload_sha256
) values (
  '50000000-0000-0000-0000-000000000008',
  '50000000-0000-0000-0000-000000000008',
  3, 5, 'formulaEvents/formula-2026/access/firebase-revoked', '{}'::jsonb, repeat('1', 64)
);

select throws_ok(
  $$select formula_private.enqueue_event_access_projection('50000000-0000-0000-0000-000000000008')$$,
  'P0001', 'formula_revocation_version_regression',
  'enqueue rejects a lower revocation version'
);

update public.formula_entitlements
   set personal_module_slugs = array['personal-a','personal-b','personal-c']
 where id = '60000000-0000-0000-0000-000000000001';

select throws_ok(
  $$select formula_private.enqueue_event_access_projection('50000000-0000-0000-0000-000000000001')$$,
  'P0001', 'formula_projection_version_conflict',
  'same projection version with different payload fails closed'
);

update formula_private.projection_outbox
   set state = 'processed', processed_at = now()
 where event_registration_id = '50000000-0000-0000-0000-000000000001';

select throws_ok(
  $$update formula_private.projection_outbox
       set payload = jsonb_build_object('accessState', 'changed')
     where event_registration_id = '50000000-0000-0000-0000-000000000001'$$,
  '23514', 'formula_processed_projection_is_immutable',
  'processed outbox payload is immutable'
);

select ok(
  not has_function_privilege('anon', 'formula_private.build_event_access_projection(uuid)', 'execute')
  and not has_function_privilege('authenticated', 'formula_private.build_event_access_projection(uuid)', 'execute')
  and has_function_privilege('service_role', 'formula_private.build_event_access_projection(uuid)', 'execute'),
  'private projection builder is service-only'
);

select ok(
  not has_function_privilege('anon', 'formula_private.enqueue_event_access_projection(uuid)', 'execute')
  and not has_function_privilege('authenticated', 'formula_private.enqueue_event_access_projection(uuid)', 'execute')
  and has_function_privilege('service_role', 'formula_private.enqueue_event_access_projection(uuid)', 'execute'),
  'private enqueue function is service-only'
);

select ok(
  not has_table_privilege('anon', 'public.formula_members', 'select')
  and not has_table_privilege('anon', 'public.formula_members', 'insert')
  and not has_table_privilege('authenticated', 'public.formula_members', 'insert'),
  'browser roles cannot select anonymously or mutate Formula public tables'
);

select ok(
  not has_schema_privilege('anon', 'formula_private', 'usage')
  and not has_schema_privilege('authenticated', 'formula_private', 'usage')
  and not has_table_privilege('anon', 'formula_private.claim_tokens', 'select')
  and not has_table_privilege('authenticated', 'formula_private.projection_outbox', 'select'),
  'browser roles cannot access claim, outbox, or audit data'
);

set local role service_role;
select lives_ok(
  $$select formula_private.enqueue_event_access_projection('50000000-0000-0000-0000-000000000002')$$,
  'trusted service context can enqueue a valid projection'
);
reset role;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '70000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated', 'admin@invalid', '', now(), now(), now()
);

insert into public.user_roles (user_id, role)
values ('70000000-0000-0000-0000-000000000001', 'admin');

select set_config('request.jwt.claim.sub', '70000000-0000-0000-0000-000000000001', true);
set local role authenticated;
select ok(
  (select count(*) from public.formula_members) > 0,
  'existing Supabase admin receives bounded Formula SELECT access'
);
reset role;

select set_config('request.jwt.claim.sub', '70000000-0000-0000-0000-000000000002', true);
set local role authenticated;
select is(
  (select count(*) from public.formula_members),
  0::bigint,
  'ordinary authenticated user cannot read Formula rows'
);
reset role;

select ok(
  exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'purchases')
  and exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'partner_profiles')
  and exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'purchases' and policyname = 'Only admins can view purchases')
  and exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'partner_profiles' and policyname = 'admin_partner_profiles_select'),
  'existing source tables and policies remain present'
);

select * from finish();
rollback;
