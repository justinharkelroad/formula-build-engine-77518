import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, LogOut, AlertTriangle } from 'lucide-react';
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

const SEAT_CAP = 250;

const AdminSales = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const { toast } = useToast();
  const { signOut, user } = useAuth();

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast({
        title: "Error",
        description: "Failed to fetch purchases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
  const totalQuantity = purchases.reduce((sum, p) => sum + p.quantity, 0);
  const agencyOwnerCount = purchases.filter(p => p.pass_type === 'agencyOwner').reduce((sum, p) => sum + p.quantity, 0);
  const teamCount = purchases.filter(p => p.pass_type === 'team').reduce((sum, p) => sum + p.quantity, 0);
  const remainingSeats = SEAT_CAP - totalQuantity;
  const unknownCount = purchases.filter(p => p.pass_type === 'unknown').length;

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
      await fetchPurchases();
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
      default: return passType;
    }
  };

  const formatTier = (tier: string) => {
    switch (tier) {
      case 'earlyBird': return 'Early Bird';
      case 'vip': return 'VIP';
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

  return (
    <>
      <SEO
        title="Admin - Sales | F³ Formula Forum 2026"
        description="View and manage ticket sales"
        noindex={true}
      />
      <Navigation />

      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold">Sales Dashboard</h1>
              <p className="text-muted-foreground mt-2">Track Formula 2026 ticket purchases</p>
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
                onClick={fetchPurchases}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={exportCSV}
                disabled={purchases.length === 0}
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(totalRevenue / 100).toLocaleString()}</div>
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
            <CardHeader>
              <CardTitle>Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading purchases...</div>
              ) : purchases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No purchases yet.
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
                      {purchases.map((purchase) => (
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
        </div>
      </div>
    </>
  );
};

export default AdminSales;
