import type { ResourcePageContent } from "./types";
import { partnerFor } from "./partners";

// ─────────────────────────────────────────────────────────────
// Business — Making It Rain (The Formula Growth Stack)
//
// The largest partner ecosystem at Formula. The workbook taught a three-stage
// stack, so the page keeps that shape: SOURCE → CREATE → WORK + CONVERT. The
// unfiltered list stays grouped by stage so the framework survives the volume.
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
  partnerFor("quote-nerds", {
    helpsWith: "Insurance lead generation and marketing support for agents and agencies.",
    bestFit: "Your Domino involves adding another channel of quotable opportunity.",
    categories: ["source-opportunity"],
  }),
  partnerFor("dms", {
    helpsWith: "Performance marketing and consumer acquisition across digital channels.",
    bestFit: "Your Domino involves sourcing insurance shoppers through digital media buying.",
    categories: ["source-opportunity"],
  }),
  partnerFor("filtered-quotes", {
    helpsWith: "Insurance opportunities screened before they reach the agency.",
    bestFit: "Your Domino involves fewer, better-matched opportunities rather than more raw volume.",
    categories: ["source-opportunity"],
  }),

  // 02 — Create your own opportunity
  partnerFor("goal", {
    helpsWith: "Generating your own in-market insurance leads rather than purchasing shared ones.",
    bestFit: "Your Domino involves owning the opportunity you create instead of renting it.",
    categories: ["create-opportunity"],
  }),
  partnerFor("search-perfect", {
    helpsWith: "Search engine optimization and organic search visibility.",
    bestFit: "Your Domino involves being found by people already searching for what you sell.",
    categories: ["create-opportunity"],
  }),
  partnerFor("melon-local", {
    helpsWith: "SEO, paid search, social media, websites and lead generation for insurance agents.",
    bestFit: "Your Domino involves building a marketing presence the agency actually owns.",
    categories: ["create-opportunity"],
  }),
  partnerFor("ypc-media", {
    helpsWith: "Digital marketing built to generate exclusive leads for the business running it.",
    bestFit: "Your Domino involves creating exclusive opportunity rather than competing on shared leads.",
    categories: ["create-opportunity"],
  }),
  partnerFor("post-pros", {
    helpsWith: "Personalized direct mail campaigns designed for insurance agents.",
    bestFit: "Your Domino involves reaching prospects through mail instead of the phone.",
    categories: ["create-opportunity"],
  }),
  partnerFor("smarketingmail", {
    helpsWith: "Insurance direct mail campaigns for agency offers, built by an operating agent.",
    bestFit: "Your Domino involves putting a specific offer in front of a targeted mailing list.",
    categories: ["create-opportunity"],
  }),

  // 03 — Work + convert the opportunity
  partnerFor("ricochet360", {
    helpsWith: "CRM, calling, lead workflows, automation, follow-up and sales activity visibility.",
    bestFit: "Your Domino involves speed-to-lead and what happens in the minutes after an opportunity lands.",
    categories: ["work-convert"],
  }),
  partnerFor("arbeit", {
    helpsWith: "VoIP phone systems, cloud dialing, recorded conversations and outbound workflows.",
    bestFit: "Your Domino involves call volume, follow-up discipline or contact rates.",
    categories: ["work-convert"],
  }),
  partnerFor("mav", {
    helpsWith: "AI SMS engagement that works and qualifies insurance leads before a producer picks up.",
    bestFit: "Your Domino involves producers spending too much time on prospects who are not ready to talk.",
    categories: ["work-convert"],
  }),
  partnerFor("leadminer", {
    helpsWith: "Lead nurture, qualification and moving engaged opportunities toward licensed agents.",
    bestFit: "Your Domino involves contact rates, nurture, or getting producers into qualified conversations.",
    categories: ["work-convert"],
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
  groupByCategoryWhenUnfiltered: true,
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
