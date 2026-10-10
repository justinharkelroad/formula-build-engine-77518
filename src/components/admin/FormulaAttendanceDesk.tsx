import { FormEvent, useEffect, useRef, useState } from 'react';
import { Check, Download, History, Loader2, RefreshCw, Search, Undo2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  arrivalTime, attendanceHelp, attendanceCsv, collectAttendance, requireConfirmedChange, attendanceChangeRequest, PendingAttendanceChanges,
  type AttendanceRow, type AttendancePage, type AttendanceChange, type AttendanceFilter, type AttendanceHistoryEntry,
} from '@/lib/formulaAttendance';

const pendingChanges = new PendingAttendanceChanges();
const lightOutline = 'border-black/20 bg-transparent text-[#181816] hover:bg-black/5 hover:text-[#181816]';
const lightDialog = 'border-black/15 bg-[#f8f5ee] text-[#181816] [&>button]:text-[#181816]';

async function request<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('formula-admin-attendees', {
    body: { eventId: 'formula-2026', ...body },
  });
  if (error || !data) throw new Error('Attendance is unavailable. Check your connection and refresh before trying again.');
  return data as T;
}

export default function FormulaAttendanceDesk() {
  const [page, setPage] = useState<AttendancePage | null>(null);
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<AttendanceFilter>('all');
  const [offset, setOffset] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [change, setChange] = useState<{ attendee: AttendanceRow; undo: boolean; correlationId: string } | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<AttendanceRow | null>(null);
  const [history, setHistory] = useState<AttendanceHistoryEntry[]>([]);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [historyNext, setHistoryNext] = useState<number | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const mounted = useRef(true);
  const { toast } = useToast();

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => { setQuery(queryInput.trim()); setOffset(0); }, 250);
    return () => window.clearTimeout(timer);
  }, [queryInput]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    request<AttendancePage>({ action: 'attendance-list', query, filter, offset, limit: 50 })
      .then(result => { if (active) setPage(result); })
      .catch(() => { if (active) setError('We could not refresh attendance. Try again before recording an arrival.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, filter, offset, refresh]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden && !busy && !change && !historyTarget) setRefresh(value => value + 1);
    }, 30000);
    return () => window.clearInterval(timer);
  }, [busy, change, historyTarget]);
  useEffect(() => {
    if (!historyTarget) return;
    let active = true;
    setHistoryLoading(true);
    setHistoryError(null);
    request<{ history: AttendanceHistoryEntry[]; nextOffset: number | null }>({
      action: 'attendance-history', registrationId: historyTarget.registrationId, offset: historyOffset, limit: 25,
    }).then(result => {
      if (!active) return;
      setHistory(previous => historyOffset === 0 ? result.history : [...previous, ...result.history]);
      setHistoryNext(result.nextOffset);
    }).catch(() => { if (active) setHistoryError('History could not be loaded. Close and reopen to try again.'); })
      .finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [historyTarget, historyOffset]);

  async function confirmChange(event: FormEvent) {
    event.preventDefault();
    if (!change || busy || (change.undo && !reason.trim())) return;
    const current = change;
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sign in again before changing attendance.');
      const body = pendingChanges.retain(session.user.id, attendanceChangeRequest(
        current.attendee, current.undo, reason, current.correlationId,
      ));
      const result = await request<AttendanceChange>(body);
      if (result.status === 'needs_help') {
        pendingChanges.complete(session.user.id, body);
        throw new Error(attendanceHelp(result.reasonCode));
      }
      requireConfirmedChange(result, current.attendee.registrationId, current.undo);
      pendingChanges.complete(session.user.id, body);
      if (!mounted.current) return;
      toast({ title: result.status === 'already_checked_in' ? 'Already checked in'
        : current.undo ? 'Arrival cleared' : 'Checked in',
      description: `${current.attendee.name} · ${arrivalTime(result.attendee?.checkedInAt ?? null)}` });
      setChange(null);
      setReason('');
      setRefresh(value => value + 1);
    } catch (caught) {
      if (mounted.current) toast({ title: 'Check the attendance status',
        description: caught instanceof Error ? caught.message : 'Refresh the roster before trying again.', variant: 'destructive' });
    } finally { if (mounted.current) setBusy(false); }
  }

  async function exportView() {
    if (exporting) return;
    setExporting(true);
    try {
      const rows = await collectAttendance(next => request<AttendancePage>({
        action: 'attendance-list', query, filter, offset: next, limit: 100,
      }));
      if (!mounted.current) return;
      const url = URL.createObjectURL(new Blob([attendanceCsv(rows)], { type: 'text/csv;charset=utf-8' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `formula-attendance-${filter}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast({ title: 'Attendance exported', description: `${rows.length} attendees in this search and filter.` });
    } catch {
      if (mounted.current) toast({ title: 'Export unavailable', description: 'Refresh attendance and try again.', variant: 'destructive' });
    } finally { if (mounted.current) setExporting(false); }
  }

  return <section className="border-b border-black/15 py-10" aria-labelledby="attendance-heading">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 id="attendance-heading" className="text-2xl font-bold tracking-tight">Event check-in</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/70">Scan personal QR codes in the Formula app, or find an attendee here. Arrival is tracked separately from app access.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className={lightOutline} onClick={() => setRefresh(value => value + 1)} disabled={loading || busy}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh attendance
        </Button>
        <Button variant="outline" className={lightOutline} onClick={exportView} disabled={exporting || !page || Boolean(error)}>
          {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Export view
        </Button>
      </div>
    </div>
    {page && <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-live="polite">
      <span><strong>{page.counts.checkedIn}</strong> checked in</span>
      <span><strong>{page.counts.notArrived}</strong> not yet arrived</span>
      <span><strong>{page.counts.needsHelp}</strong> need help</span>
      <span><strong>{page.counts.total}</strong> registrations</span>
    </p>}
    <div className="my-5 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/60" />
        <Input aria-label="Search attendance by name, email, or company" placeholder="Name, email, or company"
          value={queryInput} maxLength={120} onChange={event => setQueryInput(event.target.value)} className="border-black/20 bg-white/70 pl-9" />
      </div>
      <Select value={filter} onValueChange={(value: AttendanceFilter) => { setFilter(value); setOffset(0); }}>
        <SelectTrigger aria-label="Attendance filter" className="border-black/20 bg-white/70 sm:w-52"><SelectValue /></SelectTrigger>
        <SelectContent className="border-black/15 bg-[#fffdf8] text-[#181816]">
          <SelectItem value="all">All registrations</SelectItem>
          <SelectItem value="checked-in">Checked in</SelectItem>
          <SelectItem value="not-arrived">Not yet arrived</SelectItem>
          <SelectItem value="needs-help">Needs help</SelectItem>
        </SelectContent>
      </Select>
    </div>
    {error && <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {!page && loading ? <p role="status" className="py-8 text-sm">Loading attendance…</p>
      : page && page.attendees.length === 0 ? <p className="border border-black/15 p-8 text-center text-sm text-black/70">No attendees match this search and attendance filter.</p>
      : page && <div className="overflow-x-auto border border-black/15 bg-[#faf8f2]" aria-busy={loading}>
        <Table><TableHeader><TableRow className="border-black/15 hover:bg-transparent">
          <TableHead className="text-black/70">Attendee</TableHead><TableHead className="text-black/70">Arrival · event time</TableHead><TableHead><span className="sr-only">Attendance actions</span></TableHead>
        </TableRow></TableHeader><TableBody>
          {page.attendees.map(attendee => <TableRow key={attendee.registrationId} className="border-black/10 hover:bg-[#f1ede3]">
            <TableCell><p className="font-semibold">{attendee.name}</p><p className="mt-1 text-sm text-black/70">{attendee.email}</p>
              {attendee.company && <p className="mt-1 text-sm text-black/70">{attendee.company}</p>}</TableCell>
            <TableCell><p className={attendee.checkedInAt ? 'font-medium text-emerald-800' : ''}>{arrivalTime(attendee.checkedInAt)}</p>
              {!attendee.eligible && <p className="mt-1 max-w-xs text-sm text-amber-900">{attendanceHelp(attendee.needsHelpReason)}</p>}</TableCell>
            <TableCell><div className="flex flex-wrap justify-end gap-2">
              {attendee.checkedInAt ? <Button size="sm" variant="outline" className={lightOutline} disabled={busy || loading || Boolean(error)} onClick={() => { setReason(''); setChange({ attendee, undo: true, correlationId: crypto.randomUUID() }); }}>
                <Undo2 className="mr-1.5 h-4 w-4" />Undo</Button>
                : <Button size="sm" disabled={!attendee.eligible || busy || loading || Boolean(error)} onClick={() => setChange({ attendee, undo: false, correlationId: crypto.randomUUID() })}>
                  <Check className="mr-1.5 h-4 w-4" />Check in</Button>}
              <Button size="sm" variant="ghost" className="text-[#181816] hover:bg-black/5 hover:text-[#181816]" aria-label={`Arrival history for ${attendee.name}`} onClick={() => {
                setHistory([]); setHistoryOffset(0); setHistoryNext(null); setHistoryTarget(attendee);
              }}><History className="h-4 w-4" /></Button>
            </div></TableCell>
          </TableRow>)}
        </TableBody></Table>
      </div>}
    {page && <div className="mt-4 flex items-center justify-between gap-3 text-sm">
      <span className="text-black/70">{page.attendees.length ? `${offset + 1}–${offset + page.attendees.length}` : '0'} shown · refreshes every 30 seconds</span>
      <div className="flex gap-2"><Button variant="outline" className={lightOutline} size="sm" disabled={offset === 0 || loading} onClick={() => setOffset(value => Math.max(0, value - 50))}>Previous</Button>
        <Button variant="outline" className={lightOutline} size="sm" disabled={page.nextOffset === null || loading} onClick={() => { if (page.nextOffset !== null) setOffset(page.nextOffset); }}>Next</Button></div>
    </div>}
    <Dialog open={Boolean(change)} onOpenChange={open => { if (!open && !busy) setChange(null); }}>
      <DialogContent className={lightDialog}><DialogHeader><DialogTitle>{change?.undo ? 'Undo arrival' : 'Confirm check-in'}</DialogTitle>
        <DialogDescription className="text-black/70">{change?.attendee.name} · {change?.attendee.email}</DialogDescription></DialogHeader>
        <form onSubmit={confirmChange} className="space-y-4">
          {change?.undo ? <div className="space-y-2"><Label htmlFor="arrival-undo-reason">Reason for undoing this arrival</Label>
            <Textarea id="arrival-undo-reason" className="border-black/20 bg-white text-[#181816]" value={reason} onChange={event => setReason(event.target.value)} maxLength={500} required disabled={busy} />
            <p className="text-sm text-black/70">The correction and your reason will remain in the attendance history.</p></div>
            : <p className="text-sm">Confirm this is the person arriving. Their app and ticket access will stay as currently assigned.</p>}
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" className={lightOutline} disabled={busy} onClick={() => setChange(null)}>Cancel</Button>
            <Button type="submit" disabled={busy || Boolean(change?.undo && !reason.trim())}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{change?.undo ? 'Undo arrival' : 'Check in attendee'}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
    <Dialog open={Boolean(historyTarget)} onOpenChange={open => { if (!open) setHistoryTarget(null); }}>
      <DialogContent className={`${lightDialog} max-h-[85vh] overflow-y-auto`}><DialogHeader><DialogTitle>Arrival history</DialogTitle><DialogDescription className="text-black/70">{historyTarget?.name}</DialogDescription></DialogHeader>
        {historyError && <p role="alert" className="text-sm text-red-700">{historyError}</p>}
        {!history.length && !historyLoading && !historyError && <p className="text-sm">No arrival changes have been recorded.</p>}
        <ol className="divide-y">{history.map((entry, index) => <li key={`${entry.correlationId}-${index}`} className="py-3 text-sm">
          <p className="font-semibold">{entry.action.includes('undo') ? 'Arrival cleared' : 'Checked in'} · {arrivalTime(entry.createdAt)}</p>
          <p className="mt-1 text-black/70">{entry.method === 'qr' ? 'QR scan' : 'Staff lookup'} · Staff {entry.actorId}</p>
          {entry.reason && <p className="mt-2">{entry.reason}</p>}
        </li>)}</ol>
        {historyLoading && <p role="status" className="text-sm">Loading history…</p>}
        {historyNext !== null && !historyLoading && !historyError && <Button variant="outline" className={lightOutline} onClick={() => setHistoryOffset(historyNext)}>Load earlier changes</Button>}
      </DialogContent>
    </Dialog>
  </section>;
}
