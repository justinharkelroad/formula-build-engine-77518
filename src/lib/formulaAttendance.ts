export type AttendanceFilter = 'all' | 'checked-in' | 'not-arrived' | 'needs-help';

export interface AttendanceRow {
  registrationId: string;
  eventId: string;
  name: string;
  email: string;
  company: string | null;
  seatType: string;
  registrationState: string;
  checkedInAt: string | null;
  eligible: boolean;
  needsHelpReason: string | null;
}

export interface AttendancePage {
  eventId: string;
  attendees: AttendanceRow[];
  counts: { total: number; checkedIn: number; notArrived: number; needsHelp: number };
  offset: number;
  limit: number;
  nextOffset: number | null;
}

export interface AttendanceChange {
  status: 'checked_in' | 'already_checked_in' | 'undone' | 'already_not_arrived' | 'needs_help';
  reasonCode?: string;
  attendee: AttendanceRow | null;
}

export interface AttendanceHistoryEntry {
  action: string;
  actorId: string;
  method: string;
  reason: string | null;
  previousCheckedInAt: string | null;
  checkedInAt: string | null;
  correlationId: string;
  createdAt: string;
}

export function arrivalTime(value: string | null): string {
  if (!value) return 'Not yet arrived';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Arrival time unavailable';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(date);
}

export function attendanceHelp(reason: string | null | undefined): string {
  if (!reason) return 'Review this registration before checking in.';
  if (reason === 'attendance_changed_since_request') return 'Attendance changed after the earlier request. Close this confirmation and refresh before making another change.';
  if (/revoked|cancelled|canceled/.test(reason)) return 'This registration has been canceled or revoked.';
  if (/suspend/.test(reason)) return 'This registration is suspended.';
  if (/ambiguous|multiple/.test(reason)) return 'More than one registration matches. Review the attendee details.';
  if (/identity|different_uid|linked_elsewhere/.test(reason)) return 'The account connection needs a staff review.';
  if (/not_found|unmatched|no_registration/.test(reason)) return 'No matching event registration was found.';
  return 'This registration needs a staff review before admission.';
}

export function requireConfirmedChange(result: AttendanceChange, registrationId: string, undo: boolean): void {
  const accepted = undo ? ['undone', 'already_not_arrived'] : ['checked_in', 'already_checked_in'];
  if (!accepted.includes(result?.status) || result.attendee?.registrationId !== registrationId ||
      (undo ? result.attendee.checkedInAt !== null : !result.attendee.checkedInAt || result.attendee.eligible !== true)) {
    throw new Error('The attendance change could not be confirmed. Refresh the roster before trying again.');
  }
}

export function attendanceChangeRequest(attendee: AttendanceRow, undo: boolean, reason: string, correlationId: string) {
  if (undo && (!attendee.checkedInAt || !reason.trim())) {
    throw new Error('Refresh the arrival and enter a reason before undoing it.');
  }
  return {
    action: undo ? 'attendance-undo' : 'attendance-check-in',
    registrationId: attendee.registrationId,
    // Keep the original timestamp, including database microseconds, for the server's comparison.
    ...(undo ? { reason: reason.trim(), expectedCheckedInAt: attendee.checkedInAt } : { method: 'manual' }),
    correlationId,
  };
}

type ChangeRequest = ReturnType<typeof attendanceChangeRequest>;

// Lives beyond a confirmation dialog or roster remount, and is scoped to the signed-in operator.
// Only a definite server response clears an uncertain mutation; retries retain the entire request.
export class PendingAttendanceChanges {
  private readonly requests = new Map<string, ChangeRequest>();

  private key(actorId: string, request: ChangeRequest): string {
    return JSON.stringify([actorId, request.registrationId, request.action,
      'expectedCheckedInAt' in request ? request.expectedCheckedInAt : null]);
  }

  retain(actorId: string, proposed: ChangeRequest): ChangeRequest {
    const key = this.key(actorId, proposed);
    const existing = this.requests.get(key);
    if (existing) return existing;
    const retained = Object.freeze({ ...proposed });
    this.requests.set(key, retained);
    return retained;
  }

  complete(actorId: string, request: ChangeRequest): void {
    const key = this.key(actorId, request);
    if (this.requests.get(key)?.correlationId === request.correlationId) this.requests.delete(key);
  }
}

function csvCell(value: string | null): string {
  const raw = value ?? '';
  // Spreadsheet applications otherwise treat attendee-supplied cells as formulas.
  const safe = /^\s*[=+\-@]/.test(raw) || /^[\t\r\n]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function attendanceCsv(rows: AttendanceRow[]): string {
  const header = ['Registration ID', 'Name', 'Email', 'Company', 'Seat type', 'Attendance', 'Arrival time (UTC)', 'Needs help'];
  const records = rows.map(row => [row.registrationId, row.name, row.email, row.company, row.seatType,
    row.checkedInAt ? 'Checked in' : 'Not yet arrived', row.checkedInAt, row.needsHelpReason]);
  return '\uFEFF' + [header, ...records].map(row => row.map(csvCell).join(',')).join('\r\n');
}

export async function collectAttendance(load: (offset: number) => Promise<AttendancePage>): Promise<AttendanceRow[]> {
  const rows = new Map<string, AttendanceRow>();
  let offset = 0;
  for (let pageNumber = 0; pageNumber < 1000; pageNumber += 1) {
    const page = await load(offset);
    for (const row of page.attendees) rows.set(row.registrationId, row);
    if (page.nextOffset === null) return [...rows.values()];
    if (!Number.isInteger(page.nextOffset) || page.nextOffset <= offset) {
      throw new Error('The roster changed during export. Refresh and try again.');
    }
    offset = page.nextOffset;
  }
  throw new Error('This export is too large. Narrow the search or attendance filter.');
}
