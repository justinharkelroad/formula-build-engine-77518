// Executes the actual migration in local PostgreSQL (PGlite), never production.
// The fixture provides the pre-existing tables, bridge-secret check and outbox hook.
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
create table formula_members(id uuid primary key default gen_random_uuid(), status text default 'active');
create table formula_member_emails(member_id uuid references formula_members, normalized_email text unique, state text default 'verified');
create table formula_event_registrations(id uuid primary key default gen_random_uuid(), member_id uuid references formula_members,
 event_id text default 'formula-2026', registration_state text default 'invited', claim_state text default 'unclaimed',
 claimed_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());
create table formula_entitlements(event_registration_id uuid primary key references formula_event_registrations,
 access_state text default 'active', event_attendance_allowed boolean default false, ai_capture_allowed boolean default false,
 dashboard_read_allowed boolean default false, partner_hub_allowed boolean default false, projection_version int default 1,
 updated_at timestamptz default now());
create table formula_auth_identities(member_id uuid references formula_members, provider text, provider_subject text,
 link_state text, linked_at timestamptz, created_at timestamptz default now(), unique(member_id,provider),unique(provider,provider_subject));
create table formula_private.test_outbox(registration_id uuid primary key);
create function formula_private.enqueue_event_access_projection(id uuid) returns void language sql as $$
 insert into formula_private.test_outbox values(id) on conflict do nothing;
$$;
create function formula_private.verify_projection_bridge_secret(secret text) returns void language plpgsql as $$
 begin if secret is distinct from 'test-scoped-secret' then raise exception using errcode='42501', message='unauthorized'; end if; end;
$$;
`);
await db.exec(await readFile(new URL('../supabase/migrations/20261006133230_allow_attendee_connection_without_email_verification.sql', import.meta.url), 'utf8'));
const rows = async (sql, params=[]) => (await db.query(sql,params)).rows;
const link = async (uid,email,verified=false,secret='test-scoped-secret') =>
 (await rows('select formula_bridge_link_firebase_identity($1,$2,$3,$4) result',[secret,uid,email,verified]))[0].result;
const seed = async (email, {access='active',registration='invited',memberStatus='active',ticket=true}={}) => {
 const member=(await rows('insert into formula_members(status) values($1) returning id',[memberStatus]))[0].id;
 await rows('insert into formula_member_emails(member_id,normalized_email) values($1,$2)',[member,email]);
 if(!ticket) return;
 const reg=(await rows('insert into formula_event_registrations(member_id,registration_state) values($1,$2) returning id',[member,registration]))[0].id;
 await rows('insert into formula_entitlements(event_registration_id,access_state) values($1,$2)',[reg,access]);
 return reg;
};
let checks=0;
const check=(value,expected)=>{assert.deepEqual(value,expected);checks++;};
const rejects=async(fn,re)=>{await assert.rejects(fn,re);checks++;};
for(const verified of [false,null,true]) {
 const email=`attendee-${verified}@example.com`, uid=`uid-${verified}`;
 const reg=await seed(email,{access:'pending'});
 check(await link(uid,email,verified),'linked');
 check((await rows('select registration_state,claim_state from formula_event_registrations where id=$1',[reg]))[0],{registration_state:'claimed',claim_state:'active'});
 check((await rows('select access_state,event_attendance_allowed,ai_capture_allowed from formula_entitlements where event_registration_id=$1',[reg]))[0],{access_state:'active',event_attendance_allowed:true,ai_capture_allowed:true});
 check(await link(uid,`  ${email.toUpperCase()}  `,false),'existing');
 check(await link(`different-${uid}`,email,false),'identity_conflict');
 check((await rows('select count(*)::int count from formula_auth_identities where provider_subject=$1',[uid]))[0].count,1);
 check((await rows('select count(*)::int count from formula_private.test_outbox where registration_id=$1',[reg]))[0].count,1);
}
await seed('other-seat@example.com');
check(await link('uid-false','other-seat@example.com',false),'identity_conflict');
check(await link('missing','missing@example.com',false),'not_eligible');
for(const access of ['suspended','revoked']) {
 const email=`${access}@example.com`; await seed(email,{access});
 check(await link(access,email,false),'not_eligible');
 check((await rows('select count(*)::int count from formula_auth_identities where provider_subject=$1',[access]))[0].count,0);
}
for(const registration of ['cancelled','suspended']) {
 const email=`registration-${registration}@example.com`; await seed(email,{registration});
 check(await link(email,email,false),'not_eligible');
}
await seed('no-ticket@example.com',{ticket:false});
check(await link('no-ticket','no-ticket@example.com',false),'not_eligible');
await seed('inactive@example.com',{memberStatus:'inactive'});
check(await link('inactive','inactive@example.com',false),'not_eligible');
await rejects(()=>link('unknown','attendee-false@example.com',false,'wrong-secret'),/unauthorized/);
await rejects(()=>link('','attendee-false@example.com',false),/formula_firebase_uid_invalid/);
await rejects(()=>link('bad-email','bad email',false),/formula_email_invalid/);
await db.exec('set role authenticated');
await rejects(()=>link('authenticated','other-seat@example.com',false),/permission denied/);
await db.exec('reset role; set role anon');
await rejects(()=>link('anon','other-seat@example.com',false,'wrong-secret'),/unauthorized/);
check(await link('anon-bridge','other-seat@example.com',false),'linked');
await db.exec('reset role');
check((await rows("select proconfig from pg_proc where proname='formula_bridge_link_firebase_identity'"))[0].proconfig,['search_path=""']);
await db.close();
console.log(`${checks} attendee identity migration assertions passed.`);
