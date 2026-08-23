import type { ResourcePageContent } from "./types";
import { partnerFor } from "./partners";

// ─────────────────────────────────────────────────────────────
// Business — Growth Through Service
// Copy rule: no performance claims. HELPS WITH / BEST FIT IF only.
// ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "create-capacity",
    tag: "Capacity",
    label: "Create capacity",
    sub: "Delegation · workload · ownership · administrative capacity",
  },
  {
    id: "customer-experience",
    tag: "Experience",
    label: "Deliver a better customer experience",
    sub: "Onboarding · handoffs · service experience · recovery after a loss",
  },
  {
    id: "solve-customer-needs",
    tag: "Coverage",
    label: "Solve more customer needs",
    sub: "Market access · specialty solutions · keeping the relationship",
  },
  {
    id: "sales-service-alignment",
    tag: "Alignment",
    label: "Improve sales + service alignment",
    sub: "Ownership · handoff · accountability · team operation",
  },
];

const PARTNERS = [
  partnerFor("standard", {
    helpsWith: "Operating standards, role ownership, service rhythm and team accountability.",
    bestFit: "Your Domino involves who owns what, how service work moves between people, or the standard the team is held to.",
    categories: ["create-capacity", "customer-experience", "sales-service-alignment"],
  }),
  partnerFor("secure-evas", {
    helpsWith: "Trained virtual assistants who take on service, administrative and back-office workload.",
    bestFit: "Your Domino involves moving routine work off licensed staff so capacity opens up.",
    categories: ["create-capacity", "customer-experience", "sales-service-alignment"],
  }),
  partnerFor("servicemaster-restore", {
    helpsWith: "Property restoration and mitigation support for customers after a loss.",
    bestFit: "Your Domino involves the customer experience during a claim, when the relationship is most exposed.",
    categories: ["customer-experience"],
  }),
  partnerFor("national-general", {
    helpsWith: "Personal lines home and auto coverage, part of Allstate.",
    bestFit: "Your Domino involves customers you currently have to turn away.",
    categories: ["solve-customer-needs"],
  }),
  partnerFor("hagerty", {
    helpsWith: "Specialty coverage for classic, collector and enthusiast vehicles.",
    bestFit: "Your Domino involves customers with vehicles your standard markets are not built to write.",
    categories: ["solve-customer-needs"],
  }),
  partnerFor("slide-insurance", {
    helpsWith: "Homeowners coverage in Florida and South Carolina.",
    bestFit: "Your Domino involves property risk your current markets are not writing.",
    categories: ["solve-customer-needs"],
  }),
  partnerFor("crc-tapco", {
    helpsWith: "Wholesale and excess & surplus lines market access for hard-to-place risk.",
    bestFit: "Your Domino involves risk that falls outside your admitted markets.",
    categories: ["solve-customer-needs"],
  }),
];

export const GROWTH_THROUGH_SERVICE: ResourcePageContent = {
  sessionId: "growth-through-service",
  seo: {
    title: "Growth Through Service Resources | Formula Forum 2026",
    description:
      "Resources from Formula Forum partners to help insurance agencies create capacity, improve the customer experience, expand market access and align sales with service.",
    path: "/resources/growth-through-service",
  },
  hero: {
    eyebrow: "Formula 2026 · Business Resource",
    headlineLines: ["Growth Through", "Service"],
    supportLine: "Turn service into retention, capacity and growth.",
    lede: "You identified where service is creating friction or opportunity inside the agency. Start with the problem you chose to solve.",
    metaPills: ["Session 2 · Business"],
    whyThisMattersLabel: "Why this matters",
    whyThisMatters:
      "Great service doesn't just retain customers. It creates capacity, referrals and growth.",
  },
  decision: {
    microLabel: "Your Domino",
    headline: "Start with the decision you already made",
    lede: "Look at the Domino you wrote in your workbook. Which part of the service operation are you actually trying to fix?",
    filterGroupLabel: "Filter partners by service problem",
    resetLabel: "All Resources",
  },
  categories: CATEGORIES,
  partners: PARTNERS,
  partnerList: {
    eyebrow: "Formula Partners · Growth Through Service",
    allHeadline: "All Growth Through Service partners",
  },
  guide: {
    eyebrow: "Decision guide",
    headline: "Not sure where to start?",
    lede: "Match the problem in your workbook to the partners built closest to it.",
    rows: [
      {
        problem: "Too much service work / unclear ownership",
        partnerIds: ["secure-evas", "standard"],
      },
      {
        problem: "Bad sale-to-service handoff",
        partnerIds: ["standard", "secure-evas"],
      },
      {
        problem: "Customer needs something we cannot currently place",
        partnerIds: ["national-general", "hagerty", "slide-insurance", "crc-tapco"],
      },
      {
        problem: "Customer experience after a loss",
        partnerIds: ["servicemaster-restore"],
      },
    ],
  },
  closing: {
    headline: "The resource doesn't replace the decision.",
    body: "You already chose the Domino. Use the resource to execute it.",
    supporting: "Service is the part of the business the customer actually experiences.",
    ctaLabel: "Back to Formula 2026",
    ctaTo: "/",
  },
};
