import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Users, DollarSign, MousePointer, LogOut } from 'lucide-react';
import { trackEvent } from '@/hooks/useAnalytics';
import { useAuth } from '@/contexts/AuthContext';

const AdminMetrics = () => {
  const { signOut, user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalSessions: 0,
    totalPageViews: 0,
    ctaClicks: 0,
    checkoutAttempts: 0,
    completedPurchases: 0,
    conversionRate: 0,
    totalRevenue: 0
  });

  // Simulate metrics data - in real app this would come from GA4 API or your analytics service
  const fetchMetrics = async () => {
    // Mock data for demonstration
    setMetrics({
      totalSessions: 1247,
      totalPageViews: 3891,
      ctaClicks: 234,
      checkoutAttempts: 89,
      completedPurchases: 67,
      conversionRate: 75.3,
      totalRevenue: 33450
    });
  };

  useEffect(() => {
    fetchMetrics();
    trackEvent('view_item', {
      page_location: window.location.href,
    });
  }, []);

  const funnelData = [
    { step: 'Page Views', count: metrics.totalPageViews, percentage: 100 },
    { step: 'CTA Clicks', count: metrics.ctaClicks, percentage: parseFloat((metrics.ctaClicks / metrics.totalPageViews * 100).toFixed(1)) },
    { step: 'Checkout Started', count: metrics.checkoutAttempts, percentage: parseFloat((metrics.checkoutAttempts / metrics.ctaClicks * 100).toFixed(1)) },
    { step: 'Purchase Complete', count: metrics.completedPurchases, percentage: parseFloat((metrics.completedPurchases / metrics.checkoutAttempts * 100).toFixed(1)) }
  ];

  return (
    <>
      <SEO 
        title="Admin - Analytics Metrics | Formula Forum 2026"
        description="View analytics and conversion metrics"
        noindex={true}
      />
      <Navigation />
      
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-2">Monitor key metrics and conversion performance</p>
              {user && <p className="text-sm text-muted-foreground">Signed in as: {user.email}</p>}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={fetchMetrics}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalSessions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalPageViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+8% from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CTA Clicks</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.ctaClicks}</div>
                <p className="text-xs text-muted-foreground">6% click-through rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+23% from last week</p>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((item, index) => (
                  <div key={item.step} className="flex items-center space-x-4">
                    <div className="w-32 text-sm font-medium">{item.step}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-muted rounded-full h-4">
                          <div 
                            className="bg-primary h-4 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(item.percentage, 5)}%` }}
                          ></div>
                        </div>
                        <div className="text-sm font-medium w-16">{item.percentage}%</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground w-20">
                      {item.count.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Conversion Insights</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Overall conversion rate: {metrics.conversionRate}% (checkout to purchase)</li>
                  <li>• Click-to-checkout rate: {(metrics.checkoutAttempts / metrics.ctaClicks * 100).toFixed(1)}%</li>
                  <li>• Average order value: ${(metrics.totalRevenue / Math.max(metrics.completedPurchases, 1)).toFixed(0)}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Event Tracking Status */}
          <Card>
            <CardHeader>
              <CardTitle>GA4 Event Tracking Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Configured Events</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>view_item (Page views)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>cta_click (CTA interactions)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>begin_checkout (Checkout starts)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>purchase (Completed purchases)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>faq_expand (FAQ interactions)</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Ecommerce Tracking</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Item IDs (pass_type)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Currency tracking</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Revenue values</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Quantity tracking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminMetrics;