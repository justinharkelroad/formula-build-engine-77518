// Execute the actual migration in local PostgreSQL (PGlite). Only the
// pre-existing roster RPCs are fixture adapters; this tests the new SQL itself.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const root = process.env.FORMULA_PGLITE_ROOT;
if (!root) throw new Error('Set FORMULA_PGLITE_ROOT to a local @electric-sql/pglite package directory.');
const { PGlite } = await import(pathToFileURL(`${root}/dist/index.js`).href);
const db = new PGlite();
await db.exec(`
create role anon; create role authenticated; create role service_role;
create schema formula_private;
create table public.formula_members(id uuid primary key, status text default 'active');
create table public.formula_event_registrations(id uuid primary key, member_id uuid references formula_members,
  event_id text default 'formula-2026', registration_state text default 'invited', normalized_email text);
create table public.formula_entitlements(event_registration_id uuid references formula_event_registrations, access_state text default 'pending');
create table public.formula_auth_identities(member_id uuid references formula_members, provider text,
  provider_subject text, link_state text, unique(member_id,provider));
create function formula_private.verify_projection_bridge_secret(secret text) returns void language plpgsql as $$
begin if secret is distinct from 'test-scoped-secret' then raise exception using errcode='42501', message='unauthorized'; end if; end $$;
create function public.formula_admin_upsert_attendee(p_actor_id text,p_name text,p_email text,p_seat_type text,
  p_registration_id uuid,p_agency_id uuid,p_agency_display_name text,p_purchase_id uuid,p_source_ordinal integer)
returns jsonb language plpgsql as $$ declare v_id uuid := coalesce(p_registration_id,gen_random_uuid()); v_member uuid;
begin
  select member_id into v_member from public.formula_event_registrations where id=v_id;
  if v_member is null then v_member:=gen_random_uuid(); insert into public.formula_members(id) values(v_member);
    insert into public.formula_event_registrations(id,member_id,normalized_email) values(v_id,v_member,lower(p_email));
    insert into public.formula_entitlements(event_registration_id) values(v_id);
  else update public.formula_event_registrations set normalized_email=lower(p_email) where id=v_id; end if;
  return jsonb_build_object('registrationId',v_id,'identityLinked',false);
end $$;
create function public.formula_admin_roster_snapshot() returns jsonb language sql as $$
select jsonb_build_object('attendees',coalesce(jsonb_agg(jsonb_build_object('id',id,'email',normalized_email)),'[]'::jsonb)) from public.formula_event_registrations;
$$;
`);
await db.exec(await readFile(new URL('../supabase/migrations/20261001135957_attendee_partner_company_assignment.sql', import.meta.url), 'utf8'));
await db.exec(await readFile(new URL('../supabase/migrations/20261001162500_partner_catalog_safe_update.sql', import.meta.url), 'utf8'));
const query = async (sql, params = []) => (await db.query(sql, params)).rows;
const rpc = async (sql, params = []) => (await query(sql, params))[0].result;
const sync = companies => rpc('select public.formula_bridge_sync_partner_catalog($1,$2::jsonb) result', ['test-scoped-secret', JSON.stringify(companies)]);
const save = (email, org, id = null) => rpc(`select public.formula_admin_upsert_attendee_with_partner('admin','Attendee',$1,'team',$2,null,null,null,null,$3) result`, [email,id,org]);
const claim = () => rpc('select public.formula_bridge_claim_partner_assignments($1,10) result', ['test-scoped-secret']);
const snapshot = () => rpc('select public.formula_admin_roster_snapshot_with_partners() result');
let assertions = 0;
const check = (actual, expected) => { assert.deepEqual(actual,expected); assertions++; };
const rejects = async (action, pattern) => { await assert.rejects(action,pattern); assertions++; };
await sync([{id:'post_pros',businessName:'Post Pros',active:true},{id:'blocked',businessName:'Blocked',active:false}]);
check((await snapshot()).partnerCompanies.map(c=>c.id),['post_pros']);
await rejects(()=>save('blocked@example.com','blocked'),/formula_partner_company_unavailable/);
await rejects(()=>save('unknown@example.com','unknown'),/formula_partner_company_unavailable/);
check((await snapshot()).attendees.length,0); // failed assignment rolls back attendee creation
const saved = await save('future@example.com','post_pros');
check(saved.partnerOrgId,'post_pros');
check((await snapshot()).attendees[0].partnerConnectionState,'pending');
const oldClient = await rpc(`select public.formula_admin_upsert_attendee_with_partner('admin','Attendee','future@example.com','team',$1,null,null,null,null,null,false) result`, [saved.registrationId]);
check(oldClient.partnerOrgId,'post_pros'); // an older open page must not clear the new assignment
const leased = (await claim())[0];
check(leased.firebaseUid,null);
check((await claim()).length,0); // exclusive, retryable lease
await rejects(()=>save('future@example.com','post_pros',saved.registrationId),/formula_partner_connection_syncing/);
const complete = (row,state,code,uid=null,token=row.leaseToken) => rpc(`select public.formula_bridge_complete_partner_assignment($1,$2,$3,$4,$5,$6,$7) result`,
  ['test-scoped-secret',row.registrationId,row.assignmentVersion,token,state,code,uid]);
check(await complete(leased,'waiting_for_sign_in','waiting_for_account'),true);
check((await snapshot()).attendees[0].partnerConnectionState,'waiting_for_sign_in');
await db.exec(`update formula_private.attendee_partner_assignments set next_attempt_at=now();
insert into formula_auth_identities select member_id,'firebase','existing-user','active' from formula_event_registrations;`);
const linked = (await claim())[0]; check(linked.firebaseUid,'existing-user');
check(await complete(linked,'connected','connected','existing-user','00000000-0000-4000-8000-000000000000'),false);
check(await complete(linked,'connected','connected','existing-user'),true);
await rejects(()=>save('replacement@example.com','post_pros',saved.registrationId),/formula_partner_connected_email_change/);
await rejects(()=>save('future@example.com',null,saved.registrationId),/formula_partner_membership_change_requires_hub/);
check((await snapshot()).attendees[0].partnerConnectionState,'connected');
await db.exec(`update formula_private.attendee_partner_assignments set next_attempt_at=now();
update formula_event_registrations set registration_state='suspended';`);
check((await claim()).length,0);
await db.exec(`update formula_event_registrations set registration_state='claimed'; update formula_entitlements set access_state='revoked';`);
check((await claim()).length,0);
await db.exec(`update formula_entitlements set access_state='active'; update formula_private.partner_company_catalog set synced_at=now()-interval '16 minutes';`);
check((await snapshot()).partnerCompanies.length,0);
await rejects(()=>save('future@example.com','post_pros',saved.registrationId),/formula_partner_company_unavailable/);
await sync([{id:'post_pros',businessName:'Post Pros',active:true}]);
await rejects(()=>rpc('select public.formula_bridge_claim_partner_assignments($1,10) result',['wrong-secret']),/unauthorized/);
for (const role of ['anon','authenticated']) {
  await db.exec(`set role ${role}`);
  await rejects(()=>snapshot(),/permission denied/);
  await rejects(()=>save('intruder@example.com','post_pros'),/permission denied/);
  await db.exec('reset role');
}
const retry = (await claim())[0];
await db.exec(`update formula_private.attendee_partner_assignments set lease_expires_at=now()-interval '1 second';`);
const reclaimed = (await claim())[0];
check(reclaimed.registrationId,retry.registrationId); assert.notEqual(reclaimed.leaseToken,retry.leaseToken); assertions++;
check(await complete(retry,'connected','connected','existing-user'),false);
check(await complete(reclaimed,'needs_attention','membership_removed'),true);
await save('future@example.com',null,saved.registrationId);
check((await snapshot()).attendees[0].partnerConnectionState,'not_assigned');
const hubMember = await save('already-linked@example.com',null);
await sync([{id:'post_pros',businessName:'Post Pros',active:true,memberEmails:['already-linked@example.com']}]);
const mirrored = (await snapshot()).attendees.find(row => row.id === hubMember.registrationId);
check(mirrored.partnerOrgId,'post_pros');
check(mirrored.partnerConnectionState,'connected');
console.log(`${assertions} SQL acceptance assertions passed (actual migration; fixture legacy roster adapters).`);
await db.close();
