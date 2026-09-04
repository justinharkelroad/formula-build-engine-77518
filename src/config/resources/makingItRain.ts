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
  partnerFor("quote-nerds", {
    helpsWith: "Outbound home and auto insurance leads plus inbound insurance calls sold to agents.",
    bestFit: "Your Domino involves adding quotable opportunity in the lines you actually want to write.",
    categories: ["source-opportunity"],
  }),
  partnerFor("dms", {
    helpsWith: "Performance marketing and consumer acquisition, including insurance leads, calls and clicks.",
    bestFit: "Your Domino involves sourcing opportunity through a media partner instead of building the funnel yourself.",
    categories: ["source-opportunity"],
  }),
  partnerFor("filtered-quotes", {
    helpsWith:
      "Insurance lead generation alongside sales performance support and phone-number spam remediation.",
    bestFit: "Your Domino involves buying opportunity and having a partner help you work it.",
    categories: ["source-opportunity"],
  }),

  // 02 — Create your own opportunity
  partnerFor("goal", {
    helpsWith:
      "A marketing platform for building your own funnels and capturing insurance prospects under your own brand.",
    bestFit: "Your Domino involves generating your own in-market prospects instead of buying them from a marketplace.",
    categories: ["create-opportunity"],
  }),
  partnerFor("search-perfect", {
    helpsWith: "Search engine optimization and organic search visibility for agency websites.",
    bestFit: "Your Domino involves being found by the shoppers already searching for insurance in your market.",
    categories: ["create-opportunity"],
  }),
  partnerFor("melon-local", {
    helpsWith:
      "Local SEO, paid search, social media, review management and live transfer calls for local businesses.",
    bestFit: "Your Domino involves building local demand and a review presence around your agency.",
    categories: ["create-opportunity"],
  }),
  partnerFor("ypc-media", {
    helpsWith:
      "Digital marketing for agencies — SEO, business listings, website design, reputation management and paid advertising.",
    bestFit: "Your Domino involves the marketing surface around your agency: site, listings, reviews and ads.",
    categories: ["create-opportunity"],
  }),
  partnerFor("post-pros", {
    helpsWith: "Direct mail campaigns built for insurance agents, including targeting, creative and fulfillment.",
    bestFit: "Your Domino involves reaching households in your territory through mail rather than digital channels.",
    categories: ["create-opportunity"],
  }),
  partnerFor("smarketingmail", {
    helpsWith:
      "Insurance direct mail with exclusive zip codes, list filters and QR-code landing pages, run by a P&C agent.",
    bestFit: "Your Domino involves owning a mail territory and turning mailed offers into inbound quote requests.",
    categories: ["create-opportunity"],
  }),

  // 03 — Work + convert the opportunity
  partnerFor("ricochet360", {
    helpsWith: "CRM, dialing, lead workflows, automation, follow-up and sales activity visibility.",
    bestFit: "Your Domino involves speed-to-lead and working the opportunity you already bought before it goes cold.",
    categories: ["work-convert"],
  }),
  partnerFor("arbeit", {
    helpsWith: "Calling technology, activity visibility, recorded conversations and outbound sales workflows.",
    bestFit: "Your Domino involves actually reaching the opportunity sitting in your system.",
    categories: ["work-convert"],
  }),
  partnerFor("mav", {
    helpsWith: "Automated lead engagement, follow-up and qualification before opportunities reach the producer.",
    bestFit: "Your Domino involves opportunity going unworked because producers cannot get to all of it.",
    categories: ["work-convert"],
  }),
  partnerFor("leadminer", {
    helpsWith: "Lead nurture, qualification and moving engaged opportunities toward licensed agents.",
    bestFit: "Your Domino involves contact rates and getting purchased opportunity into live conversations.",
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
