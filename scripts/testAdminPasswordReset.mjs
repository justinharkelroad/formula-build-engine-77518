import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const code = ts.transpileModule(fs.readFileSync(new URL('../src/lib/adminAttendeePassword.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const api = {};
new Function('exports', code)(api);
const account = { uid: 'attendee', email: 'attendee@example.com', displayName: 'Test Attendee', company: 'Agency',
  disabled: false, registrationId: 'registration', accessState: 'active', canReset: true, unavailableReason: null };
const request = { action: 'reset', email: account.email, uid: account.uid, registrationId: account.registrationId,
  password: 'Chosen1', operationId: '11111111-1111-4111-8111-111111111111' };

test('sends the exact chosen password and selected identity with the website session', async () => {
  const result = await api.requestAttendeePassword('test-session', request, async (url, options) => {
    assert.equal(url, api.ATTENDEE_PASSWORD_ENDPOINT);
    assert.equal(options.headers.authorization, 'Bearer test-session');
    assert.equal(options.cache, 'no-store');
    assert.deepEqual(JSON.parse(options.body), request);
    return Response.json({ account, passwordChanged: true, sessionsRevoked: true, auditRecorded: true });
  });
  assert.equal(result.passwordChanged, true);
});
test('displays blocked-account errors instead of reporting success', async () => {
  await assert.rejects(api.requestAttendeePassword('session', request, async () => Response.json({ error: 'Account disabled' }, { status: 403 })), /Account disabled/);
});
test('does not accept a success response for another account', async () => {
  await assert.rejects(api.requestAttendeePassword('session', request, async () => Response.json({ account: { ...account, uid: 'another' }, passwordChanged: true })), /could not be confirmed/);
});
test('a reset timeout makes the potentially changed password clear', async () => {
  await assert.rejects(api.requestAttendeePassword('session', request, async () => { throw new Error('Timeout'); }), /password may have changed/);
});
test('lookup never includes a password', async () => {
  const result = await api.requestAttendeePassword('session', { action: 'lookup', email: account.email }, async (_url, options) => {
    assert.deepEqual(JSON.parse(options.body), { action: 'lookup', email: account.email });
    return Response.json({ account });
  });
  assert.deepEqual(result.account, account);
});
test('an unreadable reset response does not claim the password was unchanged', async () => {
  await assert.rejects(api.requestAttendeePassword('session', request, async () => new Response('Gateway unavailable')), /could not be confirmed/);
});

test('roster reset refuses an account belonging to a different attendee registration', () => {
  assert.throws(() => api.requireAttendeeRegistration(account, 'another-registration'), /not linked to the selected attendee/);
  assert.throws(() => api.requireAttendeeRegistration({ ...account, registrationId: null }, 'registration'), /not linked/);
});
test('roster reset accepts a different sign-in email only when linked to the selected registration', () => {
  assert.doesNotThrow(() => api.requireAttendeeRegistration({ ...account, email: 'alternate@example.com' }, 'registration'));
});
