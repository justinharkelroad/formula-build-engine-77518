import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, RefreshCw, LogOut, AlertTriangle, CheckCircle, Clock, ExternalLink, Mail, Copy, Loader2, Search, X } from 'lucide-react';
import { CONFIG } from '@/config/event';
import { PARTNER_TIERS } from '@/config/partners';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Purchase {
  id: string;
  email: string;
  name: string | null;
  stripe_session_id: string;
  stripe_payment_link_id: string | null;
  amount: number;
  currency: string;
  pass_type: string;
  tier: string;
  quantity: number;
  created_at: string;
}

interface PartnerProfile {
  id: string;
  tier: string;
  stripe_session_id: string | null;
  purchase_email: string | null;
  purchase_name: string | null;
  company_name: string | null;
  company_bio: string | null;
  website_url: string | null;
  logo_url: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  marketing_contact_name: string | null;
  marketing_contact_email: string | null;
  attendees: any;
  social_linkedin: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface EmailDelivery {
  id: string;
  stripe_session_id: string;
  email_type: 'attendee_confirmation' | 'partner_welcome';
  recipient_email: string;
  status: string;
  attempt_count: number;
  last_error: string | null;
  updated_at: string;
}

interface ReprocessPurchasesResult {
  message?: string;
  fixed?: number;
  failed?: number;
}

const SEAT_CAP = CONFIG.SEAT_CAP;

// Passes included with each partner tier. These people occupy seats in the room
// even though they never buy an attendee ticket, so they count against SEAT_CAP.
const PARTNER_SEATS_BY_TIER: Record<string, number> = {
  platinum: PARTNER_TIERS.platinum.passes,
  gold: PARTNER_TIERS.gold.passes,
  silver: PARTNER_TIERS.silver.passes,
  bronze: PARTNER_TIERS.bronze.passes,
};

const AdminSales = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [partnerProfiles, setPartnerProfiles] = useState<PartnerProfile[]>([]);
  const [emailDeliveries, setEmailDeliveries] = useState<EmailDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [passTypeFilter, setPassTypeFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [partnerTierFilter, setPartnerTierFilter] = useState('all');
  const { toast } = useToast();
  const { signOut, user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [purchasesRes, partnersRes, deliveriesRes] = await Promise.all([
        supabase.from('purchases').select('*').order('created_at', { ascending: false }),
        supabase.from('partner_profiles' as any).select('*').order('created_at', { ascending: false }),
        supabase.from('purchase_email_deliveries').select('*').order('updated_at', { ascending: false }),
      ]);

      if (purchasesRes.error) throw purchasesRes.error;
      if (partnersRes.error) throw partnersRes.error;
      if (deliveriesRes.error) throw deliveriesRes.error;
      setPurchases(purchasesRes.data || []);
      setPartnerProfiles((partnersRes.data || []) as unknown as PartnerProfile[]);
      setEmailDeliveries((deliveriesRes.data || []) as unknown as EmailDelivery[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Revenue calculations
  const attendeePurchases = purchases.filter(p => p.pass_type !== 'partner');
  const partnerPurchases = purchases.filter(p => p.pass_type === 'partner');

  const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
  const attendeeRevenue = attendeePurchases.reduce((sum, p) => sum + p.amount, 0);
  const partnerRevenue = partnerPurchases.reduce((sum, p) => sum + p.amount, 0);

  const totalQuantity = attendeePurchases.reduce((sum, p) => sum + p.quantity, 0);
  const agencyOwnerCount = purchases.filter(p => p.pass_type === 'agencyOwner').reduce((sum, p) => sum + p.quantity, 0);
  const teamCount = purchases.filter(p => p.pass_type === 'team').reduce((sum, p) => sum + p.quantity, 0);
  const unknownCount = purchases.filter(p => p.pass_type === 'unknown').length;

  // Partner passes occupy seats but are never sold as attendee tickets, so they
  // have to be subtracted from the cap too. Otherwise the room reads emptier
  // than it is. Unrecognised tiers contribute 0 rather than silently guessing.
  const partnerSeats = partnerPurchases.reduce(
    (sum, p) => sum + (PARTNER_SEATS_BY_TIER[p.tier] ?? 0) * p.quantity,
    0,
  );
  const seatsUsed = totalQuantity + partnerSeats;
  const remainingSeats = SEAT_CAP - seatsUsed;
  const capacityPct = SEAT_CAP > 0 ? Math.min(100, Math.round((seatsUsed / SEAT_CAP) * 100)) : 0;

  // Partner tier breakdown
  const partnersByTier = {
    platinum: partnerPurchases.filter(p => p.tier === 'platinum').length,
    gold: partnerPurchases.filter(p => p.tier === 'gold').length,
    silver: partnerPurchases.filter(p => p.tier === 'silver').length,
    bronze: partnerPurchases.filter(p => p.tier === 'bronze').length,
  };

  const onboardedCount = partnerProfiles.filter(p => p.onboarding_completed).length;
  const deliveryByKey = useMemo(
    () => new Map(
      emailDeliveries.map(delivery => [
        `${delivery.stripe_session_id}:${delivery.email_type}`,
        delivery,
      ]),
    ),
    [emailDeliveries],
  );

  // --- Filtering -----------------------------------------------------------
  // Tier/pass-type options are derived from the data rather than hardcoded, so
  // a price map addition (a new tier) shows up here without a code change.
  const attendeeTiers = Array.from(new Set(attendeePurchases.map(p => p.tier))).sort();
  const attendeePassTypes = Array.from(new Set(attendeePurchases.map(p => p.pass_type))).sort();
  const partnerTiersPresent = Array.from(new Set(partnerPurchases.map(p => p.tier))).sort();

  const matchesSearch = (p: Purchase) => {
    const q = attendeeSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      p.email.toLowerCase().includes(q) ||
      (p.name?.toLowerCase().includes(q) ?? false)
    );
  };

  const filteredAttendees = attendeePurchases.filter(
    p =>
      matchesSearch(p) &&
      (passTypeFilter === 'all' || p.pass_type === passTypeFilter) &&
      (tierFilter === 'all' || p.tier === tierFilter),
  );

  const filteredPartnerPurchases = partnerPurchases.filter(
    p => partnerTierFilter === 'all' || p.tier === partnerTierFilter,
  );

  const attendeeFiltersActive =
    attendeeSearch.trim() !== '' || passTypeFilter !== 'all' || tierFilter !== 'all';

  const clearAttendeeFilters = () => {
    setAttendeeSearch('');
    setPassTypeFilter('all');
    setTierFilter('all');
  };

  // Revenue/seat totals for whatever subset is currently on screen.
  const filteredAttendeeRevenue = filteredAttendees.reduce((sum, p) => sum + p.amount, 0);
  const filteredAttendeeSeats = filteredAttendees.reduce((sum, p) => sum + p.quantity, 0);

  const identifyUnknownPurchases = async () => {
    setFixing(true);
    try {
      // Stripe line items are the source of truth for historical purchases.
      // The legacy partner RPC only creates missing partner profiles and cannot
      // classify attendee purchases, which left this counter unchanged.
      const { data, error } = await supabase.functions.invoke<ReprocessPurchasesResult>(
        'reprocess-purchases',
        { body: {} },
      );
      if (error) throw error;
      const purchasesFixed = data?.fixed ?? 0;
      const purchasesFailed = data?.failed ?? 0;
      toast({
        title: purchasesFixed > 0 ? "Purchases Identified" : "No Purchases Changed",
        description: purchasesFixed > 0
          ? `${purchasesFixed} purchase${purchasesFixed === 1 ? '' : 's'} identified from Stripe${purchasesFailed > 0 ? `; ${purchasesFailed} still need review` : ''}.`
          : purchasesFailed > 0
            ? `${purchasesFailed} purchase${purchasesFailed === 1 ? '' : 's'} could not be identified from Stripe and still need review.`
            : data?.message ?? 'There are no unknown purchases to identify.',
      });
      await fetchData();
    } catch (error) {
      console.error('Error identifying purchases:', error);
      toast({
        title: "Error",
        description: "Could not identify these purchases from Stripe. Try again or review the function logs.",
        variant: "destructive",
      });
    } finally {
      setFixing(false);
    }
  };

  const resendWelcomeEmail = async (profile: PartnerProfile) => {
    const email = profile.primary_contact_email || profile.purchase_email;
    if (!email || !profile.stripe_session_id) {
      toast({ title: "Error", description: "Missing email or session ID for this partner", variant: "destructive" });
      return;
    }
    setSendingEmailId(profile.id);
    try {
      const { error } = await supabase.functions.invoke('send-partner-welcome', {
        body: {
          email,
          name: profile.primary_contact_name || profile.purchase_name,
          tier: profile.tier,
          sessionId: profile.stripe_session_id,
        },
      });
      if (error) throw error;
      toast({ title: "Email Sent", description: `Partner welcome email sent to ${email}` });
      await fetchData();
    } catch (error) {
      console.error('Error sending partner email:', error);
      toast({ title: "Error", description: "Failed to send email. Make sure the send-partner-welcome function is deployed.", variant: "destructive" });
    } finally {
      setSendingEmailId(null);
    }
  };

  const resendAttendeeEmail = async (purchase: Purchase) => {
    setSendingEmailId(purchase.stripe_session_id);
    try {
      const { error } = await supabase.functions.invoke('process-email-deliveries', {
        body: {
          action: 'resend',
          stripeSessionId: purchase.stripe_session_id,
          emailType: 'attendee_confirmation',
          recipientEmail: purchase.email,
          recipientName: purchase.name,
          tier: purchase.tier,
        },
      });
      if (error) throw error;
      toast({
        title: "Email Sent",
        description: `Attendee confirmation sent to ${purchase.email}`,
      });
      await fetchData();
    } catch (error) {
      console.error('Error sending attendee confirmation:', error);
      toast({
        title: "Email Failed",
        description: "The confirmation was not sent. Check the delivery error and Edge Function logs.",
        variant: "destructive",
      });
    } finally {
      setSendingEmailId(null);
    }
  };

  const findDelivery = (
    stripeSessionId: string | null,
    emailType: EmailDelivery['email_type'],
  ) => deliveryByKey.get(`${stripeSessionId}:${emailType}`);

  const renderEmailStatus = (delivery?: EmailDelivery) => {
    if (!delivery) return <span className="text-xs text-muted-foreground">Not queued</span>;
    const successful = delivery.status === 'sent' || delivery.status === 'delivered';
    const pending = delivery.status === 'queued' || delivery.status === 'sending';
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
          successful
            ? 'bg-green-100 text-green-700'
            : pending
              ? 'bg-blue-100 text-blue-700'
              : 'bg-red-100 text-red-700'
        }`}
        title={delivery.last_error || `Last updated ${new Date(delivery.updated_at).toLocaleString()}`}
      >
        {delivery.status.replace(/_/g, ' ')}
      </span>
    );
  };

  const copyOnboardingLink = (profile: PartnerProfile) => {
    if (!profile.stripe_session_id) {
      toast({ title: "Error", description: "No session ID for this partner", variant: "destructive" });
      return;
    }
    const url = `https://theformulaforum.com/partner-welcome/${profile.tier}?session_id=${profile.stripe_session_id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Copied", description: "Onboarding link copied to clipboard" });
  };

  const formatPassType = (passType: string) => {
    switch (passType) {
      case 'agencyOwner': return 'Agency Owner';
      case 'team': return 'Team Member';
      case 'partner': return 'Partner';
      default: return passType;
    }
  };

  const formatTier = (tier: string) => {
    switch (tier) {
      case 'earlyBird': return 'Early Bird';
      case 'regular': return 'Regular';
      case 'vip': return 'VIP';
      case 'platinum': return 'Platinum';
      case 'gold': return 'Gold';
      case 'silver': return 'Silver';
      case 'bronze': return 'Bronze';
      default: return tier;
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ['Email', 'Name', 'Pass Type', 'Tier', 'Amount', 'Currency', 'Quantity', 'Date'],
      ...purchases.map(p => [
        p.email,
        `"${p.name || ''}"`,
        formatPassType(p.pass_type),
        formatTier(p.tier),
        (p.amount / 100).toFixed(2),
        p.currency.toUpperCase(),
        p.quantity.toString(),
        new Date(p.created_at).toLocaleDateString(),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportPartnerCSV = () => {
    const csvContent = [
      ['Company', 'Tier', 'Contact Name', 'Contact Email', 'Phone', 'Website', 'Onboarded', 'Date'],
      ...partnerProfiles.map(p => [
        `"${p.company_name || p.purchase_name || ''}"`,
        formatTier(p.tier),
        `"${p.primary_contact_name || p.purchase_name || ''}"`,
        p.primary_contact_email || p.purchase_email || '',
        p.primary_contact_phone || '',
        p.website_url || '',
        p.onboarding_completed ? 'Yes' : 'No',
        new Date(p.created_at).toLocaleDateString(),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partners-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <SEO
        title="Admin - Sales | Formula Forum 2026"
        description="View and manage ticket sales and partnerships"
        noindex={true}
      />
      <Navigation />

      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold">Sales Dashboard</h1>
              <p className="text-muted-foreground mt-2">Track Formula 2026 tickets & partnerships</p>
              {user && <p className="text-sm text-muted-foreground">Signed in as: {user.email}</p>}
              <Link to="/admin/registrations" className="text-sm text-primary hover:underline mt-1 inline-block">
                View pre-launch waitlist &rarr;
              </Link>
              <span className="mx-2 text-muted-foreground">&middot;</span>
              <Link to="/admin/formula-attendees" className="text-sm text-primary hover:underline mt-1 inline-block">
                Manage attendee access &rarr;
              </Link>
            </div>
            <div className="flex gap-2 flex-wrap">
              {unknownCount > 0 && (
                <Button
                  onClick={identifyUnknownPurchases}
                  disabled={fixing}
                  variant="destructive"
                  size="sm"
                >
                  <AlertTriangle className={`w-4 h-4 mr-2 ${fixing ? 'animate-spin' : ''}`} />
                  {fixing
                    ? 'Checking Stripe...'
                    : `Identify ${unknownCount} purchase${unknownCount === 1 ? '' : 's'}`}
                </Button>
              )}
              <Button
                onClick={fetchData}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Revenue Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(totalRevenue / 100).toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Attendee Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(attendeeRevenue / 100).toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Partner Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(partnerRevenue / 100).toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Partners Onboarded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{onboardedCount} / {partnerProfiles.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="attendees" className="space-y-4">
            <TabsList>
              <TabsTrigger value="attendees">Attendees ({attendeePurchases.length})</TabsTrigger>
              <TabsTrigger value="partners">Partners ({partnerPurchases.length})</TabsTrigger>
            </TabsList>

            {/* Attendees Tab */}
            <TabsContent value="attendees">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalQuantity}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Agency Owners</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{agencyOwnerCount}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teamCount}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Remaining Seats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{remainingSeats}</div>
                    <p className="text-xs text-muted-foreground mt-1">of {SEAT_CAP} total</p>
                  </CardContent>
                </Card>
              </div>

              {/* Room capacity includes attendee tickets plus partner passes.
                  Partner passes are invisible on the ticket counts above but
                  still occupy seats, so they get their own line here. */}
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Room Capacity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-end justify-between gap-4 flex-wrap">
                    <div>
                      <span className="text-3xl font-bold">{seatsUsed}</span>
                      <span className="text-muted-foreground text-lg"> / {SEAT_CAP} seats</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {capacityPct}% full &middot; {remainingSeats} open
                    </div>
                  </div>
                  <Progress value={capacityPct} className="h-2" />
                  <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                    <span>
                      <strong className="text-foreground">{totalQuantity}</strong> attendee tickets
                    </span>
                    <span>
                      <strong className="text-foreground">{partnerSeats}</strong> partner passes
                      {partnerPurchases.length > 0 && ` (${partnerPurchases.length} partners)`}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="space-y-4">
                  <div className="flex flex-row items-center justify-between gap-4">
                    <CardTitle>
                      Attendee Purchases
                      {attendeeFiltersActive && (
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          {filteredAttendees.length} of {attendeePurchases.length}
                        </span>
                      )}
                    </CardTitle>
                    <Button onClick={exportCSV} disabled={purchases.length === 0} size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export All CSV
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        value={attendeeSearch}
                        onChange={e => setAttendeeSearch(e.target.value)}
                        placeholder="Search name or email…"
                        className="pl-9"
                      />
                    </div>

                    <Select value={passTypeFilter} onValueChange={setPassTypeFilter}>
                      <SelectTrigger className="w-full sm:w-[170px]">
                        <SelectValue placeholder="Pass type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All pass types</SelectItem>
                        {attendeePassTypes.map(pt => (
                          <SelectItem key={pt} value={pt}>{formatPassType(pt)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={tierFilter} onValueChange={setTierFilter}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All tiers</SelectItem>
                        {attendeeTiers.map(t => (
                          <SelectItem key={t} value={t}>{formatTier(t)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {attendeeFiltersActive && (
                      <Button onClick={clearAttendeeFilters} variant="ghost" size="sm">
                        <X className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>

                  {attendeeFiltersActive && filteredAttendees.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Showing <strong className="text-foreground">{filteredAttendeeSeats}</strong> tickets
                      {' · '}
                      <strong className="text-foreground">
                        ${(filteredAttendeeRevenue / 100).toLocaleString()}
                      </strong> in this view
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading purchases...</div>
                  ) : attendeePurchases.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No attendee purchases yet.
                    </div>
                  ) : filteredAttendees.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No purchases match these filters.
                      <Button onClick={clearAttendeeFilters} variant="link" size="sm">
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Email</th>
                            <th className="text-left p-3">Name</th>
                            <th className="text-left p-3">Pass Type</th>
                            <th className="text-left p-3">Tier</th>
                            <th className="text-left p-3">Amount</th>
                            <th className="text-left p-3">Qty</th>
                            <th className="text-left p-3">Date</th>
                            <th className="text-left p-3">Email Status</th>
                            <th className="text-left p-3">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAttendees.map((purchase) => (
                            <tr key={purchase.id} className="border-b hover:bg-muted/50">
                              <td className="p-3">{purchase.email}</td>
                              <td className="p-3">{purchase.name || '-'}</td>
                              <td className="p-3">{formatPassType(purchase.pass_type)}</td>
                              <td className="p-3">{formatTier(purchase.tier)}</td>
                              <td className="p-3">${(purchase.amount / 100).toFixed(2)}</td>
                              <td className="p-3">{purchase.quantity}</td>
                              <td className="p-3">
                                {new Date(purchase.created_at).toLocaleDateString()}
                              </td>
                              <td className="p-3">
                                {renderEmailStatus(findDelivery(
                                  purchase.stripe_session_id,
                                  'attendee_confirmation',
                                ))}
                              </td>
                              <td className="p-3">
                                <Button
                                  onClick={() => resendAttendeeEmail(purchase)}
                                  disabled={sendingEmailId === purchase.stripe_session_id}
                                  variant="outline"
                                  size="sm"
                                >
                                  {sendingEmailId === purchase.stripe_session_id ? (
                                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                  ) : (
                                    <Mail className="w-3 h-3 mr-1" />
                                  )}
                                  Resend
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Partners Tab */}
            <TabsContent value="partners">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Platinum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{partnersByTier.platinum}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Gold</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{partnersByTier.gold}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Silver</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{partnersByTier.silver}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Bronze</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{partnersByTier.bronze}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Partner Payments */}
              <Card className="mb-6">
                <CardHeader className="space-y-4">
                  <div className="flex flex-row items-center justify-between gap-4">
                    <CardTitle>
                      Partner Payments
                      {partnerTierFilter !== 'all' && (
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          {filteredPartnerPurchases.length} of {partnerPurchases.length}
                        </span>
                      )}
                    </CardTitle>
                    <Button onClick={exportCSV} disabled={partnerPurchases.length === 0} size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <Select value={partnerTierFilter} onValueChange={setPartnerTierFilter}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Partner tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All tiers ({partnerPurchases.length})</SelectItem>
                        {partnerTiersPresent.map(t => (
                          <SelectItem key={t} value={t}>
                            {formatTier(t)} ({partnerPurchases.filter(p => p.tier === t).length})
                            {PARTNER_SEATS_BY_TIER[t] ? ` · ${PARTNER_SEATS_BY_TIER[t]} passes ea.` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {partnerTierFilter !== 'all' && (
                      <Button onClick={() => setPartnerTierFilter('all')} variant="ghost" size="sm">
                        <X className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {partnerPurchases.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No partner purchases yet.
                    </div>
                  ) : filteredPartnerPurchases.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No partners in this tier.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Email</th>
                            <th className="text-left p-3">Name</th>
                            <th className="text-left p-3">Tier</th>
                            <th className="text-left p-3">Amount</th>
                            <th className="text-left p-3">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPartnerPurchases.map((purchase) => (
                            <tr key={purchase.id} className="border-b hover:bg-muted/50">
                              <td className="p-3">{purchase.email}</td>
                              <td className="p-3">{purchase.name || '-'}</td>
                              <td className="p-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  purchase.tier === 'platinum' ? 'bg-slate-200 text-slate-800' :
                                  purchase.tier === 'gold' ? 'bg-amber-100 text-amber-800' :
                                  purchase.tier === 'silver' ? 'bg-gray-200 text-gray-700' :
                                  'bg-amber-200 text-amber-900'
                                }`}>
                                  {formatTier(purchase.tier)}
                                </span>
                              </td>
                              <td className="p-3">${(purchase.amount / 100).toLocaleString()}</td>
                              <td className="p-3">{new Date(purchase.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Partner Onboarding Profiles */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Partner Onboarding</CardTitle>
                  <Button onClick={exportPartnerCSV} disabled={partnerProfiles.length === 0} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Partners CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {partnerProfiles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No partner profiles yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Company</th>
                            <th className="text-left p-3">Tier</th>
                            <th className="text-left p-3">Contact</th>
                            <th className="text-left p-3">Email</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Email</th>
                            <th className="text-left p-3">Logo</th>
                            <th className="text-left p-3">Attendees</th>
                            <th className="text-left p-3">Date</th>
                            <th className="text-left p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {partnerProfiles.map((profile) => {
                            const attendeeCount = Array.isArray(profile.attendees)
                              ? (profile.attendees as any[]).filter((a: any) => a.name || a.email).length
                              : 0;
                            return (
                              <tr key={profile.id} className="border-b hover:bg-muted/50">
                                <td className="p-3 font-medium">
                                  {profile.company_name || profile.purchase_name || '-'}
                                  {profile.website_url && (
                                    <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="ml-1 inline-block">
                                      <ExternalLink className="w-3 h-3 inline text-muted-foreground" />
                                    </a>
                                  )}
                                </td>
                                <td className="p-3">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    profile.tier === 'platinum' ? 'bg-slate-200 text-slate-800' :
                                    profile.tier === 'gold' ? 'bg-amber-100 text-amber-800' :
                                    profile.tier === 'silver' ? 'bg-gray-200 text-gray-700' :
                                    'bg-amber-200 text-amber-900'
                                  }`}>
                                    {formatTier(profile.tier)}
                                  </span>
                                </td>
                                <td className="p-3">{profile.primary_contact_name || profile.purchase_name || '-'}</td>
                                <td className="p-3">{profile.primary_contact_email || profile.purchase_email || '-'}</td>
                                <td className="p-3">
                                  {profile.onboarding_completed ? (
                                    <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                                      <CheckCircle className="w-4 h-4" /> Done
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-amber-600 text-sm">
                                      <Clock className="w-4 h-4" /> Pending
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {renderEmailStatus(findDelivery(
                                    profile.stripe_session_id,
                                    'partner_welcome',
                                  ))}
                                </td>
                                <td className="p-3">
                                  {profile.logo_url ? (
                                    <img src={profile.logo_url} alt="" className="h-8 w-8 object-contain rounded" />
                                  ) : (
                                    <span className="text-muted-foreground text-sm">-</span>
                                  )}
                                </td>
                                <td className="p-3">{attendeeCount}</td>
                                <td className="p-3">{new Date(profile.created_at).toLocaleDateString()}</td>
                                <td className="p-3">
                                  <div className="flex gap-1">
                                    <Button
                                      onClick={() => resendWelcomeEmail(profile)}
                                      disabled={sendingEmailId === profile.id}
                                      variant="outline"
                                      size="sm"
                                      title="Resend welcome email"
                                    >
                                      {sendingEmailId === profile.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Mail className="w-3 h-3" />
                                      )}
                                    </Button>
                                    <Button
                                      onClick={() => copyOnboardingLink(profile)}
                                      variant="outline"
                                      size="sm"
                                      title="Copy onboarding link"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdminSales;
