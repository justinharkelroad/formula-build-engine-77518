/**
 * Formula Forum 2026 x Destiny Rescue — the room's giving campaign.
 *
 * GIVE_URL is the exact destination the QR code printed in the 2026 workbook
 * encodes (confirmed by Justin, 2026-09-15). The page and the poster must point
 * at the same Raisely campaign or the $31,000 scoreboard cannot be attributed
 * back to the room. Change it in one place only.
 *
 * STATS are figures reported by Destiny Rescue and reproduced from the workbook
 * spread; they are quoted, not computed. Re-verify against Destiny Rescue's own
 * materials before each event rather than letting them age silently here.
 */
export const DESTINY_RESCUE = {
  GIVE_URL: "https://irescue-us.raiselysite.com/formula-forum",
  ORG_URL: "https://destinyrescue.org",
  /** Raised by the Formula room in 2025 — the number 2026 is trying to beat. */
  NUMBER_TO_BEAT: "$31,000",
  STATS: [
    { value: "20,000+", label: "Children and adults rescued since 2001" },
    { value: "900+", label: "Arrests of traffickers and exploiters" },
    { value: "250+", label: "Staff and volunteers rescuing kids and equipping them to stay free" },
  ],
} as const;
