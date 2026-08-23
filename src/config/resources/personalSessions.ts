import type { ResourcePageContent } from "./types";
import { partnerFor } from "./partners";

// ─────────────────────────────────────────────────────────────
// Personal — Body, Balance, Being
//
// These pages are deliberately restrained. Standard is the only partner in the
// Formula ecosystem with a legitimate connection to this work, so there are no
// filters: four buttons that all lead to the same card would be theatre. Same
// design language as the Business pages, less machinery.
// ─────────────────────────────────────────────────────────────

const PERSONAL_EYEBROW = "Formula 2026 · Personal Resource";
const DECISION_HEADLINE = "Start with the standard you chose";

export const BODY: ResourcePageContent = {
  sessionId: "body",
  seo: {
    title: "Body Resources | Formula Forum 2026",
    description:
      "Resources for the Formula Forum Body session — raising the physical standard, and building energy and recovery into how you operate.",
    path: "/resources/body",
  },
  hero: {
    eyebrow: PERSONAL_EYEBROW,
    headlineLines: ["The Body", "Session"],
    supportLine: "Raise the physical standard.",
    lede: "You chose a Body Domino in the room. This page points at the work, not at a shopping list.",
    metaPills: ["Session 3 · Body"],
    whyThisMattersLabel: "Why this matters",
    whyThisMatters:
      "Your body determines the energy, focus and longevity you bring to everything else.",
  },
  decision: {
    microLabel: "Your Domino",
    headline: DECISION_HEADLINE,
    lede: "Look at the Body Domino you wrote in your workbook. Which of these two areas does it actually belong to?",
    topicBlocks: [
      {
        label: "The physical standard",
        sub: "Training · nutrition · knowing your numbers",
      },
      {
        label: "Energy + recovery",
        sub: "Sleep · recovery · inputs · listening before it breaks",
      },
    ],
  },
  partners: [
    partnerFor("standard", {
      helpsWith: "Building repeatable standards across Body, Being, Balance and Business.",
      bestFit:
        "Your Body Domino requires more structure, accountability or consistency rather than another burst of motivation.",
      categories: [],
      formulaResourceTitle: "Formula-exclusive Body resource coming soon.",
    }),
  ],
  partnerList: {
    eyebrow: "Formula Partner · The Body Session",
    allHeadline: "The Formula partner closest to this work",
  },
  closing: {
    headline: "The standard only matters if you live it.",
    body: "Return to the recurring action you committed to in the workbook.",
    ctaLabel: "Back to Formula 2026",
    ctaTo: "/",
  },
};

export const BALANCE: ResourcePageContent = {
  sessionId: "balance",
  seo: {
    title: "Balance Resources | Formula Forum 2026",
    description:
      "Resources for the Formula Forum Balance session — making your priorities visible in your behavior to the people you are responsible to love.",
    path: "/resources/balance",
  },
  hero: {
    eyebrow: PERSONAL_EYEBROW,
    headlineLines: ["The Balance", "Session"],
    supportLine: "Make your priorities visible in your behavior.",
    lede: "You chose a Balance Domino in the room. This page points back at it, not at a product.",
    metaPills: ["Session 6 · Balance"],
    whyThisMattersLabel: "Why this matters",
    whyThisMatters:
      "The people you love should experience your priorities, not just hear about them.",
  },
  decision: {
    microLabel: "Your Domino",
    headline: DECISION_HEADLINE,
    lede: "Look at the Balance Domino you wrote in your workbook. Which of these two areas does it actually belong to?",
    topicBlocks: [
      {
        label: "The primary relationship",
        sub: "Seen · chosen · connected",
      },
      {
        label: "The people you're responsible to love",
        sub: "Know their world · presence · prove the priority",
      },
    ],
  },
  partners: [
    partnerFor("standard", {
      helpsWith:
        "Building intentional standards across the Core 4 rather than allowing Business to consume everything else.",
      bestFit:
        "Your Balance Domino requires a repeatable rhythm that makes the people you value visible in your actual calendar and behavior.",
      categories: [],
      formulaResourceTitle: "Formula-exclusive Balance resource coming soon.",
    }),
  ],
  partnerList: {
    eyebrow: "Formula Partner · The Balance Session",
    allHeadline: "The Formula partner closest to this work",
  },
  closing: {
    headline: "The people you say matter most should be able to see it.",
    body: "Return to the commitment you wrote in the workbook — and put it where they can see it.",
    ctaLabel: "Back to Formula 2026",
    ctaTo: "/",
  },
};

export const BEING: ResourcePageContent = {
  sessionId: "being",
  seo: {
    title: "Being Resources | Formula Forum 2026",
    description:
      "Resources for the Formula Forum Being session — inner alignment and personal command for leaders who want to live aligned before leading externally.",
    path: "/resources/being",
  },
  hero: {
    eyebrow: PERSONAL_EYEBROW,
    headlineLines: ["The Being", "Session"],
    supportLine: "Live aligned before you lead externally.",
    lede: "You chose a Being Domino in the room. This page stays close to that work.",
    metaPills: ["Session 8 · Being"],
    whyThisMattersLabel: "Why this matters",
    whyThisMatters:
      "The strongest businesses are built by leaders who are internally aligned before they lead externally.",
  },
  decision: {
    microLabel: "Your Domino",
    headline: DECISION_HEADLINE,
    lede: "Look at the Being Domino you wrote in your workbook. Which of these two areas does it actually belong to?",
    topicBlocks: [
      {
        label: "Inner alignment",
        sub: "Create the space · talk to God · truth over performance",
      },
      {
        label: "Personal command",
        sub: "Know who you are · control the story · live what you say",
      },
    ],
  },
  partners: [
    partnerFor("standard", {
      helpsWith:
        "Applying the Core 4 framework to the standards a leader chooses to live across business and life.",
      bestFit:
        "Your Being Domino requires a repeatable practice that brings you back to truth, alignment and intentional action.",
      categories: [],
      formulaResourceTitle: "Formula-exclusive Being resource coming soon.",
    }),
  ],
  partnerList: {
    eyebrow: "Formula Partner · The Being Session",
    allHeadline: "The Formula partner closest to this work",
  },
  closing: {
    headline: "The work is not to perform alignment. It is to live it.",
    body: "Return to the practice you committed to in the workbook.",
    ctaLabel: "Back to Formula 2026",
    ctaTo: "/",
  },
};
