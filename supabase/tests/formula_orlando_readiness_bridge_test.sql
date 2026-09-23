create extension if not exists pgtap with schema extensions;
begin;
set local search_path = public, extensions;
select no_plan();
select vault.create_secret(repeat('o', 64), 'formula_projection_firebase_bridge', 'Orlando readiness test');

insert into public.purchases (id, email, name, stripe_session_id, amount, pass_type, tier, quantity)
values
 ('a3000000-0000-0000-0000-000000000001', 'Buyer@Example.com', 'Group Buyer', 'orlando-group', 300, 'team', 'standard', 3),
 ('a3000000-0000-0000-0000-000000000002', 'solo@example.com', 'Solo Team', 'orlando-solo', 100, 'team', 'standard', 1),
 ('a3000000-0000-0000-0000-000000000003', 'other@example.com', 'Other Buyer', 'orlando-other', 200, 'team', 'standard', 2);

select public.formula_admin_upsert_attendee('orlando-test', 'Named Team', 'named@example.com',
  'team', null, null, 'Confirmed Agency', 'a3000000-0000-0000-0000-000000000001', 1);
select public.formula_admin_upsert_attendee('orlando-test', 'Not Signed In', 'not-signed-in@example.com',
  'team', null, null, 'Confirmed Agency', null, null);
insert into public.formula_auth_identities(member_id, provider, provider_subject, link_state, linked_at)
select member_id, 'firebase', case normalized_email when 'named@example.com' then 'orlando-named'
  else 'orlando-solo' end, 'active', now()
from public.formula_event_registrations where normalized_email in ('named@example.com', 'solo@example.com');

select throws_ok($$select public.formula_bridge_orlando_readiness('wrong', 'orlando-named', null)$$,
  '42501', 'formula_projection_bridge_unauthorized', 'personal bridge rejects wrong secret');
select throws_ok($$select public.formula_bridge_orlando_roster('wrong', 0, 50)$$,
  '42501', 'formula_projection_bridge_unauthorized', 'staff bridge rejects wrong secret');
select throws_ok($$select public.formula_bridge_orlando_readiness(repeat('o',64), '', null)$$,
  '22023', 'formula_readiness_uid_invalid', 'empty UID rejected');
select throws_ok($$select public.formula_bridge_orlando_readiness(repeat('o',64), 'uid', 'invalid')$$,
  '22023', 'formula_readiness_email_invalid', 'invalid verified email rejected');
select throws_ok($$select public.formula_bridge_orlando_roster(repeat('o',64), -1, 50)$$,
  '22023', 'formula_readiness_page_invalid', 'negative offset rejected');
select throws_ok($$select public.formula_bridge_orlando_roster(repeat('o',64), 0, 101)$$,
  '22023', 'formula_readiness_page_invalid', 'oversized page rejected');

select is(public.formula_bridge_orlando_readiness(repeat('o',64), 'no-link', null)->'registration',
  'null'::jsonb, 'unlinked account does not acquire a registration');
select is(public.formula_bridge_orlando_readiness(repeat('o',64), 'no-link', null)->'purchases',
  '[]'::jsonb, 'no independently verified email means no purchase disclosure');
select is(public.formula_bridge_orlando_readiness(repeat('o',64), 'no-link', ' BUYER@example.com ')
  #>> '{purchases,0,purchased}', '3', 'verified payer sees purchased quantity with email normalization');
select is(public.formula_bridge_orlando_readiness(repeat('o',64), 'no-link', 'buyer@example.com')
  #>> '{purchases,0,assigned}', '1', 'only named purchase ordinal counts as assigned');
select is(public.formula_bridge_orlando_readiness(repeat('o',64), 'no-link', 'buyer@example.com')
  #>> '{purchases,0,unassigned}', '2', 'remaining group seats need names');
select is(jsonb_array_length(public.formula_bridge_orlando_readiness(repeat('o',64), 'no-link',
  'buyer@example.com')->'purchases'), 1, 'another payer purchase is not disclosed');
select is(public.formula_bridge_orlando_readiness(repeat('o',64), 'no-link', 'buyer@example.com')->'memberId',
  'null'::jsonb, 'purchase lookup does not claim a member identity');
select is(public.formula_bridge_orlando_readiness(repeat('o',64), 'orlando-named', null)
  #>> '{registration,email}', 'named@example.com', 'active identity resolves its own named seat');
select is(public.formula_bridge_orlando_readiness(repeat('o',64), 'orlando-named', null)
  #>> '{registration,name}', 'Named Team', 'named seat uses registration name rather than a self-edited profile');
select is(public.formula_bridge_orlando_readiness(repeat('o',64), 'orlando-named', null)
  #>> '{registration,role}', 'team_member', 'registration role remains authoritative');
select is(public.formula_bridge_orlando_readiness(repeat('o',64), 'orlando-named', null)
  #>> '{agency,confirmed}', 'true', 'standard active agency and confirmed membership are ready');
select is(public.formula_bridge_orlando_readiness(repeat('o',64), 'orlando-solo', null)
  #>> '{agency,confirmed}', 'false', 'auto-created solo workspace is not an agency connection');

select ok(exists(select 1 from jsonb_array_elements(public.formula_bridge_orlando_roster(repeat('o',64),0,100)->'rows') r
  where r->>'id' = 'purchase:a3000000-0000-0000-0000-000000000001'
    and r->'issues' @> '[{"key":"unassigned_seats"}]'::jsonb), 'staff sees unassigned group seats before payer signs in');
select ok(exists(select 1 from jsonb_array_elements(public.formula_bridge_orlando_roster(repeat('o',64),0,100)->'rows') r
  where r->>'email' = 'solo@example.com' and r->'issues' @> '[{"key":"organization"}]'::jsonb),
  'staff sees missing real agency connection');
select ok(exists(select 1 from jsonb_array_elements(public.formula_bridge_orlando_roster(repeat('o',64),0,100)->'rows') r
  where r->>'email' = 'not-signed-in@example.com' and r->'uid' = 'null'::jsonb
    and r->'issues' @> '[{"key":"sign_in"}]'::jsonb), 'staff includes named attendees who never created an account');
select is(public.formula_bridge_orlando_roster(repeat('o',64),0,1)->>'nextOffset', '1', 'roster exposes continuation');
select isnt(public.formula_bridge_orlando_roster(repeat('o',64),0,1)#>>'{rows,0,id}',
  public.formula_bridge_orlando_roster(repeat('o',64),1,1)#>>'{rows,0,id}', 'successive stable pages do not repeat rows');
select is(public.formula_bridge_orlando_roster(repeat('o',64),1000,50)->'nextOffset', 'null'::jsonb,
  'exhausted roster stops pagination');

select public.formula_admin_set_attendee_access('orlando-test',
  (select id from public.formula_event_registrations where normalized_email='named@example.com'), 'suspend');
select is(public.formula_bridge_orlando_readiness(repeat('o',64), 'orlando-named', 'buyer@example.com')
  #>> '{purchases,0,assigned}', '1', 'suspension does not silently make a purchased ordinal reusable');
select is(public.formula_bridge_orlando_readiness(repeat('o',64), 'orlando-named', 'buyer@example.com')
  #>> '{purchases,0,unresolved}', '1', 'suspended seat needs review');
select is(public.formula_bridge_orlando_readiness(repeat('o',64), 'orlando-named', null)
  #>> '{registration,accessState}', 'suspended', 'suspension stays visible to readiness');

update public.formula_members set status='disabled' where id =
  (select member_id from public.formula_auth_identities where provider_subject='orlando-solo');
select is(public.formula_bridge_orlando_readiness(repeat('o',64), 'orlando-solo', null)->'memberId',
  'null'::jsonb, 'disabled member cannot resolve an active readiness identity');
select ok(not has_function_privilege('anon', 'formula_private.orlando_purchase_readiness(text,boolean)', 'EXECUTE'),
  'anonymous callers cannot bypass the secret through the private helper');
select ok(not has_function_privilege('authenticated', 'public.formula_bridge_orlando_roster(text,integer,integer)', 'EXECUTE'),
  'regular authenticated database clients cannot request the staff roster');

select * from finish();
rollback;
