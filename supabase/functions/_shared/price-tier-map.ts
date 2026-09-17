/**
 * Stripe amounts (in cents) mapped to the pass they represent.
 *
 * The amount IS the tier: a partner sponsorship is priced per tier, so a
 * $5,000 payment is a Bronze partner no matter how it reached Stripe. This
 * used to be copy-pasted into the webhook and the reconciler, which meant a
 * price change had to be made twice or the two would silently disagree.
 */
export interface PassInfo {
  tier: string;
  passType: string;
}

export const UNKNOWN_PASS: PassInfo = { tier: "unknown", passType: "unknown" };

export const PRICE_TIER_MAP: Record<number, PassInfo> = {
  69700: { tier: "earlyBird", passType: "agencyOwner" },
  39700: { tier: "earlyBird", passType: "team" },
  64700: { tier: "earlyBird", passType: "agencyOwner" },
  34700: { tier: "earlyBird", passType: "team" },
  89700: { tier: "regular", passType: "agencyOwner" },
  59700: { tier: "regular", passType: "team" },
  53800: { tier: "vip", passType: "agencyOwner" },
  35800: { tier: "vip", passType: "team" },
  44800: { tier: "vip", passType: "agencyOwner" },
  29800: { tier: "vip", passType: "team" },
  // An extra seat a partner buys on top of the passes their tier includes.
  // Priced well below a ticket, so it must not be mistaken for one — and it is
  // an attendee pass, not a sponsorship, so its passType is deliberately not
  // "partner": that would add these to the partner totals and let the roster
  // try to match them to a sponsorship.
  20000: { tier: "extraPass", passType: "partnerExtra" },
  1500000: { tier: "platinum", passType: "partner" },
  1000000: { tier: "gold", passType: "partner" },
  750000: { tier: "silver", passType: "partner" },
  500000: { tier: "bronze", passType: "partner" },
};

export const passForAmount = (amountInCents: number): PassInfo | null =>
  PRICE_TIER_MAP[amountInCents] ?? null;

/**
 * Partner sponsorships are frequently invoiced and paid by check rather than
 * bought through Checkout, so an invoice total has to resolve to a tier on its
 * own. Only partner prices are matched here: an arbitrary invoice that happens
 * to equal a ticket price should not silently become an attendee registration.
 */
export const partnerPassForAmount = (amountInCents: number): PassInfo | null => {
  const info = PRICE_TIER_MAP[amountInCents];
  return info?.passType === "partner" ? info : null;
};
