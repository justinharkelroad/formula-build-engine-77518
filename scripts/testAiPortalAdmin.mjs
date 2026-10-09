import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const code = ts.transpileModule(fs.readFileSync(new URL('../src/lib/aiPortalAdmin.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const api = {};
new Function('exports', code)(api);

const member = (id, overrides = {}) => ({
  id,
  email: `${id}@example.com`,
  displayName: id[0].toUpperCase() + id.slice(1),
  state: 'active',
  platform: 'claude',
  lastSeenAt: '2027-01-01T00:00:00Z',
  ...overrides,
});

function invoking(data, error = null, onInvoke = () => {}) {
  return async (name, options) => {
    onInvoke(name, options);
    return { data, error };
  };
}

test('callAiPortalAdmin sends the function call and returns successful data', async () => {
  const result = await api.callAiPortalAdmin(invoking({ ok: true }, null, (name, options) => {
    assert.equal(name, api.AI_PORTAL_ADMIN_FUNCTION);
    assert.deepEqual(options, { body: { action: 'snapshot', includeInactive: true } });
  }), 'snapshot', { includeInactive: true });
  assert.deepEqual(result, { ok: true });
});

test('callAiPortalAdmin extracts an error code from a Response in the error context', async () => {
  const responseError = { context: Response.json({ error: 'formula_ai_portal_invalid_settings' }, { status: 400 }) };
  await assert.rejects(
    api.callAiPortalAdmin(async () => ({ data: null, error: responseError }), 'save-settings'),
    (error) => error instanceof api.AiPortalAdminError && error.code === 'formula_ai_portal_invalid_settings',
  );
});

test('callAiPortalAdmin falls back to a code token in an error message', async () => {
  await assert.rejects(
    api.callAiPortalAdmin(async () => ({ data: null, error: new Error('request failed: formula_ai_portal_request_failed') }), 'approve'),
    (error) => error.code === 'formula_ai_portal_request_failed',
  );
});

test('callAiPortalAdmin uses the network fallback for an unclassified thrown error', async () => {
  await assert.rejects(
    api.callAiPortalAdmin(async () => { throw new Error('connection reset'); }, 'snapshot'),
    (error) => error instanceof api.AiPortalAdminError && error.code === 'network',
  );
});

test('callAiPortalAdmin rejects a 2xx response containing an error body', async () => {
  await assert.rejects(
    api.callAiPortalAdmin(invoking({ error: 'formula_ai_portal_invalid_email' }), 'check-email'),
    (error) => error.code === 'formula_ai_portal_invalid_email',
  );
});

test('fetchSnapshot rejects a response with the wrong shape', async () => {
  await assert.rejects(
    api.fetchSnapshot(invoking({ settings: {}, members: [], approvals: [], requests: [], codeRequests: {} })),
    (error) => error instanceof api.AiPortalAdminError && error.code === 'invalid_response',
  );
});

test('admin wrappers send their exact actions and request bodies', async () => {
  const calls = [];
  const responses = {
    'check-email': { eligible: true },
    approve: { approvalId: 'approval-1' },
    'set-member-state': { state: 'revoked' },
    'set-sign-in': { signInOpen: false },
    'upload-asset': { id: 'asset-1', storagePath: 'asset/path', state: 'ready' },
  };
  const invoke = async (name, options) => {
    calls.push([name, options.body]);
    return { data: responses[options.body.action], error: null };
  };

  await api.checkEmail(invoke, 'person@example.com');
  await api.approveEmail(invoke, 'person@example.com', 'confirmed purchaser', 'Person Name');
  await api.setMemberState(invoke, 'member-1', 'revoked', 'duplicate account');
  await api.setSignIn(invoke, false);
  await api.uploadAsset(invoke, 'YWJj');

  assert.deepEqual(calls, [
    [api.AI_PORTAL_ADMIN_FUNCTION, { action: 'check-email', email: 'person@example.com' }],
    [api.AI_PORTAL_ADMIN_FUNCTION, {
      action: 'approve', email: 'person@example.com', reason: 'confirmed purchaser', name: 'Person Name',
    }],
    [api.AI_PORTAL_ADMIN_FUNCTION, {
      action: 'set-member-state', memberId: 'member-1', state: 'revoked', reason: 'duplicate account',
    }],
    [api.AI_PORTAL_ADMIN_FUNCTION, { action: 'set-sign-in', open: false }],
    [api.AI_PORTAL_ADMIN_FUNCTION, { action: 'upload-asset', contentBase64: 'YWJj' }],
  ]);
});

test('sourceLabel names every portal source', () => {
  assert.deepEqual([
    api.sourceLabel('roster'),
    api.sourceLabel('purchaser'),
    api.sourceLabel('partner'),
    api.sourceLabel('manual'),
  ], ['Roster seat', 'Ticket purchaser', 'Partner contact', 'Manual approval']);
});

test('eligibilityExplanation covers eligibility and every ineligible reason', () => {
  assert.deepEqual(api.eligibilityExplanation({ eligible: true, source: 'roster' }), {
    eligible: true, headline: 'Eligible', detail: 'Eligible · roster seat',
  });
  assert.deepEqual(api.eligibilityExplanation({ eligible: false, reason: 'invalid_email' }), {
    eligible: false, headline: 'Not eligible', detail: "That doesn't look like an email address",
  });
  assert.deepEqual(api.eligibilityExplanation({ eligible: false, reason: 'not_found' }), {
    eligible: false, headline: 'Not eligible', detail: 'Not on the roster',
  });
  assert.deepEqual(api.eligibilityExplanation({ eligible: false, reason: 'roster_inactive' }), {
    eligible: false, headline: 'Not eligible', detail: 'Seat suspended or revoked',
  });
  assert.deepEqual(api.eligibilityExplanation({ eligible: false, reason: 'revoked' }), {
    eligible: false, headline: 'Not eligible', detail: 'Portal access revoked',
  });
  assert.deepEqual(api.eligibilityExplanation({ eligible: false }), {
    eligible: false, headline: 'Not eligible', detail: 'Not eligible',
  });
});

test('filterMembers supports every filter and case-insensitive search', () => {
  const members = [
    member('alice', { platform: 'claude' }),
    member('bob', { state: 'revoked', platform: 'codex' }),
    member('carol', { platform: 'codex' }),
    member('dana', { state: 'revoked', platform: null }),
  ];
  const ids = (query, filter) => api.filterMembers(members, query, filter).map(({ id }) => id);

  assert.deepEqual(ids('', 'all'), ['alice', 'bob', 'carol', 'dana']);
  assert.deepEqual(ids('', 'active'), ['alice', 'carol']);
  assert.deepEqual(ids('', 'revoked'), ['bob', 'dana']);
  assert.deepEqual(ids('', 'claude'), ['alice']);
  assert.deepEqual(ids('', 'codex'), ['bob', 'carol']);
  assert.deepEqual(ids('  BOB@EXAMPLE  ', 'all'), ['bob']);
  assert.deepEqual(ids('car', 'active'), ['carol']);
});

test('sortMembers puts newest first and invalid dates last with deterministic email ordering', () => {
  const members = [
    member('invalid-z', { email: 'z@example.com', lastSeenAt: 'not-a-date' }),
    member('old', { email: 'old@example.com', lastSeenAt: '2027-01-02T00:00:00Z' }),
    member('new', { email: 'new@example.com', lastSeenAt: '2027-01-03T00:00:00Z' }),
    member('invalid-a', { email: 'a@example.com', lastSeenAt: 'not-a-date' }),
    member('tie-b', { email: 'b@example.com', lastSeenAt: '2027-01-01T00:00:00Z' }),
  ];
  assert.deepEqual(api.sortMembers(members).map(({ id }) => id), ['new', 'old', 'tie-b', 'invalid-a', 'invalid-z']);
});

test('sortRequests puts oldest first and invalid dates last with deterministic email ordering', () => {
  const requests = [
    { id: 'invalid-z', email: 'z@example.com', createdAt: 'not-a-date' },
    { id: 'new', email: 'new@example.com', createdAt: '2027-01-03T00:00:00Z' },
    { id: 'old', email: 'old@example.com', createdAt: '2027-01-02T00:00:00Z' },
    { id: 'invalid-a', email: 'a@example.com', createdAt: 'not-a-date' },
    { id: 'tie-b', email: 'b@example.com', createdAt: '2027-01-03T00:00:00Z' },
  ];
  assert.deepEqual(api.sortRequests(requests).map(({ id }) => id), ['old', 'tie-b', 'new', 'invalid-a', 'invalid-z']);
});

test('dayProgressLabel reports progress, missing values, and clamped or NaN values', () => {
  assert.equal(api.dayProgressLabel({ 'day-1': 45 }, 1), 'Day 1 · 45% furthest reached');
  assert.equal(api.dayProgressLabel({}, 1), 'Day 1 · not started');
  assert.equal(api.dayProgressLabel({ 'day-1': 150 }, 1), 'Day 1 · 100% furthest reached');
  assert.equal(api.dayProgressLabel({ 'day-1': -20 }, 1), 'Day 1 · 0% furthest reached');
  assert.equal(api.dayProgressLabel({ 'day-1': Number.NaN }, 1), 'Day 1 · not started');
});

test('filesRequestedLabel describes requested files and never downloaded files', () => {
  assert.equal(api.filesRequestedLabel(0), '0 requested');
  assert.equal(api.filesRequestedLabel(3), '3 requested');
  assert.doesNotMatch(api.filesRequestedLabel(3), /downloaded/i);
});

test('buildStats counts members, requests, approvals, and code request metrics', () => {
  const snapshot = {
    members: [member('a'), member('b', { state: 'revoked' }), member('c', { state: 'active' })],
    requests: [{ id: 'request-1' }, { id: 'request-2' }],
    approvals: [{ id: 'approval-1' }],
    codeRequests: { last24h: 8, notEligible24h: 3, sendFailed24h: 1 },
  };
  assert.deepEqual(api.buildStats(snapshot), [
    { label: 'Signed in', value: 2 },
    { label: 'Revoked', value: 1 },
    { label: 'Pending requests', value: 2 },
    { label: 'Manual approvals', value: 1 },
    { label: 'Code requests (24h)', value: 8 },
    { label: 'Not eligible (24h)', value: 3 },
    { label: 'Send failures (24h)', value: 1 },
  ]);
});

test('formatAccessEnd formats date-only, New York timestamp, and invalid dates', () => {
  assert.equal(api.formatAccessEnd('2027-04-01'), 'Access ends Apr 1, 2027');
  assert.equal(api.formatAccessEnd('2027-04-01T03:59:59Z'), 'Access ends Mar 31, 2027');
  assert.equal(api.formatAccessEnd('not-a-date'), 'Access end date unavailable');
});

test('bytesToBase64 matches Buffer for empty, small, and 200 KB inputs', () => {
  for (const bytes of [Buffer.alloc(0), Buffer.from('Formula AI Portal'), randomBytes(200 * 1024)]) {
    assert.equal(api.bytesToBase64(new Uint8Array(bytes)), Buffer.from(bytes).toString('base64'));
  }
});

test('fileToBase64 encodes a Blob using the same base64 representation as Buffer', async () => {
  const bytes = Buffer.from('blob payload');
  assert.equal(await api.fileToBase64(new Blob([bytes])), bytes.toString('base64'));
});

test('isValidEmailShape accepts a trimmed email and rejects malformed shapes', () => {
  assert.equal(api.isValidEmailShape('  person@example.com  '), true);
  assert.equal(api.isValidEmailShape('person@example'), false);
  assert.equal(api.isValidEmailShape('person example.com'), false);
  assert.equal(api.isValidEmailShape(''), false);
});

test('friendlyAiPortalError maps known codes and gives a generic message for unknown codes', () => {
  assert.equal(api.friendlyAiPortalError('formula_ai_portal_invalid_email'), "That email address isn't valid.");
  assert.equal(api.friendlyAiPortalError('network'), 'The portal service did not respond. Check your connection and try again.');
  assert.equal(api.friendlyAiPortalError('formula_ai_portal_future_code'), 'We could not complete that portal action. Try again in a moment.');
});
