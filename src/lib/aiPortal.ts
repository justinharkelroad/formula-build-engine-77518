import { supabase } from "@/integrations/supabase/client";

export type PortalPlatform = "claude" | "codex";

export type PortalStatus = {
  access: true;
  accessUntil: string;
  member: {
    email: string;
    displayName: string | null;
    source: "roster" | "purchaser" | "partner" | "manual";
    platform: PortalPlatform | null;
  };
  progress: Record<string, number>;
  videos: { id: string; embedUrl: string }[];
};

export type PortalDenied = { access: false; reason: string };

export function isPortalStatus(value: PortalStatus | PortalDenied): value is PortalStatus {
  return value.access === true;
}

type PortalSession = { token: string; email: string };
const SESSION_KEY = "formula_ai_portal_session_v1";
let currentSession: PortalSession | null = null;

export function portalSession(): PortalSession | null {
  if (currentSession) return currentSession;
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null");
    if (saved && typeof saved.token === "string" && /^fai_[a-f0-9]{64}$/.test(saved.token)
      && typeof saved.email === "string") currentSession = saved;
  } catch { /* A blocked browser store only disables remembering the toolkit. */ }
  return currentSession;
}

export function clearPortalSession(): void {
  currentSession = null;
  try { localStorage.removeItem(SESSION_KEY); } catch { /* Storage may be disabled. */ }
}

export const SUPPORT_EMAIL = "info@f3florida.com";

/** Body of a non-2xx edge-function reply, or null when it is not JSON. */
async function errorBody(error: unknown): Promise<Record<string, unknown> | null> {
  const context = error && typeof error === "object" && "context" in error ? (error as { context: unknown }).context : null;
  if (context instanceof Response) {
    try {
      return await context.clone().json();
    } catch {
      return null;
    }
  }
  return null;
}

async function invoke<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, {
    body: fn === "formula-ai-portal" ? { ...body, portalToken: portalSession()?.token } : body,
  });
  if (error) {
    const payload = await errorBody(error);
    if (payload && payload.access === false) return payload as T;
    throw new Error(typeof payload?.error === "string" ? payload.error : "formula_ai_portal_unavailable");
  }
  return data as T;
}

export async function openPortal(email: string): Promise<PortalStatus | PortalDenied> {
  const result = await invoke<(PortalStatus & { token: string }) | PortalDenied>(
    "formula-ai-portal-signin", { action: "enter", email: email.trim() },
  );
  if (result.access) {
    if (!/^fai_[a-f0-9]{64}$/.test(result.token)) throw new Error("formula_ai_portal_unavailable");
    currentSession = { token: result.token, email: result.member.email };
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(currentSession)); } catch { /* Keep this tab working. */ }
  }
  return result;
}

export async function requestAccess(input: { email: string; name: string; note?: string }): Promise<void> {
  await invoke("formula-ai-portal-signin", { action: "request-access", ...input });
}

export function loadStatus(): Promise<PortalStatus | PortalDenied> {
  return invoke("formula-ai-portal", { action: "status" });
}

export function savePlatform(platform: PortalPlatform): Promise<unknown> {
  return invoke("formula-ai-portal", { action: "set-platform", platform });
}

export function saveProgress(contentId: string, percent: number): Promise<unknown> {
  return invoke("formula-ai-portal", { action: "progress", contentId, percent });
}

export async function downloadUrl(assetId: string): Promise<string> {
  const result = await invoke<{ url?: string; access?: false }>("formula-ai-portal", { action: "download", assetId });
  if (!result.url) throw new Error("formula_ai_portal_no_access");
  return result.url;
}

export const isEmail = (value: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());

/** Completed 10% steps, so progress is saved at most ten times per video. */
export function progressStep(percent: number): number {
  if (!Number.isFinite(percent)) return 0;
  return Math.min(100, Math.max(0, Math.floor(percent / 10) * 10));
}

export type VimeoEvent = { event: "ready" } | { event: "timeupdate"; percent: number } | { event: "ended" };

/**
 * Reads a Vimeo player postMessage. Only messages from the Vimeo player origin
 * are trusted; Vimeo reports progress as a 0-1 fraction.
 */
export function parseVimeoMessage(origin: string, data: unknown): VimeoEvent | null {
  if (origin !== "https://player.vimeo.com") return null;
  let message: unknown = data;
  if (typeof data === "string") {
    try {
      message = JSON.parse(data);
    } catch {
      return null;
    }
  }
  if (!message || typeof message !== "object") return null;
  const { event, data: payload } = message as { event?: unknown; data?: { percent?: unknown } };
  if (event === "ready" || event === "ended") return { event };
  if (event === "timeupdate" && typeof payload?.percent === "number") {
    return { event, percent: Math.round(payload.percent * 100) };
  }
  return null;
}

export function denialMessage(reason: string): string {
  switch (reason) {
    case "closed":
      return "The toolkit is not open yet. Please check back soon.";
    case "rate_limited":
      return "Too many access attempts. Please wait a few minutes and try again.";
    case "expired":
      return "Portal access for Formula 2026 has ended.";
    case "revoked":
    case "no_access":
      return "Access for this email has been turned off.";
    default:
      return "We could not match this email to a Formula 2026 registration.";
  }
}

export const PLATFORM_LABEL: Record<PortalPlatform, string> = {
  claude: "Claude",
  codex: "Codex",
};

export const PLATFORM_DETAIL: Record<PortalPlatform, { app: string; masterFile: string; skillsFolder: string; starterFile: string }> = {
  claude: {
    app: "the Claude desktop app (Cowork)",
    masterFile: "CLAUDE.md",
    skillsFolder: ".claude/skills",
    starterFile: "CLAUDE-STARTER.md",
  },
  codex: {
    app: "the Codex app",
    masterFile: "AGENTS.md",
    skillsFolder: ".agents/skills",
    starterFile: "AGENTS-STARTER.md",
  },
};

export const PORTAL_SKILLS = [
  { name: "Agency Quote Conversion", detail: "Quote-detail export → conversion, producer and product participation, the highest-value unbound quotes." },
  { name: "Agency Retention Rescue", detail: "Cancellation audit → payment-rescue, price-conversation and owner-review queues." },
  { name: "Agency Commission Audit", detail: "Policy-level commission exports → reconciliation and exceptions to review against the carrier schedule." },
  { name: "Agency Owner Review", detail: "Business-metrics export → book, retention, loss ratio and mix, with three management questions." },
  { name: "Agency Cross-Sell", detail: "Policy-level exports → provisional monoline and add-item opportunities to verify." },
  { name: "Lead-Vendor ROI", detail: "Vendor spend and lead activity → cost per lead, quote and sale where the data supports it." },
  { name: "Agency Project Builder", detail: "Turns an outcome into one durable project file with owners, milestones and blockers." },
  { name: "Daily Owner Brief", detail: "Every active project → at most three priorities for today and what is overdue or blocked." },
  { name: "Weekly Accountability Review", detail: "Commitments vs. evidence for the week, plus your accountability meeting agenda." },
  { name: "Meeting-to-Execution Capture", detail: "Meeting notes → decisions, action candidates and proposed project updates for your approval." },
] as const;
