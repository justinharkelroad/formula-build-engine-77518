export const AI_PORTAL_ADMIN_FUNCTION = 'formula-ai-portal-admin';

export type PortalSource = 'roster' | 'purchaser' | 'partner' | 'manual';
export type PortalPlatform = 'claude' | 'codex';
export type MemberState = 'active' | 'revoked';
export type MemberFilter = 'all' | 'active' | 'revoked' | 'claude' | 'codex';

export interface AdminInvoker {
  (name: string, options: { body: Record<string, unknown> }): Promise<{ data: unknown; error: unknown }>;
}

export interface PortalSettings {
  sign_in_open: boolean;
  access_until: string;
  updated_at: string;
  updated_by: string | null;
}

export interface Member {
  id: string;
  email: string;
  displayName: string | null;
  source: PortalSource;
  platform: PortalPlatform | null;
  state: MemberState;
  firstSeenAt: string;
  lastSeenAt: string;
  visitCount: number;
  revokedAt: string | null;
  revokeReason: string | null;
  progress: Record<string, number>;
  downloadCount: number;
  lastDownloadAt: string | null;
  /** False when the person no longer qualifies (seat suspended, approval revoked); they are refused on their next click. */
  eligibleNow?: boolean;
}

export interface Approval {
  id: string;
  email: string;
  displayName: string | null;
  reason: string;
  approvedAt: string;
}

export interface AccessRequest {
  id: string;
  email: string;
  displayName: string;
  note: string | null;
  createdAt: string;
  eligibleNow: boolean;
}

export interface CodeRequestStats {
  last24h: number;
  notEligible24h: number;
  sendFailed24h: number;
}

export interface Snapshot {
  settings: PortalSettings;
  members: Member[];
  approvals: Approval[];
  requests: AccessRequest[];
  codeRequests: CodeRequestStats;
}

export type CheckEmailReason = 'invalid_email' | 'revoked' | 'roster_inactive' | 'not_found';

export interface CheckEmailResult {
  eligible: boolean;
  source?: PortalSource;
  displayName?: string | null;
  reason?: CheckEmailReason;
}

export type AssetState = 'ready' | 'missing' | 'mismatch';

export interface AssetStatusEntry {
  id: string;
  storagePath: string;
  state: AssetState;
}

export interface AssetStatus {
  assets: AssetStatusEntry[];
}

export interface ApprovalResult {
  approvalId: string;
}

export interface RevokeApprovalResult {
  revoked: boolean;
}

export interface DismissRequestResult {
  dismissed: boolean;
}

export interface MemberStateResult {
  state: MemberState;
}

export interface SignInResult {
  signInOpen: boolean;
}

export interface UploadAssetResult {
  id: string;
  storagePath: string;
  state: 'ready';
}

export interface EligibilityExplanation {
  eligible: boolean;
  headline: string;
  detail: string;
}

export interface Stat {
  label: string;
  value: number;
}

export interface UploadAttempt {
  ok: boolean;
}

export interface UploadSummary {
  ok: number;
  failed: number;
}

export class AiPortalAdminError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = 'AiPortalAdminError';
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isSource(value: unknown): value is PortalSource {
  return value === 'roster' || value === 'purchaser' || value === 'partner' || value === 'manual';
}

function isPlatform(value: unknown): value is PortalPlatform {
  return value === 'claude' || value === 'codex';
}

function isMemberState(value: unknown): value is MemberState {
  return value === 'active' || value === 'revoked';
}

function isCheckEmailReason(value: unknown): value is CheckEmailReason {
  return value === 'invalid_email' || value === 'revoked' || value === 'roster_inactive' || value === 'not_found';
}

function isProgress(value: unknown): value is Record<string, number> {
  if (!isRecord(value)) return false;
  return Object.values(value).every(isFiniteNumber);
}

function isSettings(value: unknown): value is PortalSettings {
  return isRecord(value)
    && isBoolean(value.sign_in_open)
    && isString(value.access_until)
    && isString(value.updated_at)
    && isNullableString(value.updated_by);
}

function isMember(value: unknown): value is Member {
  return isRecord(value)
    && isString(value.id)
    && isString(value.email)
    && isNullableString(value.displayName)
    && isSource(value.source)
    && (value.platform === null || isPlatform(value.platform))
    && isMemberState(value.state)
    && isString(value.firstSeenAt)
    && isString(value.lastSeenAt)
    && isFiniteNumber(value.visitCount)
    && isNullableString(value.revokedAt)
    && isNullableString(value.revokeReason)
    && isProgress(value.progress)
    && isFiniteNumber(value.downloadCount)
    && isNullableString(value.lastDownloadAt);
}

function isApproval(value: unknown): value is Approval {
  return isRecord(value)
    && isString(value.id)
    && isString(value.email)
    && isNullableString(value.displayName)
    && isString(value.reason)
    && isString(value.approvedAt);
}

function isAccessRequest(value: unknown): value is AccessRequest {
  return isRecord(value)
    && isString(value.id)
    && isString(value.email)
    && isString(value.displayName)
    && isNullableString(value.note)
    && isString(value.createdAt)
    && isBoolean(value.eligibleNow);
}

function isCodeRequestStats(value: unknown): value is CodeRequestStats {
  return isRecord(value)
    && isFiniteNumber(value.last24h)
    && isFiniteNumber(value.notEligible24h)
    && isFiniteNumber(value.sendFailed24h);
}

function isSnapshot(value: unknown): value is Snapshot {
  return isRecord(value)
    && isSettings(value.settings)
    && Array.isArray(value.members)
    && value.members.every(isMember)
    && Array.isArray(value.approvals)
    && value.approvals.every(isApproval)
    && Array.isArray(value.requests)
    && value.requests.every(isAccessRequest)
    && isCodeRequestStats(value.codeRequests);
}

function isCheckEmailResult(value: unknown): value is CheckEmailResult {
  return isRecord(value)
    && isBoolean(value.eligible)
    && (value.source === undefined || isSource(value.source))
    && (value.displayName === undefined || isNullableString(value.displayName))
    && (value.reason === undefined || isCheckEmailReason(value.reason));
}

function isApprovalResult(value: unknown): value is ApprovalResult {
  return isRecord(value) && isString(value.approvalId);
}

function isRevokeApprovalResult(value: unknown): value is RevokeApprovalResult {
  return isRecord(value) && isBoolean(value.revoked);
}

function isDismissRequestResult(value: unknown): value is DismissRequestResult {
  return isRecord(value) && isBoolean(value.dismissed);
}

function isMemberStateResult(value: unknown): value is MemberStateResult {
  return isRecord(value) && isMemberState(value.state);
}

function isSignInResult(value: unknown): value is SignInResult {
  return isRecord(value) && isBoolean(value.signInOpen);
}

function isAssetStatus(value: unknown): value is AssetStatus {
  return isRecord(value)
    && Array.isArray(value.assets)
    && value.assets.every((asset) => isRecord(asset)
      && isString(asset.id)
      && isString(asset.storagePath)
      && (asset.state === 'ready' || asset.state === 'missing' || asset.state === 'mismatch'));
}

function isUploadAssetResult(value: unknown): value is UploadAssetResult {
  return isRecord(value) && isString(value.id) && isString(value.storagePath) && value.state === 'ready';
}

function codeFromMessage(value: unknown): string | null {
  if (!isRecord(value) || !isString(value.message)) return null;
  return value.message.match(/formula_ai_portal_[a-z0-9_]+/)?.[0] ?? null;
}

async function codeFromError(value: unknown): Promise<string | null> {
  if (isRecord(value) && 'context' in value && typeof Response !== 'undefined' && value.context instanceof Response) {
    try {
      const body: unknown = await value.context.clone().json();
      if (isRecord(body) && isString(body.error)) return body.error;
    } catch {
      return codeFromMessage(value);
    }
  }
  return codeFromMessage(value);
}

export async function callAiPortalAdmin(
  invoke: AdminInvoker,
  action: string,
  params: Record<string, unknown> = {},
): Promise<unknown> {
  let response: { data: unknown; error: unknown };
  try {
    response = await invoke(AI_PORTAL_ADMIN_FUNCTION, { body: { action, ...params } });
  } catch (error) {
    if (error instanceof AiPortalAdminError) throw error;
    throw new AiPortalAdminError(await codeFromError(error) ?? 'network');
  }
  if (response.error) {
    throw new AiPortalAdminError(await codeFromError(response.error) ?? 'network');
  }
  if (isRecord(response.data) && isString(response.data.error)) {
    throw new AiPortalAdminError(response.data.error);
  }
  return response.data;
}

function requireShape<T>(value: unknown, guard: (candidate: unknown) => candidate is T): T {
  if (!guard(value)) throw new AiPortalAdminError('invalid_response');
  return value;
}

export async function fetchSnapshot(invoke: AdminInvoker): Promise<Snapshot> {
  return requireShape(await callAiPortalAdmin(invoke, 'snapshot'), isSnapshot);
}

export async function checkEmail(invoke: AdminInvoker, email: string): Promise<CheckEmailResult> {
  return requireShape(await callAiPortalAdmin(invoke, 'check-email', { email }), isCheckEmailResult);
}

export async function approveEmail(
  invoke: AdminInvoker,
  email: string,
  reason: string,
  name?: string,
): Promise<ApprovalResult> {
  const params: Record<string, unknown> = { email, reason };
  if (name !== undefined) params.name = name;
  return requireShape(await callAiPortalAdmin(invoke, 'approve', params), isApprovalResult);
}

export async function revokeApproval(invoke: AdminInvoker, approvalId: string): Promise<RevokeApprovalResult> {
  return requireShape(await callAiPortalAdmin(invoke, 'revoke-approval', { approvalId }), isRevokeApprovalResult);
}

export async function dismissRequest(invoke: AdminInvoker, requestId: string): Promise<DismissRequestResult> {
  return requireShape(await callAiPortalAdmin(invoke, 'dismiss-request', { requestId }), isDismissRequestResult);
}

export async function setMemberState(
  invoke: AdminInvoker,
  memberId: string,
  state: MemberState,
  reason?: string,
): Promise<MemberStateResult> {
  const params: Record<string, unknown> = { memberId, state };
  if (reason !== undefined) params.reason = reason;
  return requireShape(await callAiPortalAdmin(invoke, 'set-member-state', params), isMemberStateResult);
}

export async function setSignIn(invoke: AdminInvoker, open: boolean): Promise<SignInResult> {
  return requireShape(await callAiPortalAdmin(invoke, 'set-sign-in', { open }), isSignInResult);
}

export async function fetchAssetStatus(invoke: AdminInvoker): Promise<AssetStatus> {
  return requireShape(await callAiPortalAdmin(invoke, 'asset-status'), isAssetStatus);
}

export async function uploadAsset(invoke: AdminInvoker, contentBase64: string): Promise<UploadAssetResult> {
  return requireShape(await callAiPortalAdmin(invoke, 'upload-asset', { contentBase64 }), isUploadAssetResult);
}

export function sourceLabel(source: PortalSource): string {
  if (source === 'roster') return 'Roster seat';
  if (source === 'purchaser') return 'Ticket purchaser';
  if (source === 'partner') return 'Partner contact';
  return 'Manual approval';
}

export function eligibilityExplanation(result: CheckEmailResult): EligibilityExplanation {
  if (result.eligible) {
    const label = result.source ? sourceLabel(result.source).toLocaleLowerCase() : 'approved access';
    return { eligible: true, headline: 'Eligible', detail: `Eligible · ${label}` };
  }
  if (result.reason === 'invalid_email') return { eligible: false, headline: 'Not eligible', detail: "That doesn't look like an email address" };
  if (result.reason === 'not_found') return { eligible: false, headline: 'Not eligible', detail: 'Not on the roster' };
  if (result.reason === 'roster_inactive') return { eligible: false, headline: 'Not eligible', detail: 'Seat suspended or revoked' };
  if (result.reason === 'revoked') return { eligible: false, headline: 'Not eligible', detail: 'Portal access revoked' };
  return { eligible: false, headline: 'Not eligible', detail: 'Not eligible' };
}

export function platformLabel(platform: PortalPlatform | null): string {
  if (platform === 'claude') return 'Claude';
  if (platform === 'codex') return 'Codex';
  return 'Not chosen';
}

export function memberDisplayName(member: Member): string {
  return member.displayName?.trim() || member.email;
}

export function filterMembers(members: Member[], query: string, filter: MemberFilter): Member[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return members.filter((member) => {
    const searchable = `${memberDisplayName(member)} ${member.email}`.toLocaleLowerCase();
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
    const matchesFilter = filter === 'all'
      || (filter === 'active' && member.state === 'active')
      || (filter === 'revoked' && member.state === 'revoked')
      || (filter === 'claude' && member.platform === 'claude')
      || (filter === 'codex' && member.platform === 'codex');
    return matchesQuery && matchesFilter;
  });
}

function timestamp(value: string): number | null {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function sortMembers(members: Member[]): Member[] {
  return members.map((member, index) => ({ member, index })).sort((a, b) => {
    const aTime = timestamp(a.member.lastSeenAt);
    const bTime = timestamp(b.member.lastSeenAt);
    if (aTime === null && bTime !== null) return 1;
    if (aTime !== null && bTime === null) return -1;
    if (aTime !== null && bTime !== null && aTime !== bTime) return bTime - aTime;
    const emailOrder = a.member.email.localeCompare(b.member.email);
    return emailOrder || a.index - b.index;
  }).map(({ member }) => member);
}

export function sortRequests(requests: AccessRequest[]): AccessRequest[] {
  return requests.map((request, index) => ({ request, index })).sort((a, b) => {
    const aTime = timestamp(a.request.createdAt);
    const bTime = timestamp(b.request.createdAt);
    if (aTime === null && bTime !== null) return 1;
    if (aTime !== null && bTime === null) return -1;
    if (aTime !== null && bTime !== null && aTime !== bTime) return aTime - bTime;
    const emailOrder = a.request.email.localeCompare(b.request.email);
    return emailOrder || a.index - b.index;
  }).map(({ request }) => request);
}

export function dayProgressLabel(progress: Record<string, number>, day: 1 | 2): string {
  const value = progress[`day-${day}`];
  if (!Number.isFinite(value)) return `Day ${day} · not started`;
  const percent = Math.round(Math.max(0, Math.min(100, value)));
  return `Day ${day} · ${percent}% furthest reached`;
}

export function filesRequestedLabel(count: number): string {
  return `${count} requested`;
}

export function buildStats(snapshot: Snapshot): Stat[] {
  return [
    { label: 'Signed in', value: snapshot.members.filter((member) => member.state === 'active').length },
    { label: 'Revoked', value: snapshot.members.filter((member) => member.state === 'revoked').length },
    { label: 'Pending requests', value: snapshot.requests.length },
    { label: 'Manual approvals', value: snapshot.approvals.length },
    { label: 'Code requests (24h)', value: snapshot.codeRequests.last24h },
    { label: 'Not eligible (24h)', value: snapshot.codeRequests.notEligible24h },
    { label: 'Send failures (24h)', value: snapshot.codeRequests.sendFailed24h },
  ];
}

export function formatAccessEnd(accessUntil: string): string {
  let date: Date;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(accessUntil.trim());
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    date = new Date(Date.UTC(year, month - 1, day, 12));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      return 'Access end date unavailable';
    }
  } else {
    date = new Date(accessUntil);
    if (!Number.isFinite(date.getTime())) return 'Access end date unavailable';
  }
  try {
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric',
    }).format(date);
    return `Access ends ${formatted}`;
  } catch {
    return 'Access end date unavailable';
  }
}

export function bytesToBase64(bytes: Uint8Array): string {
  let output = '';
  const chunkSize = 0x7ffe;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length));
    let binary = '';
    for (const byte of chunk) binary += String.fromCharCode(byte);
    output += btoa(binary);
  }
  return output;
}

export async function fileToBase64(file: Blob): Promise<string> {
  return bytesToBase64(new Uint8Array(await file.arrayBuffer()));
}

export function isValidEmailShape(email: string): boolean {
  const value = email.trim();
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function summarizeUploadResults(results: UploadAttempt[]): UploadSummary {
  return results.reduce((summary, result) => {
    if (result.ok) summary.ok += 1;
    else summary.failed += 1;
    return summary;
  }, { ok: 0, failed: 0 });
}

export function friendlyAiPortalError(code: string): string {
  const normalized = code.replace(/^formula_ai_portal_/, '');
  const messages: Record<string, string> = {
    invalid_email: "That email address isn't valid.",
    invalid_approval: 'Email and reason are required.',
    approval_not_found: 'That approval is no longer available. Refresh and try again.',
    request_not_found: 'That request is no longer pending. Refresh and try again.',
    invalid_state: 'That access state is not valid. Refresh and try again.',
    invalid_settings: 'Those sign-in settings could not be saved. Refresh and try again.',
    unrecognized_file: 'That file is not one of the nine portal files. Nothing was uploaded.',
    request_failed: 'The portal service could not complete that request. Try again in a moment.',
    Unauthorized: 'Your session may have expired, or you may not be an admin. Sign in again and try again.',
    network: 'The portal service did not respond. Check your connection and try again.',
    invalid_response: 'The portal service returned an incomplete response. Refresh and try again.',
    missing_configuration: 'The portal service is not configured yet. Try again later.',
  };
  return messages[normalized] ?? 'We could not complete that portal action. Try again in a moment.';
}
