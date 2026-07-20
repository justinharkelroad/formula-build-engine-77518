// Pure aggregation for the admin-stats endpoint. No I/O, no Deno globals — so
// it can be unit-tested directly without booting the server.
//
// SOURCE OF TRUTH: src/pages/AdminSales.tsx (lines 109-140). Every aggregation
// here mirrors that file so the JSON matches the dashboard tile-for-tile. If
// the dashboard math changes, change it here too — they are a lockstep pair.

// Mirrors CONFIG.SEAT_CAP in src/config/event.ts.
export const SEAT_CAP = 300;
// Mirrors CONFIG.START_DATETIME_ISO in src/config/event.ts.
export const EVENT_DATE = "2026-10-14";

// Mirrors PARTNER_TIERS in src/config/partners.ts. `price` is the list price in
// dollars; `passes` is the seat allotment bundled with the tier. Keys are the
// lowercase values actually stored in purchases.tier.
export const PARTNER_TIERS = {
  platinum: { label: "Platinum", price: 15000, passes: 8 },
  gold: { label: "Gold", price: 10000, passes: 6 },
  silver: { label: "Silver", price: 7500, passes: 4 },
  bronze: { label: "Bronze", price: 5000, passes: 2 },
} as const;

type TierKey = keyof typeof PARTNER_TIERS;
const TIER_ORDER: TierKey[] = ["platinum", "gold", "silver", "bronze"];

export interface PurchaseRow {
  amount: number | null;
  pass_type: string | null;
  tier: string | null;
  quantity: number | null;
}

export interface ProfileRow {
  tier: string | null;
  onboarding_completed: boolean | null;
}

export function computeStats(purchases: PurchaseRow[], profiles: ProfileRow[]) {
  // Partner vs attendee is decided by pass_type, NOT by tier membership.
  const attendeePurchases = purchases.filter((p) => p.pass_type !== "partner");
  const partnerPurchases = purchases.filter((p) => p.pass_type === "partner");

  const sumAmount = (rows: PurchaseRow[]) =>
    rows.reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const sumQuantityWhere = (passType: string) =>
    purchases
      .filter((p) => p.pass_type === passType)
      .reduce((sum, p) => sum + (p.quantity ?? 0), 0);

  const totalCents = sumAmount(purchases);
  const attendeeCents = sumAmount(attendeePurchases);
  const partnerCents = sumAmount(partnerPurchases);

  const attendeeTickets = attendeePurchases.reduce((s, p) => s + (p.quantity ?? 0), 0);
  const agencyOwners = sumQuantityWhere("agencyOwner");
  const teamMembers = sumQuantityWhere("team");
  // Surfaced so automation sees the same data-quality signal the dashboard's
  // "Fix N Unknown" button reacts to. Unknown rows are counted by row, not qty.
  const unknownPassTypes = purchases.filter((p) => p.pass_type === "unknown").length;

  // Partner passes occupy seats without being sold as attendee tickets. Seats
  // come from the tier allotment, not from partner_profiles.attendees.
  // Unrecognised tiers contribute 0 rather than silently guessing.
  const partnerPasses = partnerPurchases.reduce(
    (sum, p) => sum + (PARTNER_TIERS[p.tier as TierKey]?.passes ?? 0) * (p.quantity ?? 0),
    0,
  );
  const seatsFilled = attendeeTickets + partnerPasses;

  // Per-tier counts are ROW counts of partner purchases (matches the dashboard
  // tiles). Per-tier revenue is the actual money collected, so the tier lines
  // always sum to partner_revenue even if a deal closed off list price.
  const partners = TIER_ORDER.map((key) => {
    const rows = partnerPurchases.filter((p) => p.tier === key);
    return {
      tier: PARTNER_TIERS[key].label,
      count: rows.length,
      each: PARTNER_TIERS[key].price,
      revenue: Math.round(sumAmount(rows) / 100),
    };
  });

  const partnersOnboarded = profiles.filter((p) => p.onboarding_completed).length;

  return {
    as_of: new Date().toISOString(),
    event_date: EVENT_DATE,
    seats_total: SEAT_CAP,

    total_revenue: Math.round(totalCents / 100),
    attendee_revenue: Math.round(attendeeCents / 100),
    partner_revenue: Math.round(partnerCents / 100),

    attendee_tickets: attendeeTickets,
    agency_owners: agencyOwners,
    team_members: teamMembers,
    unknown_pass_types: unknownPassTypes,

    partner_passes: partnerPasses,
    seats_filled: seatsFilled,
    seats_remaining: SEAT_CAP - seatsFilled,

    // partners_total counts partner PURCHASES (what the tier breakdown sums to).
    // partners_onboarded is out of partner PROFILES — the dashboard's
    // "Partners Onboarded" tile reads onboarded / partner_profiles_total.
    partners_total: partnerPurchases.length,
    partner_profiles_total: profiles.length,
    partners_onboarded: partnersOnboarded,

    partners,
  };
}
