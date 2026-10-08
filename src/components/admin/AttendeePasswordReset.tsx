import { FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound, Loader2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestAttendeePassword, requireAttendeeRegistration, type AttendeePasswordAccount } from '@/lib/adminAttendeePassword';

interface AttendeePasswordResetProps {
  attendee: { registrationId: string; name: string; email: string };
  onBusyChange: (busy: boolean) => void;
  relatedRegistrations: { id: string; name: string; email: string; agencyName: string | null }[];
  onReviewRegistration: (registrationId: string) => void;
}

async function token() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error('Sign in again as a website administrator.');
  return data.session.access_token;
}

export default function AttendeePasswordReset({ attendee, onBusyChange, relatedRegistrations, onReviewRegistration }: AttendeePasswordResetProps) {
  const [email, setEmail] = useState(attendee.email);
  const [account, setAccount] = useState<AttendeePasswordAccount | null>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    setBusy(true);
    const load = async () => {
      try {
        const result = await requestAttendeePassword(await token(), { action: 'lookup', email: attendee.email });
        requireAttendeeRegistration(result.account, attendee.registrationId);
        if (active) setAccount(result.account);
      } catch (failure) {
        if (active) setError(failure instanceof Error ? failure.message : 'The account could not be found.');
      } finally { if (active) setBusy(false); }
    };
    void load();
    return () => { active = false; };
  }, [attendee.email, attendee.registrationId]);

  const lookup = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setAccount(null); setError(''); setSuccess(''); setPassword(''); setConfirmation(''); setShowPassword(false);
    try {
      const result = await requestAttendeePassword(await token(), { action: 'lookup', email: email.trim() });
      requireAttendeeRegistration(result.account, attendee.registrationId);
      setAccount(result.account);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'The account could not be found.'); }
    finally { setBusy(false); }
  };

  const reset = async (event: FormEvent) => {
    event.preventDefault();
    if (!account?.canReset || !account.registrationId || busy) return;
    setError(''); setSuccess('');
    if (password !== confirmation) { setError('The passwords do not match.'); return; }
    if (password.length < 6) { setError('Choose a temporary password with at least 6 characters.'); return; }
    setBusy(true);
    onBusyChange(true);
    try {
      requireAttendeeRegistration(account, attendee.registrationId);
      const result = await requestAttendeePassword(await token(), {
        action: 'reset', email: account.email, uid: account.uid, registrationId: account.registrationId,
        password, operationId: crypto.randomUUID(),
      });
      setPassword(''); setConfirmation(''); setShowPassword(false);
      setSuccess(`Password changed for ${account.displayName || account.email}. Give the attendee the password you chose. They can sign in with ${account.email} in the app or Formula Flow.`);
      if (!result.sessionsRevoked || !result.auditRecorded) {
        setError(!result.sessionsRevoked
          ? 'The password changed, but previous sessions could not all be signed out. Contact support to finish signing them out.'
          : 'The password changed, but the final audit status could not be saved. Contact support to check the reset record.');
      }
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'The password could not be changed.'); }
    finally { setBusy(false); onBusyChange(false); }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> {attendee.name}</CardTitle>
        <CardDescription>Review the attendee’s app account, then choose a temporary password without a reset email.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!account && <form onSubmit={lookup} className="space-y-3">
          <Label htmlFor="attendee-login-email">Attendee’s sign-in email</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input id="attendee-login-email" type="email" autoComplete="off" placeholder="attendee@example.com" value={email} required disabled={busy}
              onChange={event => { setEmail(event.target.value); setAccount(null); setPassword(''); setConfirmation(''); setError(''); setSuccess(''); }} />
            <Button type="submit" disabled={busy || !email.trim()}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />} Find account
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{busy ? 'Looking up this attendee’s app account…' : 'If their sign-in email differs, enter it here. It must be linked to this attendee.'}</p>
        </form>}
        {error && <Alert variant="destructive" role="alert"><AlertDescription>{error}</AlertDescription></Alert>}
        {!account && !busy && error && relatedRegistrations.length > 0 && (
          <div className="space-y-3 rounded-md border p-4">
            <p className="font-semibold">Another connected registration has this name</p>
            <p className="text-sm text-muted-foreground">Review its email and agency. If it is the person you are helping, open that registration to reset their existing account.</p>
            {relatedRegistrations.map(row => (
              <Button key={row.id} type="button" variant="outline" className="h-auto w-full justify-start whitespace-normal py-3 text-left"
                onClick={() => onReviewRegistration(row.id)}>
                <span className="space-y-1"><span className="block font-semibold">{row.name}</span><span className="block break-all">{row.email}</span>
                  {row.agencyName && <span className="block text-sm text-muted-foreground">{row.agencyName}</span>}
                  <span className="block text-sm">Review connected registration →</span></span>
              </Button>
            ))}
          </div>
        )}
        {success && <Alert role="status"><AlertDescription>{success}</AlertDescription></Alert>}
        {account && (
          <div className="space-y-5 border-t pt-5">
            <div className="rounded-md border bg-muted/30 p-4">
              <p className="font-semibold">{account.displayName || 'Account name not provided'}</p>
              <p className="break-all text-sm">{account.email}</p>
              {account.company && <p className="mt-1 text-sm text-muted-foreground">{account.company}</p>}
            </div>
            {!account.canReset ? <Alert variant="destructive"><AlertDescription>{account.unavailableReason || 'This account cannot be reset.'}</AlertDescription></Alert> : (
              <form onSubmit={reset} className="space-y-4" autoComplete="off">
                <p className="text-sm">Confirm the name and email above belong to the person you are helping.</p>
                <div className="space-y-2">
                  <Label htmlFor="attendee-temporary-password">Temporary password you choose</Label>
                  <div className="flex gap-2">
                    <Input id="attendee-temporary-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={6} maxLength={4096} required disabled={busy} value={password} onChange={event => setPassword(event.target.value)} />
                    <Button type="button" variant="outline" size="icon" disabled={busy} aria-label={showPassword ? 'Hide temporary password' : 'Show temporary password'} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">At least 6 characters. Tell the attendee the password you choose.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-attendee-password">Confirm temporary password</Label>
                  <Input id="confirm-attendee-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={6} maxLength={4096} required disabled={busy} value={confirmation} onChange={event => setConfirmation(event.target.value)} />
                </div>
                <Button type="submit" disabled={busy || !password || !confirmation}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {busy ? 'Setting password…' : 'Set temporary password'}
                </Button>
                <p className="text-sm text-muted-foreground">Replaces their current password and signs out previous sessions. Their account and business access stay linked.</p>
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
