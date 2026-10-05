import type { PartnerId } from "./partners";

/**
 * Formula resources that partners have actually supplied, keyed by partner.
 *
 * WHERE THESE COME FROM. Partners upload PDFs in the Partner Hub
 * (flow.theformulaforum.com/partnerhub, and the Partner Hub tab in the Formula
 * Forum app). That writes to Firebase project `the-formula-forum-2026` at
 * `partner-handouts/{orgId}/handout_{epochMs}.pdf` and mirrors the download URL
 * onto the public Firestore doc `partnerPages/{orgId}.handoutUrls`.
 *
 * This site has no Firebase client and does not read that at runtime, so the URL
 * is copied here by hand once a reviewer has opened the PDF and confirmed what it
 * is. `bun run formula:handouts:audit` re-checks every entry against the live
 * mirror; run it before a release.
 *
 * TWO TRAPS THE AUDIT EXISTS TO CATCH:
 *   1. Re-uploading a handout writes a NEW timestamped object and leaves the old
 *      one in place, so a stale URL keeps serving the superseded PDF at HTTP 200.
 *      Nothing 404s. Nothing looks broken.
 *   2. `partner-handouts/**` is world-readable in the app's storage.rules, so the
 *      tokenless `?alt=media` form is the stable public URL. Never paste the
 *      `&token=` variant — it is noise here, and it invites someone to treat a
 *      rotated token as the reason a link "broke".
 *
 * An entry here records a reviewed PDF. Identify the reviewer in
 * FORMULA-PARTNER-RESOURCE-READINESS.md at the same time. A partner uploading
 * something is not the Formula team having checked it.
 */
export interface SuppliedFormulaResource {
  /** Partner Hub org id in `the-formula-forum-2026` — the source of `url`. */
  orgId: string;
  /** Panel headline. The PDF's own title, not a pitch for it. */
  title: string;
  /** One sentence on what is actually inside, so the click is informed. */
  description: string;
  /** Tokenless `?alt=media` Firebase Storage URL. */
  url: string;
  /** Rendered as the panel badge — "Field guide", "Sell sheet", "Brochure". */
  type: string;
  /**
   * Which of this org's uploads was reviewed, by position in `handoutUrls`.
   * Used when the partner replaces a handout: the file in the same slot is
   * picked, which preserves a deliberate choice between two uploads.
   */
  slot: number;
  /** ISO date the recorded reviewer opened the PDF and confirmed the copy above. */
  reviewed: string;
}

const STORAGE = "https://firebasestorage.googleapis.com/v0/b/the-formula-forum-2026.firebasestorage.app/o/partner-handouts";

/** Build the public URL for one uploaded handout. */
const handout = (orgId: string, fileName: string) =>
  `${STORAGE}%2F${orgId}%2F${fileName}?alt=media`;

export const PARTNER_FORMULA_RESOURCES = {
  standard: {
    orgId: "CtQVIJNXZK2wrx0zqGrP",
    title: "The Three Buckets Method",
    description:
      "Standard Playbook's field guide for new sales reps — the three buckets that organize a sales day, a five-day morning drill tracker, and a one-day self-audit.",
    url: handout("CtQVIJNXZK2wrx0zqGrP", "handout_1789731341684.pdf"),
    type: "Field guide",
    slot: 0,
    reviewed: "2026-09-18",
  },
  arbeit: {
    orgId: "AOHuQPc10AV5E2pnoCQJ",
    title: "Numberlab — call label monitoring",
    description:
      "Arbeit's sell sheet on seeing how carriers label your outbound numbers on real devices, and getting Spam or Scam labels remediated so calls get answered.",
    url: handout("AOHuQPc10AV5E2pnoCQJ", "handout_1789573646224.pdf"),
    type: "Sell sheet",
    slot: 0,
    reviewed: "2026-09-18",
  },
  leadminer: {
    orgId: "UcaWlrOpL0UW2tGr9w4Q",
    title: "LeadMiner — premium telemarketing services",
    description:
      "LeadMiner's company brochure: an outsourced contact-center team that nurtures and qualifies leads, then warm-transfers them to your licensed agents.",
    url: handout("UcaWlrOpL0UW2tGr9w4Q", "handout_0.pdf"),
    type: "Brochure",
    slot: 0,
    reviewed: "2026-09-18",
  },
  "servicemaster-restore": {
    orgId: "tMe1bdQvDYksewzIqpKP",
    title: "Why agents recommend ServiceMaster Restore",
    description:
      "The agent-facing one-pager on having a restoration referral ready before a loss — IICRC-trained crews, 24/7/365 response, and the claims-satisfaction case for recommending one.",
    // This org uploaded two handouts. The second is a general capabilities
    // tri-fold ("Who we are", 850 locations, service list) aimed at property
    // owners rather than agents; it is recorded in the readiness inventory and
    // deliberately not the one linked from an agent-facing card. `slot: 0` is
    // what keeps that choice after a re-upload.
    url: handout("tMe1bdQvDYksewzIqpKP", "handout_1788976159625.pdf"),
    type: "One-pager",
    slot: 0,
    reviewed: "2026-09-18",
  },
  "nw-preferred": {
    orgId: "w1t9JkRwmDQpKHOp8I1c",
    title: "Why Allstate agents choose NW Preferred",
    description:
      "NW Preferred's agency-lending one-pager — loans to buy an agency or an office, annual review instead of monthly reporting, business debt off personal credit, no prepayment penalties.",
    url: handout("w1t9JkRwmDQpKHOp8I1c", "handout_1789070514281.pdf"),
    type: "One-pager",
    slot: 0,
    reviewed: "2026-09-18",
  },
  "crc-tapco": {
    orgId: "UCNZfpR85rJNc7WkmJlZ",
    title: "Make the Logical Choice and Call CRC Tapco",
    description: "CRC Tapco’s overview of available commercial, personal and specialty lines, with quote and binding contacts.",
    url: handout("UCNZfpR85rJNc7WkmJlZ", "handout_0.pdf"),
    type: "Coverage overview",
    slot: 0,
    reviewed: "2026-10-05",
  },
  "ivantage": {
    orgId: "Z1UnIFrbDYdULetpIIiJ",
    title: "Ivantage Agency Engagement Alignment",
    description: "The U.S. agency engagement territory map and regional leader contacts, dated September 14, 2026.",
    url: handout("Z1UnIFrbDYdULetpIIiJ", "handout_0.pdf"),
    type: "Territory map",
    slot: 0,
    reviewed: "2026-10-05",
  },
  "dms": {
    orgId: "l9q8j1CcbDqYY8yAzkGQ",
    title: "ZipQuote, DMS and ALM",
    description: "A visual overview of the ZipQuote and ALM platforms and their connection to DMS.",
    url: handout("l9q8j1CcbDqYY8yAzkGQ", "handout_0.pdf"),
    type: "Platform overview",
    slot: 0,
    reviewed: "2026-10-05",
  },
  "national-general": {
    orgId: "8ZSVx0v1170uVA24HFTN",
    title: "National General Commercial Vehicle",
    description: "National General’s commercial vehicle brochure, outlining business auto uses, program features and available discounts.",
    url: handout("8ZSVx0v1170uVA24HFTN", "handout_0.pdf"),
    type: "Brochure",
    slot: 0,
    reviewed: "2026-10-05",
  },
  "authority-war": {
    orgId: "1ydxGtgkjb2OAQ2Ozxo4",
    title: "The Formula Personal Brand Audit",
    description: "A worksheet on online presence, content ownership and the next 90 days of your personal brand.",
    url: handout("1ydxGtgkjb2OAQ2Ozxo4", "handout_0.pdf"),
    type: "Worksheet",
    slot: 0,
    reviewed: "2026-10-05",
  },
} satisfies Partial<Record<PartnerId, SuppliedFormulaResource>>;

export type PartnerWithFormulaResource = keyof typeof PARTNER_FORMULA_RESOURCES;
