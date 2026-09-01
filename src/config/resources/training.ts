import type { ResourcePageContent } from "./types";
import { partnerFor } from "./partners";

// ─────────────────────────────────────────────────────────────
// Business — Commitment to Training
// ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "build-training-system",
    tag: "System",
    label: "Build the training system",
    sub: "Onboarding · role training · standards · repetition",
  },
  {
    id: "coach-real-performance",
    tag: "Coaching",
    label: "Coach real performance",
    sub: "Call review · coaching · observation · feedback",
  },
  {
    id: "measure-training",
    tag: "Measure",
    label: "Measure whether training worked",
    sub: "Scoreboards · KPIs · execution · accountability",
  },
  {
    id: "coach-from-conversations",
    tag: "Calls",
    label: "Use real conversations to coach",
    sub: "Calling · recordings · sales activity · call visibility",
  },
];

const PARTNERS = [
  partnerFor("standard", {
    helpsWith:
      "Onboarding structure, role standards, coaching rhythm and repeatable team development.",
    bestFit:
      "Your Domino involves how people are trained, what standard they are trained to, and who holds it.",
    categories: [
      "build-training-system",
      "coach-real-performance",
      "measure-training",
      "coach-from-conversations",
    ],
  }),
];

export const TRAINING: ResourcePageContent = {
  sessionId: "training",
  seo: {
    title: "Training Resources | Formula Forum 2026",
    description:
      "Resources from Formula Forum partners to help insurance agencies build onboarding and role training, coach from real conversations, and measure whether training changed performance.",
    path: "/resources/training",
  },
  hero: {
    eyebrow: "Formula 2026 · Business Resource",
    headlineLines: ["Commitment", "To Training"],
    supportLine: "Turn knowledge into repeatable performance.",
    lede: "You picked a Domino in the room. Use this page to find the Formula partners that can help you execute it.",
    metaPills: ["Session 5 · Business"],
    whyThisMattersLabel: "Why this matters",
    whyThisMatters: "Your team will never outperform the system that develops them.",
  },
  decision: {
    microLabel: "Your Domino",
    headline: "Start with the decision you already made",
    lede: "Look at the Domino you wrote in your workbook. Which part of developing the team are you actually trying to fix?",
    filterGroupLabel: "Filter partners by training problem",
    resetLabel: "All Resources",
  },
  categories: CATEGORIES,
  partners: PARTNERS,
  partnerList: {
    eyebrow: "Formula Partners · Commitment To Training",
    allHeadline: "All Commitment To Training partners",
  },
  guide: {
    eyebrow: "Decision guide",
    headline: "Not sure where to start?",
    lede: "Match the problem in your workbook to the partners built closest to it.",
    rows: [
      {
        problem: "New people take too long to become productive",
        partnerIds: ["standard"],
      },
      {
        problem: "We train but don't verify execution",
        partnerIds: ["standard"],
      },
      {
        problem: "We need better call coaching",
        partnerIds: ["standard"],
      },
      {
        problem: "We need more visibility into performance",
        partnerIds: ["standard"],
      },
    ],
  },
  closing: {
    headline: "The resource doesn't replace the decision.",
    body: "You already chose the Domino. Use the resource to execute it.",
    supporting: "Training that isn't measured is just a meeting.",
    ctaLabel: "Back to Formula 2026",
    ctaTo: "/",
  },
};
