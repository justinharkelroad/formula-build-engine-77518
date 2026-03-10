import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, RefreshCw, LogOut, AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
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

const SEAT_CAP = 250;

const AdminSales = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [partnerProfiles, setPartnerProfiles] = useState<PartnerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const { toast } = useToast();
  const { signOut, user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [purchasesRes, partnersRes] = await Promise.all([
        supabase.from('purchases').select('*').order('created_at', { ascending: false }),
        supabase.from('partner_profiles' as any).select('*').order('created_at', { ascending: false }),
      ]);

      if (purchasesRes.error) throw purchasesRes.error;
      setPurchases(purchasesRes.data || []);
      setPartnerProfiles((partnersRes.data || []) as PartnerProfile[]);
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
  const remainingSeats = SEAT_CAP - totalQuantity;
  const unknownCount = purchases.filter(p => p.pass_type === 'unknown').length;

  // Partner tier breakdown
  const partnersByTier = {
    platinum: partnerPurchases.filter(p => p.tier === 'platinum').length,
    gold: partnerPurchases.filter(p => p.tier === 'gold').length,
    silver: partnerPurchases.filter(p => p.tier === 'silver').length,
    bronze: partnerPurchases.filter(p => p.tier === 'bronze').length,
  };

  const onboardedCount = partnerProfiles.filter(p => p.onboarding_completed).length;

  const fixUnknownPurchases = async () => {
    setFixing(true);
    try {
      const { data, error } = await supabase.functions.invoke('reprocess-purchases');
      if (error) throw error;
      const fixed = data?.fixed ?? 0;
      const failed = data?.failed ?? 0;
      toast({
        title: "Reprocess Complete",
        description: `Fixed ${fixed} purchases${failed > 0 ? `, ${failed} failed` : ''}`,
      });
      await fetchData();
    } catch (error) {
      console.error('Error fixing unknown purchases:', error);
      toast({
        title: "Error",
        description: "Failed to reprocess unknown purchases",
        variant: "destructive",
      });
    } finally {
      setFixing(false);
    }
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
        title="Admin - Sales | F³ Formula Forum 2026"
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
                View Waitlist
              </Link>
            </div>
            <div className="flex gap-2 flex-wrap">
              {unknownCount > 0 && (
                <Button
                  onClick={fixUnknownPurchases}
                  disabled={fixing}
                  variant="destructive"
                  size="sm"
                >
                  <AlertTriangle className={`w-4 h-4 mr-2 ${fixing ? 'animate-spin' : ''}`} />
                  {fixing ? 'Fixing...' : `Fix ${unknownCount} Unknown`}
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
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Attendee Purchases</CardTitle>
                  <Button onClick={exportCSV} disabled={purchases.length === 0} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export All CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading purchases...</div>
                  ) : attendeePurchases.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No attendee purchases yet.
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
                          </tr>
                        </thead>
                        <tbody>
                          {attendeePurchases.map((purchase) => (
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Partner Payments</CardTitle>
                  <Button onClick={exportCSV} disabled={partnerPurchases.length === 0} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {partnerPurchases.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No partner purchases yet.
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
                          {partnerPurchases.map((purchase) => (
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
                            <th className="text-left p-3">Logo</th>
                            <th className="text-left p-3">Attendees</th>
                            <th className="text-left p-3">Date</th>
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
                                  {profile.logo_url ? (
                                    <img src={profile.logo_url} alt="" className="h-8 w-8 object-contain rounded" />
                                  ) : (
                                    <span className="text-muted-foreground text-sm">-</span>
                                  )}
                                </td>
                                <td className="p-3">{attendeeCount}</td>
                                <td className="p-3">{new Date(profile.created_at).toLocaleDateString()}</td>
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
