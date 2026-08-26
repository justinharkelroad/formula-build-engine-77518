import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  ChevronLeft,
  CircleAlert,
  Ellipsis,
  Link2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  TicketCheck,
  UserRoundPlus,
  UsersRound,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type SeatType = 'agencyOwner' | 'team';
type SourceMode = 'manual' | 'purchase' | 'edit';
type AccessAction = 'activate' | 'suspend' | 'revoke';

interface RosterSummary {
  purchasedSeats: number;
  assignedPurchaseSeats: number;
  unassignedPurchaseSeats: number;
  activeRoster: number;
  linkedAccounts: number;
  manualAttendees: number;
}

interface RosterAttendee {
  id: string;
  name: string;
  email: string;
  seatType: SeatType;
  eventRole: string;
  registrationState: string;
  claimState: string;
  accessState: string;
  agencyId: string | null;
  agencyName: string | null;
  agencyKind: string | null;
  sourceType: 'purchase' | 'manual' | 'partner_profile' | 'legacy_registration';
  sourceId: string;
  sourceOrdinal: number;
  identityLinked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RosterPurchase {
  id: string;
  name: string | null;
  email: string;
  quantity: number;
  passType: string;
  tier: string;
  assignedOrdinals: number[];
  unassignedCount: number;
  createdAt: string;
}

interface RosterAgency {
  id: string;
  displayName: string;
  kind: string;
  attendeeCount: number;
}

interface RosterSnapshot {
  summary: RosterSummary;
  attendees: RosterAttendee[];
  purchases: RosterPurchase[];
  agencies: RosterAgency[];
}

interface AttendeeFormState {
  registrationId: string | null;
  name: string;
  email: string;
  seatType: SeatType;
  purchaseSeat: string;
  agencyChoice: string;
  newAgencyName: string;
}

const emptyForm = (): AttendeeFormState => ({
  registrationId: null,
  name: '',
  email: '',
  seatType: 'team',
  purchaseSeat: '',
  agencyChoice: 'automatic',
  newAgencyName: '',
});

const ERROR_MESSAGES: Record<string, string> = {
  formula_purchase_seat_already_assigned: 'That purchased seat has already been assigned.',
  formula_attendee_email_already_registered: 'That email already has a Formula 2026 registration.',
  formula_attendee_email_in_use: 'That email belongs to another Formula member.',
  formula_purchase_seat_type_mismatch: 'The attendee role must match the purchased ticket type.',
  formula_purchase_not_assignable: 'That purchase cannot be assigned as an attendee ticket.',
  formula_purchase_seat_ordinal_invalid: 'That seat is not available on the selected purchase.',
  formula_attendee_registration_revoked: 'Revoked registrations cannot be edited or reactivated.',
};

async function displayError(value: unknown): Promise<string> {
  if (value && typeof value === 'object' && 'context' in value && value.context instanceof Response) {
    try {
      const body = await value.context.clone().json() as { error?: string };
      if (body.error) return ERROR_MESSAGES[body.error] ?? 'We could not save that attendee. Check the details and try again.';
    } catch {
      // Fall through to the standard function-error message.
    }
  }
  if (value && typeof value === 'object' && 'message' in value && typeof value.message === 'string') {
    const code = value.message.match(/formula_[a-z0-9_]+/)?.[0];
    if (code) return ERROR_MESSAGES[code] ?? 'We could not save that attendee. Check the details and try again.';
  }
  return 'We could not save that attendee. Check the details and try again.';
}

function seatLabel(seatType: string): string {
  return seatType === 'agencyOwner' ? 'Agency owner' : 'Team member';
}

function sourceLabel(attendee: RosterAttendee): string {
  if (attendee.sourceType === 'purchase') return `Purchased seat ${attendee.sourceOrdinal}`;
  if (attendee.sourceType === 'manual') return 'Added manually';
  return 'Imported registration';
}

function statusTone(attendee: RosterAttendee): string {
  if (attendee.registrationState === 'revoked') return 'bg-red-100 text-red-800';
  if (attendee.registrationState === 'suspended') return 'bg-amber-100 text-amber-900';
  if (attendee.identityLinked && attendee.accessState === 'active') return 'bg-emerald-100 text-emerald-800';
  return 'bg-stone-200 text-stone-700';
}

function statusLabel(attendee: RosterAttendee): string {
  if (attendee.registrationState === 'revoked') return 'Revoked';
  if (attendee.registrationState === 'suspended') return 'Suspended';
  if (attendee.identityLinked && attendee.accessState === 'active') return 'Connected';
  return 'Waiting for app sign-in';
}

const AdminFormulaAttendees = () => {
  const [snapshot, setSnapshot] = useState<RosterSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('active');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sourceMode, setSourceMode] = useState<SourceMode>('manual');
  const [form, setForm] = useState<AttendeeFormState>(emptyForm);
  const [revokeTarget, setRevokeTarget] = useState<RosterAttendee | null>(null);
  const [busyRegistrationId, setBusyRegistrationId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadRoster = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('formula-admin-attendees', {
        body: { action: 'snapshot' },
      });
      if (error) throw error;
      setSnapshot(data as RosterSnapshot);
    } catch (error) {
      toast({
        title: 'Roster unavailable',
        description: 'We could not load Formula attendee access. Try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  const availableSeats = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.purchases
      .filter((purchase) => purchase.passType === 'agencyOwner' || purchase.passType === 'team')
      .flatMap((purchase) => {
      const assigned = new Set(purchase.assignedOrdinals);
      return Array.from({ length: Math.max(purchase.quantity, 0) }, (_, index) => index + 1)
        .filter((ordinal) => !assigned.has(ordinal))
        .map((ordinal) => ({ purchase, ordinal, value: `${purchase.id}:${ordinal}` }));
      });
  }, [snapshot]);

  const filteredAttendees = useMemo(() => {
    if (!snapshot) return [];
    const query = search.trim().toLowerCase();
    return snapshot.attendees.filter((attendee) => {
      const matchesSearch = !query || [attendee.name, attendee.email, attendee.agencyName ?? '']
        .some((value) => value.toLowerCase().includes(query));
      const matchesFilter = filter === 'all'
        || (filter === 'active' && attendee.registrationState !== 'revoked')
        || (filter === 'unlinked' && !attendee.identityLinked && attendee.registrationState !== 'revoked')
        || (filter === 'manual' && attendee.sourceType === 'manual')
        || (filter === 'suspended' && attendee.registrationState === 'suspended')
        || (filter === 'revoked' && attendee.registrationState === 'revoked');
      return matchesSearch && matchesFilter;
    });
  }, [filter, search, snapshot]);

  const openCreate = (mode: 'manual' | 'purchase') => {
    setSourceMode(mode);
    setForm(emptyForm());
    setSheetOpen(true);
  };

  const openEdit = (attendee: RosterAttendee) => {
    setSourceMode('edit');
    setForm({
      registrationId: attendee.id,
      name: attendee.name,
      email: attendee.email,
      seatType: attendee.seatType,
      purchaseSeat: '',
      agencyChoice: attendee.agencyId ?? 'automatic',
      newAgencyName: '',
    });
    setSheetOpen(true);
  };

  const selectPurchaseSeat = (value: string) => {
    const seat = availableSeats.find((candidate) => candidate.value === value);
    setForm((current) => ({
      ...current,
      purchaseSeat: value,
      name: current.name || seat?.purchase.name || '',
      email: current.email || seat?.purchase.email || '',
      seatType: seat?.purchase.passType === 'agencyOwner' ? 'agencyOwner' : 'team',
    }));
  };

  const submitAttendee = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: 'Name and email are required', variant: 'destructive' });
      return;
    }
    const selectedSeat = sourceMode === 'purchase'
      ? availableSeats.find((candidate) => candidate.value === form.purchaseSeat)
      : null;
    if (sourceMode === 'purchase' && !selectedSeat) {
      toast({ title: 'Choose a purchased seat first', variant: 'destructive' });
      return;
    }
    if (form.agencyChoice === 'new' && !form.newAgencyName.trim()) {
      toast({ title: 'Enter the agency name', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const agencyId = form.agencyChoice !== 'automatic' && form.agencyChoice !== 'new'
        ? form.agencyChoice
        : null;
      const { data, error } = await supabase.functions.invoke('formula-admin-attendees', {
        body: {
          action: 'upsert',
          registrationId: form.registrationId,
          name: form.name.trim(),
          email: form.email.trim(),
          seatType: form.seatType,
          purchaseId: selectedSeat?.purchase.id ?? null,
          sourceOrdinal: selectedSeat?.ordinal ?? null,
          agencyId,
          agencyDisplayName: form.agencyChoice === 'new' ? form.newAgencyName.trim() : null,
        },
      });
      if (error) throw error;
      setSheetOpen(false);
      await loadRoster(true);
      toast({
        title: sourceMode === 'edit' ? 'Attendee updated' : sourceMode === 'purchase' ? 'Purchased seat assigned' : 'Attendee added',
        description: data?.identityLinked
          ? 'Their existing app account is connected and access is syncing.'
          : 'They will connect automatically when they sign in with this email.',
      });
    } catch (error) {
      toast({ title: 'Attendee not saved', description: await displayError(error), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const changeAccess = async (attendee: RosterAttendee, accessAction: AccessAction) => {
    setBusyRegistrationId(attendee.id);
    try {
      const { error } = await supabase.functions.invoke('formula-admin-attendees', {
        body: { action: 'set-access', registrationId: attendee.id, accessAction },
      });
      if (error) throw error;
      setRevokeTarget(null);
      await loadRoster(true);
      toast({
        title: accessAction === 'activate' ? 'Access activated' : accessAction === 'suspend' ? 'Access suspended' : 'Access revoked',
      });
    } catch (error) {
      toast({ title: 'Access not changed', description: await displayError(error), variant: 'destructive' });
    } finally {
      setBusyRegistrationId(null);
    }
  };

  const summary = snapshot?.summary;

  return (
    <>
      <SEO
        title="Formula 2026 attendee access | Admin"
        description="Assign purchased seats and manage Formula attendee workspace access"
        noindex={true}
      />
      <Navigation />
      <main className="min-h-screen bg-[#f3f0e9] pt-24 text-[#181816]">
        <section className="mx-auto max-w-[1480px] px-4 pb-20 sm:px-7 lg:px-10">
          <header className="border-b border-black/15 pb-8 pt-8 lg:flex lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-4xl">
              <Link to="/admin/sales" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-black/60 transition hover:text-black">
                <ChevronLeft className="h-4 w-4" /> Sales dashboard
              </Link>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#c45120]">Formula 2026 · attendee access</p>
              <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Every seat, assigned to a person.
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-black/60 sm:text-lg">
                Assign historical purchases, add approved guests, and see who has connected their existing Formula app account. No verification email is required.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3 lg:mt-0 lg:justify-end">
              <Button variant="outline" className="border-black/20 bg-transparent" onClick={() => loadRoster()} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button variant="outline" className="border-black/20 bg-transparent" onClick={() => openCreate('purchase')}>
                <TicketCheck className="mr-2 h-4 w-4" /> Assign past seat
              </Button>
              <Button className="bg-[#f26622] text-black hover:bg-[#dc5719]" onClick={() => openCreate('manual')}>
                <UserRoundPlus className="mr-2 h-4 w-4" /> Add attendee
              </Button>
            </div>
          </header>

          {loading ? (
            <div className="grid gap-px border-b border-black/15 bg-black/15 md:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-[#f3f0e9] p-6"><Skeleton className="h-16 w-full" /></div>
              ))}
            </div>
          ) : (
            <div className="grid gap-px border-b border-black/15 bg-black/15 md:grid-cols-3 lg:grid-cols-6">
              {[
                ['Purchased seats', summary?.purchasedSeats ?? 0],
                ['Assigned purchases', summary?.assignedPurchaseSeats ?? 0],
                ['Still unassigned', summary?.unassignedPurchaseSeats ?? 0],
                ['Active roster', summary?.activeRoster ?? 0],
                ['App accounts linked', summary?.linkedAccounts ?? 0],
                ['Added manually', summary?.manualAttendees ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="bg-[#f3f0e9] px-5 py-6">
                  <div className="font-mono text-3xl font-semibold tabular-nums tracking-tight">{value}</div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/50">{label}</div>
                </div>
              ))}
            </div>
          )}

          <section className="pt-10" aria-labelledby="roster-heading">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 id="roster-heading" className="text-2xl font-bold tracking-[-0.03em]">Attendee roster</h2>
                <p className="mt-1 text-sm text-black/55">Website access follows the email assigned here.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-[260px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, email, or agency"
                    className="border-black/20 bg-white/60 pl-9"
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full border-black/20 bg-white/60 sm:w-[190px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Current roster</SelectItem>
                    <SelectItem value="unlinked">Waiting for app sign-in</SelectItem>
                    <SelectItem value="manual">Added manually</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                    <SelectItem value="all">All records</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-hidden border border-black/15 bg-[#faf8f2]">
              {loading ? (
                <div className="space-y-3 p-6">
                  {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-14 w-full" />)}
                </div>
              ) : filteredAttendees.length === 0 ? (
                <div className="grid min-h-[300px] place-items-center px-6 text-center">
                  <div className="max-w-md">
                    <UsersRound className="mx-auto h-8 w-8 text-[#f26622]" />
                    <h3 className="mt-4 text-xl font-semibold">No attendees match this view</h3>
                    <p className="mt-2 text-sm leading-6 text-black/55">Clear the search, change the filter, or assign the first attendee.</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-black/15 hover:bg-transparent">
                      <TableHead className="pl-6 text-black/50">Attendee</TableHead>
                      <TableHead className="text-black/50">Role and agency</TableHead>
                      <TableHead className="text-black/50">Source</TableHead>
                      <TableHead className="text-black/50">Access</TableHead>
                      <TableHead className="w-16"><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendees.map((attendee) => (
                      <TableRow key={attendee.id} className="border-black/10 hover:bg-[#f1ede3]">
                        <TableCell className="pl-6">
                          <div className="font-semibold">{attendee.name}</div>
                          <div className="mt-1 text-sm text-black/50">{attendee.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{seatLabel(attendee.seatType)}</div>
                          <div className="mt-1 text-sm text-black/50">{attendee.agencyName ?? 'Individual workspace'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{sourceLabel(attendee)}</div>
                          <div className="mt-1 text-xs text-black/45">Added {new Date(attendee.createdAt).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-semibold ${statusTone(attendee)}`}>
                            {attendee.identityLinked && attendee.registrationState !== 'suspended' && attendee.registrationState !== 'revoked'
                              ? <Check className="h-3 w-3" />
                              : <CircleAlert className="h-3 w-3" />}
                            {statusLabel(attendee)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={busyRegistrationId === attendee.id}>
                                {busyRegistrationId === attendee.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ellipsis className="h-4 w-4" />}
                                <span className="sr-only">Manage {attendee.name}</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onSelect={() => openEdit(attendee)} disabled={attendee.registrationState === 'revoked'}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit attendee
                              </DropdownMenuItem>
                              {attendee.registrationState === 'suspended' ? (
                                <DropdownMenuItem onSelect={() => changeAccess(attendee, 'activate')}>
                                  <Link2 className="mr-2 h-4 w-4" /> Restore access
                                </DropdownMenuItem>
                              ) : attendee.registrationState !== 'revoked' ? (
                                <DropdownMenuItem onSelect={() => changeAccess(attendee, 'suspend')}>
                                  <CircleAlert className="mr-2 h-4 w-4" /> Suspend access
                                </DropdownMenuItem>
                              ) : null}
                              {attendee.registrationState !== 'revoked' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-700 focus:text-red-700" onSelect={() => setRevokeTarget(attendee)}>
                                    Revoke permanently
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </section>
        </section>
      </main>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full overflow-y-auto border-black/15 bg-[#f8f5ee] sm:max-w-xl">
          <SheetHeader className="pr-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c45120]">
              {sourceMode === 'edit' ? 'Edit roster' : sourceMode === 'purchase' ? 'Historical purchase' : 'Manual access'}
            </p>
            <SheetTitle className="text-3xl tracking-[-0.04em]">
              {sourceMode === 'edit' ? 'Update attendee' : sourceMode === 'purchase' ? 'Assign a purchased seat' : 'Add an approved attendee'}
            </SheetTitle>
            <SheetDescription className="max-w-md leading-6">
              {sourceMode === 'purchase'
                ? 'Choose an unassigned seat, then enter the person who will use it.'
                : 'Use the exact email they use in the Formula app. Access connects without a verification email.'}
            </SheetDescription>
          </SheetHeader>

          <form className="mt-8 space-y-6" onSubmit={submitAttendee}>
            {sourceMode === 'purchase' && (
              <div className="space-y-2">
                <Label htmlFor="purchase-seat">Unassigned purchased seat</Label>
                <Select value={form.purchaseSeat} onValueChange={selectPurchaseSeat}>
                  <SelectTrigger id="purchase-seat" className="border-black/20 bg-white">
                    <SelectValue placeholder="Choose a purchase and seat" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSeats.length === 0 ? (
                      <SelectItem value="none" disabled>No unassigned purchased seats</SelectItem>
                    ) : availableSeats.map(({ purchase, ordinal, value }) => (
                      <SelectItem key={value} value={value}>
                        {purchase.name || purchase.email} · seat {ordinal} of {purchase.quantity} · {seatLabel(purchase.passType)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="attendee-name">Full name</Label>
                <Input
                  id="attendee-name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="border-black/20 bg-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendee-email">Formula app email</Label>
                <Input
                  id="attendee-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="border-black/20 bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendee-role">Ticket role</Label>
              <Select
                value={form.seatType}
                onValueChange={(value: SeatType) => setForm((current) => ({ ...current, seatType: value }))}
                disabled={sourceMode === 'purchase'}
              >
                <SelectTrigger id="attendee-role" className="border-black/20 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agencyOwner">Agency owner</SelectItem>
                  <SelectItem value="team">Team member</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs leading-5 text-black/50">Agency owners can publish the shared business-session plans.</p>
            </div>

            <div className="space-y-2 border-t border-black/10 pt-6">
              <Label htmlFor="attendee-agency">Agency workspace</Label>
              <Select
                value={form.agencyChoice}
                onValueChange={(value) => setForm((current) => ({ ...current, agencyChoice: value }))}
              >
                <SelectTrigger id="attendee-agency" className="border-black/20 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Individual workspace</SelectItem>
                  <SelectItem value="new">Create or match by agency name</SelectItem>
                  {(snapshot?.agencies ?? [])
                    .filter((agency) => agency.kind === 'standard' || agency.attendeeCount > 1 || agency.id === form.agencyChoice)
                    .map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.displayName} · {agency.attendeeCount} attendee{agency.attendeeCount === 1 ? '' : 's'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {form.agencyChoice === 'new' && (
                <Input
                  aria-label="New agency name"
                  placeholder="Agency name"
                  value={form.newAgencyName}
                  onChange={(event) => setForm((current) => ({ ...current, newAgencyName: event.target.value }))}
                  className="mt-3 border-black/20 bg-white"
                />
              )}
            </div>

            <div className="flex items-start gap-3 border border-black/10 bg-white/60 p-4 text-sm leading-6 text-black/60">
              <Link2 className="mt-1 h-4 w-4 shrink-0 text-[#c45120]" />
              <p>If this email already has a Formula app account, it connects immediately. Otherwise it connects the first time the person signs in with that email.</p>
            </div>

            <div className="flex justify-end gap-3 border-t border-black/10 pt-6">
              <Button type="button" variant="ghost" onClick={() => setSheetOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="min-w-36 bg-[#f26622] text-black hover:bg-[#dc5719]">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                {sourceMode === 'edit' ? 'Save changes' : sourceMode === 'purchase' ? 'Assign seat' : 'Add attendee'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={Boolean(revokeTarget)} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this attendee permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              {revokeTarget?.name} will immediately lose Formula 2026 capture and workspace access. Revoked access cannot be restored from this screen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep access</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-700 text-white hover:bg-red-800"
              onClick={() => revokeTarget && changeAccess(revokeTarget, 'revoke')}
            >
              Revoke access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminFormulaAttendees;
