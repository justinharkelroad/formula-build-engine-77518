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
  first_name: string;
  last_name: string;
  phone: string;
  attended_2025: boolean;
  agency_state: string;
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
        .from('waitlist')
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

  const formatPhoneDisplay = (phone: string): string => {
    // If already in E.164 format, format for display
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      const areaCode = digits.slice(1, 4);
      const prefix = digits.slice(4, 7);
      const line = digits.slice(7, 11);
      return `(${areaCode}) ${prefix}-${line}`;
    }
    return phone; // Return as-is if not recognized format
  };

  const exportCSV = () => {
    const csvContent = [
      ['First Name', 'Last Name', 'Email', 'Phone', 'Attended 2025', 'Agency State', 'Date'],
      ...registrations.map(reg => [
        `"${reg.first_name}"`,
        `"${reg.last_name}"`,
        reg.email,
        reg.phone, // Export in E.164 format
        reg.attended_2025 ? 'Yes' : 'No',
        reg.agency_state,
        new Date(reg.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <SEO 
        title="Admin - Registrations | F³ Formula Forum 2026"
        description="View and manage event registrations"
        noindex={true}
      />
      <Navigation />
      
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold">Waitlist Management</h1>
              <p className="text-muted-foreground mt-2">View and manage Formula 2026 waitlist</p>
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
                <CardTitle className="text-sm font-medium">Total Waitlist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{registrations.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Attended 2025</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {registrations.filter(r => r.attended_2025).length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">New Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {registrations.filter(r => !r.attended_2025).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Waitlist Members</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading waitlist...</div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No waitlist members found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">First Name</th>
                        <th className="text-left p-3">Last Name</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Phone</th>
                        <th className="text-left p-3">Attended 2025</th>
                        <th className="text-left p-3">State</th>
                        <th className="text-left p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((registration) => (
                        <tr key={registration.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">{registration.first_name}</td>
                          <td className="p-3">{registration.last_name}</td>
                          <td className="p-3">{registration.email}</td>
                          <td className="p-3">{formatPhoneDisplay(registration.phone)}</td>
                          <td className="p-3">{registration.attended_2025 ? 'Yes' : 'No'}</td>
                          <td className="p-3">{registration.agency_state}</td>
                          <td className="p-3">
                            {new Date(registration.created_at).toLocaleDateString()}
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