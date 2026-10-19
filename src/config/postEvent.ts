// Post-event (Formula Forum 2026 is over). Ticket sales are closed; every
// former "buy ticket" entry point now routes here instead of Stripe.

export const REUNION_CALL = {
  // Nov 2, 2026 at 11:00 AM Eastern. DST ends Nov 1, so Eastern is UTC-5.
  startsAtIso: "2026-11-02T11:00:00-05:00",
  // Treat the call as live for an hour before flipping to the "it happened" copy.
  durationMinutes: 60,
  dateLabel: "MON, NOV 2 · 11\u00a0AM\u00a0ET",
  /** Sentence-case date for body copy. */
  dateSentence: "Monday, Nov 2 at 11\u00a0AM Eastern",
  registerUrl: "https://us06web.zoom.us/meeting/register/XEequJmATfmp2V36WUmokg",
} as const;

export const AI_PORTAL_PATH = "/ai-portal";

export type ReunionCallPhase = "upcoming" | "live" | "past";

export const getReunionCallPhase = (now: Date = new Date()): ReunionCallPhase => {
  const start = new Date(REUNION_CALL.startsAtIso).getTime();
  const end = start + REUNION_CALL.durationMinutes * 60 * 1000;
  const t = now.getTime();
  if (t < start) return "upcoming";
  if (t < end) return "live";
  return "past";
};

// Label for every former "buy ticket" button. They all open the post-event
// dialog (PassDialogHost), which routes to the call or the AI portal.
export const getPostEventCtaLabel = (now: Date = new Date()): string =>
  getReunionCallPhase(now) === "past" ? "AI PORTAL" : "NOV 2 CALL";
