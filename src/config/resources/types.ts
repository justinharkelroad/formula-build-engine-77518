// Shared shapes for the Formula Workbook digital resource pages (/resources/*).
// Each session page supplies a content module; ResourcePage renders it.
// Sections are optional on purpose — a page with one partner should not be
// forced to show four filters that all lead to the same place.

export interface BaseResourceCategory {
  id: string;
  /** Short chip label — "System" | "Source" | "Capacity" */
  tag: string;
  /** Display label, rendered uppercase */
  label: string;
  /** "Roles · standards · scoreboards · management" */
  sub: string;
}

export interface BaseResourcePartner {
  id: string;
  name: string;
  /** Public path, e.g. "/assets/sponsors/ricochet360.png". Empty string renders the missing-asset state. */
  logo: string;
  logoAlt: string;
  /** External company URL */
  url: string;
  helpsWith: string;
  /** Usually begins "Your Domino involves…" */
  bestFit: string;
  categories: string[];
  formulaResourceTitle?: string;
  formulaResourceDescription?: string;
  formulaResourceUrl?: string;
  /** "checklist" | "scorecard" | "offer" | … */
  formulaResourceType?: string;
  /** Defaults to "Coming soon" */
  formulaResourceBadge?: string;
}

/** One row of the "not sure where to start?" decision guide. */
export interface ProblemMatchRow {
  /** Uppercase problem line, e.g. "SPEED-TO-LEAD / CALLING / FOLLOW-UP" */
  problem: string;
  /** Chips that clear the filter and jump to a partner card. */
  partnerIds?: string[];
  /** Chips that apply a category filter instead. Use "all" to reset. */
  categoryIds?: string[];
}

export interface ResourcePageCopy {
  eyebrow: string;
  /** Rendered as separate lines inside the h1 */
  headlineLines: string[];
  supportLine: string;
  lede: string;
  metaPills: string[];
  whyThisMattersLabel?: string;
  whyThisMatters?: string;
}

/** A named area of the workbook, shown on pages too small to warrant filters. */
export interface ResourceTopicBlock {
  label: string;
  sub: string;
}

export interface ResourcePageContent {
  /** Analytics session id, e.g. "making-it-rain" */
  sessionId: string;
  seo: { title: string; description: string; path: string };
  hero: ResourcePageCopy;

  /** The light "start with the decision you already made" section. */
  decision?: {
    microLabel: string;
    headline: string;
    lede: string;
    filterGroupLabel?: string;
    resetLabel?: string;
    /** Shown instead of filters when the page has too few partners to filter. */
    topicBlocks?: ResourceTopicBlock[];
  };

  /** Omit to render the partner list unfiltered. */
  categories?: BaseResourceCategory[];
  /** "stack" renders the categories as an ordered pathway with connectors. */
  categoryDisplay?: "grid" | "stack";
  /** With many partners, group the unfiltered list under its category headings. */
  groupByCategoryWhenUnfiltered?: boolean;

  partners: BaseResourcePartner[];
  partnerList: { eyebrow: string; allHeadline: string };

  guide?: {
    eyebrow: string;
    headline: string;
    lede: string;
    rows: ProblemMatchRow[];
  };

  closing: {
    headline: string;
    body: string;
    supporting?: string;
    ctaLabel: string;
    /** Internal route — these pages never sell a ticket. */
    ctaTo: string;
  };

  /** Rendered as fine print above the footer (e.g. lending pages). */
  disclaimer?: string;
}
