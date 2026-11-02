import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';

// Exercise the actual migration and original eligibility rules against a
// disposable PostgreSQL cluster. No production credentials or network access.
const fixture = `
create schema formula_private; create schema auth; create schema storage;
create role anon; create role authenticated; create role service_role;
create table auth.users(id uuid primary key, email text);
create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table public.formula_event_registrations(id uuid primary key, event_id text, registration_state text,
  normalized_email text, member_id uuid, invited_name text, created_at timestamptz default now());
create table public.formula_entitlements(event_registration_id uuid, access_state text);
create table public.formula_member_emails(member_id uuid, normalized_email text, state text);
create table public.purchases(email text, name text, pass_type text, created_at timestamptz default now());
create table public.partner_profiles(primary_contact_name text, purchase_name text, purchase_email text,
 primary_contact_email text, marketing_contact_email text, attendees jsonb, created_at timestamptz default now());
`;
const checks = `
insert into public.formula_event_registrations values
 ('00000000-0000-4000-8000-000000000001','formula-2026','invited','owner@example.test',null,'Owner',now());
insert into public.formula_entitlements values ('00000000-0000-4000-8000-000000000001','active');
insert into public.purchases(email,name,pass_type) values('buyer@example.test','Buyer','agencyOwner');
insert into public.partner_profiles(primary_contact_email) values('partner@example.test');
insert into formula_private.ai_portal_approvals(normalized_email,reason,approved_by)
 values('guest@example.test','Guest',gen_random_uuid());
update formula_private.ai_portal_settings set sign_in_open=true;
do $$
declare result jsonb; caught boolean;
begin
 result := public.formula_ai_portal_email_entry(' OWNER@EXAMPLE.TEST ', repeat('a',64),repeat('c',64));
 assert (result->>'access')::boolean, 'eligible roster email denied';
 assert result->'member'->>'source' = 'roster';
 assert result->'member'->>'email' = 'owner@example.test';
 assert (select count(*) from auth.users)=0, 'toolkit entry created an auth account';
 assert (select user_id is null from formula_private.ai_portal_members where normalized_email='owner@example.test'),
   'toolkit entry linked a website identity';
 insert into auth.users(id,email) values('00000000-0000-4000-8000-000000000099','owner@example.test');
 update formula_private.ai_portal_members set user_id='00000000-0000-4000-8000-000000000099'
 where normalized_email='owner@example.test';
 perform public.formula_ai_portal_email_entry('owner@example.test',repeat('4',64),repeat('c',64));
 assert (select user_id='00000000-0000-4000-8000-000000000099' from formula_private.ai_portal_members
   where normalized_email='owner@example.test'), 'entry changed the existing website identity';
 assert (select count(*) from auth.users)=1, 'entry modified Auth accounts';
 result := public.formula_ai_portal_email_entry('unknown@example.test',repeat('b',64),repeat('c',64));
 assert not (result->>'access')::boolean, 'unknown email admitted';
 assert not exists(select from formula_private.ai_portal_sessions where token_hash=repeat('b',64));
 result := public.formula_ai_portal_email_entry('buyer@example.test',repeat('d',64),repeat('c',64));
 assert result->'member'->>'source'='purchaser';
 result := public.formula_ai_portal_email_entry('partner@example.test',repeat('e',64),repeat('c',64));
 assert result->'member'->>'source'='partner';
 result := public.formula_ai_portal_email_entry('guest@example.test',repeat('f',64),repeat('c',64));
 assert result->'member'->>'source'='manual';
 perform public.formula_ai_portal_session_action(repeat('a',64),'set-platform','codex');
 perform public.formula_ai_portal_session_action(repeat('a',64),'progress',null,'day-1',80);
 perform public.formula_ai_portal_session_action(repeat('a',64),'progress',null,'day-1',20);
 result := public.formula_ai_portal_session_action(repeat('a',64),'status');
 assert result->'member'->>'platform'='codex';
 assert result->'progress'->>'day-1'='80', 'progress moved backwards';
 update formula_private.ai_portal_sessions set created_at=now()-interval '1 day';
 result := public.formula_ai_portal_session_action(repeat('a',64),'status');
 assert (result->>'access')::boolean, 'session expired before toolkit access end';
 perform public.formula_ai_portal_session_action(repeat('a',64),'download',null,null,null,'codex-starter',true);
 assert (select count(*) from formula_private.ai_portal_downloads)=1;
 caught:=false;
 begin perform public.formula_ai_portal_session_action(repeat('0',64),'status');
 exception when others then caught:=sqlerrm='formula_ai_portal_no_access'; end;
 assert caught, 'forged session accepted';
 update formula_private.ai_portal_members set state='revoked', revoked_at=now(),revoked_by=gen_random_uuid()
 where normalized_email='owner@example.test';
 caught:=false;
 begin perform public.formula_ai_portal_session_action(repeat('a',64),'status');
 exception when others then caught:=sqlerrm='formula_ai_portal_no_access'; end;
 assert caught, 'revoked session still admitted';
 result := public.formula_ai_portal_email_entry('owner@example.test',repeat('1',64),repeat('c',64));
 assert result->>'reason'='revoked', 'revoked email readmitted';
 update public.formula_event_registrations set registration_state='suspended';
 insert into public.purchases(email,name,pass_type) values('owner@example.test','Owner','agencyOwner');
 -- The existing roster rule blocks fallback admission, independently of portal revocation.
 assert formula_private.ai_portal_eligibility('owner@example.test')->>'reason'='revoked';
 update formula_private.ai_portal_settings set sign_in_open=false;
 result := public.formula_ai_portal_email_entry('buyer@example.test',repeat('2',64),repeat('c',64));
 assert result->>'reason'='closed';
 result := public.formula_ai_portal_session_action(repeat('d',64),'status');
 assert (result->>'access')::boolean, 'closing new entry ended an existing session';
 update formula_private.ai_portal_settings set sign_in_open=true,access_until=now()-interval '1 second';
 result := public.formula_ai_portal_email_entry('buyer@example.test',repeat('2',64),repeat('c',64));
 assert result->>'reason'='expired';
 caught:=false;
 begin perform public.formula_ai_portal_session_action(repeat('d',64),'download',null,null,null,'codex-starter',true);
 exception when others then caught:=sqlerrm='formula_ai_portal_no_access'; end;
 assert caught, 'expired session could request files';
 assert not has_function_privilege('anon','public.formula_ai_portal_email_entry(text,text,text)','EXECUTE');
 assert not has_function_privilege('authenticated','public.formula_ai_portal_session_action(text,text,text,text,integer,text,boolean)','EXECUTE');
 assert not has_table_privilege('anon','formula_private.ai_portal_sessions','SELECT');
 assert has_function_privilege('service_role','public.formula_ai_portal_email_entry(text,text,text)','EXECUTE');
end $$;
update formula_private.ai_portal_settings set access_until=now()+interval '1 day';
insert into formula_private.ai_portal_entry_attempts(client_hash) select repeat('9',64) from generate_series(1,30);
do $$ begin
 assert public.formula_ai_portal_email_entry('buyer@example.test',repeat('3',64),repeat('9',64))->>'reason'='rate_limited';
end $$;
`;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'formula-portal-email-test-'));
const run = (cmd,args,input) => execFileSync(cmd,args,{encoding:'utf8',input,stdio:['pipe','pipe','pipe']});
let running=false;
try {
 run('initdb',['-D',path.join(dir,'db'),'-A','trust','--no-locale']);
 run('pg_ctl',['-D',path.join(dir,'db'),'-l',path.join(dir,'postgres.log'),'-o',`-F -h '' -k ${dir}`,'-w','start']);
 running=true;
 const original=fs.readFileSync(new URL('../supabase/migrations/20261009200000_formula_ai_portal.sql',import.meta.url),'utf8');
 const migration=fs.readFileSync(new URL('../supabase/migrations/20261102134823_formula_ai_portal_email_entry.sql',import.meta.url),'utf8');
 run('psql',['-h',dir,'-d','postgres','-v','ON_ERROR_STOP=1','-X','-q'], fixture+original.split('-- Gate for "email me a code"')[0]+migration+checks);
 console.log('PASS: real PostgreSQL email eligibility, session isolation, progress, downloads, revocation, access window, rate limits and RPC permissions');
} catch(error) {
 console.error(error.stderr?.toString() ?? error.message);
 process.exitCode=1;
} finally {
 if(running) run('pg_ctl',['-D',path.join(dir,'db'),'-m','immediate','-w','stop']);
 fs.rmSync(dir,{recursive:true,force:true});
}

// Verify the browser never creates or replaces a website/admin Auth session.
const storage=new Map();
const requests=[];
let allowed=true;
const status={access:true,accessUntil:'2027-04-02',member:{email:'owner@example.test',source:'roster',platform:null},progress:{},videos:[]};
const compiled=ts.transpileModule(fs.readFileSync(new URL('../src/lib/aiPortal.ts',import.meta.url),'utf8'),{
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
}).outputText;
const api={};
new Function('exports','require','localStorage',compiled)(api,()=>({supabase:{functions:{invoke:async(fn,{body})=>{
 requests.push({fn,body});
 return {data:fn.endsWith('signin') ? allowed ? {...status,token:'fai_'+'a'.repeat(64)} : {access:false,reason:'not_found'} : status,error:null};
}}}}),{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)});
assert.equal((await api.openPortal(' owner@example.test ')).access,true);
assert.equal(requests[0].body.action,'enter');
await api.loadStatus();
assert.equal(requests[1].body.portalToken,'fai_'+'a'.repeat(64));
api.clearPortalSession();
assert.equal(api.portalSession(),null);
assert.equal(storage.size,0);
allowed=false;
assert.equal((await api.openPortal('unknown@example.test')).access,false);
assert.equal(api.portalSession(),null);
console.log('PASS: browser email entry, toolkit-only token, sign-out and denied-email handling without any Auth API');
