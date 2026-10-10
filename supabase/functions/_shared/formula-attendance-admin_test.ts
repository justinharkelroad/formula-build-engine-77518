import { webAttendanceRequest } from './formula-attendance-admin.ts';
import { requireAdmin } from './admin-auth.ts';
const registrationId = '11111111-1111-4111-8111-111111111111';
const assert = (condition: unknown) => { if (!condition) throw new Error('Assertion failed'); };
Deno.test('attendance accepts bounded canonical search page', () => {
  const value = webAttendanceRequest('attendance-list', {query:' Guest ',filter:'needs-help',offset:50,limit:100});
  assert(value.query==='Guest' && value.offset===50 && value.limit===100);
});
Deno.test('staff body cannot inject actor, auth email, or QR method', () => {
  const value = webAttendanceRequest('attendance-check-in', {registrationId,actorId:'forged',email:'fake',firebaseUid:'forged',method:'manual'});
  assert(!('actorId' in value) && !('email' in value) && !('firebaseUid' in value));
  let denied = false;
  try { webAttendanceRequest('attendance-check-in', {registrationId,method:'qr'}); } catch { denied=true; }
  assert(denied);
});
Deno.test('undo requires reason and valid retry correlation', () => {
  let denied=false;
  try { webAttendanceRequest('attendance-undo', {registrationId}); } catch { denied=true; }
  assert(denied);
  const value=webAttendanceRequest('attendance-undo',{registrationId,reason:'Wrong person',expectedCheckedInAt:'2026-10-10T00:00:00.123456Z',correlationId:registrationId});
  assert(value.correlationId===registrationId && value.reason==='Wrong person');
});
Deno.test('rejects unbounded list, invalid event and registration', () => {
  for (const [action,body] of [['attendance-list',{limit:101}],['attendance-history',{registrationId,limit:51}],
    ['attendance-list',{offset:-1}],['attendance-list',{eventId:'wrong'}],['attendance-check-in',{registrationId:'bad'}],
    ['attendance-list',{query:'a'.repeat(201)}],['attendance-undo',{registrationId,reason:'x',correlationId:'bad'}]] as const) {
    let denied=false; try { webAttendanceRequest(action,body); } catch { denied=true; } assert(denied);
  }
});
Deno.test('admin gate denies missing and invalid auth before role check', async () => {
  let roleRead=false;
  const client={auth:{getUser:async()=>({data:{user:null},error:'invalid'})},from:()=>{roleRead=true;throw Error('unexpected');}};
  assert(!await requireAdmin(new Request('https://example.test'),client as never));
  assert(!await requireAdmin(new Request('https://example.test',{headers:{authorization:'Bearer forged'}}),client as never));
  assert(!roleRead);
});
Deno.test('admin gate uses authoritative user_roles rather than editable profile metadata', async () => {
  for (const admin of [false,true]) {
    const filters:unknown[]=[];
    const chain={select:()=>chain,eq:(...args:unknown[])=>{filters.push(args);return chain;},maybeSingle:async()=>({data:admin?{id:'role'}:null})};
    const client={auth:{getUser:async()=>({data:{user:{id:'verified-user',user_metadata:{role:'admin'}}},error:null})},from:(table:string)=>{assert(table==='user_roles');return chain;}};
    assert(await requireAdmin(new Request('https://example.test',{headers:{authorization:'Bearer verified'}}),client as never)===admin);
    assert(JSON.stringify(filters)==='[["user_id","verified-user"],["role","admin"]]');
  }
});

Deno.test('undo requires observed arrival timestamp and keeps microsecond precision', () => {
  for (const expectedCheckedInAt of [undefined,null,'',123,'yesterday','2026-10-10','2026-10-10T00:00:00.1234567Z']) {
    let denied=false;
    try { webAttendanceRequest('attendance-undo',{registrationId,reason:'Wrong person',expectedCheckedInAt}); } catch { denied=true; }
    assert(denied);
  }
  const expectedCheckedInAt='2026-10-10T00:00:00.123456+00:00';
  assert(webAttendanceRequest('attendance-undo',{registrationId,reason:'Wrong person',expectedCheckedInAt}).expectedCheckedInAt===expectedCheckedInAt);
});
