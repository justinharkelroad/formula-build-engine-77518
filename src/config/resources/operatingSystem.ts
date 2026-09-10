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

  // Carriers, a wholesaler and one finance-side vendor. None of them delegate work
  // or create visibility, so they carry a single category: their published rules are
  // raw material for a written Agency Bible entry that someone here still has to author.
  partnerFor("national-general", {
    helpsWith:
      "Market placement rules for a carrier whose coverages, discounts and pay plans vary by state.",
    bestFit:
      "Your Domino involves writing down which risks go to which market, instead of asking the one veteran who knows.",
    categories: ["knowledge-out-of-head"],
  }),
  partnerFor("hagerty", {
    helpsWith:
      "Collector-vehicle submission, billing and commission mechanics you can turn into a written standard.",
    bestFit:
      "Your Domino involves a carrier process that only one person on the team knows how to run.",
    categories: ["knowledge-out-of-head"],
  }),
  partnerFor("slide-insurance", {
    helpsWith:
      "Agent platform routing: which system handles which state and product, across Violet and the legacy and commercial platforms.",
    bestFit:
      "Your Domino involves a new hire placing business in the right system without asking anyone.",
    categories: ["knowledge-out-of-head"],
  }),
  partnerFor("crc-tapco", {
    helpsWith:
      "Surplus-lines submission mechanics: who requests the quote, who is allowed to bind, and the binder clock that runs out at twelve days.",
    bestFit:
      "Your Domino involves a deadline that only gets missed because the procedure was never written down.",
    categories: ["knowledge-out-of-head"],
  }),
  partnerFor("elite-travel-hackers", {
    helpsWith:
      "A deliberate card and points strategy for the business spend you are already making. Finance-side policy, not an operating change.",
    bestFit:
      "Your Domino involves deciding which card each recurring expense runs on and why, rather than living with whatever was set up first.",
    categories: ["knowledge-out-of-head"],
  }),
  // Canadian brokerage. Included as a worked example of published agency policy —
  // compensation ranges, contingent commission, privacy, accessibility — not as a
  // vendor an American agency buys from, and no US regulatory equivalence is implied.
  partnerFor("ivantage", {
    helpsWith:
      "A working example of agency policy written down in public: compensation ranges, contingent commission, privacy and accessibility.",
    bestFit:
      "Your Domino involves moving core policy out of your head and into writing you would be comfortable publishing.",
    categories: ["knowledge-out-of-head"],
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
        partnerIds: [
          "standard",
          "secure-evas",
          "ask-fetch",
          "national-general",
          "hagerty",
          "slide-insurance",
          "crc-tapco",
          "ivantage",
        ],
      },
      {
        problem: "Business spend runs on whatever card was set up first",
        partnerIds: ["elite-travel-hackers"],
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
