/**
 * Formula Forum 2026 — public agenda.
 *
 * DESIGN RULE (Justin, 2026-09-04): the eight working sessions are published as a
 * BODY OF WORK, never as a schedule. No day, no time, no room order for any of
 * them. What IS published is the rhythm around them — workouts, meals, vendor
 * time, evening events — so the shape of each day is legible without letting
 * anyone map a session to a slot.
 *
 * Never add to SESSIONS: a day, a time, a sequence number, or anything that
 * implies order. The numbered order lives in src/config/resources/library.ts
 * for the in-room QR pages, and it stays there.
 *
 * COPY RULE (Justin, 2026-09-04): publish the VALUE of what an attendee takes
 * away. Never publish what the session focuses on internally, and never the
 * questions they will be asked. "question" below is a market-truth hook about
 * the reader's own agency — it is NOT a Mirror question and must never become
 * one.
 *
 * Also unpublished: Platinum partner slot placement, transitions and breaks,
 * the Mirror questions, the 1-5 star scoring standard, the Domino exercise,
 * the per-session target areas themselves, and workbook page numbers.
 *
 * Source: workbook FORMULAv8.pdf p.5, plus Justin's confirmed rhythm items.
 */

export type Track = "BUSINESS" | "BODY" | "BALANCE" | "BEING";
export type Build = "TEAM" | "PERSONAL";

export interface AgendaSession {
  title: string;
  track: Track;
  build: Build;
  minutes: number;
  line: string;
  outcome: string;
  /** Teaser hook. The question the session forces you to answer. DRAFT COPY — Justin rewrites. */
  question: string;
  /** What happens, outcome-shaped. Never the mechanics. */
  inTheRoom: string;
  /** Who from the agency should be sitting in it. Drives multi-seat purchases. */
  bring: string;
  /** Workbook target areas: 1 per business session, 2 per personal session = 11. */
  targetAreas: number;
}

export interface AgendaDay {
  id: string;
  label: string;
  date: string;
  theme: string;
  window: string | null;
  promise: string;
}

export interface RhythmItem {
  dayId: string;
  /** null renders as TIME TBA — deliberate, not missing data. */
  time: string | null;
  title: string;
  note?: string;
  /** Marks the generic block that stands in for the working sessions. */
  isWork?: boolean;
}

export const EVENT = {
  name: "Formula Forum 26",
  dates: "October 14–16, 2026",
  venue: "JW Marriott Orlando Bonnet Creek",
  headline: "The truth of where you are currently & where you desire to go next.",
  subhead: "Build 2027 in the room.",
  arc: ["TRUTH", "WORK", "DECISIONS", "INTEGRATED PLAN", "CONVERSATION", "DECLARATION"],
  counters: [
    { value: "8", label: "working sessions" },
    { value: "11", label: "target areas" },
    { value: "1", label: "map you leave with" },
  ],
  closingLine: "This is not a notebook. It is the build.",
} as const;

/** The eight, as a body of work. Grouped by build, never by day. */
export const SESSIONS: AgendaSession[] = [
  {
    title: "The Sales Sequence",
    track: "BUSINESS",
    build: "TEAM",
    minutes: 60,
    line: "Building a producer machine, not becoming a better individual salesperson.",
    outcome: "A sales process the agency owns, instead of one your best person owns.",
    question: "If your top producer quit on Friday, does your sales process walk out the door with them?",
    inTheRoom:
      "Sales stops depending on the one person who happens to be good at it. You leave with the machine itself, not a memory of what used to work.",
    bring: "Your top producer, and whoever owns follow-up.",
    targetAreas: 1,
  },
  {
    title: "Growth Through Service",
    track: "BUSINESS",
    build: "TEAM",
    minutes: 60,
    line: "Designing service operations that create retention, capacity and growth.",
    outcome: "A service team that grows the book on purpose, not one that just keeps it from shrinking.",
    question: "Your sales team is measured on growth. What is your service team measured on?",
    inTheRoom:
      "Service stops being the department that absorbs problems and becomes a second engine that produces growth — held to the same expectation as sales, and built with the same rigor.",
    bring: "Your service lead, and whoever owns retention.",
    targetAreas: 1,
  },
  {
    title: "The Operating System",
    track: "BUSINESS",
    build: "TEAM",
    minutes: 60,
    line: "Removing the owner from the center of the agency.",
    outcome: "An agency that keeps moving on the days you are not in it.",
    question: "How many decisions this week could only have been made by you?",
    inTheRoom:
      "The agency stops routing everything through the owner. You leave having built the first piece of it that runs without you in the loop.",
    bring: "Your second-in-command.",
    targetAreas: 1,
  },
  {
    title: "Commitment to Training",
    track: "BUSINESS",
    build: "TEAM",
    minutes: 60,
    line: "Turning knowledge into repeatable performance.",
    outcome: "A team that improves on a schedule instead of by accident.",
    question: "Can you name one thing your team got measurably better at last quarter?",
    inTheRoom:
      "Training stops being something you buy and becomes something that installs. What your team knows turns into performance you can point at.",
    bring: "Whoever runs your team meetings.",
    targetAreas: 1,
  },
  {
    title: "Making It Rain",
    track: "BUSINESS",
    build: "TEAM",
    minutes: 60,
    line: "Engineering enough opportunity to keep the sales machine fed.",
    outcome: "Enough opportunity in front of your team to make the number you committed to realistic.",
    question: "Is your pipeline sized to the year you are planning, or the year you just had?",
    inTheRoom:
      "Opportunity stops being whatever shows up and becomes something you engineer. The machine you just built gets fed deliberately.",
    bring: "Whoever owns your marketing spend.",
    targetAreas: 1,
  },
  {
    title: "The Body Session",
    track: "BODY",
    build: "PERSONAL",
    minutes: 40,
    line: "The physical standard, plus energy and recovery.",
    outcome: "The physical capacity to actually run the year you are about to declare.",
    question: "Would your calendar survive a health scare, or would the agency stop when you did?",
    inTheRoom:
      "This is the energy the rest of the build runs on. Not a fitness pitch — the standard that still holds in your loudest quarter.",
    bring: "Just you.",
    targetAreas: 2,
  },
  {
    title: "The Balance Session",
    track: "BALANCE",
    build: "PERSONAL",
    minutes: 40,
    line: "The primary relationship, and the people you are responsible to love.",
    outcome: "A home life that stops quietly paying the bill for your growth.",
    question: "Does the person you are building this for feel like a priority or a leftover?",
    inTheRoom:
      "The relationships you are actually responsible to, given the same seriousness you give production numbers.",
    bring: "Just you. Worked in pairs in the room.",
    targetAreas: 2,
  },
  {
    title: "The Being Session",
    track: "BEING",
    build: "PERSONAL",
    minutes: 40,
    line: "Inner alignment and personal command.",
    outcome: "Certainty about who you are becoming, independent of what the business does that year.",
    question: "Who are you when the production numbers are not there to answer for you?",
    inTheRoom:
      "The last session of the build. The person running this agency in 2027 gets built with the same intention as the agency itself.",
    bring: "Just you.",
    targetAreas: 2,
  },
];

export const BUILD_GROUPS: { id: Build; label: string; blurb: string }[] = [
  {
    id: "TEAM",
    label: "Team Build",
    blurb:
      "Five business sessions. What you decide here goes back to the agency and gets an owner, a measure and a cadence.",
  },
  {
    id: "PERSONAL",
    label: "Personal Build",
    blurb:
      "Three sessions — Body, Balance, Being. Six target areas, worked in pairs. Private unless you choose to share it.",
  },
];

export const DAYS: AgendaDay[] = [
  {
    id: "wed",
    label: "WEDNESDAY",
    date: "October 14",
    theme: "CONNECT",
    window: null,
    promise: "Arrive, check in, and meet the room before any work starts.",
  },
  {
    id: "thu",
    label: "THURSDAY",
    date: "October 15",
    theme: "CONFRONT + BUILD",
    window: "9:00 AM – 6:00 PM",
    promise: "The long day. Full programming, vendor time, and the night everyone talks about after.",
  },
  {
    id: "fri",
    label: "FRIDAY",
    date: "October 16",
    theme: "COMPLETE + DECLARE",
    window: "9:00 AM – 1:00 PM",
    promise: "Finish the build, assemble both maps, and declare them out loud before you leave.",
  },
];

/** The published rhythm. Working sessions appear only as an unnamed block. */
export const RHYTHM: RhythmItem[] = [
  { dayId: "wed", time: "4:00 – 6:00 PM", title: "Registration & Check-In" },
  {
    dayId: "wed",
    time: "6:00 – 7:00 PM",
    title: "Poolside Cocktail Hour",
    note: "No programming. Arrival, connection, and the room meeting itself.",
  },

  {
    dayId: "thu",
    time: "6:00 – 6:45 AM",
    title: "Rooftop Workout",
    note: "With Corina. Optional, and the best way to start the day.",
  },
  { dayId: "thu", time: "8:00 – 9:00 AM", title: "Breakfast" },
  {
    dayId: "thu",
    time: null,
    title: "Working Sessions",
    note: "Multiple sessions across the day. Which ones land when is revealed on site.",
    isWork: true,
  },
  { dayId: "thu", time: null, title: "Lunch" },
  {
    dayId: "thu",
    time: null,
    title: "Partner Connect",
    note: "45 minutes inside the vendor room with the partners who build for this industry.",
  },
  { dayId: "thu", time: null, title: "Breathwork", note: "A reset in the middle of the long day." },
  { dayId: "thu", time: null, title: "Garrett J. White", note: "Main stage, closing the day." },
  {
    dayId: "thu",
    time: null,
    title: "Formula Thursday Night",
    note: "The evening the room stops working and starts belonging.",
  },

  {
    dayId: "fri",
    time: "6:00 – 6:45 AM",
    title: "Rooftop Workout",
    note: "With Corina. Second and last chance.",
  },
  { dayId: "fri", time: "8:00 – 9:00 AM", title: "Breakfast" },
  {
    dayId: "fri",
    time: null,
    title: "Working Sessions",
    note: "The rest of the eight. Order stays with the room.",
    isWork: true,
  },
  {
    dayId: "fri",
    time: null,
    title: "Build My 2027 Maps",
    note: "Business and Personal, assembled from everything the week produced.",
  },
  {
    dayId: "fri",
    time: null,
    title: "This Is Where I'm Going",
    note: "The final declaration. Signed in the room, in front of a witness.",
  },
];

export const WITHHELD_LINE =
  "Which session lands on which day is revealed in the room.";

export const sessionsForBuild = (build: Build) => SESSIONS.filter((s) => s.build === build);
export const rhythmForDay = (dayId: string) => RHYTHM.filter((r) => r.dayId === dayId);
