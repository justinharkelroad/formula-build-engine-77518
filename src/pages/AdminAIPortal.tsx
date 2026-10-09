import { format, formatDistanceToNow, isValid } from 'date-fns';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  ChevronLeft,
  CircleAlert,
  CircleCheck,
  CircleX,
  FileWarning,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Upload,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AiPortalAdminError,
  approveEmail,
  buildStats,
  checkEmail,
  dayProgressLabel,
  dismissRequest,
  eligibilityExplanation,
  fileToBase64,
  filesRequestedLabel,
  filterMembers,
  formatAccessEnd,
  friendlyAiPortalError,
  isValidEmailShape,
  memberDisplayName,
  platformLabel,
  revokeApproval,
  setMemberState,
  setSignIn,
  sortMembers,
  sortRequests,
  sourceLabel,
  uploadAsset,
  fetchAssetStatus,
  fetchSnapshot,
  type AccessRequest,
  type AdminInvoker,
  type Approval,
  type AssetStatus,
  type CheckEmailResult,
  type Member,
  type MemberFilter,
  type Snapshot,
} from '@/lib/aiPortalAdmin';

const invoke: AdminInvoker = (name, options) => supabase.functions.invoke(name, options);
const inputClass = 'border-black/20 bg-white/70 text-[#181816] focus-visible:ring-[#f26622]';
const sheetClass = 'w-full overflow-y-auto border-black/15 bg-[#f8f5ee] text-[#181816] [&>button]:text-[#181816] [&>button]:ring-offset-[#f8f5ee] sm:max-w-xl';

type ApprovalForm = { email: string; name: string; reason: string };
type UploadResult = { fileName: string; ok: boolean; assetId?: string; error?: string };
type ConfirmState =
  | { kind: 'sign-in'; open: boolean }
  | { kind: 'dismiss'; request: AccessRequest }
  | { kind: 'revoke-approval'; approval: Approval }
  | { kind: 'member'; member: Member; state: 'active' | 'revoked' }
  | null;

function relativeTime(value: string): string {
  const date = new Date(value);
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : 'Time unavailable';
}

function absoluteTime(value: string): string {
  const date = new Date(value);
  return isValid(date) ? format(date, 'PPpp') : 'Time unavailable';
}

function errorMessage(error: unknown): string {
  return friendlyAiPortalError(error instanceof AiPortalAdminError ? error.code : 'network');
}

function StateBadge({ state }: { state: 'ready' | 'missing' | 'mismatch' | 'active' | 'revoked' }) {
  if (state === 'ready' || state === 'active') {
    return <span className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800"><Check className="h-3.5 w-3.5" /> {state === 'ready' ? 'Ready' : 'Active'}</span>;
  }
  if (state === 'revoked') {
    return <span className="inline-flex items-center gap-1.5 rounded-sm bg-red-100 px-2 py-1 text-xs font-semibold text-red-800"><CircleX className="h-3.5 w-3.5" /> Revoked</span>;
  }
  return <span className="inline-flex items-center gap-1.5 rounded-sm bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900"><FileWarning className="h-3.5 w-3.5" /> {state === 'missing' ? 'Missing' : 'Mismatch'}</span>;
}

function SectionHeading({ id, title, description, action }: { id: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 id={id} className="text-2xl font-bold tracking-[-0.03em]">{title}</h2>
        {description && <p className="mt-1 text-sm text-black/55">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const AdminAIPortal = () => {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(true);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [assetStatus, setAssetStatus] = useState<AssetStatus | null>(null);
  const [assetLoading, setAssetLoading] = useState(true);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [mutation, setMutation] = useState<string | null>(null);
  const [checkEmailValue, setCheckEmailValue] = useState('');
  const [checkResult, setCheckResult] = useState<CheckEmailResult | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [approvalSheetOpen, setApprovalSheetOpen] = useState(false);
  const [approvalForm, setApprovalForm] = useState<ApprovalForm>({ email: '', name: '', reason: '' });
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [confirmReason, setConfirmReason] = useState('');
  const [peopleSearch, setPeopleSearch] = useState('');
  const [peopleFilter, setPeopleFilter] = useState<MemberFilter>('all');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const mountedRef = useRef(true);
  const snapshotRequestRef = useRef(0);
  const assetRequestRef = useRef(0);
  const hasLoadedSnapshotRef = useRef(false);
  const { toast } = useToast();
  const busy = Boolean(mutation) || uploading;

  useEffect(() => () => { mountedRef.current = false; }, []);

  const showMutationError = useCallback((title: string, error: unknown) => {
    toast({ title, description: errorMessage(error), variant: 'destructive' });
  }, [toast]);

  const loadSnapshot = useCallback(async (quiet = false): Promise<boolean> => {
    const requestId = ++snapshotRequestRef.current;
    if (!quiet && mountedRef.current) setSnapshotLoading(true);
    try {
      const nextSnapshot = await fetchSnapshot(invoke);
      if (!mountedRef.current || requestId !== snapshotRequestRef.current) return false;
      setSnapshot(nextSnapshot);
      setSnapshotError(null);
      hasLoadedSnapshotRef.current = true;
      return true;
    } catch (error) {
      if (mountedRef.current && requestId === snapshotRequestRef.current) {
        if (!hasLoadedSnapshotRef.current && !quiet) setSnapshotError('We could not load the AI portal admin data.');
        toast({ title: 'AI portal unavailable', description: errorMessage(error), variant: 'destructive' });
      }
      return false;
    } finally {
      if (mountedRef.current && requestId === snapshotRequestRef.current) setSnapshotLoading(false);
    }
  }, [toast]);

  const loadAssets = useCallback(async (quiet = false): Promise<boolean> => {
    const requestId = ++assetRequestRef.current;
    if (!quiet && mountedRef.current) setAssetLoading(true);
    try {
      const nextStatus = await fetchAssetStatus(invoke);
      if (!mountedRef.current || requestId !== assetRequestRef.current) return false;
      setAssetStatus(nextStatus);
      setAssetError(null);
      return true;
    } catch (error) {
      if (mountedRef.current && requestId === assetRequestRef.current) {
        setAssetError(errorMessage(error));
        toast({ title: 'Files unavailable', description: errorMessage(error), variant: 'destructive' });
      }
      return false;
    } finally {
      if (mountedRef.current && requestId === assetRequestRef.current) setAssetLoading(false);
    }
  }, [toast]);

  const refreshAll = useCallback(() => {
    void loadSnapshot();
    void loadAssets();
  }, [loadAssets, loadSnapshot]);

  useEffect(() => {
    let ignore = false;
    void loadSnapshot().then((loaded) => {
      if (loaded && !ignore) void loadAssets();
    });
    return () => { ignore = true; };
  }, [loadAssets, loadSnapshot]);

  const stats = useMemo(() => snapshot ? buildStats(snapshot) : [], [snapshot]);
  const visibleMembers = useMemo(() => snapshot ? sortMembers(filterMembers(snapshot.members, peopleSearch, peopleFilter)) : [], [peopleFilter, peopleSearch, snapshot]);
  const visibleRequests = useMemo(() => snapshot ? sortRequests(snapshot.requests) : [], [snapshot]);

  const refreshAfterMutation = useCallback(async () => {
    await loadSnapshot(true);
  }, [loadSnapshot]);

  const checkEmailAddress = async (event: FormEvent) => {
    event.preventDefault();
    const email = checkEmailValue.trim();
    if (!isValidEmailShape(email)) {
      setCheckResult({ eligible: false, reason: 'invalid_email' });
      return;
    }
    setCheckLoading(true);
    try {
      const result = await checkEmail(invoke, email);
      if (mountedRef.current) setCheckResult(result);
    } catch (error) {
      showMutationError('Email check failed', error);
    } finally {
      if (mountedRef.current) setCheckLoading(false);
    }
  };

  const openApprovalSheet = (request?: AccessRequest) => {
    setApprovalForm({ email: request?.email ?? '', name: request?.displayName ?? '', reason: '' });
    setApprovalSheetOpen(true);
  };

  const submitApproval = async (event: FormEvent) => {
    event.preventDefault();
    const email = approvalForm.email.trim();
    const reason = approvalForm.reason.trim();
    if (!isValidEmailShape(email)) {
      toast({ title: 'Enter a valid email address', variant: 'destructive' });
      return;
    }
    if (!reason) {
      toast({ title: 'A reason is required', variant: 'destructive' });
      return;
    }
    setMutation('approve');
    try {
      await approveEmail(invoke, email, reason, approvalForm.name.trim() || undefined);
      if (mountedRef.current) setApprovalSheetOpen(false);
      await refreshAfterMutation();
      toast({ title: 'Approval added', description: `${email} can now request a sign-in code.` });
    } catch (error) {
      showMutationError('Approval not saved', error);
    } finally {
      if (mountedRef.current) setMutation(null);
    }
  };

  const confirmAction = async () => {
    if (!confirmState) return;
    const state = confirmState;
    const key = state.kind === 'sign-in' ? 'sign-in' : state.kind === 'dismiss' ? `dismiss-${state.request.id}` : state.kind === 'revoke-approval' ? `revoke-approval-${state.approval.id}` : `member-${state.member.id}`;
    setMutation(key);
    try {
      if (state.kind === 'sign-in') {
        await setSignIn(invoke, state.open);
      } else if (state.kind === 'dismiss') {
        await dismissRequest(invoke, state.request.id);
      } else if (state.kind === 'revoke-approval') {
        await revokeApproval(invoke, state.approval.id);
      } else {
        await setMemberState(invoke, state.member.id, state.state, state.state === 'revoked' ? confirmReason.trim() || undefined : undefined);
      }
      if (mountedRef.current) {
        setConfirmState(null);
        setConfirmReason('');
      }
      await refreshAfterMutation();
      toast({ title: state.kind === 'sign-in' ? `Sign-in ${state.open ? 'opened' : 'closed'}` : state.kind === 'dismiss' ? 'Request dismissed' : state.kind === 'revoke-approval' ? 'Approval revoked' : state.state === 'revoked' ? 'Access revoked' : 'Access restored' });
    } catch (error) {
      showMutationError('Portal change not saved', error);
    } finally {
      if (mountedRef.current) setMutation(null);
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;
    setUploading(true);
    setMutation('upload');
    setUploadResults([]);
    setUploadProgress({ current: 0, total: files.length });
    try {
      for (const [index, file] of files.entries()) {
        if (!mountedRef.current) return;
        setUploadProgress({ current: index + 1, total: files.length });
        try {
          const contentBase64 = await fileToBase64(file);
          const result = await uploadAsset(invoke, contentBase64);
          if (mountedRef.current) setUploadResults((current) => [...current, { fileName: file.name, ok: true, assetId: result.id }]);
        } catch (error) {
          if (mountedRef.current) setUploadResults((current) => [...current, { fileName: file.name, ok: false, error: errorMessage(error) }]);
          showMutationError('File upload failed', error);
        }
      }
      if (mountedRef.current) await loadAssets(true);
    } finally {
      if (mountedRef.current) {
        setUploading(false);
        setMutation(null);
        setUploadProgress(null);
      }
    }
  };

  const confirmTitle = confirmState?.kind === 'sign-in' ? `${confirmState.open ? 'Open' : 'Close'} sign-in?` : confirmState?.kind === 'dismiss' ? 'Dismiss this request?' : confirmState?.kind === 'revoke-approval' ? 'Revoke this approval?' : confirmState?.kind === 'member' ? `${confirmState.state === 'revoked' ? 'Revoke' : 'Restore'} access?` : '';
  const confirmDescription = confirmState?.kind === 'sign-in'
    ? confirmState.open ? 'People can request a sign-in code as soon as you open the gate.' : 'Nobody can request a sign-in code while the gate is closed.'
    : confirmState?.kind === 'dismiss' ? `${confirmState.request.email} will be removed from Mary’s pending queue.`
      : confirmState?.kind === 'revoke-approval' ? `${confirmState.approval.email} will no longer have this manual approval.`
        : confirmState?.kind === 'member' ? confirmState.state === 'revoked' ? 'This person will lose portal access immediately. You can restore access later.' : 'This person will regain portal access immediately.' : '';
  const confirmKey = confirmState?.kind === 'sign-in' ? 'sign-in' : confirmState?.kind === 'dismiss' ? `dismiss-${confirmState.request.id}` : confirmState?.kind === 'revoke-approval' ? `revoke-approval-${confirmState.approval.id}` : confirmState?.kind === 'member' ? `member-${confirmState.member.id}` : '';

  return (
    <>
      <SEO title="AI Portal | Formula Admin" description="Administrative access." path="/admin/ai-portal" noindex />
      <Navigation />
      <main className="min-h-screen bg-[#f3f0e9] pt-24 text-[#181816]">
        <section className="mx-auto max-w-[1480px] px-4 pb-20 sm:px-7 lg:px-10">
          <header className="border-b border-black/15 pb-8 pt-8 lg:flex lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-4xl">
              <Link to="/admin/sales" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-black/60 transition hover:text-black"><ChevronLeft className="h-4 w-4" /> Sales dashboard</Link>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#c45120]">Formula 2026 · AI portal</p>
              <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-[-0.045em] sm:text-6xl lg:text-7xl">Who has the AI toolkit.</h1>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-black/60 sm:text-lg">Keep the private toolkit limited to the people who should have it, and make the closing-call handoff easy to manage.</p>
            </div>
            <Button variant="outline" className="mt-7 border-black/20 bg-transparent lg:mt-0" onClick={refreshAll} disabled={snapshotLoading || assetLoading || busy}><RefreshCw className={`mr-2 h-4 w-4 ${snapshotLoading || assetLoading ? 'animate-spin' : ''}`} /> Refresh</Button>
          </header>

          {snapshotError && !snapshot && <div role="alert" className="mt-6 flex flex-col gap-4 border border-red-300 bg-red-50 p-5 text-red-900 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">AI portal data could not load.</p><p className="mt-1 text-sm">Try again before changing access.</p></div><Button variant="outline" className="border-red-300 bg-transparent text-red-900 hover:bg-red-100" onClick={() => void loadSnapshot()} disabled={snapshotLoading}>Retry</Button></div>}

          <section aria-labelledby="sign-in-heading" className="mt-10 border border-black/15 bg-[#faf8f2] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c45120]">Sign-in switch</p>
                <h2 id="sign-in-heading" className="mt-3 text-3xl font-bold tracking-[-0.04em]">{snapshot ? snapshot.settings.sign_in_open ? 'Sign-in is OPEN' : 'Sign-in is CLOSED' : <Skeleton className="h-10 w-72" />}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">When closed, nobody can request a sign-in code. Open it on the closing Zoom call.</p>
                {snapshot && <p className="mt-3 text-sm font-semibold text-black/60">{formatAccessEnd(snapshot.settings.access_until)}</p>}
              </div>
              {snapshot ? <Button className="shrink-0 bg-[#f26622] text-black hover:bg-[#dc5719]" onClick={() => setConfirmState({ kind: 'sign-in', open: !snapshot.settings.sign_in_open })} disabled={busy}><span className={`mr-2 h-3 w-3 rounded-full ring-2 ring-offset-2 ring-offset-[#faf8f2] ${snapshot.settings.sign_in_open ? 'bg-emerald-500 ring-emerald-200' : 'bg-red-500 ring-red-200'}`} aria-hidden="true" /> {snapshot.settings.sign_in_open ? 'Close sign-in' : 'Open sign-in'}</Button> : <Skeleton className="h-10 w-32" />}
            </div>
          </section>

          <section aria-label="Portal stats" className="mt-8 grid gap-px border-y border-black/15 bg-black/15 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {snapshotLoading && !snapshot ? Array.from({ length: 7 }).map((_, index) => <div key={index} className="bg-[#f3f0e9] p-5"><Skeleton className="h-16 w-full" /></div>) : stats.map((stat) => <div key={stat.label} className="bg-[#f3f0e9] px-5 py-5"><div className="font-mono text-3xl font-semibold tabular-nums tracking-tight">{stat.value}</div><div className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/50">{stat.label}</div></div>)}
          </section>

          <section aria-labelledby="check-email-heading" className="mt-10">
            <SectionHeading id="check-email-heading" title="Check an email" description="Confirm access before you answer a question on the closing call." />
            <form className="border border-black/15 bg-[#faf8f2] p-6 sm:flex sm:items-end sm:gap-4" onSubmit={checkEmailAddress}>
              <div className="flex-1 space-y-2"><Label htmlFor="check-email">Email address</Label><Input id="check-email" type="email" value={checkEmailValue} onChange={(event) => setCheckEmailValue(event.target.value)} placeholder="person@example.com" className={inputClass} /></div>
              <Button type="submit" className="mt-4 bg-[#f26622] text-black hover:bg-[#dc5719] sm:mt-0" disabled={checkLoading || busy}>{checkLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Check email</Button>
              <div aria-live="polite" className={`mt-5 min-h-12 flex-1 border-l-4 px-4 py-2 sm:mt-0 ${checkResult ? checkResult.eligible ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50' : 'border-transparent'}`}>
                {checkResult && <><p className="font-semibold">{eligibilityExplanation(checkResult).headline}{checkResult.displayName ? ` · ${checkResult.displayName}` : ''}</p><p className="mt-1 text-sm text-black/60">{eligibilityExplanation(checkResult).detail}</p></>}
              </div>
            </form>
          </section>

          <section aria-labelledby="requests-heading" className="mt-12">
            <SectionHeading id="requests-heading" title="Requests" description="Mary’s queue of people asking for access." />
            <div className="overflow-x-auto border border-black/15 bg-[#faf8f2]">
              {!snapshot ? <div className="space-y-3 p-6">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-14 w-full" />)}</div> : visibleRequests.length === 0 ? <div className="grid min-h-40 place-items-center p-6 text-sm text-black/55">No pending requests.</div> : <Table><TableHeader><TableRow className="border-black/15 hover:bg-transparent"><TableHead className="pl-6 text-black/50">Name</TableHead><TableHead className="text-black/50">Email</TableHead><TableHead className="text-black/50">Note</TableHead><TableHead className="text-black/50">Created</TableHead><TableHead className="text-right text-black/50"><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader><TableBody>{visibleRequests.map((request) => <TableRow key={request.id} className="border-black/10 hover:bg-[#f1ede3]"><TableCell className="pl-6 font-semibold">{request.displayName}</TableCell><TableCell>{request.email}{request.eligibleNow && <span className="ml-2 inline-flex rounded-sm bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">Already eligible</span>}</TableCell><TableCell className="max-w-xs whitespace-normal text-sm text-black/60">{request.note || '—'}</TableCell><TableCell title={absoluteTime(request.createdAt)} className="whitespace-nowrap text-sm text-black/60">{relativeTime(request.createdAt)}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-2"><Button size="sm" className="bg-[#f26622] text-black hover:bg-[#dc5719]" onClick={() => openApprovalSheet(request)} disabled={Boolean(mutation)}>Approve</Button><Button size="sm" variant="ghost" className="text-black/60 hover:bg-black/5 hover:text-black" onClick={() => setConfirmState({ kind: 'dismiss', request })} disabled={Boolean(mutation)}>Dismiss</Button></div></TableCell></TableRow>)}</TableBody></Table>}
            </div>
          </section>

          <section aria-labelledby="approvals-heading" className="mt-12">
            <SectionHeading id="approvals-heading" title="Manual approvals" description="Direct approvals that do not come from the roster." action={<Button className="bg-[#f26622] text-black hover:bg-[#dc5719]" onClick={() => openApprovalSheet()} disabled={Boolean(mutation)}><Plus className="mr-2 h-4 w-4" /> Add approval</Button>} />
            <div className="overflow-x-auto border border-black/15 bg-[#faf8f2]"><Table><TableHeader><TableRow className="border-black/15 hover:bg-transparent"><TableHead className="pl-6 text-black/50">Name or email</TableHead><TableHead className="text-black/50">Email</TableHead><TableHead className="text-black/50">Reason</TableHead><TableHead className="text-black/50">Approved</TableHead><TableHead className="text-right text-black/50"><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader><TableBody>{!snapshot ? <TableRow><TableCell colSpan={5}><Skeleton className="h-12 w-full" /></TableCell></TableRow> : snapshot.approvals.length === 0 ? <TableRow><TableCell colSpan={5} className="h-32 text-center text-sm text-black/55">No manual approvals.</TableCell></TableRow> : snapshot.approvals.map((approval) => <TableRow key={approval.id} className="border-black/10 hover:bg-[#f1ede3]"><TableCell className="pl-6 font-semibold">{approval.displayName || approval.email}</TableCell><TableCell>{approval.email}</TableCell><TableCell className="max-w-sm whitespace-normal text-sm text-black/60">{approval.reason}</TableCell><TableCell title={absoluteTime(approval.approvedAt)} className="whitespace-nowrap text-sm text-black/60">{relativeTime(approval.approvedAt)}</TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => setConfirmState({ kind: 'revoke-approval', approval })} disabled={Boolean(mutation)}>Revoke</Button></TableCell></TableRow>)}</TableBody></Table></div>
          </section>

          <section aria-labelledby="people-heading" className="mt-12">
            <SectionHeading id="people-heading" title="People" description="Everyone who has interacted with the AI toolkit." />
            <div className="mb-5 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Label htmlFor="people-search" className="sr-only">Search people</Label><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" /><Input id="people-search" value={peopleSearch} onChange={(event) => setPeopleSearch(event.target.value)} placeholder="Search people" className={`${inputClass} pl-9`} /></div><div className="sm:w-48"><Label htmlFor="people-filter" className="sr-only">Filter people</Label><Select value={peopleFilter} onValueChange={(value) => setPeopleFilter(value as MemberFilter)}><SelectTrigger id="people-filter" className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="revoked">Revoked</SelectItem><SelectItem value="claude">Claude</SelectItem><SelectItem value="codex">Codex</SelectItem></SelectContent></Select></div></div>
            <div className="overflow-x-auto border border-black/15 bg-[#faf8f2]">{!snapshot ? <div className="space-y-3 p-6">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)}</div> : visibleMembers.length === 0 ? <div className="grid min-h-40 place-items-center p-6 text-sm text-black/55">No people match this view.</div> : <Table><TableHeader><TableRow className="border-black/15 hover:bg-transparent"><TableHead className="pl-6 text-black/50">Person</TableHead><TableHead className="text-black/50">Source</TableHead><TableHead className="text-black/50">Platform</TableHead><TableHead className="text-black/50">Last visit</TableHead><TableHead className="text-black/50">Day 1 / Day 2 furthest reached</TableHead><TableHead className="text-black/50">Files requested</TableHead><TableHead className="text-black/50">Access</TableHead></TableRow></TableHeader><TableBody>{visibleMembers.map((member) => <TableRow key={member.id} className="border-black/10 align-top hover:bg-[#f1ede3]"><TableCell className="pl-6"><div className="font-semibold">{memberDisplayName(member)}</div><div className="mt-1 text-sm text-black/50">{member.email}</div>{member.state === 'active' && member.eligibleNow === false && <div className="mt-2 max-w-xs text-xs text-amber-800">No longer eligible · refused on next visit</div>}{member.state === 'revoked' && <div className="mt-2 max-w-xs text-xs text-red-800">Revoked {member.revokedAt ? relativeTime(member.revokedAt) : ''}{member.revokeReason ? ` · ${member.revokeReason}` : ''}</div>}</TableCell><TableCell className="whitespace-nowrap text-sm">{sourceLabel(member.source)}</TableCell><TableCell className="whitespace-nowrap text-sm">{platformLabel(member.platform)}</TableCell><TableCell title={absoluteTime(member.lastSeenAt)} className="whitespace-nowrap text-sm text-black/60">{relativeTime(member.lastSeenAt)}<div className="mt-1 text-xs text-black/45">{member.visitCount} {member.visitCount === 1 ? 'visit' : 'visits'}</div></TableCell><TableCell className="whitespace-nowrap text-xs text-black/60"><div>{dayProgressLabel(member.progress, 1)}</div><div className="mt-1">{dayProgressLabel(member.progress, 2)}</div></TableCell><TableCell className="whitespace-nowrap text-sm"><span aria-label={filesRequestedLabel(member.downloadCount)}>{filesRequestedLabel(member.downloadCount)}</span></TableCell><TableCell className="whitespace-nowrap">{member.state === 'active' ? <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => { setConfirmReason(''); setConfirmState({ kind: 'member', member, state: 'revoked' }); }} disabled={Boolean(mutation)}>Revoke</Button> : <><StateBadge state="revoked" /><Button variant="ghost" size="sm" className="mt-2 block text-emerald-800 hover:bg-emerald-50" onClick={() => setConfirmState({ kind: 'member', member, state: 'active' })} disabled={Boolean(mutation)}>Restore</Button></>}</TableCell></TableRow>)}</TableBody></Table>}</div>
          </section>

          <section aria-labelledby="files-heading" className="mt-12">
            <SectionHeading id="files-heading" title="Files" description="The exact private assets that the portal can serve." action={<div className="flex flex-wrap gap-3"><Button variant="outline" className="border-black/20 bg-transparent" onClick={() => void loadAssets()} disabled={assetLoading || Boolean(mutation)}><RefreshCw className={`mr-2 h-4 w-4 ${assetLoading ? 'animate-spin' : ''}`} /> Check files</Button><label htmlFor="asset-upload" className={`inline-flex cursor-pointer items-center justify-center rounded-md bg-[#f26622] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#dc5719] ${uploading ? 'pointer-events-none opacity-50' : ''}`}><Upload className="mr-2 h-4 w-4" /> Upload files</label><input id="asset-upload" type="file" multiple className="sr-only" onChange={handleUpload} disabled={uploading} /></div>} />
            <p className="mb-5 border-l-4 border-[#f26622] bg-[#faf8f2] px-4 py-3 text-sm leading-6 text-black/65">Upload the nine files from ~/formula-ai-portal-content/dist/private. Files are matched by their exact contents; anything else is refused.</p>
            {uploadProgress && <p className="mb-4 text-sm font-semibold text-black/65" aria-live="polite">Uploading {uploadProgress.current} of {uploadProgress.total}…</p>}
            {uploadResults.length > 0 && <div className="mb-5 space-y-2 border border-black/15 bg-[#faf8f2] p-4" aria-live="polite">{uploadResults.map((result, index) => <div key={`${result.fileName}-${index}`} className="flex flex-wrap items-center gap-2 text-sm"><span className="font-semibold">{result.fileName}</span>{result.ok ? <span className="text-emerald-800"><CircleCheck className="mr-1 inline h-4 w-4" /> Uploaded as {result.assetId}</span> : <span className="text-red-800"><CircleAlert className="mr-1 inline h-4 w-4" /> {result.error}</span>}</div>)}</div>}
            <div className="overflow-x-auto border border-black/15 bg-[#faf8f2]">{assetLoading && !assetStatus ? <div className="space-y-3 p-6"><p className="text-sm font-semibold text-black/60">Checking…</p>{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div> : assetError && !assetStatus ? <div className="p-6 text-sm text-red-800">{assetError}</div> : <Table><TableHeader><TableRow className="border-black/15 hover:bg-transparent"><TableHead className="pl-6 text-black/50">ID</TableHead><TableHead className="text-black/50">Storage path</TableHead><TableHead className="text-black/50">State</TableHead></TableRow></TableHeader><TableBody>{(assetStatus?.assets ?? []).map((asset) => <TableRow key={asset.id} className="border-black/10 hover:bg-[#f1ede3]"><TableCell className="pl-6 font-mono text-xs">{asset.id}</TableCell><TableCell className="font-mono text-xs text-black/60">{asset.storagePath}</TableCell><TableCell><StateBadge state={asset.state} /></TableCell></TableRow>)}</TableBody></Table>}</div>
          </section>
        </section>
      </main>

      <Sheet open={approvalSheetOpen} onOpenChange={(open) => { if (!open && mutation !== 'approve') setApprovalSheetOpen(false); }}>
        <SheetContent className={sheetClass}>
          <SheetHeader className="pr-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c45120]">Manual access</p><SheetTitle className="text-3xl tracking-[-0.04em] text-[#181816]">Add an approval</SheetTitle><SheetDescription className="leading-6 text-black/60">Use the exact email they will use to request their sign-in code. The reason stays with the approval record.</SheetDescription></SheetHeader>
          <form className="mt-8 space-y-6" onSubmit={submitApproval}><div className="space-y-2"><Label htmlFor="approval-email">Email address</Label><Input id="approval-email" type="email" autoComplete="email" value={approvalForm.email} onChange={(event) => setApprovalForm((current) => ({ ...current, email: event.target.value }))} className={inputClass} required /></div><div className="space-y-2"><Label htmlFor="approval-name">Name (optional)</Label><Input id="approval-name" autoComplete="name" value={approvalForm.name} onChange={(event) => setApprovalForm((current) => ({ ...current, name: event.target.value }))} className={inputClass} /></div><div className="space-y-2"><Label htmlFor="approval-reason">Reason</Label><Textarea id="approval-reason" value={approvalForm.reason} onChange={(event) => setApprovalForm((current) => ({ ...current, reason: event.target.value }))} className={inputClass} required /></div><div className="flex justify-end gap-3 border-t border-black/10 pt-6"><Button type="button" variant="ghost" onClick={() => setApprovalSheetOpen(false)} disabled={mutation === 'approve'}>Cancel</Button><Button type="submit" className="bg-[#f26622] text-black hover:bg-[#dc5719]" disabled={mutation === 'approve'}>{mutation === 'approve' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save approval</Button></div></form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={Boolean(confirmState)} onOpenChange={(open) => { if (!open && !mutation) { setConfirmState(null); setConfirmReason(''); } }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{confirmTitle}</AlertDialogTitle><AlertDialogDescription>{confirmDescription}</AlertDialogDescription></AlertDialogHeader>{confirmState?.kind === 'member' && confirmState.state === 'revoked' && <div className="space-y-2"><Label htmlFor="revoke-reason">Reason (optional)</Label><Textarea id="revoke-reason" value={confirmReason} onChange={(event) => setConfirmReason(event.target.value)} placeholder="Why is access being revoked?" className={inputClass} disabled={Boolean(mutation)} /></div>}<AlertDialogFooter><AlertDialogCancel disabled={Boolean(mutation)}>Cancel</AlertDialogCancel><AlertDialogAction className={confirmState?.kind === 'member' && confirmState.state === 'active' ? 'bg-emerald-700 text-white hover:bg-emerald-800' : confirmState?.kind === 'sign-in' && confirmState.open ? 'bg-[#f26622] text-black hover:bg-[#dc5719]' : 'bg-red-700 text-white hover:bg-red-800'} disabled={mutation === confirmKey} onClick={(event) => { event.preventDefault(); void confirmAction(); }}>{mutation === confirmKey && <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />}{confirmState?.kind === 'sign-in' ? confirmState.open ? 'Open sign-in' : 'Close sign-in' : confirmState?.kind === 'dismiss' ? 'Dismiss request' : confirmState?.kind === 'revoke-approval' ? 'Revoke approval' : confirmState?.state === 'revoked' ? 'Revoke access' : 'Restore access'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminAIPortal;
