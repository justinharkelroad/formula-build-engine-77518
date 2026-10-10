import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const code = ts.transpileModule(fs.readFileSync(new URL('../src/lib/formulaAttendance.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const api = {};
new Function('exports', code)(api);
const row = { registrationId: 'seat-one', eventId: 'formula-2026', name: 'Person', email: 'person@example.com',
  company: null, seatType: 'team', registrationState: 'invited', checkedInAt: null, eligible: true, needsHelpReason: null };

test('server success must refer to the selected seat with a confirmed arrival timestamp', () => {
  assert.doesNotThrow(() => api.requireConfirmedChange({status: 'checked_in', attendee: {...row, checkedInAt: '2026-10-14T13:00:00Z'}}, row.registrationId, false));
  assert.doesNotThrow(() => api.requireConfirmedChange({status: 'already_checked_in', attendee: {...row, checkedInAt: '2026-10-14T13:00:00Z'}}, row.registrationId, false));
  assert.throws(() => api.requireConfirmedChange({status: 'checked_in', attendee: row}, row.registrationId, false), /could not be confirmed/);
  assert.throws(() => api.requireConfirmedChange({status: 'checked_in', attendee: {...row, registrationId: 'another-seat', checkedInAt: '2026-10-14T13:00:00Z'}}, row.registrationId, false), /could not be confirmed/);
  assert.throws(() => api.requireConfirmedChange({status: 'needs_help', attendee: row}, row.registrationId, false), /could not be confirmed/);
  assert.throws(() => api.requireConfirmedChange({status: 'checked_in', attendee: {...row, eligible: false, checkedInAt: '2026-10-14T13:00:00Z'}}, row.registrationId, false), /could not be confirmed/);
});

test('undo sends the selected arrival timestamp without dropping database precision', () => {
  const timestamp = '2026-10-14T13:00:00.123456+00:00';
  const request = api.attendanceChangeRequest({...row, checkedInAt: timestamp}, true, ' Duplicate scan ', 'operation-one');
  assert.equal(request.expectedCheckedInAt, timestamp);
  assert.equal(request.reason, 'Duplicate scan');
  assert.equal(request.correlationId, 'operation-one');
  assert.throws(() => api.attendanceChangeRequest(row, true, 'Duplicate', 'operation-one'), /Refresh/);
  assert.ok(!('expectedCheckedInAt' in api.attendanceChangeRequest(row, false, '', 'operation-two')));
});

test('undo succeeds only when the matching seat has no remaining arrival', () => {
  assert.doesNotThrow(() => api.requireConfirmedChange({status: 'undone', attendee: row}, row.registrationId, true));
  assert.throws(() => api.requireConfirmedChange({status: 'undone', attendee: {...row, checkedInAt: '2026-10-14T13:00:00Z'}}, row.registrationId, true), /could not be confirmed/);
  assert.throws(() => api.requireConfirmedChange({status: 'checked_in', attendee: row}, row.registrationId, true), /could not be confirmed/);
});

test('uncertain mutations retain the original request across dialog recreation and separate operators', () => {
  const pending = new api.PendingAttendanceChanges();
  const arrived = {...row, checkedInAt: '2026-10-14T13:00:00.123456Z'};
  const first = api.attendanceChangeRequest(arrived, true, 'Original reason', 'first-request');
  const retry = api.attendanceChangeRequest(arrived, true, 'Edited reason', 'new-dialog');
  pending.retain('staff-a', first);
  assert.deepEqual(pending.retain('staff-a', retry), first);
  assert.deepEqual(pending.retain('staff-b', retry), retry);
  const laterArrival = api.attendanceChangeRequest({...arrived, checkedInAt: '2026-10-14T14:00:00Z'}, true, 'New arrival', 'later');
  assert.deepEqual(pending.retain('staff-a', laterArrival), laterArrival);
  pending.complete('staff-a', first);
  assert.deepEqual(pending.retain('staff-a', retry), retry);
});

test('CSV quotes attendee text and neutralizes spreadsheet formulas', () => {
  const csv = api.attendanceCsv([{...row, name: ' =HYPERLINK("bad")', company: 'First, "Second"\nThird'}]);
  assert.ok(csv.startsWith('\uFEFF"Registration ID"'));
  assert.ok(csv.includes('"\' =HYPERLINK(""bad"")"'));
  assert.ok(csv.includes('"First, ""Second""\nThird"'));
  assert.ok(csv.includes('"Not yet arrived"'));
});

test('export loads every page and avoids duplicate registration rows', async () => {
  const offsets = [];
  const result = await api.collectAttendance(async offset => {
    offsets.push(offset);
    return offset === 0 ? {attendees: [row], nextOffset: 100} : {attendees: [row, {...row, registrationId: 'seat-two'}], nextOffset: null};
  });
  assert.deepEqual(offsets, [0, 100]);
  assert.deepEqual(result.map(item => item.registrationId), ['seat-one', 'seat-two']);
});

test('export aborts non-advancing pagination rather than hanging or silently truncating', async () => {
  await assert.rejects(api.collectAttendance(async () => ({attendees: [row], nextOffset: 0})), /Refresh and try again/);
});

test('arrival display uses event time and handles missing or corrupt timestamps', () => {
  assert.equal(api.arrivalTime(null), 'Not yet arrived');
  assert.equal(api.arrivalTime('broken'), 'Arrival time unavailable');
  assert.match(api.arrivalTime('2026-10-14T13:00:00Z'), /9:00 AM EDT/);
});
