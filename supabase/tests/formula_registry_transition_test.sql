create extension if not exists pgtap with schema extensions;

begin;
set local search_path = public, extensions;
select no_plan();

update public.formula_events
   set registry_hash = 'e848e7a952badb1e1c072fc81050cafafca597ea45189f91cf30645fcfc5e404'
 where id = 'formula-2026';

select vault.create_secret(
  repeat('r', 64),
  'formula_projection_firebase_bridge',
  'Formula registry transition test secret'
);

insert into public.purchases (
  id, email, name, stripe_session_id, amount, pass_type, tier, quantity, created_at
) values (
  'a3000000-0000-0000-0000-000000000001',
  'registry-transition@example.com',
  'Registry Transition',
  'formula-registry-transition',
  100,
  'agencyOwner',
  'standard',
  1,
  '2026-09-05T12:00:00Z'
);

set local role anon;
select is(
  public.formula_bridge_link_firebase_identity(
    repeat('r', 64),
    'firebase-registry-transition',
    'registry-transition@example.com',
    true
  ),
  'linked',
  'fixture begins with a linked identity and old-hash projection'
);
reset role;

select is(
  (select payload ->> 'registryHash'
     from formula_private.projection_outbox
    where target_path = 'formulaEvents/formula-2026/access/firebase-registry-transition'
    order by projection_version desc
    limit 1),
  'e848e7a952badb1e1c072fc81050cafafca597ea45189f91cf30645fcfc5e404',
  'fixture projection carries the old registry hash before transition'
);

select is(
  formula_private.transition_formula_2026_registry(),
  1,
  'transition reprojects every linked Formula 2026 entitlement'
);

select is(
  (select registry_hash from public.formula_events where id = 'formula-2026'),
  'e6d64ba4b9b13f1d577d7ace6a8e406e67cdccc6cf03af8290caee21c1b49faa',
  'event contract advances to the current registry hash'
);

select is(
  (select projection_version
     from public.formula_entitlements entitlement
     join public.formula_event_registrations registration
       on registration.id = entitlement.event_registration_id
     join public.formula_member_emails email on email.member_id = registration.member_id
    where email.normalized_email = 'registry-transition@example.com'),
  2::bigint,
  'transition increments the entitlement projection version'
);

select results_eq(
  $$select projection_version, payload ->> 'registryHash'
      from formula_private.projection_outbox
     where target_path = 'formulaEvents/formula-2026/access/firebase-registry-transition'
     order by projection_version$$,
  $$values
      (1::bigint, 'e848e7a952badb1e1c072fc81050cafafca597ea45189f91cf30645fcfc5e404'::text),
      (2::bigint, 'e6d64ba4b9b13f1d577d7ace6a8e406e67cdccc6cf03af8290caee21c1b49faa'::text)$$,
  'new monotonic outbox row carries the current registry hash'
);

select is(
  formula_private.transition_formula_2026_registry(),
  0,
  'replaying the transition is idempotent'
);

select is(
  (select count(*)
     from formula_private.projection_outbox
    where target_path = 'formulaEvents/formula-2026/access/firebase-registry-transition'),
  2::bigint,
  'idempotent replay creates no additional projection'
);

update public.formula_events set registry_hash = repeat('f', 64) where id = 'formula-2026';
select throws_ok(
  $$select formula_private.transition_formula_2026_registry()$$,
  '23514',
  'formula_2026_registry_hash_unexpected',
  'transition rejects an unrecognized source hash'
);

select * from finish();
rollback;
