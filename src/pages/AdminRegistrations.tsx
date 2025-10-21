import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Registration {
  id: string;
  email: string;
  stripe_session_id: string;
  amount: number;
  currency: string;
  pass_type: string;
  quantity: number;
  created_at: string;
}

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { signOut, user } = useAuth();

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const exportCSV = () => {
    const csvContent = [
      ['Email', 'Pass Type', 'Amount', 'Currency', 'Quantity', 'Date', 'Session ID'],
      ...registrations.map(reg => [
        reg.email,
        reg.pass_type,
        (reg.amount / 100).toFixed(2),
        reg.currency.toUpperCase(),
        reg.quantity,
        new Date(reg.created_at).toLocaleDateString(),
        reg.stripe_session_id
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalRevenue = registrations.reduce((sum, reg) => sum + reg.amount, 0) / 100;

  return (
    <>
      <SEO 
        title="Admin - Registrations | F³ Formula Forum 2025"
        description="View and manage event registrations"
      />
      <Navigation />
      
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold">Registration Management</h1>
              <p className="text-muted-foreground mt-2">View and manage all event registrations</p>
              {user && <p className="text-sm text-muted-foreground">Signed in as: {user.email}</p>}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={fetchRegistrations}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={exportCSV}
                disabled={registrations.length === 0}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{registrations.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Agent vs Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  Agent: {registrations.filter(r => r.pass_type === 'agent').length}<br />
                  Team: {registrations.filter(r => r.pass_type === 'team').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading registrations...</div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No registrations found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Pass Type</th>
                        <th className="text-left p-3">Amount</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Session ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((registration) => (
                        <tr key={registration.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">{registration.email}</td>
                          <td className="p-3 capitalize">{registration.pass_type}</td>
                          <td className="p-3">${(registration.amount / 100).toFixed(2)}</td>
                          <td className="p-3">
                            {new Date(registration.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3 font-mono text-sm">
                            {registration.stripe_session_id.substring(0, 20)}...
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

export default AdminRegistrations;