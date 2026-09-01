import type { ResourcePageContent } from "./types";
import { partnerFor } from "./partners";

// ─────────────────────────────────────────────────────────────
// Business — The Operating System
// ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "delegate-create-capacity",
    tag: "Delegate",
    label: "Delegate + create capacity",
    sub: "Ownership · responsibilities · getting work off the owner",
  },
  {
    id: "know-what-team-is-doing",
    tag: "Visibility",
    label: "Know what the team is doing",
    sub: "KPIs · visibility · performance · accountability",
  },
  {
    id: "management-rhythms",
    tag: "Rhythm",
    label: "Build management rhythms",
    sub: "Team leads · accountability · measurement · management",
  },
  {
    id: "knowledge-out-of-head",
    tag: "Document",
    label: "Get knowledge out of the owner's head",
    sub: "Documentation · processes · repeatable operation",
  },
];

const PARTNERS = [
  partnerFor("standard", {
    helpsWith:
      "Operating standards, role ownership, management rhythm and documented ways of working.",
    bestFit:
      "Your Domino involves removing yourself from the center of decisions the team should be making.",
    categories: [
      "delegate-create-capacity",
      "know-what-team-is-doing",
      "management-rhythms",
      "knowledge-out-of-head",
    ],
  }),
  partnerFor("secure-evas", {
    helpsWith:
      "Trained virtual assistants who take on recurring administrative and operational workload.",
    bestFit:
      "Your Domino involves work that only stays with you because nobody else has been handed it.",
    categories: ["delegate-create-capacity", "knowledge-out-of-head"],
  }),
  partnerFor("agency-toolchest", {
    helpsWith: "Agency performance visibility, scoreboards, KPIs and accountability reporting.",
    bestFit: "Your Domino involves seeing what the team is doing without asking each person.",
    categories: ["know-what-team-is-doing", "management-rhythms"],
  }),
  partnerFor("performology", {
    helpsWith: "Employee performance management, goal setting, measurement and review cadence.",
    bestFit:
      "Your Domino involves defining what good looks like for a role and managing against it.",
    categories: ["know-what-team-is-doing", "management-rhythms"],
  }),
  partnerFor("ricochet360", {
    helpsWith: "CRM workflows, activity visibility, automation and repeatable follow-up processes.",
    bestFit:
      "Your Domino involves making day-to-day sales activity visible and turning follow-up into a managed system.",
    categories: ["know-what-team-is-doing", "management-rhythms"],
  }),
  partnerFor("ask-fetch", {
    helpsWith: "AI-assisted carrier matching, risk assessment and underwriting workflows.",
    bestFit:
      "Your Domino involves getting underwriting knowledge out of one person's head and shortening a repeatable quoting process.",
    categories: ["delegate-create-capacity", "knowledge-out-of-head"],
  }),
];

export const OPERATING_SYSTEM: ResourcePageContent = {
  sessionId: "operating-system",
  seo: {
    title: "Operating System Resources | Formula Forum 2026",
    description:
      "Resources from Formula Forum partners to help insurance agency owners delegate, build visibility and management rhythms, and get the operation out of the owner's head.",
    path: "/resources/operating-system",
  },
  hero: {
    eyebrow: "Formula 2026 · Business Resource",
    headlineLines: ["The Operating", "System"],
    supportLine: "Remove the owner from the center.",
    lede: "You picked a Domino in the room. Use this page to find the Formula partners that can help you execute it.",
    metaPills: ["Session 4 · Business"],
    whyThisMattersLabel: "Why this matters",
    whyThisMatters: "A business that depends on you will eventually be limited by you.",
  },
  decision: {
    microLabel: "Your Domino",
    headline: "Start with the decision you already made",
    lede: "Look at the Domino you wrote in your workbook. Which part of the operation still runs through you?",
    filterGroupLabel: "Filter partners by operating problem",
    resetLabel: "All Resources",
  },
  categories: CATEGORIES,
  partners: PARTNERS,
  partnerList: {
    eyebrow: "Formula Partners · The Operating System",
    allHeadline: "All Operating System partners",
  },
  guide: {
    eyebrow: "Decision guide",
    headline: "Not sure where to start?",
    lede: "Match the problem in your workbook to the partners built closest to it.",
    rows: [
      {
        problem: "Owner is still doing too much",
        partnerIds: ["standard", "secure-evas", "ask-fetch"],
      },
      {
        problem: "I don't know if the team is executing",
        partnerIds: ["agency-toolchest", "performology", "standard", "ricochet360"],
      },
      {
        problem: "We need stronger team leads / accountability",
        partnerIds: ["standard", "performology", "agency-toolchest", "ricochet360"],
      },
      {
        problem: "Too much knowledge lives in people's heads",
        partnerIds: ["standard", "secure-evas", "ask-fetch"],
      },
    ],
  },
  closing: {
    headline: "The resource doesn't replace the decision.",
    body: "You already chose the Domino. Use the resource to execute it.",
    supporting: "The business should be able to run the day without you in the room.",
    ctaLabel: "Back to Formula 2026",
    ctaTo: "/",
  },
};
