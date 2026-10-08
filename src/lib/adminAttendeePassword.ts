export interface AttendeePasswordAccount {
  uid: string;
  email: string;
  displayName: string;
  company: string;
  disabled: boolean;
  registrationId: string | null;
  accessState: string;
  canReset: boolean;
  unavailableReason: string | null;
}

export interface AttendeePasswordResult {
  account: AttendeePasswordAccount;
  passwordChanged?: boolean;
  sessionsRevoked?: boolean;
  auditRecorded?: boolean;
}

type AccountRequest = { action: 'lookup'; email: string } | {
  action: 'reset'; email: string; uid: string; registrationId: string; password: string; operationId: string;
};

export const ATTENDEE_PASSWORD_ENDPOINT = 'https://us-central1-the-formula-forum-2026.cloudfunctions.net/adminAttendeePassword';

export function requireAttendeeRegistration(account: AttendeePasswordAccount, registrationId: string): void {
  if (account.registrationId !== registrationId) {
    throw new Error('This app account is not linked to the selected attendee. Check their sign-in email and attendee access before resetting their password.');
  }
}

export async function requestAttendeePassword(
  token: string, body: AccountRequest, fetcher: typeof fetch = fetch,
): Promise<AttendeePasswordResult> {
  let response: Response;
  try {
    response = await fetcher(ATTENDEE_PASSWORD_ENDPOINT, {
      method: 'POST', headers: { authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body), cache: 'no-store', signal: AbortSignal.timeout(60000),
    });
  } catch {
    throw new Error(body.action === 'reset'
      ? 'The account service did not respond. The password may have changed. Check the chosen password before starting another reset.'
      : 'The account service did not respond. Try again.');
  }
  let data: AttendeePasswordResult & { error?: string };
  try { data = await response.json(); } catch {
    throw new Error(body.action === 'reset'
      ? 'The password change could not be confirmed. Check the chosen password before starting another reset.'
      : 'The account service is unavailable. Try again.');
  }
  if (!response.ok) throw new Error(data.error || 'The account request could not be completed.');
  if (!data.account || typeof data.account.uid !== 'string' || typeof data.account.email !== 'string') {
    throw new Error('The account service returned an incomplete result. Look up the account again.');
  }
  if (body.action === 'reset' && (data.passwordChanged !== true || data.account.uid !== body.uid)) {
    throw new Error('The password change could not be confirmed. Check the chosen password before starting another reset.');
  }
  return data;
}
