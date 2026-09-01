import type { ResourcePageContent } from "./types";
import { partnerFor } from "./partners";

// ─────────────────────────────────────────────────────────────
// Business Session 1 — The Sales Sequence
// Copy rule: no performance claims. HELPS WITH / BEST FIT IF only.
// The attendee decides.
// ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "build-the-sales-system",
    tag: "System",
    label: "Build the sales system",
    sub: "Roles · standards · scoreboards · management",
  },
  {
    id: "coach-hold-the-standard",
    tag: "Coaching",
    label: "Coach + hold the standard",
    sub: "Accountability · call coaching · performance visibility",
  },
  {
    id: "work-opportunity-faster",
    tag: "Speed",
    label: "Work the opportunity faster",
    sub: "Calling · workflows · speed-to-lead · follow-up",
  },
  {
    id: "qualify-nurture",
    tag: "Qualify",
    label: "Qualify + nurture before the producer",
    sub: "Qualification · nurture · protecting producer time",
  },
];

const PARTNERS = [
  partnerFor("standard", {
    helpsWith: "Producer systems, sales management, accountability, coaching and call performance.",
    bestFit: "Your Domino involves producer consistency, sales standards, management rhythm or coaching.",
    categories: ["build-the-sales-system", "coach-hold-the-standard"],
  }),
  partnerFor("agency-toolchest", {
    helpsWith: "Sales performance visibility, scoreboards, accountability and targeted coaching.",
    bestFit: "Your Domino involves knowing whether producers are executing the standard and where coaching is needed.",
    categories: ["build-the-sales-system", "coach-hold-the-standard"],
  }),
  partnerFor("performology", {
    helpsWith: "Employee performance management, goals, measurement and performance accountability.",
    bestFit: "Your Domino involves clearly defining, measuring and managing producer performance.",
    categories: ["build-the-sales-system", "coach-hold-the-standard"],
  }),
  partnerFor("ricochet360", {
    helpsWith: "CRM, calling, lead workflows, automation, follow-up and sales activity visibility.",
    bestFit: "Your Domino involves speed-to-lead, consistent follow-up or a more disciplined producer workflow.",
    categories: ["coach-hold-the-standard", "work-opportunity-faster"],
  }),
  partnerFor("arbeit", {
    helpsWith: "Calling technology, activity visibility, recorded conversations and outbound sales workflows.",
    bestFit: "Your Domino involves producer call activity, follow-up discipline or coaching from real conversations.",
    categories: ["coach-hold-the-standard", "work-opportunity-faster"],
  }),
  partnerFor("mav", {
    helpsWith: "Automated lead engagement, follow-up and qualification before opportunities reach the producer.",
    bestFit: "Your Domino involves producers spending too much time chasing prospects who are not ready to talk.",
    categories: ["work-opportunity-faster", "qualify-nurture"],
  }),
  partnerFor("leadminer", {
    helpsWith: "Lead nurture, qualification and moving engaged opportunities toward licensed agents.",
    bestFit: "Your Domino involves improving contact rates, nurture or getting producers into more qualified conversations.",
    categories: ["work-opportunity-faster", "qualify-nurture"],
  }),
];

export const SALES_SEQUENCE: ResourcePageContent = {
  sessionId: "sales-sequence",
  seo: {
    title: "Formula Sales Sequence Resources | Formula Forum 2026",
    description:
      "Resources from Formula Forum partners to help insurance agencies build stronger producer systems, accountability, follow-up and sales execution.",
    path: "/resources/sales-sequence",
  },
  hero: {
    eyebrow: "Formula 2026 · Business Resource",
    headlineLines: ["The Sales", "Sequence"],
    supportLine: "Build the producer machine.",
    lede: "You picked a Domino in the room. Use this page to find the Formula partners that can help you execute it.",
    metaPills: ["Session 1 · Business"],
    whyThisMattersLabel: "Why this matters",
    whyThisMatters: "A predictable sales system creates predictable growth.",
  },
  decision: {
    microLabel: "Your Domino",
    headline: "Start with the decision you already made",
    lede: "Look at the Domino you wrote in your workbook. What part of the sales machine are you actually trying to fix?",
    filterGroupLabel: "Filter partners by sales problem",
    resetLabel: "All Resources",
  },
  categories: CATEGORIES,
  partners: PARTNERS,
  partnerList: {
    eyebrow: "Formula Partners · Sales Sequence",
    allHeadline: "All Sales Sequence partners",
  },
  guide: {
    eyebrow: "Decision guide",
    headline: "Not sure where to start?",
    lede: "Match the problem in your workbook to the partners built closest to it.",
    rows: [
      {
        problem: "Recruiting / role clarity / sales structure",
        partnerIds: ["standard", "agency-toolchest", "performology"],
      },
      {
        problem: "Accountability / coaching / producer performance",
        partnerIds: ["standard", "agency-toolchest", "performology"],
      },
      {
        problem: "Speed-to-lead / calling / follow-up",
        partnerIds: ["ricochet360", "arbeit", "mav", "leadminer"],
      },
      {
        problem: "Too much producer time spent chasing opportunities",
        partnerIds: ["mav", "leadminer"],
      },
    ],
  },
  closing: {
    headline: "The resource doesn't replace the decision.",
    body: "You already chose the Domino. Pick the resources that help you execute it — then go build.",
    supporting: "You can't lead a year your team can't see.",
    ctaLabel: "Back to Formula 2026",
    ctaTo: "/",
  },
};
