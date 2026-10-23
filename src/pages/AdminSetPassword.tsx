import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SEO from '@/components/SEO';
import Navigation from '@/components/Navigation';

/**
 * Landing page for the "Forgot password?" email. The link signs the person in
 * for one purpose (the auth client reads the token from the URL), then this
 * page lets them choose a new password. Without that session the link has
 * expired or was already used, and the page says so.
 */

const MIN_LENGTH = 8;

type Phase = 'checking' | 'ready' | 'expired' | 'saved';

const AdminSetPassword = () => {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // getSession waits for the client to finish reading any token in the URL.
    void supabase.auth.getSession().then(({ data }) => setPhase(data.session ? 'ready' : 'expired'));
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setSaving(true);
    setError('');
    const { error: updateError } = await updatePassword(password);
    setSaving(false);
    if (updateError) {
      setError(updateError.message || "Your password couldn't be saved. Request a new reset link and try again.");
      return;
    }
    setPhase('saved');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Set Password | Formula Admin" description="Administrative access." path="/admin/set-password" noindex />
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>{phase === 'saved' ? 'Password updated' : 'Set a new password'}</CardTitle>
            <CardDescription>
              {phase === 'expired'
                ? 'This reset link has expired or was already used.'
                : phase === 'saved'
                  ? "You're signed in. Use the new password next time you sign in."
                  : 'Choose a new password for your Formula admin account.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {phase === 'checking' && <p role="status" className="text-sm text-muted-foreground">Checking your reset link…</p>}

            {phase === 'expired' && (
              <Button asChild className="w-full">
                <Link to="/admin/auth?reset=1">Send a new reset link</Link>
              </Button>
            )}

            {phase === 'ready' && (
              <form onSubmit={save} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">At least {MIN_LENGTH} characters.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Type it again</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? 'Saving…' : 'Save new password'}
                </Button>
              </form>
            )}

            {phase === 'saved' && (
              <div className="space-y-2">
                <Button className="w-full" onClick={() => navigate('/admin/survey-results')}>
                  Go to survey results
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/admin/sales')}>
                  Admin home
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSetPassword;
