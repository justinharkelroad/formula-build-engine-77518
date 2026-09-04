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
 * Also unpublished: Platinum partner slot placement, transitions and breaks,
 * the Mirror questions, the 1-5 star scoring standard, the Domino exercise,
 * and workbook page numbers.
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
    outcome: "A sales sequence your producers can run without you in the room.",
    question: "If your top producer quit on Friday, does your sales process walk out the door with them?",
    inTheRoom:
      "We take the sequence out of your best person's head and put it somewhere the whole team can run it. You build the version your producers can execute without you sitting in.",
    bring: "Your top producer, and whoever owns follow-up.",
    targetAreas: 1,
  },
  {
    title: "Growth Through Service",
    track: "BUSINESS",
    build: "TEAM",
    minutes: 60,
    line: "Designing service operations that create retention, capacity and growth.",
    outcome: "A service operation that returns capacity instead of consuming it.",
    question: "Is your service team protecting the book, or just absorbing the complaints?",
    inTheRoom:
      "Service either returns capacity to the agency or quietly eats it. You design the operation that retains, and frees the hours you have been giving away.",
    bring: "Your service lead.",
    targetAreas: 1,
  },
  {
    title: "The Operating System",
    track: "BUSINESS",
    build: "TEAM",
    minutes: 60,
    line: "Removing the owner from the center of the agency.",
    outcome: "The first system that runs without the owner watching it.",
    question: "How many decisions this week could only have been made by you?",
    inTheRoom:
      "The agency that needs you in every decision cannot grow past your calendar. You pull yourself out of the center and put a system in your place.",
    bring: "Your second-in-command.",
    targetAreas: 1,
  },
  {
    title: "Commitment to Training",
    track: "BUSINESS",
    build: "TEAM",
    minutes: 60,
    line: "Turning knowledge into repeatable performance.",
    outcome: "A training cadence with an owner, a measure, and a date.",
    question: "Can you name one thing your team got measurably better at last quarter?",
    inTheRoom:
      "Most agencies buy training and never install it. You leave with a cadence that turns what your team knows into what your team does.",
    bring: "Whoever runs your team meetings.",
    targetAreas: 1,
  },
  {
    title: "Making It Rain",
    track: "BUSINESS",
    build: "TEAM",
    minutes: 60,
    line: "Engineering enough opportunity to keep the sales machine fed.",
    outcome: "An opportunity engine sized to the production you say you want.",
    question: "Is your pipeline sized to the year you are planning, or the year you just had?",
    inTheRoom:
      "A sales machine with nothing feeding it stalls. You engineer enough opportunity to keep the producers you just built actually busy.",
    bring: "Whoever owns your marketing spend.",
    targetAreas: 1,
  },
  {
    title: "The Body Session",
    track: "BODY",
    build: "PERSONAL",
    minutes: 40,
    line: "The physical standard, plus energy and recovery.",
    outcome: "A physical standard you can actually hold under a full calendar.",
    question: "Would your calendar survive a health scare, or would the agency stop when you did?",
    inTheRoom:
      "The physical standard is not a fitness pitch. It is the energy the rest of this build runs on, and whether it holds in your busiest month.",
    bring: "Just you.",
    targetAreas: 2,
  },
  {
    title: "The Balance Session",
    track: "BALANCE",
    build: "PERSONAL",
    minutes: 40,
    line: "The primary relationship, and the people you are responsible to love.",
    outcome: "A commitment at home that survives your busiest quarter.",
    question: "Does the person you are building this for feel like a priority or a leftover?",
    inTheRoom:
      "You name the relationships you are actually responsible to, and set a commitment at home that does not get traded away the next time work gets loud.",
    bring: "Just you. Worked in pairs in the room.",
    targetAreas: 2,
  },
  {
    title: "The Being Session",
    track: "BEING",
    build: "PERSONAL",
    minutes: 40,
    line: "Inner alignment and personal command.",
    outcome: "Clarity on who you are becoming while the business grows.",
    question: "Who are you when the production numbers are not there to answer for you?",
    inTheRoom:
      "The last session of the build. Inner alignment and personal command, so the person running the agency in 2027 is someone you would follow.",
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
