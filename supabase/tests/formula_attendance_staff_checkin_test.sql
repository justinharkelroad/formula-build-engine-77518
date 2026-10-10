-- Run only in a disposable local test database after domain + attendance migration.
-- Every fixture is rolled back. The companion Python runner tests real sessions.
begin;
create function pg_temp.assert_true(value boolean, label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %',label; end if; end $$;
insert into public.formula_events(id,slug,display_name,starts_at,ends_at,timezone,state,registry_version,registry_hash)
values('formula-2026','formula-2026','Test Event','2026-10-20','2026-10-21','UTC','active',1,repeat('a',64)) on conflict do nothing;
insert into vault.decrypted_secrets(name,decrypted_secret) values('formula_projection_firebase_bridge',repeat('s',40));
insert into public.user_roles(user_id,role) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','admin');
insert into public.formula_members(id) select ('10000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid from generate_series(1,5)n;
insert into public.formula_member_emails(member_id,original_email,normalized_email,state,verified_at,is_primary,source_type,source_id)
select ('10000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'guest'||n||'@example.com','guest'||n||'@example.com','verified',now(),true,'manual','test-'||n from generate_series(1,5)n;
insert into public.formula_registration_sources(id,event_id,source_type,source_id,source_ordinal,source_payload_hash,reconciliation_state)
select ('20000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'formula-2026','manual','attendance-test',n,repeat('a',64),'resolved' from generate_series(1,7)n;
insert into public.formula_event_registrations(id,event_id,member_id,source_record_id,invited_name,invited_email,normalized_email,seat_type,event_role,registration_state,claimed_at,revoked_at)
select ('30000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'formula-2026',
case when n<=5 then ('10000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid when n=6 then null else '10000000-0000-4000-8000-000000000005'::uuid end,
('20000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'Guest '||n,'guest'||n||'@example.com','guest'||n||'@example.com','guest','attendee',
case when n in (3,7) then 'revoked' when n=4 then 'suspended' else 'invited' end,null,case when n in (3,7) then now() else null end
from generate_series(1,7)n;
insert into public.formula_entitlements(event_registration_id,access_state,event_attendance_allowed,revoked_at)
select id,case when registration_state='revoked' then 'revoked' when registration_state='suspended' then 'suspended' else 'active' end,
registration_state='invited',case when registration_state='revoked' then now() else null end from public.formula_event_registrations where invited_name like 'Guest %';
insert into public.formula_auth_identities(member_id,provider_subject,link_state,linked_at)
values('10000000-0000-4000-8000-000000000001','existing-uid','active',now());
create temporary table before_entitlements as select * from public.formula_entitlements;
create temporary table before_claims as select id,registration_state,claim_state,claimed_at from public.formula_event_registrations;

do $$ declare x jsonb; first_time text; undo_time text; legacy_time text; regression_id uuid; retry_id uuid:='aaaaaaaa-0000-4000-8000-000000000001'; undo_id uuid:='aaaaaaaa-0000-4000-8000-000000000002'; begin
  x:=public.formula_bridge_attendance(repeat('s',40),'staff',jsonb_build_object('action','resolve'),'existing-uid','guest1@example.com');
  perform pg_temp.assert_true(x->>'status'='ready','active identity resolves');
  x:=public.formula_bridge_attendance(repeat('s',40),'staff',jsonb_build_object('action','resolve'),'new-uid','guest2@example.com');
  perform pg_temp.assert_true(x->>'status'='ready','new account resolves immediately');
  perform pg_temp.assert_true(not exists(select 1 from public.formula_auth_identities where provider_subject='new-uid'),'arrival never claims identity');
  x:=public.formula_bridge_attendance(repeat('s',40),'staff',jsonb_build_object('action','resolve'),'existing-uid','guest2@example.com');
  perform pg_temp.assert_true(x->>'status'='needs_help','wrong email fails');
  x:=public.formula_bridge_attendance(repeat('s',40),'staff',jsonb_build_object('action','resolve'),'other-uid','guest1@example.com');
  perform pg_temp.assert_true(x->>'status'='needs_help','seat claimed by different UID fails');
  x:=public.formula_bridge_attendance(repeat('s',40),'staff',jsonb_build_object('action','resolve'),'new-uid','unknown@example.com');
  perform pg_temp.assert_true(x->>'status'='needs_help','unmatched email fails');
  x:=public.formula_bridge_attendance(repeat('s',40),'staff',jsonb_build_object('action','resolve'),'ambiguous-uid','guest5@example.com');
  perform pg_temp.assert_true(x->>'status'='needs_help','historical ambiguous seat fails');
  x:=public.formula_bridge_attendance(repeat('s',40),'staff',jsonb_build_object('action','check-in','registrationId','30000000-0000-4000-8000-000000000002','method','qr','correlationId',retry_id),'new-uid','guest2@example.com');
  perform pg_temp.assert_true(x->>'status'='checked_in','QR arrival succeeds'); first_time:=x->'attendee'->>'checkedInAt';
  x:=public.formula_bridge_attendance(repeat('s',40),'staff',jsonb_build_object('action','check-in','registrationId','30000000-0000-4000-8000-000000000002','method','qr','correlationId',retry_id),'new-uid','guest2@example.com');
  perform pg_temp.assert_true((x->>'replayed')::boolean and x->'attendee'->>'checkedInAt'=first_time,'same retry timestamp preserved');
  x:=public.formula_bridge_attendance(repeat('s',40),'staff-2',jsonb_build_object('action','check-in','registrationId','30000000-0000-4000-8000-000000000002','method','qr'),'new-uid','guest2@example.com');
  perform pg_temp.assert_true(x->>'status'='already_checked_in' and x->'attendee'->>'checkedInAt'=first_time,'second staff preserves timestamp');
  perform pg_temp.assert_true((select checked_in_at is null from public.formula_event_registrations where id='30000000-0000-4000-8000-000000000001'),'separate group seat unchanged');
  x:=public.formula_admin_attendance('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',jsonb_build_object('action','check-in','registrationId','30000000-0000-4000-8000-000000000006','method','manual'));
  perform pg_temp.assert_true(x->>'status'='checked_in','manual unassigned guest arrival');
  x:=public.formula_admin_attendance('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',jsonb_build_object('action','check-in','registrationId','30000000-0000-4000-8000-000000000003','method','manual'));
  perform pg_temp.assert_true(x->>'status'='needs_help' and x->>'reasonCode'='revoked','revoked not restored');
  x:=public.formula_admin_attendance('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',jsonb_build_object('action','check-in','registrationId','30000000-0000-4000-8000-000000000004','method','manual'));
  perform pg_temp.assert_true(x->>'status'='needs_help' and x->>'reasonCode'='suspended','suspended not restored');
  perform pg_temp.assert_true(not exists((select * from before_entitlements except select * from public.formula_entitlements) union all (select * from public.formula_entitlements except select * from before_entitlements)),'no access side effects');
  perform pg_temp.assert_true(not exists((select * from before_claims except select id,registration_state,claim_state,claimed_at from public.formula_event_registrations) union all (select id,registration_state,claim_state,claimed_at from public.formula_event_registrations except select * from before_claims)),'no claim/lifecycle side effects');
  undo_time:=first_time;
  x:=public.formula_admin_attendance('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',jsonb_build_object('action','undo','registrationId','30000000-0000-4000-8000-000000000002','reason','Wrong person','expectedCheckedInAt',undo_time,'correlationId',undo_id));
  perform pg_temp.assert_true(x->>'status'='undone' and x->'attendee'->>'checkedInAt' is null,'undo works');
  x:=public.formula_admin_attendance('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',jsonb_build_object('action','undo','registrationId','30000000-0000-4000-8000-000000000002','reason','Wrong person','expectedCheckedInAt',undo_time,'correlationId',undo_id));
  perform pg_temp.assert_true(x->>'status'='undone' and (x->>'replayed')::boolean and x->'attendee'->>'checkedInAt' is null,'same-correlation applied undo replays safely');
  x:=public.formula_admin_attendance('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',jsonb_build_object('action','check-in','registrationId','30000000-0000-4000-8000-000000000002','method','manual'));
  first_time:=x->'attendee'->>'checkedInAt';
  x:=public.formula_admin_attendance('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',jsonb_build_object('action','undo','registrationId','30000000-0000-4000-8000-000000000002','reason','Wrong person','expectedCheckedInAt',undo_time,'correlationId',undo_id));
  perform pg_temp.assert_true((x->>'replayed')::boolean and x->>'status'='needs_help' and x->>'reasonCode'='attendance_changed_since_request' and x->'attendee'->>'checkedInAt'=first_time,'undo retry cannot clear later arrival');
  x:=public.formula_admin_attendance('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',jsonb_build_object('action','undo','registrationId','30000000-0000-4000-8000-000000000002','reason','Stale first request','expectedCheckedInAt',undo_time));
  perform pg_temp.assert_true(x->>'status'='needs_help' and x->>'reasonCode'='attendance_changed_since_request' and x->'attendee'->>'checkedInAt'=first_time,'stale FIRST undo cannot clear later arrival');
  perform pg_temp.assert_true(not exists(select 1 from formula_private.audit_events where state_summary->>'reason'='Stale first request'),'stale undo emits no successful mutation audit');
  update public.formula_event_registrations set registration_state='checked_in',claimed_at=now() where id='30000000-0000-4000-8000-000000000006';
  legacy_time:=formula_private.attendance_row('30000000-0000-4000-8000-000000000006')->>'checkedInAt';
  x:=public.formula_admin_attendance('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',jsonb_build_object('action','undo','registrationId','30000000-0000-4000-8000-000000000006','reason','Legacy undo','expectedCheckedInAt',legacy_time));
  perform pg_temp.assert_true(x->'attendee'->>'registrationState'='claimed' and x->'attendee'->>'checkedInAt' is null,'legacy undo schema compatibility');
  x:=public.formula_admin_attendance('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',jsonb_build_object('action','list','limit',2,'query','Guest'));
  perform pg_temp.assert_true(jsonb_array_length(x->'attendees')=2 and (x->>'nextOffset')::integer=2,'bounded list page');
  perform pg_temp.assert_true((x->'counts'->>'total')::integer=7 and (x->'counts'->>'checkedIn')::integer=1,'canonical attendance counts');
  x:=public.formula_admin_attendance('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',jsonb_build_object('action','list','filter','needs-help'));
  perform pg_temp.assert_true(jsonb_array_length(x->'attendees')=3,'needs help filter');
  x:=public.formula_admin_attendance('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',jsonb_build_object('action','history','registrationId','30000000-0000-4000-8000-000000000002'));
  perform pg_temp.assert_true(jsonb_array_length(x->'history')=4,'audit without retry duplicates');
  perform pg_temp.assert_true(exists(select 1 from formula_private.audit_events where correlation_id=undo_id and state_summary->>'reason'='Wrong person' and state_summary->>'previousCheckedInAt' is not null),'audit reason/previous/actor retained');
  -- P1: an unchanged arrival timestamp never authorizes replay after access revocation.
  regression_id:=gen_random_uuid();
  x:=public.formula_bridge_attendance(repeat('s',40),'revocation-staff',jsonb_build_object('action','check-in','registrationId','30000000-0000-4000-8000-000000000001','method','qr','correlationId',regression_id),'existing-uid','guest1@example.com');
  first_time:=x->'attendee'->>'checkedInAt';
  update public.formula_entitlements set access_state='revoked',event_attendance_allowed=false,revoked_at=now() where event_registration_id='30000000-0000-4000-8000-000000000001';
  x:=public.formula_bridge_attendance(repeat('s',40),'revocation-staff',jsonb_build_object('action','check-in','registrationId','30000000-0000-4000-8000-000000000001','method','qr','correlationId',regression_id),'existing-uid','guest1@example.com');
  perform pg_temp.assert_true(x->>'status'='needs_help' and not (x->'attendee'->>'eligible')::boolean and x->'attendee'->>'checkedInAt'=first_time,'revoked entitlement blocks successful check-in replay');
  perform pg_temp.assert_true((select count(*)=1 from formula_private.audit_events where actor_id='firebase:revocation-staff'),'denied replay leaves original audit only');
  regression_id:=gen_random_uuid();
  x:=public.formula_bridge_attendance(repeat('s',40),'identity-staff',jsonb_build_object('action','check-in','registrationId','30000000-0000-4000-8000-000000000002','method','qr','correlationId',regression_id),'new-uid','guest2@example.com');
  insert into public.formula_auth_identities(member_id,provider_subject,link_state,linked_at,revoked_at)
    values('10000000-0000-4000-8000-000000000002','new-uid','revoked',now(),now());
  x:=public.formula_bridge_attendance(repeat('s',40),'identity-staff',jsonb_build_object('action','check-in','registrationId','30000000-0000-4000-8000-000000000002','method','qr','correlationId',regression_id),'new-uid','guest2@example.com');
  perform pg_temp.assert_true(x->>'status'='needs_help' and x->>'reasonCode'='identity_unmatched_or_ambiguous','revoked QR identity blocks successful check-in replay');
  begin perform public.formula_admin_attendance('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','{"action":"undo","registrationId":"30000000-0000-4000-8000-000000000002","reason":"Valid reason"}'); raise exception 'missing expected unexpectedly allowed'; exception when raise_exception then if sqlerrm <> 'formula_attendance_expected_timestamp_required' then raise; end if; end;
  begin perform public.formula_admin_attendance('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','{"action":"undo","registrationId":"30000000-0000-4000-8000-000000000002","reason":"Valid reason","expectedCheckedInAt":"yesterday"}'); raise exception 'invalid expected unexpectedly allowed'; exception when raise_exception then if sqlerrm <> 'formula_attendance_expected_timestamp_invalid' then raise; end if; end;
  begin perform public.formula_admin_attendance('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','{"action":"list"}'); raise exception 'nonadmin unexpectedly allowed'; exception when insufficient_privilege then null; end;
  begin perform public.formula_bridge_attendance('bad','staff','{"action":"list"}'); raise exception 'wrong secret unexpectedly allowed'; exception when insufficient_privilege then null; end;
  begin perform public.formula_admin_attendance('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','{"action":"undo","registrationId":"30000000-0000-4000-8000-000000000002"}'); raise exception 'missing reason unexpectedly allowed'; exception when raise_exception then if sqlerrm <> 'formula_attendance_reason_required' then raise; end if; end;
  perform pg_temp.assert_true(not has_function_privilege('anon','public.formula_admin_attendance(uuid,jsonb)','EXECUTE'),'anon denied admin rpc');
  perform pg_temp.assert_true(not has_function_privilege('authenticated','public.formula_admin_attendance(uuid,jsonb)','EXECUTE'),'authenticated denied admin rpc');
  perform pg_temp.assert_true(not has_function_privilege('anon','formula_private.attendance_operation(text,text,jsonb,text,text)','EXECUTE'),'anon denied core');
  raise notice 'PASS: attendance transaction/security assertions including P1/P2 regressions';
end $$;
rollback;
