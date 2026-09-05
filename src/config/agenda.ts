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
 * Also unpublished on the agenda page: Platinum partner slot placement, transitions and breaks,
 * the Mirror questions, the 1-5 star scoring standard, the Domino exercise,
 * the per-session target areas themselves, and workbook page numbers.
 *
 * Source: workbook The Formula Process v7.pdf p.5, plus Justin's confirmed rhythm items.
 *
 * NOTE: "line" no longer matches the workbook p.5 wording verbatim. Those were
 * written as internal contents-page descriptions and several read defensively
 * (Growth Through Service was "retention, capacity and growth", which sells
 * service as protection rather than as a growth engine). Rewritten for the
 * public page, Justin approved 2026-09-04. Do not "restore" them from the PDF.
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
  /** Marks the General Session — the block the eight run inside. */
  isWork?: boolean;
  /** Named moments that happen INSIDE this block, not after it. */
  within?: { title: string; note?: string }[];
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
    line: "Building a producer machine, not a better individual salesperson.",
    outcome: "A sales process the agency owns, instead of one your best person owns.",
    question: "Your best producer has a process. Does anyone else on your team run the same one?",
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
    line: "Turning service into a second growth engine, not a safety net.",
    outcome: "A service team that grows the book on purpose, not one that just keeps it from shrinking.",
    question: "Your sales team is measured on growth. What is your service team measured on?",
    inTheRoom:
      "Service stops absorbing problems and starts producing growth — held to the same standard as sales, and built with the same rigor.",
    bring: "Your service lead, and whoever owns retention.",
    targetAreas: 1,
  },
  {
    title: "The Operating System",
    track: "BUSINESS",
    build: "TEAM",
    minutes: 60,
    line: "Building an agency that runs, instead of one you run.",
    outcome: "An agency that keeps moving on the days you are not in it.",
    question: "Every part of your agency has an owner. How many of them are still you?",
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
    line: "Turning what your team knows into what your team actually does.",
    outcome: "A team that improves on a schedule instead of by accident.",
    question: "You have a process for hiring people. Do you have one for making them better?",
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
    line: "Manufacturing opportunity instead of waiting on it.",
    outcome: "Enough opportunity in front of your team to make the number you committed to realistic.",
    question: "You are about to build a team that can close more. Who is responsible for giving them more to close?",
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
    line: "Treating your capacity as infrastructure, not willpower.",
    outcome: "The physical capacity to actually run the year you are about to declare.",
    question: "Your agency has a plan for the next twelve months. Does your body?",
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
    line: "Giving the people you are doing this for more than what is left over.",
    outcome: "A home life that stops quietly paying the bill for your growth.",
    question: "Your calendar protects your best clients. What protects the people you are doing all this for?",
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
    line: "Building the operator, not just the operation.",
    outcome: "Certainty about who you are becoming, independent of what the business does that year.",
    question: "You came here to build the agency. Who is building the person who has to run it?",
    inTheRoom:
      "The last session of the build. The person running this agency in 2027 gets built with the same intention as the agency itself.",
    bring: "Just you.",
    targetAreas: 2,
  },
];

export const BUILD_GROUPS: { id: Build; label: string; blurb: string }[] = [
  {
    id: "TEAM",
    label: "Build the Agency",
    blurb:
      "Five sessions. What you decide here goes back to the agency and gets an owner, a measure and a cadence.",
  },
  {
    id: "PERSONAL",
    label: "Build the Person",
    blurb:
      "Three sessions — Body, Balance, Being. The half of the build nobody else can do for you. Private unless you choose to share it.",
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
    time: "9:00 AM – 6:00 PM",
    title: "General Session",
    note: "The whole room, together. Which of the eight land when is revealed on site.",
    isWork: true,
    within: [
      { title: "Lunch" },
      {
        title: "Partner Connect",
        note: "45 minutes in the vendor room with the partners who build for this industry.",
      },
      { title: "Breathwork", note: "A reset in the middle of the long day." },
      { title: "Garrett J. White", note: "Main stage, closing the day." },
    ],
  },
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
    time: "9:00 AM – 1:00 PM",
    title: "General Session",
    note: "The whole room again, straight through to the declaration.",
    isWork: true,
    within: [
      {
        title: "Build My 2027 Maps",
        note: "Business and Personal, assembled from everything the week produced.",
      },
      {
        title: "This Is Where I'm Going",
        note: "The final declaration. Signed in the room, in front of a witness.",
      },
    ],
  },
];

/**
 * The three seats, from workbook p.3 "READ FROM YOUR SEAT". The same session is
 * answered differently depending on who is sitting in it, and each seat ends in
 * its own AI breakdown — the last step of both patterns on that page.
 *
 * This is the multi-seat argument: a team member is not there to support the
 * owner, and a partner is not there to watch. Both are doing their own build.
 */
export const SEATS: { role: string; short: string; line: string }[] = [
  {
    role: "Owner",
    short: "answers for the agency.",
    line: "Answers for the whole agency.",
  },
  {
    role: "Team",
    short: "for the role they actually play.",
    line: "Answers from the role they actually play, and the reality they live every day.",
  },
  {
    role: "Partner",
    short: "for their own company.",
    line: "Works the frame on the agencies they serve, then on their own company.",
  },
];

export const SEATS_NOTE =
  "Same frame. Different seat. Each one builds their own 2027 plan.";

/**
 * The AI half of the build (Justin, confirmed 2026-09-04: locked and already
 * built out). Named "Your 2027 Build". Every session's answers compile into it;
 * the attendee has it immediately after the event, connected to their Formula
 * app. The implemented library renders, downloads and copies generated plans;
 * it does not track task completion or provide a shared agency editor.
 *
 * Justin: it lives on the Flow site, but the page must NOT specify that. Say it
 * connects to their app and stop there.
 *
 * DO NOT conflate this with the Agency AI Install Walkthrough / MY BIZ BRAIN
 * bonus gift on the homepage. Justin: "completely different than what we're
 * doing right here." Nothing here may reference that product.
 *
 * Everything in this block is Justin's own description. Do not add mechanism,
 * product names, or delivery details that have not been confirmed.
 */
export const AI_BUILD = {
  eyebrow: "AI IN THE BUILD",
  heading: "YOUR 2027 BUILD",
  lead:
    "Every session feeds the same place. AI builds your 2027 plan with you, in the room, out of your own answers — not a template, and not a notebook you have to transcribe on the flight home.",
  points: [
    {
      title: "Built as you go",
      body: "Each session's work compiles into it, instead of sitting in a book you close at the end of the day.",
    },
    {
      title: "Saved to your private library",
      body: "After your plan is generated, review it in your private library and download or copy it for your own records.",
    },
    {
      title: "Ready for the handoff",
      body: "Take the plan with you. Team members can export or copy business actions to the agency owner without exposing personal session work.",
    },
    {
      title: "One per seat",
      body: "Owner, team member and partner each answer from where they sit and receive their own private plan.",
    },
  ],
  kicker: "You leave with the plan, not the notes.",
} as const;

export const WITHHELD_LINE =
  "Which session lands on which day is revealed in the room.";

export const sessionsForBuild = (build: Build) => SESSIONS.filter((s) => s.build === build);
export const rhythmForDay = (dayId: string) => RHYTHM.filter((r) => r.dayId === dayId);
