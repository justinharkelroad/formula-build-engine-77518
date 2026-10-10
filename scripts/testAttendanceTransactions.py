#!/usr/bin/env python3
"""Isolated real PostgreSQL attendance checks. Requires Docker + cached postgres:17-alpine.
No ports/network; no existing local or remote databases touched.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json, subprocess, tempfile, time, uuid

ROOT = Path(__file__).resolve().parents[1]
NAME = 'formula-attendance-test-' + uuid.uuid4().hex[:10]
def docker(*args, input=None):
    return subprocess.run(['docker', *args], input=input, text=True, capture_output=True, check=True).stdout
def sql(statement):
    return docker('exec','-i',NAME,'psql','-U','postgres','-v','ON_ERROR_STOP=1','-At',input=statement)
def json_sql(statement):
    return json.loads(next(line for line in sql(statement).splitlines() if line.startswith('{')))

with tempfile.TemporaryDirectory(prefix='formula-attendance-') as tmp:
    domain = (ROOT/'supabase/migrations/20260824090835_formula_member_registration_domain.sql').read_text()
    bridge = (ROOT/'supabase/migrations/20260825153343_formula_projection_scoped_bridge.sql').read_text()
    bootstrap = '''create role anon; create role authenticated; create role service_role;
create schema extensions; create schema auth;
create function auth.uid() returns uuid language sql as $$select null::uuid$$;
create table public.user_roles(id uuid default gen_random_uuid(),user_id uuid,role text);
create function public.has_role(uuid,text) returns boolean language sql as $$select false$$;
create schema vault; create table vault.decrypted_secrets(name text,decrypted_secret text);
''' + domain + bridge.split('create or replace function public.formula_bridge_claim_projection_outbox_batch')[0]
    Path(tmp,'bootstrap.sql').write_text(bootstrap)
    migration = next((ROOT/'supabase/migrations').glob('*_formula_attendance_staff_checkin.sql'))
    Path(tmp,'migration.sql').write_text(migration.read_text())
    tests=(ROOT/'supabase/tests/formula_attendance_staff_checkin_test.sql').read_text()
    Path(tmp,'tests.sql').write_text(tests)
    try:
        docker('run','--rm','--detach','--name',NAME,'--network','none','--mount',f'type=bind,src={tmp},dst=/tests,readonly',
               '-e','POSTGRES_PASSWORD=local-attendance-test','postgres:17-alpine')
        for attempt in range(50):
            try:
                docker('exec',NAME,'pg_isready','-h','127.0.0.1','-U','postgres')
                break
            except subprocess.CalledProcessError:
                time.sleep(.1)
        else:
            raise RuntimeError('Isolated PostgreSQL did not become ready')
        docker('exec',NAME,'psql','-U','postgres','-v','ON_ERROR_STOP=1','-f','/tests/bootstrap.sql','-f','/tests/migration.sql','-f','/tests/tests.sql')
        # Commit a second independent fixture set for concurrent sessions.
        fixtures=tests.split('create temporary table before_entitlements')[0].replace('begin;','',1)
        sql(fixtures)
        seat='30000000-0000-4000-8000-000000000002'
        secret='s'*40
        def arrival(actor, hold=False):
            request=json.dumps({'action':'check-in','registrationId':seat,'method':'qr','correlationId':str(uuid.uuid4())})
            wait="select pg_sleep(.5);" if hold else ''
            return json_sql(f"begin; select public.formula_bridge_attendance('{secret}','{actor}','{request}','new-uid','guest2@example.com'); {wait} commit;")
        with ThreadPoolExecutor(max_workers=2) as pool:
            first=pool.submit(arrival,'staff-one',True)
            time.sleep(.1)
            second=pool.submit(arrival,'staff-two')
            a,b=first.result(),second.result()
        assert sorted([a['status'],b['status']])==['already_checked_in','checked_in'],(a,b)
        assert a['attendee']['checkedInAt']==b['attendee']['checkedInAt'],(a,b)
        assert sql("select count(*) from public.formula_event_registrations where checked_in_at is not null;").strip()=='1'
        assert sql("select count(*) from formula_private.audit_events where event_type='formula_attendance_check_in';").strip()=='2'
        print('PASS: real concurrent staff sessions preserve one arrival timestamp and separate seats')
        # P2: a first undo from an old staff screen waits behind the replacement
        # arrival and compares its observed timestamp under the same seat lock.
        actor='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
        original=a['attendee']['checkedInAt']
        clear=json.dumps({'action':'undo','registrationId':seat,'reason':'Prepare race','expectedCheckedInAt':original})
        cleared=json_sql(f"select public.formula_admin_attendance('{actor}','{clear}');")
        assert cleared['status']=='undone',cleared
        stale=json.dumps({'action':'undo','registrationId':seat,'reason':'Stale first undo','expectedCheckedInAt':original,'correlationId':str(uuid.uuid4())})
        with ThreadPoolExecutor(max_workers=2) as pool:
            arrived_future=pool.submit(arrival,'staff-rearrival',True)
            time.sleep(.1)
            stale_future=pool.submit(json_sql,f"select public.formula_admin_attendance('{actor}','{stale}');")
            arrived,stale_result=arrived_future.result(),stale_future.result()
        assert stale_result['status']=='needs_help' and stale_result['reasonCode']=='attendance_changed_since_request',stale_result
        assert stale_result['attendee']['checkedInAt']==arrived['attendee']['checkedInAt'],(arrived,stale_result)
        assert sql("select count(*) from formula_private.audit_events where state_summary->>'reason'='Stale first undo';").strip()=='0'
        print('PASS: stale FIRST undo cannot clear a newer arrival across concurrent sessions')
        # Revoke while holding the seat lock; arrival must wait and see denial.
        sql(f"update public.formula_event_registrations set checked_in_at=null where id='{seat}';")
        def revoke():
            sql(f"begin; update public.formula_event_registrations set registration_state='revoked',revoked_at=now() where id='{seat}'; select pg_sleep(.5); update public.formula_entitlements set access_state='revoked',event_attendance_allowed=false,revoked_at=now() where event_registration_id='{seat}'; commit;")
        with ThreadPoolExecutor(max_workers=2) as pool:
            revoke_future=pool.submit(revoke)
            time.sleep(.1)
            check_future=pool.submit(arrival,'staff-three')
            revoke_future.result()
            denied=check_future.result()
        assert denied['status']=='needs_help' and denied['reasonCode']=='revoked',denied
        assert sql(f"select checked_in_at is null from public.formula_event_registrations where id='{seat}';").strip()=='t'
        print('PASS: concurrent revocation cannot be restored by arrival')
        print('PASS: complete domain migration + SQL security + P1/P2 regression assertions + concurrency checks')
    except subprocess.CalledProcessError as error:
        print(error.stdout)
        print(error.stderr)
        raise
    finally:
        docker('stop',NAME)
