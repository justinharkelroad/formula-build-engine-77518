create extension if not exists pgtap with schema extensions;

begin;
set local search_path = public, extensions;
select no_plan();

insert into public.purchases (
  id, email, name, stripe_session_id, amount, pass_type, tier, quantity, created_at
) values (
  'a2000000-0000-0000-0000-000000000001',
  'buyer@example.com',
  'Past Buyer',
  'formula-admin-roster-purchase',
  200,
  'team',
  'standard',
  2,
  '2026-08-05T12:00:00Z'
);

select is(
  public.formula_admin_upsert_attendee(
    'admin-test', 'Assigned One', 'assigned-one@example.com', 'team',
    null, null, 'Assigned Agency',
    'a2000000-0000-0000-0000-000000000001', 1
  ) ->> 'result',
  'seat_assigned',
  'an admin can assign the first seat from a historical multi-seat purchase'
);

select is(
  public.formula_admin_upsert_attendee(
    'admin-test', 'Assigned Two', 'assigned-two@example.com', 'team',
    null, null, 'Assigned Agency',
    'a2000000-0000-0000-0000-000000000001', 2
  ) ->> 'result',
  'seat_assigned',
  'an admin can assign each remaining purchase seat by ordinal'
);

select is(
  (public.formula_admin_roster_snapshot() -> 'summary' ->> 'unassignedPurchaseSeats')::integer,
  0,
  'the snapshot reports no remaining seat after both ordinals are assigned'
);

select throws_ok(
  $$select public.formula_admin_upsert_attendee(
      'admin-test', 'Duplicate Seat', 'duplicate-seat@example.com', 'team',
      null, null, null,
      'a2000000-0000-0000-0000-000000000001', 2
    )$$,
  'P0001',
  'formula_purchase_seat_already_assigned',
  'an assigned purchase ordinal cannot be reused'
);

select is(
  public.formula_admin_upsert_attendee(
    'admin-test', 'Manual Owner', 'manual-owner@example.com', 'agencyOwner',
    null, null, 'Manual Agency', null, null
  ) ->> 'result',
  'manual_added',
  'an admin can add an approved attendee without fabricating a purchase'
);

select results_eq(
  $$select entitlement.publisher_module_slugs
      from public.formula_entitlements entitlement
      join public.formula_event_registrations registration
        on registration.id = entitlement.event_registration_id
     where registration.normalized_email = 'manual-owner@example.com'$$,
  $$values (array['s1','s2','s4','s5','s7']::text[])$$,
  'manual agency owners receive publisher responsibility'
);

select is(
  public.formula_admin_upsert_attendee(
    'admin-test', 'Manual Member', 'manual-member@example.com', 'team',
    (select id from public.formula_event_registrations
      where normalized_email = 'manual-owner@example.com'),
    null, 'Manual Agency', null, null
  ) ->> 'result',
  'updated',
  'an admin can edit the attendee email and role'
);

select results_eq(
  $$select entitlement.publisher_module_slugs
      from public.formula_entitlements entitlement
      join public.formula_event_registrations registration
        on registration.id = entitlement.event_registration_id
     where registration.normalized_email = 'manual-member@example.com'$$,
  $$values (array[]::text[])$$,
  'changing an owner to a team member removes publisher responsibility'
);

insert into public.formula_auth_identities (
  member_id, provider, provider_subject, link_state, linked_at
)
select registration.member_id, 'firebase', 'firebase-manual-member', 'active', now()
  from public.formula_event_registrations registration
 where registration.normalized_email = 'manual-member@example.com';

select is(
  public.formula_admin_set_attendee_access(
    'admin-test',
    (select id from public.formula_event_registrations
      where normalized_email = 'manual-member@example.com'),
    'suspend'
  ) ->> 'action',
  'suspend',
  'an admin can suspend a linked attendee'
);

select is(
  (select access_state from public.formula_entitlements entitlement
    join public.formula_event_registrations registration
      on registration.id = entitlement.event_registration_id
   where registration.normalized_email = 'manual-member@example.com'),
  'suspended',
  'suspension updates the entitlement'
);

select is(
  public.formula_admin_set_attendee_access(
    'admin-test',
    (select id from public.formula_event_registrations
      where normalized_email = 'manual-member@example.com'),
    'activate'
  ) ->> 'action',
  'activate',
  'an admin can restore a suspended attendee'
);

select is(
  (select registration_state from public.formula_event_registrations
    where normalized_email = 'manual-member@example.com'),
  'claimed',
  'restoring a linked attendee returns the registration to claimed access'
);

select is(
  public.formula_admin_set_attendee_access(
    'admin-test',
    (select id from public.formula_event_registrations
      where normalized_email = 'manual-member@example.com'),
    'revoke'
  ) ->> 'action',
  'revoke',
  'an admin can permanently revoke an attendee'
);

select throws_ok(
  $$select public.formula_admin_set_attendee_access(
      'admin-test',
      (select id from public.formula_event_registrations
        where normalized_email = 'manual-member@example.com'),
      'activate'
    )$$,
  'P0001',
  'formula_attendee_registration_revoked',
  'revoked access cannot be reactivated'
);

select is(
  (select count(*) from formula_private.audit_events
    where actor_id = 'admin-test'
      and event_type in ('formula_attendee_upserted', 'formula_attendee_access_changed')),
  7::bigint,
  'each successful roster mutation writes a PII-free audit event'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.formula_admin_upsert_attendee(text,text,text,text,uuid,uuid,text,uuid,integer)',
    'execute'
  )
  and has_function_privilege(
    'service_role',
    'public.formula_admin_upsert_attendee(text,text,text,text,uuid,uuid,text,uuid,integer)',
    'execute'
  ),
  'only the service role can execute roster mutations'
);

select * from finish();
rollback;
