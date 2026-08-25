create extension if not exists pgtap with schema extensions;

begin;
set local search_path = public, extensions;
select no_plan();

insert into public.formula_members (id) values
  ('90000000-0000-0000-0000-000000000001'),
  ('90000000-0000-0000-0000-000000000002'),
  ('90000000-0000-0000-0000-000000000003'),
  ('90000000-0000-0000-0000-000000000004'),
  ('90000000-0000-0000-0000-000000000005'),
  ('90000000-0000-0000-0000-000000000006');

insert into public.formula_events (
  id, slug, display_name, starts_at, ends_at, timezone, state,
  registry_version, registry_hash
) values (
  'formula-2026', 'formula-service-test', 'Formula service test',
  '2026-10-14T12:00:00Z', '2026-10-16T22:00:00Z', 'America/New_York',
  'active', 4, repeat('a', 64)
);

insert into public.formula_registration_sources (
  id, event_id, source_type, source_id, source_ordinal,
  source_payload_hash, reconciliation_state
) values
  ('91000000-0000-0000-0000-000000000001', 'formula-2026', 'manual', 'service-1', 1, repeat('1', 64), 'resolved'),
  ('91000000-0000-0000-0000-000000000002', 'formula-2026', 'manual', 'service-2', 1, repeat('2', 64), 'resolved'),
  ('91000000-0000-0000-0000-000000000003', 'formula-2026', 'manual', 'service-3', 1, repeat('3', 64), 'resolved'),
  ('91000000-0000-0000-0000-000000000004', 'formula-2026', 'manual', 'service-4', 1, repeat('4', 64), 'resolved'),
  ('91000000-0000-0000-0000-000000000005', 'formula-2026', 'manual', 'service-5', 1, repeat('5', 64), 'resolved'),
  ('91000000-0000-0000-0000-000000000006', 'formula-2026', 'manual', 'service-6', 1, repeat('6', 64), 'resolved');

insert into public.formula_event_registrations (
  id, event_id, member_id, source_record_id, seat_type, event_role,
  registration_state, claim_state, claimed_at
) values
  ('92000000-0000-0000-0000-000000000001', 'formula-2026', '90000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', 'personal', 'attendee', 'claimed', 'active', now()),
  ('92000000-0000-0000-0000-000000000002', 'formula-2026', '90000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000002', 'personal', 'attendee', 'claimed', 'active', now()),
  ('92000000-0000-0000-0000-000000000003', 'formula-2026', '90000000-0000-0000-0000-000000000003', '91000000-0000-0000-0000-000000000003', 'personal', 'attendee', 'claimed', 'active', now()),
  ('92000000-0000-0000-0000-000000000004', 'formula-2026', '90000000-0000-0000-0000-000000000004', '91000000-0000-0000-0000-000000000004', 'personal', 'attendee', 'claimed', 'active', now()),
  ('92000000-0000-0000-0000-000000000005', 'formula-2026', '90000000-0000-0000-0000-000000000005', '91000000-0000-0000-0000-000000000005', 'personal', 'attendee', 'claimed', 'active', now()),
  ('92000000-0000-0000-0000-000000000006', 'formula-2026', '90000000-0000-0000-0000-000000000006', '91000000-0000-0000-0000-000000000006', 'personal', 'attendee', 'claimed', 'active', now());

create temporary table claimed_rows as
  select * from public.formula_claim_projection_outbox_batch('schema-only', 1, 30)
  with no data;
grant insert on claimed_rows to service_role;

select ok(
  has_function_privilege('service_role', 'public.formula_claim_projection_outbox_batch(text,integer,integer)', 'execute')
  and has_function_privilege('service_role', 'public.formula_complete_projection_outbox(uuid,uuid,text,text)', 'execute')
  and has_function_privilege('service_role', 'public.formula_fail_projection_outbox(uuid,uuid,text,text,boolean,integer)', 'execute'),
  'service role can execute all outbox RPCs'
);

select ok(
  not has_function_privilege('anon', 'public.formula_claim_projection_outbox_batch(text,integer,integer)', 'execute')
  and not has_function_privilege('authenticated', 'public.formula_claim_projection_outbox_batch(text,integer,integer)', 'execute')
  and not has_function_privilege('anon', 'public.formula_complete_projection_outbox(uuid,uuid,text,text)', 'execute')
  and not has_function_privilege('authenticated', 'public.formula_fail_projection_outbox(uuid,uuid,text,text,boolean,integer)', 'execute'),
  'browser roles cannot execute claim, complete, or fail RPCs'
);

set local role anon;
select throws_ok(
  $$select public.formula_claim_projection_outbox_batch('browser', 1, 30)$$,
  '42501', null, 'anon invocation of claim is denied'
);
reset role;

set local role authenticated;
select throws_ok(
  $$select public.formula_complete_projection_outbox(
      'a0000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000001', repeat('0', 64), 'applied')$$,
  '42501', null, 'authenticated invocation of complete is denied'
);
reset role;

select throws_ok(
  $$select public.formula_claim_projection_outbox_batch('', 1, 30)$$,
  'P0001', 'formula_outbox_worker_id_invalid', 'empty worker ID fails closed'
);
select throws_ok(
  $$select public.formula_claim_projection_outbox_batch('worker', 0, 30)$$,
  'P0001', 'formula_outbox_batch_size_invalid', 'batch size below one fails closed'
);
select throws_ok(
  $$select public.formula_claim_projection_outbox_batch('worker', 51, 30)$$,
  'P0001', 'formula_outbox_batch_size_invalid', 'batch size above fifty fails closed'
);
select throws_ok(
  $$select public.formula_claim_projection_outbox_batch('worker', 1, 29)$$,
  'P0001', 'formula_outbox_lease_seconds_invalid', 'lease below thirty seconds fails closed'
);
select throws_ok(
  $$select public.formula_claim_projection_outbox_batch('worker', 1, 601)$$,
  'P0001', 'formula_outbox_lease_seconds_invalid', 'lease above six hundred seconds fails closed'
);

insert into formula_private.projection_outbox (
  id, aggregate_id, event_registration_id, projection_version,
  revocation_version, target_path, payload, payload_sha256
)
select
  'a0000000-0000-0000-0000-000000000001',
  '92000000-0000-0000-0000-000000000001',
  '92000000-0000-0000-0000-000000000001', 1, 0,
  'formulaEvents/formula-2026/access/firebase-service-1', p,
  encode(extensions.digest(convert_to(p::text, 'UTF8'), 'sha256'), 'hex')
from (select jsonb_build_object(
  'accessContractVersion', 1, 'eventId', 'formula-2026',
  'firebaseUid', 'firebase-service-1', 'registrationId',
  '92000000-0000-0000-0000-000000000001', 'memberId',
  '90000000-0000-0000-0000-000000000001', 'accessState', 'active',
  'projectionVersion', 1, 'revocationVersion', 0,
  'registryVersion', 4, 'registryHash', repeat('a', 64)
) p) payload;

set local role service_role;
insert into claimed_rows
select * from public.formula_claim_projection_outbox_batch('worker-one', 1, 60);
reset role;

select is((select count(*) from claimed_rows), 1::bigint, 'service role claims one due row');
select is((select attempt_count from claimed_rows), 1, 'claim increments attempts exactly once');
select ok(
  (select lease_token is not null and lease_expires_at > now() from claimed_rows),
  'claim assigns a live lease'
);
select is(
  (select encode(extensions.digest(convert_to(payload_text, 'UTF8'), 'sha256'), 'hex') from claimed_rows),
  (select payload_sha256 from claimed_rows),
  'returned exact UTF-8 payload text matches payload SHA-256'
);
select ok(
  not ((select payload_text::jsonb from claimed_rows) ?| array[
    'email','name','invitedEmail','normalizedEmail','stripeCustomerId',
    'stripeSessionId','claimToken','sourcePayload','workbook','pageImage'
  ]),
  'claim output payload contains no PII, Stripe, token, or workbook fields'
);
select is(
  (select count(*) from public.formula_claim_projection_outbox_batch('worker-two', 1, 60)),
  0::bigint, 'a second worker cannot claim an unexpired lease'
);

select throws_ok(
  format(
    'select public.formula_complete_projection_outbox(%L, null, %L, %L)',
    (select outbox_id from claimed_rows), (select payload_sha256 from claimed_rows), 'applied'
  ), 'P0001', 'formula_outbox_lease_conflict', 'completion requires a lease token'
);
select throws_ok(
  format(
    'select public.formula_complete_projection_outbox(%L, %L, %L, %L)',
    (select outbox_id from claimed_rows), (select lease_token from claimed_rows), repeat('0', 64), 'applied'
  ), 'P0001', 'formula_outbox_payload_hash_mismatch', 'payload hash mismatch fails closed'
);
select is(
  public.formula_complete_projection_outbox(
    (select outbox_id from claimed_rows), (select lease_token from claimed_rows),
    (select payload_sha256 from claimed_rows), 'applied'
  ), 'applied', 'current lease holder completes the row'
);
select is(
  public.formula_complete_projection_outbox(
    (select outbox_id from claimed_rows), (select lease_token from claimed_rows),
    (select payload_sha256 from claimed_rows), 'applied'
  ), 'applied', 'exact completion replay is idempotent'
);
select throws_ok(
  $$update formula_private.projection_outbox
       set payload = jsonb_build_object('accessState', 'revoked')
     where id = 'a0000000-0000-0000-0000-000000000001'$$,
  '23514', 'formula_processed_projection_is_immutable',
  'processed payload cannot be changed'
);

truncate claimed_rows;
insert into formula_private.projection_outbox (
  id, aggregate_id, event_registration_id, projection_version,
  revocation_version, target_path, payload, payload_sha256
)
select 'a0000000-0000-0000-0000-000000000002',
  '92000000-0000-0000-0000-000000000002',
  '92000000-0000-0000-0000-000000000002', 1, 0,
  'formulaEvents/formula-2026/access/firebase-service-2', p,
  encode(extensions.digest(convert_to(p::text, 'UTF8'), 'sha256'), 'hex')
from (select jsonb_build_object('eventId','formula-2026','firebaseUid','firebase-service-2','accessState','active') p) payload;
insert into claimed_rows select * from public.formula_claim_projection_outbox_batch('failure-worker', 1, 60);
select is(
  public.formula_fail_projection_outbox(
    (select outbox_id from claimed_rows), (select lease_token from claimed_rows),
    (select payload_sha256 from claimed_rows), 'firestore_unavailable', true, 30
  ), 'failed', 'retryable failure returns the row to failed state'
);
select ok(
  (select state = 'failed' and lease_token is null
      and next_attempt_at between now() + interval '25 seconds' and now() + interval '35 seconds'
     from formula_private.projection_outbox where id = 'a0000000-0000-0000-0000-000000000002'),
  'retryable failure uses trusted time and clears its lease'
);

update formula_private.projection_outbox set next_attempt_at = now() where id = 'a0000000-0000-0000-0000-000000000002';
truncate claimed_rows;
insert into claimed_rows select * from public.formula_claim_projection_outbox_batch('terminal-worker', 1, 60);
select is(
  public.formula_fail_projection_outbox(
    (select outbox_id from claimed_rows), (select lease_token from claimed_rows),
    (select payload_sha256 from claimed_rows), 'target_path_mismatch', false, 0
  ), 'dead_letter', 'terminal validation failure becomes dead letter'
);
select throws_ok(
  $$select public.formula_fail_projection_outbox(
      'a0000000-0000-0000-0000-000000000002',
      'b0000000-0000-0000-0000-000000000002', repeat('0', 64),
      'raw_provider_body', true, 30)$$,
  'P0001', 'formula_outbox_error_code_invalid', 'unknown error code fails closed'
);
select throws_ok(
  $$select public.formula_complete_projection_outbox(
      'a0000000-0000-0000-0000-000000000002',
      'b0000000-0000-0000-0000-000000000002', repeat('0', 64), 'raw_result')$$,
  'P0001', 'formula_outbox_result_code_invalid', 'unknown result code fails closed'
);

insert into formula_private.projection_outbox (
  id, aggregate_id, event_registration_id, projection_version, revocation_version,
  target_path, payload, payload_sha256, state, attempt_count,
  lease_token, leased_by, last_attempt_at, lease_expires_at
)
select 'a0000000-0000-0000-0000-000000000004',
  '92000000-0000-0000-0000-000000000004',
  '92000000-0000-0000-0000-000000000004', 1, 0,
  'formulaEvents/formula-2026/access/firebase-service-4', p,
  encode(extensions.digest(convert_to(p::text, 'UTF8'), 'sha256'), 'hex'),
  'processing', 1, 'b0000000-0000-0000-0000-000000000004',
  'crashed-worker', now() - interval '2 minutes', now() - interval '1 minute'
from (select jsonb_build_object('eventId','formula-2026','firebaseUid','firebase-service-4','accessState','active') p) payload;
truncate claimed_rows;
insert into claimed_rows select * from public.formula_claim_projection_outbox_batch('recovery-worker', 1, 60);
select ok(
  (select outbox_id = 'a0000000-0000-0000-0000-000000000004'
      and lease_token <> 'b0000000-0000-0000-0000-000000000004'
      and attempt_count = 2 from claimed_rows),
  'expired lease is recovered with a new lease generation'
);
select throws_ok(
  format(
    'select public.formula_complete_projection_outbox(%L, %L, %L, %L)',
    'a0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000004',
    (select payload_sha256 from claimed_rows), 'applied'
  ), 'P0001', 'formula_outbox_lease_conflict', 'replaced lease cannot complete'
);

insert into formula_private.projection_outbox (
  id, aggregate_id, event_registration_id, projection_version, revocation_version,
  target_path, payload, payload_sha256, state, attempt_count,
  lease_token, leased_by, last_attempt_at, lease_expires_at
)
select 'a0000000-0000-0000-0000-000000000005',
  '92000000-0000-0000-0000-000000000005',
  '92000000-0000-0000-0000-000000000005', 1, 0,
  'formulaEvents/formula-2026/access/firebase-service-5', p,
  encode(extensions.digest(convert_to(p::text, 'UTF8'), 'sha256'), 'hex'),
  'processing', 1, 'b0000000-0000-0000-0000-000000000005',
  'live-worker', now(), now() + interval '5 minutes'
from (select jsonb_build_object('eventId','formula-2026','firebaseUid','firebase-service-5','accessState','active') p) payload;
select is(
  (select count(*) from public.formula_claim_projection_outbox_batch('no-steal-worker', 1, 60)),
  0::bigint, 'unexpired lease is not stolen'
);

-- Clear the recovered lease before testing ordering in isolation.
select public.formula_complete_projection_outbox(
  (select outbox_id from claimed_rows), (select lease_token from claimed_rows),
  (select payload_sha256 from claimed_rows), 'applied'
);
insert into formula_private.projection_outbox (
  id, aggregate_id, event_registration_id, projection_version, revocation_version,
  target_path, payload, payload_sha256
)
select id, registration_id, registration_id, projection_version, revocation_version,
  target_path, p, encode(extensions.digest(convert_to(p::text, 'UTF8'), 'sha256'), 'hex')
from (
  values
    ('a0000000-0000-0000-0000-000000000006'::uuid, '92000000-0000-0000-0000-000000000003'::uuid, 1::bigint, 0::bigint,
     'formulaEvents/formula-2026/access/firebase-service-3',
     jsonb_build_object('eventId','formula-2026','firebaseUid','firebase-service-3','accessState','active')),
    ('a0000000-0000-0000-0000-000000000007'::uuid, '92000000-0000-0000-0000-000000000003'::uuid, 2::bigint, 2::bigint,
     'formulaEvents/formula-2026/access/firebase-service-3',
     jsonb_build_object('eventId','formula-2026','firebaseUid','firebase-service-3','accessState','revoked')),
    ('a0000000-0000-0000-0000-000000000008'::uuid, '92000000-0000-0000-0000-000000000006'::uuid, 1::bigint, 0::bigint,
     'formulaEvents/formula-2026/access/firebase-service-6',
     jsonb_build_object('eventId','formula-2026','firebaseUid','firebase-service-6','accessState','active'))
) rows(id, registration_id, projection_version, revocation_version, target_path, p);
truncate claimed_rows;
insert into claimed_rows select * from public.formula_claim_projection_outbox_batch('ordering-worker', 1, 60);
select is(
  (select outbox_id from claimed_rows),
  'a0000000-0000-0000-0000-000000000007'::uuid,
  'newer revocation is delivered ahead of ordinary active access'
);
select ok(
  (select state = 'processed' and result_code = 'superseded_before_delivery'
     from formula_private.projection_outbox where id = 'a0000000-0000-0000-0000-000000000006'),
  'lower pending row becomes superseded before delivery'
);

insert into formula_private.projection_outbox (
  id, aggregate_id, event_registration_id, projection_version, revocation_version,
  target_path, payload, payload_sha256, attempt_count
)
select 'a0000000-0000-0000-0000-000000000009',
  '92000000-0000-0000-0000-000000000004',
  '92000000-0000-0000-0000-000000000004', 2, 0,
  'formulaEvents/formula-2026/access/firebase-service-4', p,
  encode(extensions.digest(convert_to(p::text, 'UTF8'), 'sha256'), 'hex'), 8
from (select jsonb_build_object('eventId','formula-2026','firebaseUid','firebase-service-4','accessState','active') p) payload;
select count(*)
  from public.formula_claim_projection_outbox_batch('exhaustion-worker', 1, 60);
select ok(
  (select state = 'dead_letter' and result_code = 'maximum_attempts_exhausted'
     from formula_private.projection_outbox where id = 'a0000000-0000-0000-0000-000000000009'),
  'maximum-attempt exhaustion becomes dead letter'
);

select is(
  (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname like 'formula_%'
      and c.relrowsecurity),
  9::bigint, 'all nine existing Formula public tables retain RLS'
);
select ok(
  not has_table_privilege('anon', 'public.formula_members', 'select')
  and not has_table_privilege('authenticated', 'public.formula_members', 'insert')
  and not has_schema_privilege('anon', 'formula_private', 'usage')
  and not has_schema_privilege('authenticated', 'formula_private', 'usage'),
  'existing Formula browser grants and private-schema boundary remain unchanged'
);

select * from finish();
rollback;
