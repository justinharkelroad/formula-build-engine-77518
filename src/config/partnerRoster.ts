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
  /**
   * Email domains that identify this partner. A purchase row carries only the
   * buyer's address, so the domain is often the only thing tying a payment to
   * a company when no onboarding profile exists yet.
   */
  emailDomains: string[];
  /**
   * People known to represent this partner — the podcast guest from the site
   * config, plus any explicit additions. Sponsorships are often bought on a
   * personal card, so the buyer's name is sometimes the only link back to the
   * company: Agency Toolchest paid from a gmail address under "Todd Mclain".
   */
  contactNames: string[];
  /** Exact buyer addresses that belong to this partner but match nothing else. */
  payerEmails: string[];
  /**
   * A sponsorship Stripe never produced a purchase row for, recorded by hand.
   * The method is stated per partner rather than assumed — these arrive by
   * check, by invoice and by transfer, and the dashboard should not guess.
   * Ignored the moment a real payment is matched, so it cannot double count.
   */
  recordedPayment?: RecordedPayment;
  /**
   * Why no payment is expected. A comped partner is not an unpaid one: there is
   * nothing to chase and nothing to add to revenue, so the dashboard should say
   * so rather than flagging them every time somebody reads it.
   */
  comped?: string;
  /**
   * Whether this partner's tier passes occupy chairs in the room. False for
   * partners who work the floor instead of attending — they still appear on the
   * roster and still owe deliverables, they just do not eat into the seat cap.
   */
  occupiesSeats: boolean;
}

/**
 * Roster partners whose tier passes do NOT consume room capacity, and why.
 *
 * Being a partner and occupying seats are separate facts. A photographer with a
 * booth who works the floor alone holds a Bronze slot on the roster but never
 * sits down, so charging the cap his two passes books chairs nobody uses.
 */
const NO_SEAT_PARTNERS = new Map<string, string>([
  ["Disruptur", "Photographer — works the floor with a booth, attends alone. No passes against the cap."],
]);

/**
 * Alternate names, keyed by the name in the site config. Onboarding forms, the
 * sponsor list and the internal partner list were each typed independently, so
 * "GOAL" on the homepage is "Checkout Goal" internally and "Mav" is "Hire Mav".
 * Matching by alias is deliberate rather than fuzzy: a startsWith/endsWith rule
 * would quietly pair "Mav" with the wrong company the moment a similarly named
 * partner signs. Add a line here when a new spelling shows up.
 */
/**
 * Email domains that do not follow from the partner's website. National General
 * bills through NGIC and its people are on Allstate addresses, so neither
 * matches nationalgeneral.com. Add an entry when a payment arrives from a
 * domain the site URL would never predict.
 */
const PARTNER_EMAIL_DOMAINS: Record<string, string[]> = {
  // National General bills through NGIC, which nationalgeneral.com would never
  // predict. allstate.com is deliberately NOT listed: National General is an
  // Allstate company, but so is Ivantage, whose contact pays from an Allstate
  // address. Claiming the domain here would let whichever partner is reached
  // first take the other's payment.
  "National General": ["ngic.com"],
  // The franchise trades as ServiceMaster Restoration by Royalty and pays from
  // its own domains, neither of which follows from servicemasterrestore.com.
  "ServiceMaster Restore": ["smrbyroyalty.com", "amrbyroyalty.com"],
};

/**
 * The registrable domain of a partner's website — "agents.quotewizard.com"
 * becomes "quotewizard.com" — so a subdomain in the sponsor link still matches
 * company email. Every partner here is on a two-label public suffix (.com, .ca,
 * .ai), so trimming to the last two labels is safe.
 */
/**
 * The podcast guest on a sponsor entry, for the sponsors that have one. The
 * sponsor lists are heterogeneous literals — some entries carry a podcast block
 * and some do not — so this narrows rather than assuming the property exists.
 */
const guestNameOf = (sponsor: unknown): string | null => {
  if (typeof sponsor !== "object" || sponsor === null) return null;
  const podcast = (sponsor as { podcast?: unknown }).podcast;
  if (typeof podcast !== "object" || podcast === null) return null;
  const guestName = (podcast as { guestName?: unknown }).guestName;
  return typeof guestName === "string" ? guestName : null;
};

const registrableDomain = (url: string): string | null => {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    const labels = host.split(".");
    return labels.length > 2 ? labels.slice(-2).join(".") : host;
  } catch {
    return null;
  }
};

/**
 * Buyer email addresses that identify a partner but could never be derived.
 * A sponsorship bought on a personal Gmail has no company domain to match, so
 * the address has to be recorded by hand. Add a line when a payment cannot be
 * traced any other way.
 */
/**
 * Partners we are not billing. They hold their tier's passes and are owed the
 * same deliverables, but contribute nothing to revenue — which is already true
 * of the totals, since those are summed from payments that exist.
 */
const COMPED_PARTNERS: Record<string, string> = {
  "Standard": "Partner arrangement — no invoice raised.",
  "Disruptur": "Comped — event photographer.",
  "LeadMiner": "Comped — no invoice raised.",
};

export interface RecordedPayment {
  amountInCents: number;
  /** ISO date the invoice was settled, where it is known. */
  paidOn?: string;
  /**
   * How it was paid — one word, shown on the roster beside the amount. The
   * dashboard says "invoice" or "check" rather than "recorded", because how the
   * money arrived is the useful part; that we typed it in by hand is not.
   */
  method: string;
}

/**
 * Sponsorships Stripe never recorded as a purchase.
 *
 * Payments settled outside Checkout — by check, by invoice, by transfer — fire
 * events nothing was listening for, so these partners read as unpaid however
 * well the matching works —
 * there is no row to match. The reconciler added in #19 creates those rows
 * properly, but only once its Edge Functions are deployed. Until then this
 * keeps the dashboard honest.
 *
 * Deliberately no payer emails: this file is bundled into the public site.
 *
 * Remove an entry once its real purchase row exists. Leaving it is harmless —
 * a matched payment always wins — but the list should reflect what is actually
 * outstanding.
 */
const RECORDED_PAYMENTS: Record<string, RecordedPayment> = {
  "National General": {
    amountInCents: 500000,
    paidOn: "2026-07-30",
    method: "invoice",
  },
  "NW Preferred Federal Credit Union": {
    amountInCents: 500000,
    paidOn: "2026-07-30",
    method: "invoice",
  },
  "CRC Tapco": {
    amountInCents: 500000,
    method: "invoice",
  },
};

const PARTNER_PAYER_EMAILS: Record<string, string[]> = {
  "Agency Toolchest": ["toddmclain02@gmail.com"],
};

/** Extra representatives beyond the podcast guest already in the site config. */
const PARTNER_CONTACT_NAMES: Record<string, string[]> = {};

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
  "ServiceMaster Restore": [
    "Service Master Restore",
    "ServiceMaster Restoration by Royalty",
  ],
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
/**
 * Sponsors whose logo runs on the public site but who are NOT tracked as
 * partners in the admin: no deliverables to chase, no passes, no seats in the
 * room. The homepage lists are therefore a superset of the roster, and this is
 * the only place that difference is recorded — removing a name here puts them
 * straight back into the partner totals and the seat math.
 */
const LOGO_ONLY_SPONSORS = new Set<string>([
  "AgencyBrain",
]);

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
    if (LOGO_ONLY_SPONSORS.has(sponsor.name)) return [];
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
      contactNames: [
        ...(guestNameOf(sponsor) ? [guestNameOf(sponsor)!] : []),
        ...(PARTNER_CONTACT_NAMES[sponsor.name] ?? []),
      ],
      payerEmails: (PARTNER_PAYER_EMAILS[sponsor.name] ?? []).map(e => e.toLowerCase()),
      recordedPayment: RECORDED_PAYMENTS[sponsor.name],
      comped: COMPED_PARTNERS[sponsor.name],
      emailDomains: [
        ...(registrableDomain(sponsor.linkUrl) ? [registrableDomain(sponsor.linkUrl)!] : []),
        ...(PARTNER_EMAIL_DOMAINS[sponsor.name] ?? []),
      ],
      occupiesSeats: !NO_SEAT_PARTNERS.has(sponsor.name),
      note: NO_SEAT_PARTNERS.get(sponsor.name),
    }];
  });

/** Highest tier first, so the roster groups by tier instead of by config order. */
const TIER_RANK: Record<PartnerTierKey, number> = {
  platinum: 0,
  gold: 1,
  silver: 2,
  bronze: 3,
};

/**
 * Every partner, ordered by tier descending. Within a tier the sponsor lists'
 * own order is preserved, which keeps the roster stable as partners are added.
 */
export const PARTNER_ROSTER: PartnerRosterEntry[] = [
  ...fromSiteConfig(),
  ...OFF_SITE_PARTNERS,
].sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier]);

export const rosterByTier = (): Record<PartnerTierKey, PartnerRosterEntry[]> => {
  const grouped: Record<PartnerTierKey, PartnerRosterEntry[]> = {
    platinum: [], gold: [], silver: [], bronze: [],
  };
  PARTNER_ROSTER.forEach(entry => grouped[entry.tier].push(entry));
  return grouped;
};

/**
 * Partner passes that actually occupy chairs. Partners flagged as working the
 * floor are excluded, so this is the number to subtract from the room cap —
 * not the roster's full pass allocation.
 */
export const rosterPassCount = (): number =>
  PARTNER_ROSTER.reduce(
    (sum, entry) => sum + (entry.occupiesSeats ? PARTNER_TIERS[entry.tier].passes : 0),
    0,
  );

/**
 * Every name a roster entry answers to, normalized — the keys used to join
 * config entries against `partner_profiles.company_name`.
 */
export const rosterLookupKeys = (entry: PartnerRosterEntry): string[] =>
  [entry.name, ...(entry.aliases ?? [])].map(normalizePartnerName);

/** The domain part of an email address, lowercased. */
export const emailDomain = (email: string): string | null => {
  const at = email.lastIndexOf("@");
  return at === -1 ? null : email.slice(at + 1).trim().toLowerCase();
};
