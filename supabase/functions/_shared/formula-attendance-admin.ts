/** Whitelist staff attendance inputs. Actor identity is supplied by verified Auth,
 * never copied from the body; web attendance always uses the manual method. */
export function webAttendanceRequest(action: string, body: Record<string, unknown>): Record<string, unknown> {
  const fail = (code: string): never => { throw new Error(code); };
  const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null;
  const uuid = (value: unknown) => {
    const v = text(value);
    return v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v) ? v : null;
  };
  if (!['attendance-list','attendance-check-in','attendance-undo','attendance-history'].includes(action)) fail('formula_attendance_action_invalid');
  const attendanceAction = action.replace('attendance-', '');
  const registrationId = uuid(body.registrationId);
  if (attendanceAction !== 'list' && !registrationId) fail('formula_attendance_registration_invalid');
  if (attendanceAction === 'undo' && (!text(body.reason) || text(body.reason)!.length > 500)) fail('formula_attendance_reason_required');
  let expectedCheckedInAt: string | null = null;
  if (attendanceAction === 'undo') {
    expectedCheckedInAt = text(body.expectedCheckedInAt);
    if (!expectedCheckedInAt) fail('formula_attendance_expected_timestamp_required');
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/.test(expectedCheckedInAt!)
      || !Number.isFinite(Date.parse(expectedCheckedInAt!))) fail('formula_attendance_expected_timestamp_invalid');
  }
  const offset = body.offset ?? 0, limit = body.limit ?? 50;
  if (!Number.isInteger(offset) || !Number.isInteger(limit) || Number(offset) < 0 || Number(offset) > 100000
    || Number(limit) < 1 || Number(limit) > (attendanceAction === 'history' ? 50 : 100)) fail('formula_attendance_query_invalid');
  if (body.correlationId != null && !uuid(body.correlationId)) fail('formula_attendance_correlation_invalid');
  if (body.query != null && (typeof body.query !== 'string' || body.query.length > 200)) fail('formula_attendance_query_invalid');
  if (body.filter != null && !['all', 'checked-in', 'not-arrived', 'needs-help'].includes(String(body.filter))) fail('formula_attendance_query_invalid');
  if (body.eventId != null && body.eventId !== 'formula-2026') fail('formula_attendance_event_invalid');
  if (body.method != null && body.method !== 'manual') fail('formula_attendance_action_invalid');
  return { action: attendanceAction, eventId: 'formula-2026', registrationId, method: 'manual',
    reason: text(body.reason), expectedCheckedInAt, correlationId: uuid(body.correlationId), query: text(body.query) ?? '',
    filter: text(body.filter) ?? 'all', offset, limit };
}
