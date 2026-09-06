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
  ('a1000000-0000-0000-0000-000000000005', 'invalid-email', 'Invalid Email', 'formula-roster-invalid-email', 100, 'team', 'standard', 1, '2026-08-05T12:00:00Z'),
  ('a1000000-0000-0000-0000-000000000006', 'new-claim@example.com', 'New Claim', 'formula-roster-new-claim', 100, 'team', 'standard', 1, '2026-08-06T12:00:00Z'),
  ('a1000000-0000-0000-0000-000000000007', 'pending@example.com', 'Pending Claim', 'formula-roster-pending', 100, 'team', 'standard', 1, '2026-08-07T12:00:00Z'),
  ('a1000000-0000-0000-0000-000000000008', 'suspended@example.com', 'Suspended Claim', 'formula-roster-suspended', 100, 'team', 'standard', 1, '2026-08-08T12:00:00Z'),
  ('a1000000-0000-0000-0000-000000000009', 'revoked@example.com', 'Revoked Claim', 'formula-roster-revoked', 100, 'team', 'standard', 1, '2026-08-09T12:00:00Z');

insert into public.formula_members (id)
values ('a2000000-0000-0000-0000-000000000001');

insert into public.formula_member_emails (
  member_id, original_email, normalized_email, state, is_primary,
  verified_at, source_type, source_id
) values (
  'a2000000-0000-0000-0000-000000000001',
  'no-ticket@example.com', 'no-ticket@example.com', 'verified', true,
  now(), 'readiness_test', 'no-ticket'
);

update public.formula_entitlements entitlement
   set access_state = 'pending',
       event_attendance_allowed = false,
       ai_capture_allowed = false,
       dashboard_read_allowed = false,
       partner_hub_allowed = false
  from public.formula_event_registrations registration
  join public.formula_member_emails email on email.member_id = registration.member_id
 where entitlement.event_registration_id = registration.id
   and email.normalized_email = 'pending@example.com';

update public.formula_entitlements entitlement
   set access_state = 'suspended'
  from public.formula_event_registrations registration
  join public.formula_member_emails email on email.member_id = registration.member_id
 where entitlement.event_registration_id = registration.id
   and email.normalized_email = 'suspended@example.com';

update public.formula_entitlements entitlement
   set access_state = 'revoked', revoked_at = now()
  from public.formula_event_registrations registration
  join public.formula_member_emails email on email.member_id = registration.member_id
 where entitlement.event_registration_id = registration.id
   and email.normalized_email = 'revoked@example.com';

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
    repeat('b', 64), 'firebase-new-claim', 'new-claim@example.com', false
  ),
  'email_verification_required',
  'an unverified new Firebase account cannot claim an eligible ticket email'
);
reset role;

select is(
  (select count(*) from public.formula_auth_identities
    where provider_subject = 'firebase-new-claim'),
  0::bigint,
  'blocked first claim creates no Firebase identity'
);

select is(
  (select count(*) from formula_private.projection_outbox outbox
    join public.formula_event_registrations registration
      on registration.id = outbox.event_registration_id
    join public.formula_member_emails email on email.member_id = registration.member_id
   where email.normalized_email = 'new-claim@example.com'),
  0::bigint,
  'blocked first claim creates no projection work'
);

select results_eq(
  $$select registration.registration_state, registration.claim_state, entitlement.access_state
      from public.formula_event_registrations registration
      join public.formula_member_emails email on email.member_id = registration.member_id
      join public.formula_entitlements entitlement on entitlement.event_registration_id = registration.id
     where email.normalized_email = 'new-claim@example.com'$$,
  $$values ('invited'::text, 'unclaimed'::text, 'active'::text)$$,
  'blocked first claim leaves registration and entitlement states unchanged'
);

set local role anon;
select is(
  public.formula_bridge_link_firebase_identity(
    repeat('b', 64), 'firebase-no-ticket', 'no-ticket@example.com', true
  ),
  'not_eligible',
  'a verified member email without an eligible registration cannot create an identity'
);
select is(
  public.formula_bridge_link_firebase_identity(
    repeat('b', 64), 'firebase-suspended', 'suspended@example.com', true
  ),
  'not_eligible',
  'a suspended entitlement cannot be claimed by logging in'
);
select is(
  public.formula_bridge_link_firebase_identity(
    repeat('b', 64), 'firebase-revoked', 'revoked@example.com', true
  ),
  'not_eligible',
  'a revoked entitlement cannot be claimed by logging in'
);
select is(
  public.formula_bridge_link_firebase_identity(
    repeat('b', 64), 'firebase-pending', 'pending@example.com', true
  ),
  'linked',
  'an initial pending entitlement activates after a verified claim'
);
reset role;

select is(
  (select count(*) from public.formula_auth_identities
    where provider_subject in ('firebase-no-ticket', 'firebase-suspended', 'firebase-revoked')),
  0::bigint,
  'ineligible and explicitly denied first claims create no Firebase identities'
);

select results_eq(
  $$select email.normalized_email, entitlement.access_state
      from public.formula_event_registrations registration
      join public.formula_member_emails email on email.member_id = registration.member_id
      join public.formula_entitlements entitlement on entitlement.event_registration_id = registration.id
     where email.normalized_email in ('pending@example.com', 'revoked@example.com', 'suspended@example.com')
     order by email.normalized_email$$,
  $$values
      ('pending@example.com'::text, 'active'::text),
      ('revoked@example.com'::text, 'revoked'::text),
      ('suspended@example.com'::text, 'suspended'::text)$$,
  'claiming activates pending access while preserving suspended and revoked access'
);

set local role anon;
select is(
  public.formula_bridge_link_firebase_identity(
    repeat('b', 64), 'firebase-new-claim', 'new-claim@example.com', true
  ),
  'linked',
  'a verified new Firebase account may claim its eligible ticket email'
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
    repeat('b', 64), 'firebase-owner', 'owner@example.com', false
  ),
  'existing',
  'an exact existing identity remains usable without a newly verified claim'
);
select is(
  public.formula_bridge_link_firebase_identity(
    repeat('b', 64), 'firebase-unverified', 'owner@example.com', false
  ),
  'identity_conflict',
  'a different Firebase UID cannot replace an existing link'
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
