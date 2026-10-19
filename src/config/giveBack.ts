/**
 * Formula Forum x Destiny Rescue — the room's giving campaign.
 *
 * GIVE_URL is the exact destination the QR code printed in the 2026 workbook
 * encodes (confirmed by Justin, 2026-09-15). The page and the poster must point
 * at the same Raisely campaign or the totals cannot be attributed back to the
 * room. Change it in one place only.
 *
 * RAISED and TOTAL_RAISED are per-event totals confirmed by Justin on
 * 2026-10-19: $31,000 in 2025 and $21,000+ in 2026, over $52,000 combined.
 * Update both together after each event.
 *
 * STATS are figures reported by Destiny Rescue and reproduced from the workbook
 * spread; they are quoted, not computed. Re-verify against Destiny Rescue's own
 * materials before each event rather than letting them age silently here.
 */
export const DESTINY_RESCUE = {
  GIVE_URL: "https://irescue-us.raiselysite.com/formula-forum",
  ORG_URL: "https://destinyrescue.org",
  RAISED: [
    { year: "2025", amount: "$31,000", place: "Formula Forum 2025" },
    { year: "2026", amount: "$21,000+", place: "Formula Forum 2026, Orlando" },
  ],
  TOTAL_RAISED: "$52,000+",
  EVENT_COUNT_LABEL: "two events",
  STATS: [
    { value: "20,000+", label: "Children and adults rescued since 2001" },
    { value: "900+", label: "Arrests of traffickers and exploiters" },
    { value: "250+", label: "Staff and volunteers rescuing kids and equipping them to stay free" },
  ],
} as const;
