import { CONFIG } from "@/config/event";
import { PARTNER_TIERS, type PartnerTierKey, isPartnerTier } from "@/config/partners";

/**
 * The canonical list of who is a Formula partner — independent of who paid.
 *
 * Two things used to be conflated: the *roster* (who we owe deliverables to and
 * who occupies partner seats) and the *ledger* (who has a Stripe purchase row).
 * The admin page only ever read the ledger, so comped, traded and invoiced
 * partners were invisible there even though their logos were on the homepage.
 * This module rebuilds the roster so both can be compared side by side.
 */

export type PartnerRosterSource = "site" | "off-site";

export interface PartnerRosterEntry {
  name: string;
  tier: PartnerTierKey;
  /** "site" entries render publicly; "off-site" entries are admin-only. */
  source: PartnerRosterSource;
  logoUrl?: string;
  linkUrl?: string;
  /** Why an off-site partner is on the roster without a public logo. */
  note?: string;
  /** Other names this partner is known by, used to match database records. */
  aliases?: string[];
}

/**
 * Alternate names, keyed by the name in the site config. Onboarding forms, the
 * sponsor list and the internal partner list were each typed independently, so
 * "GOAL" on the homepage is "Checkout Goal" internally and "Mav" is "Hire Mav".
 * Matching by alias is deliberate rather than fuzzy: a startsWith/endsWith rule
 * would quietly pair "Mav" with the wrong company the moment a similarly named
 * partner signs. Add a line here when a new spelling shows up.
 */
const SITE_PARTNER_ALIASES: Record<string, string[]> = {
  "Agency Toolchest": ["Agency Tool Chest"],
  "MediaAlpha": ["Media Alpha"],
  "QuoteWizard by LendingTree": ["QuoteWizard", "LendingTree"],
  "Wintrust Agent Finance": ["Wintrust"],
  "Ricochet360": ["Ricochet"],
  "SmarketingMail": ["Smarketing"],
  "SmartFinancial": ["Smart Financial"],
  "Mav": ["Hire Mav"],
  "GOAL": ["Checkout Goal"],
  "NW Preferred Federal Credit Union": ["NW Preferred FCU", "NW Preferred"],
  "DMS": ["DMS Group", "Digital Media Solutions"],
  "LeadMiner": ["Lead Miner"],
  "Arbeit": ["Arbeit Software"],
  "ServiceMaster Restore": ["Service Master Restore"],
  "SecureEVAs": ["Secure EVAs"],
  "Disruptur": ["Disruptor"],
  "AgencyBrain": ["Agency Brain"],
};

/**
 * Partners who are NOT on the public site and have no Stripe purchase — comped,
 * traded, or handshake deals. Adding a name here makes them count everywhere in
 * the admin (tier totals, roster table, pass math) WITHOUT publishing a logo to
 * the homepage. To publish one, move it into CONFIG.LOGO_SPONSORS instead.
 */
export const OFF_SITE_PARTNERS: PartnerRosterEntry[] = [
  // Empty by design. Everyone currently partnered is in CONFIG.LOGO_PARTNERS /
  // CONFIG.LOGO_SPONSORS, including comped ones like Disruptur — being on the
  // homepage is what makes someone a partner, not having paid. Add here only if
  // a partner must count in the admin WITHOUT a public logo.
];

/**
 * Names are matched between the config roster and the database by a squashed
 * form, because the two were typed by different people at different times:
 * "SecureEVAs" in the sponsor list is "Secure EVAs, Inc." in an onboarding form.
 */
export const normalizePartnerName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(inc|llc|ltd|co|corp|company|the)\b/g, "")
    .replace(/[^a-z0-9]/g, "");

const toTierKey = (tier: string): PartnerTierKey | null => {
  const key = tier.toLowerCase();
  return isPartnerTier(key) ? key : null;
};

const fromSiteConfig = (): PartnerRosterEntry[] =>
  [...CONFIG.LOGO_PARTNERS, ...CONFIG.LOGO_SPONSORS].flatMap(sponsor => {
    const tier = toTierKey(sponsor.tier);
    // An unrecognised tier is dropped rather than guessed at — a wrong tier here
    // would silently corrupt the pass count below.
    if (!tier) return [];
    return [{
      name: sponsor.name,
      tier,
      source: "site" as const,
      logoUrl: sponsor.logoUrl,
      linkUrl: sponsor.linkUrl,
      aliases: SITE_PARTNER_ALIASES[sponsor.name],
    }];
  });

/** Every partner, public roster first, then the admin-only additions. */
export const PARTNER_ROSTER: PartnerRosterEntry[] = [
  ...fromSiteConfig(),
  ...OFF_SITE_PARTNERS,
];

export const rosterByTier = (): Record<PartnerTierKey, PartnerRosterEntry[]> => {
  const grouped: Record<PartnerTierKey, PartnerRosterEntry[]> = {
    platinum: [], gold: [], silver: [], bronze: [],
  };
  PARTNER_ROSTER.forEach(entry => grouped[entry.tier].push(entry));
  return grouped;
};

/** Total partner passes owed across the roster — these occupy room capacity. */
export const rosterPassCount = (): number =>
  PARTNER_ROSTER.reduce((sum, entry) => sum + PARTNER_TIERS[entry.tier].passes, 0);

/**
 * Every name a roster entry answers to, normalized — the keys used to join
 * config entries against `partner_profiles.company_name`.
 */
export const rosterLookupKeys = (entry: PartnerRosterEntry): string[] =>
  [entry.name, ...(entry.aliases ?? [])].map(normalizePartnerName);
