import type { ResourcePageContent } from "./types";
import { partnerFor } from "./partners";

// ─────────────────────────────────────────────────────────────
// Business — Making It Rain (The Formula Growth Stack)
//
// The workbook taught a three-stage stack, so the page keeps that shape:
// SOURCE → CREATE → WORK + CONVERT.
// ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "source-opportunity",
    tag: "Source",
    label: "Source opportunity",
    sub: "Acquire insurance shoppers, leads or calls",
  },
  {
    id: "create-opportunity",
    tag: "Create",
    label: "Create your own opportunity",
    sub: "Build demand instead of relying only on purchased leads",
  },
  {
    id: "work-convert",
    tag: "Convert",
    label: "Work + convert the opportunity",
    sub: "Contact · nurture · qualify · follow up · move toward producers",
  },
];

const PARTNERS = [
  partnerFor("standard", {
    helpsWith:
      "Growth strategy, sales systems, producer standards and management rhythm across the opportunity stack.",
    bestFit:
      "Your Domino involves diagnosing where the growth system is breaking and building the operating standard around it.",
    categories: ["source-opportunity", "create-opportunity", "work-convert"],
  }),

  // 01 — Source opportunity
  partnerFor("mediaalpha", {
    helpsWith: "Insurance customer acquisition through a marketplace of shoppers, clicks and calls.",
    bestFit: "Your Domino involves adding inbound volume from consumers already shopping for insurance.",
    categories: ["source-opportunity"],
  }),
  partnerFor("everquote", {
    helpsWith: "Insurance leads, calls and shopper traffic sold directly to agents.",
    bestFit: "Your Domino involves adding a steady source of quotable opportunity.",
    categories: ["source-opportunity"],
  }),
  partnerFor("quotewizard", {
    helpsWith: "Web leads and live transfers sourced from insurance comparison traffic.",
    bestFit: "Your Domino involves opportunity you can turn on, filter and tune by volume.",
    categories: ["source-opportunity"],
  }),
  partnerFor("smartfinancial", {
    helpsWith: "Insurance leads and calls from a consumer quote-comparison marketplace.",
    bestFit: "Your Domino involves buying opportunity that matches a specific appetite or geography.",
    categories: ["source-opportunity"],
  }),
];

export const MAKING_IT_RAIN: ResourcePageContent = {
  sessionId: "making-it-rain",
  seo: {
    title: "Making It Rain Resources | Formula Forum 2026",
    description:
      "The Formula Growth Stack: partners who help insurance agencies source opportunity, create their own demand, and work and convert the opportunities they already have.",
    path: "/resources/making-it-rain",
  },
  hero: {
    eyebrow: "Formula 2026 · Business Resource",
    headlineLines: ["Making", "It Rain"],
    supportLine: "Engineer enough opportunity to keep the sales machine fed.",
    lede: "You picked a Domino in the room. Find the stage of the opportunity system it belongs to, then find the partners built for that stage.",
    metaPills: ["Session 7 · Business", "The Formula Growth Stack"],
    whyThisMattersLabel: "Why this matters",
    whyThisMatters: "Growth isn't luck. It's engineered.",
  },
  decision: {
    microLabel: "The Formula Growth Stack",
    headline: "Source it. Create it. Work + convert it.",
    lede: "Opportunity moves through three stages. Find the stage that is actually broken before you spend another dollar on the other two.",
    filterGroupLabel: "Filter partners by growth stack stage",
    resetLabel: "The Whole Stack",
  },
  categories: CATEGORIES,
  categoryDisplay: "stack",
  partners: PARTNERS,
  partnerList: {
    eyebrow: "Formula Partners · The Growth Stack",
    allHeadline: "The Formula Growth Stack",
  },
  guide: {
    eyebrow: "Decision guide",
    headline: "Not sure where to start?",
    lede: "Match the problem in your workbook to the stage of the stack it belongs to.",
    rows: [
      { problem: "We need more raw opportunity", categoryIds: ["source-opportunity"] },
      { problem: "We are too dependent on buying leads", categoryIds: ["create-opportunity"] },
      {
        problem: "We have leads but producers aren't getting enough conversations",
        categoryIds: ["work-convert"],
      },
      {
        problem: "We don't know whether the problem is volume or execution",
        categoryIds: ["all"],
      },
    ],
  },
  closing: {
    headline: "More leads is not always the answer.",
    body: "Find the stage of the opportunity system that is actually broken — then go build.",
    supporting: "You already chose the Domino. Use the resource to execute it.",
    ctaLabel: "Back to Formula 2026",
    ctaTo: "/",
  },
};
