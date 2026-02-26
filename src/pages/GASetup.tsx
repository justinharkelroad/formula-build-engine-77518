import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import Navigation from '../components/Navigation';
import SEO from '../components/SEO';

const GASetup = () => {
  const [measurementId, setMeasurementId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (measurementId.startsWith('G-')) {
      setIsSubmitted(true);
      console.log('Update src/config/analytics.ts with this ID:', measurementId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="GA4 Setup | F³ Formula Forum" description="GA4 configuration page" noindex={true} />
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>GA4 Configuration</CardTitle>
              <CardDescription>
                Paste your Google Analytics 4 Measurement ID to enable tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="ga4-id" className="text-sm font-medium">
                  GA4 Measurement ID
                </label>
                <Input
                  id="ga4-id"
                  placeholder="G-XXXXXXXXXX"
                  value={measurementId}
                  onChange={(e) => setMeasurementId(e.target.value)}
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Format: G-XXXXXXXXXX (starts with "G-")
                </p>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={!measurementId.startsWith('G-')}
                className="w-full"
              >
                Configure Analytics
              </Button>

              {isSubmitted && (
                <Alert>
                  <AlertDescription>
                    <strong>Next steps:</strong>
                    <ol className="mt-2 list-decimal list-inside space-y-1">
                      <li>Update <code>src/config/analytics.ts</code></li>
                      <li>Replace GA4_MEASUREMENT_ID with: <code>{measurementId}</code></li>
                      <li>Set ENABLED to <code>true</code></li>
                    </ol>
                  </AlertDescription>
                </Alert>
              )}

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">How to find your GA4 Measurement ID:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to <a href="https://analytics.google.com" className="text-primary hover:underline" target="_blank" rel="noopener">analytics.google.com</a></li>
                  <li>Select your property</li>
                  <li>Click "Admin" (gear icon)</li>
                  <li>Under "Property", click "Data Streams"</li>
                  <li>Click your web stream</li>
                  <li>Copy the "Measurement ID" (starts with G-)</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GASetup;