import type { BaseResourcePartner } from "./types";

/**
 * One identity per Formula partner — logo, name, external URL.
 *
 * Resource pages describe the SAME company differently depending on the session
 * (what Standard helps with on Body is not what it helps with on Training), so
 * helpsWith / bestFit / categories live in each page's own content file and this
 * registry holds only what never changes. Add a partner here once.
 */
export interface PartnerIdentity {
  id: string;
  name: string;
  logo: string;
  logoAlt: string;
  url: string;
}

const identity = (id: string, name: string, file: string, url: string): PartnerIdentity => ({
  id,
  name,
  logo: file ? `/assets/sponsors/${file}` : "",
  logoAlt: `${name} logo`,
  url,
});

export const PARTNER_REGISTRY = {
  standard: identity("standard", "Standard", "the-standard.png", "https://standardplaybook.com/"),
  "agency-toolchest": identity("agency-toolchest", "Agency Toolchest", "agency-toolchest.png", "https://agencytoolchest.com/"),
  performology: identity("performology", "Performology", "performology.svg", "https://performology.com/"),
  "filtered-quotes": identity("filtered-quotes", "Filtered Quotes", "filtered-quotes.png", "https://buyfiltered.com/"),
  ricochet360: identity("ricochet360", "Ricochet360", "ricochet360.png", "https://ricochet360.com/"),
  "ask-fetch": identity("ask-fetch", "Ask Fetch", "ask-fetch.png", "https://askfetch.com/"),
  arbeit: identity("arbeit", "Arbeit", "arbeit.png", "https://arbeitsoftware.com/"),
  mav: identity("mav", "Mav", "mav.png", "https://hiremav.com/"),
  leadminer: identity("leadminer", "LeadMiner", "leadminer.png", "https://leadminer.ai/"),

  "secure-evas": identity("secure-evas", "SecureEVAs", "secure-evas.png", "https://secureevas.com/"),
  "servicemaster-restore": identity("servicemaster-restore", "ServiceMaster Restore", "servicemaster-restore.svg", "https://www.servicemasterrestore.com/"),
  "national-general": identity("national-general", "National General", "national-general.png", "https://nationalgeneral.com/"),
  hagerty: identity("hagerty", "Hagerty", "hagerty.png", "https://www.hagerty.com/"),
  "slide-insurance": identity("slide-insurance", "Slide Insurance", "slide-insurance.svg", "https://slideinsurance.com/"),
  "crc-tapco": identity("crc-tapco", "CRC Tapco", "crc-tapco.png", "https://www.crctapco.com/"),

  mediaalpha: identity("mediaalpha", "MediaAlpha", "mediaalpha.png", "https://mediaalpha.com/"),
  everquote: identity("everquote", "EverQuote", "everquote.png", "https://www.everquote.com/pro/"),
  quotewizard: identity("quotewizard", "QuoteWizard by LendingTree", "quotewizard.png", "https://agents.quotewizard.com/"),
  smartfinancial: identity("smartfinancial", "SmartFinancial", "smart-financial.png", "https://smartfinancial.com/"),
  "quote-nerds": identity("quote-nerds", "Quote Nerds", "quote-nerds.png", "https://quotenerds.com/"),
  dms: identity("dms", "DMS", "dms.png", "https://digitalmediasolutions.com/"),

  goal: identity("goal", "GOAL", "goal.svg", "https://checkoutgoal.com/"),
  "search-perfect": identity("search-perfect", "Search Perfect", "search-perfect.png", "https://searchperfect.ca/"),
  "melon-local": identity("melon-local", "Melon Local", "melon-local.png", "https://melonlocal.com/"),
  "ypc-media": identity("ypc-media", "YPC Media", "ypc-media.png", "https://www.ypcmedia.com/"),
  "post-pros": identity("post-pros", "Post Pros", "post-pros.svg", "https://postpros.com/insurance"),
  smarketingmail: identity("smarketingmail", "SmarketingMail", "smarketing-mail.png", "https://smarketingmail.com/"),

  "wintrust-agent-finance": identity("wintrust-agent-finance", "Wintrust Agent Finance", "wintrust-agent-finance.png", "https://www.agentfinance.com/"),
  "nw-preferred": identity("nw-preferred", "NW Preferred Federal Credit Union", "nw-preferred.png", "https://nwpreferredfcu.com/"),
  ivantage: identity("ivantage", "Ivantage", "ivantage.png", ""),
} satisfies Record<string, PartnerIdentity>;

export type PartnerId = keyof typeof PARTNER_REGISTRY;

/**
 * Build a page-scoped partner entry: registry identity + this session's framing.
 * Formula resource fields stay undefined until a partner actually supplies one.
 */
export const partnerFor = (
  id: PartnerId,
  copy: {
    helpsWith: string;
    bestFit: string;
    categories: string[];
    formulaResourceTitle?: string;
    formulaResourceDescription?: string;
    formulaResourceUrl?: string;
    formulaResourceType?: string;
    formulaResourceBadge?: string;
  }
): BaseResourcePartner => ({ ...PARTNER_REGISTRY[id], ...copy });
