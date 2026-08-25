create extension if not exists pgtap with schema extensions;

begin;
set local search_path = public, extensions;
select no_plan();

select vault.create_secret(
  repeat('b', 64),
  'formula_projection_firebase_bridge',
  'Formula roster activation test secret'
);

insert into public.purchases (
  id, email, name, stripe_session_id, amount, pass_type, tier, quantity, created_at
) values
  ('a1000000-0000-0000-0000-000000000001', ' Owner@Example.com ', 'Owner One', 'formula-roster-owner', 100, 'agencyOwner', 'standard', 1, '2026-08-01T12:00:00Z'),
  ('a1000000-0000-0000-0000-000000000002', 'owner@example.com', 'Owner Duplicate', 'formula-roster-duplicate', 100, 'team', 'standard', 1, '2026-08-02T12:00:00Z'),
  ('a1000000-0000-0000-0000-000000000003', 'unknown@example.com', 'Unknown Pass', 'formula-roster-unknown', 100, 'unknown', 'standard', 1, '2026-08-03T12:00:00Z'),
  ('a1000000-0000-0000-0000-000000000004', 'group@example.com', 'Group Buyer', 'formula-roster-group', 200, 'team', 'standard', 2, '2026-08-04T12:00:00Z'),
  ('a1000000-0000-0000-0000-000000000005', 'invalid-email', 'Invalid Email', 'formula-roster-invalid-email', 100, 'team', 'standard', 1, '2026-08-05T12:00:00Z');

select is(
  (select count(*) from public.formula_member_emails where normalized_email = 'owner@example.com' and state = 'verified'),
  1::bigint,
  'duplicate clean purchases consolidate into one verified Formula member email'
);

select is(
  (select count(*) from public.formula_event_registrations registration
    join public.formula_member_emails email on email.member_id = registration.member_id
   where registration.event_id = 'formula-2026' and email.normalized_email = 'owner@example.com'),
  1::bigint,
  'duplicate clean purchases consolidate into one active event registration'
);

select results_eq(
  $$select reconciliation_state from public.formula_registration_sources
     where event_id = 'formula-2026' and source_id in (
       'a1000000-0000-0000-0000-000000000001',
       'a1000000-0000-0000-0000-000000000002'
     ) order by reconciliation_state$$,
  $$values ('already_registered'::text), ('resolved'::text)$$,
  'canonical and duplicate purchase evidence remain represented'
);

select is(
  (select reconciliation_state from public.formula_registration_sources
    where source_id = 'a1000000-0000-0000-0000-000000000003'),
  'unclassified_pass_type',
  'unknown pass remains review-only'
);

select is(
  (select reconciliation_state from public.formula_registration_sources
    where source_id = 'a1000000-0000-0000-0000-000000000004'),
  'quantity_without_names',
  'multi-seat purchase remains review-only until every attendee is named'
);

select is(
  (select review_reason from public.formula_registration_sources
    where source_id = 'a1000000-0000-0000-0000-000000000005'),
  'invalid_email',
  'malformed attendee email remains review-only'
);

select results_eq(
  $$select publisher_module_slugs from public.formula_entitlements entitlement
    join public.formula_event_registrations registration
      on registration.id = entitlement.event_registration_id
    join public.formula_member_emails email on email.member_id = registration.member_id
   where email.normalized_email = 'owner@example.com'$$,
  $$values (array['s1','s2','s4','s5','s7']::text[])$$,
  'an owner purchase grants publisher responsibility for agency modules'
);

set local role anon;
select throws_ok(
  $$select public.formula_bridge_link_firebase_identity(
      repeat('x', 64), 'firebase-owner', 'owner@example.com', true)$$,
  '42501', 'formula_projection_bridge_unauthorized',
  'identity link rejects the wrong bridge secret'
);
select is(
  public.formula_bridge_link_firebase_identity(
    repeat('b', 64), 'firebase-owner', 'OWNER@example.com', true
  ),
  'linked',
  'verified Firebase email links to the reconciled Formula member'
);
reset role;

select is(
  (select count(*) from public.formula_auth_identities
    where provider_subject = 'firebase-owner' and link_state = 'active'),
  1::bigint,
  'identity link creates one active Firebase identity'
);

select is(
  (select count(*) from formula_private.projection_outbox outbox
    join public.formula_event_registrations registration
      on registration.id = outbox.event_registration_id
    join public.formula_member_emails email on email.member_id = registration.member_id
   where email.normalized_email = 'owner@example.com'),
  1::bigint,
  'first identity link enqueues one access projection'
);

set local role anon;
select is(
  public.formula_bridge_link_firebase_identity(
    repeat('b', 64), 'firebase-owner', 'owner@example.com', true
  ),
  'existing',
  'exact identity-link replay is idempotent'
);
select is(
  public.formula_bridge_link_firebase_identity(
    repeat('b', 64), 'firebase-unverified', 'owner@example.com', false
  ),
  'email_unverified',
  'unverified Firebase email never links'
);
reset role;

select is(
  (select count(*) from formula_private.projection_outbox outbox
    join public.formula_event_registrations registration
      on registration.id = outbox.event_registration_id
    join public.formula_member_emails email on email.member_id = registration.member_id
   where email.normalized_email = 'owner@example.com'),
  1::bigint,
  'identity-link replay does not duplicate the projection version'
);

update public.purchases
   set pass_type = 'team'
 where id = 'a1000000-0000-0000-0000-000000000003';

select is(
  (select count(*) from public.formula_member_emails
    where normalized_email = 'unknown@example.com' and state = 'verified'),
  1::bigint,
  'correcting an unknown pass automatically reconciles the purchase'
);

select * from finish();
rollback;
