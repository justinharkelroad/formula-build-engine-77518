/**
 * Formula Forum 2026 — public agenda.
 *
 * PUBLIC-SAFE LAYER ONLY. Source of truth is the internal run of show
 * ("Formula Schedule.pdf", stamped RUN OF SHOW — INTERNAL) and the workbook
 * ("FORMULAv8.pdf", p.5 "Agenda at a Glance").
 *
 * What is deliberately NOT in this file, and must never be added:
 *   - per-session clock times on Thursday / Friday
 *   - Platinum partner slot placement
 *   - transitions, breaks, resets, room-flow timings
 *   - the Mirror questions, the 1-5 star scoring standard, the Domino exercise
 *   - workbook page numbers
 *
 * Session order and titles mirror src/config/resources/library.ts, which drives
 * the eight in-room QR resource pages. Keep the two in sync.
 */

export type Track = "BUSINESS" | "BODY" | "BALANCE" | "BEING";

export interface AgendaDay {
  id: string;
  label: string;
  date: string;
  theme: string;
  window: string | null;
  promise: string;
}

export interface AgendaSession {
  n: number;
  dayId: string;
  title: string;
  track: Track;
  minutes: number;
  line: string;
  outcome: string;
}

export interface AgendaMoment {
  dayId: string;
  title: string;
  note: string;
}

export const EVENT = {
  name: "Formula Forum 26",
  dates: "October 14–16, 2026",
  venue: "JW Marriott Orlando Bonnet Creek",
  headline: "The truth of where you are currently & where you desire to go next.",
  subhead: "Build 2027 in the room.",
  arc: ["TRUTH", "WORK", "DECISIONS", "INTEGRATED PLAN", "CONVERSATION", "DECLARATION"],
  counters: [
    { value: "8", label: "live sessions" },
    { value: "11", label: "target areas" },
    { value: "1", label: "map you leave with" },
  ],
  closingLine: "This is not a notebook. It is the build.",
} as const;

export const DAYS: AgendaDay[] = [
  {
    id: "wed",
    label: "WEDNESDAY",
    date: "October 14",
    theme: "CONNECT",
    window: "4:00 PM – 8:00 PM",
    promise:
      "Check in, meet the room, and start the three days with the people you will build alongside.",
  },
  {
    id: "thu",
    label: "THURSDAY",
    date: "October 15",
    theme: "CONFRONT + BUILD",
    window: "9:00 AM – 6:00 PM",
    promise:
      "Tell the truth about where the agency actually is, then build the five business standards that carry 2027.",
  },
  {
    id: "fri",
    label: "FRIDAY",
    date: "October 16",
    theme: "COMPLETE + DECLARE",
    window: "9:00 AM – 1:00 PM",
    promise:
      "Finish the personal side of the build, assemble both maps, and declare them out loud before you leave.",
  },
];

export const SESSIONS: AgendaSession[] = [
  {
    n: 1,
    dayId: "thu",
    title: "The Sales Sequence",
    track: "BUSINESS",
    minutes: 60,
    line: "Building a producer machine, not becoming a better individual salesperson.",
    outcome: "A sales sequence your producers can run without you in the room.",
  },
  {
    n: 2,
    dayId: "thu",
    title: "Growth Through Service",
    track: "BUSINESS",
    minutes: 60,
    line: "Designing service operations that create retention, capacity and growth.",
    outcome: "A service operation that returns capacity instead of consuming it.",
  },
  {
    n: 3,
    dayId: "thu",
    title: "The Body Session",
    track: "BODY",
    minutes: 40,
    line: "The physical standard, plus energy and recovery.",
    outcome: "A physical standard you can actually hold under a full calendar.",
  },
  {
    n: 4,
    dayId: "thu",
    title: "The Operating System",
    track: "BUSINESS",
    minutes: 60,
    line: "Removing the owner from the center of the agency.",
    outcome: "The first system that runs without the owner watching it.",
  },
  {
    n: 5,
    dayId: "thu",
    title: "Commitment to Training",
    track: "BUSINESS",
    minutes: 60,
    line: "Turning knowledge into repeatable performance.",
    outcome: "A training cadence with an owner, a measure, and a date.",
  },
  {
    n: 6,
    dayId: "fri",
    title: "The Balance Session",
    track: "BALANCE",
    minutes: 40,
    line: "The primary relationship, and the people you are responsible to love.",
    outcome: "A commitment at home that survives your busiest quarter.",
  },
  {
    n: 7,
    dayId: "fri",
    title: "Making It Rain",
    track: "BUSINESS",
    minutes: 60,
    line: "Engineering enough opportunity to keep the sales machine fed.",
    outcome: "An opportunity engine sized to the production you say you want.",
  },
  {
    n: 8,
    dayId: "fri",
    title: "The Being Session",
    track: "BEING",
    minutes: 40,
    line: "Inner alignment and personal command.",
    outcome: "Clarity on who you are becoming while the business grows.",
  },
];

export const MOMENTS: AgendaMoment[] = [
  {
    dayId: "wed",
    title: "Welcome Reception",
    note: "No programming. Arrival, connection, and the room meeting itself.",
  },
  {
    dayId: "thu",
    title: "Garrett J. White",
    note: "Thursday closes on the main stage before the night event.",
  },
  {
    dayId: "thu",
    title: "Formula Thursday Night",
    note: "The evening the room stops working and starts belonging.",
  },
  {
    dayId: "fri",
    title: "Build My 2027 Maps",
    note: "Business and Personal, assembled from everything the week produced.",
  },
  {
    dayId: "fri",
    title: "This Is Where I'm Going",
    note: "The final declaration. Signed in the room, in front of a witness.",
  },
];

/** What stays in the room. Rendered once per day block. */
export const WITHHELD_LINE = "The work itself is done live in the room.";

export const sessionsForDay = (dayId: string) =>
  SESSIONS.filter((s) => s.dayId === dayId);

export const momentsForDay = (dayId: string) =>
  MOMENTS.filter((m) => m.dayId === dayId);
