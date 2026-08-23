import type { ResourcePageContent } from "./types";
import { partnerFor } from "./partners";

// ─────────────────────────────────────────────────────────────
// Execution resource — Fund the Build
//
// Supports the MY 2027 BUSINESS MAP, not one of the eight workbook sessions.
// Deliberately absent from the cross-page session nav for that reason.
//
// Copy rule is stricter here: no rates, no approval odds, no lending claims.
// ─────────────────────────────────────────────────────────────

const PARTNERS = [
  partnerFor("wintrust-agent-finance", {
    helpsWith: "Lending and financing services built specifically for insurance agency owners.",
    bestFit:
      "Your Domino involves an acquisition, a buildout or a hire that needs capital ahead of the revenue it produces.",
    categories: [],
  }),
  partnerFor("nw-preferred", {
    helpsWith: "Credit union banking and lending services for members and their businesses.",
    bestFit:
      "Your Domino involves financing options for the agency or for the owner behind it.",
    categories: [],
  }),
];

export const FUNDING_THE_BUILD: ResourcePageContent = {
  sessionId: "funding-the-build",
  seo: {
    title: "Funding the Build | Formula Forum 2026",
    description:
      "Formula Forum partners who provide financing resources for insurance agencies planning acquisitions, staffing, marketing, technology or working capital.",
    path: "/resources/funding-the-build",
  },
  hero: {
    eyebrow: "Formula 2026 · Execution Resource",
    headlineLines: ["Fund", "The Build"],
    supportLine: "Some Dominos require capital to execute.",
    lede: "You left Formula with decisions around staffing, marketing, technology, acquisitions or growth. These Formula partners specialize in financing resources for insurance agencies.",
    metaPills: ["My 2027 Business Map"],
    whyThisMattersLabel: "Why this matters",
    whyThisMatters: "A plan you cannot fund is still a plan you cannot execute.",
  },
  decision: {
    microLabel: "Your 2027 Business Map",
    headline: "Start with what you decided to build",
    lede: "Look at the build you mapped out. Which part of it needs capital before it can move?",
    topicBlocks: [
      { label: "Agency acquisition", sub: "Buying a book, a location or another agency" },
      { label: "Staffing + growth", sub: "Hiring ahead of revenue · payroll runway" },
      { label: "Marketing + technology", sub: "Lead spend · systems · tooling" },
      { label: "Working capital", sub: "Cash flow · timing gaps · operating runway" },
    ],
  },
  partners: PARTNERS,
  partnerList: {
    eyebrow: "Formula Partners · Funding",
    allHeadline: "Formula financing partners",
  },
  closing: {
    headline: "The resource doesn't replace the decision.",
    body: "You already chose what to build. Use the resource to execute it.",
    supporting: "A funded plan still needs someone to execute it.",
    ctaLabel: "Back to Formula 2026",
    ctaTo: "/",
  },
  disclaimer:
    "Formula Forum does not provide financial, lending or investment advice, and does not originate, broker, endorse or guarantee any financing. Eligibility, terms, rates and approval are determined solely by each lender or financial institution. Contact the partner directly to discuss your situation.",
};
