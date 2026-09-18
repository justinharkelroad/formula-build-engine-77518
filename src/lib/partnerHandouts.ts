/**
 * Resolves each partner's CURRENT handout URL from the Partner Hub, at runtime.
 *
 * Partners upload PDFs in the Partner Hub (a different product, on Firebase
 * project `the-formula-forum-2026`). The web portal names every upload
 * `handout_{epochMs}.pdf`, so replacing a handout writes a new object and leaves
 * the old one world-readable. A URL pasted into this repo therefore keeps serving
 * the SUPERSEDED pdf at HTTP 200 forever — it never 404s, so nothing surfaces it.
 *
 * Rather than make a human re-copy URLs, this reads the public `partnerPages`
 * mirror on the client and swaps in whatever that org's current handout is. The
 * reviewed copy — title, description, type — stays in `formulaResources.ts`,
 * because the mirror has no field for any of it.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO: gate on review. A partner who replaces
 * their PDF changes what the button downloads, under a title a human wrote for
 * the previous file. That is the accepted trade for not having to run anything
 * (Justin, 2026-09-18). `bun run formula:handouts:audit` still reports a swap, so
 * the copy can be re-checked — it is now a staleness report, not a broken-link
 * report, because the link can no longer break this way.
 *
 * FAILURE IS SILENT AND SAFE. No network, blocked request, bad shape, empty
 * array, unknown org — every path falls back to the reviewed URL baked into the
 * bundle, which is exactly what shipped before this file existed. The prerendered
 * HTML also carries that URL, so the card is correct before any JS runs.
 */
const MIRROR =
  "https://firestore.googleapis.com/v1/projects/the-formula-forum-2026/databases/(default)/documents/partnerPages" +
  "?pageSize=300&key=AIzaSyCGiXVgvpBXBPFtyebsOz0ycwI4KZ8X3mU";

const TIMEOUT_MS = 4000;

/** orgId -> that org's current handout URLs, tokens stripped, in Hub order. */
export type HandoutsByOrg = ReadonlyMap<string, readonly string[]>;

const EMPTY: HandoutsByOrg = new Map();

/**
 * A download token is per-object and rotates; `partner-handouts/**` is
 * world-readable, so the tokenless form is the stable identity of the file and
 * the only thing worth comparing.
 */
const stripToken = (url: string) => url.replace(/&token=[^&]*/, "");

let inFlight: Promise<HandoutsByOrg> | null = null;

const load = async (): Promise<HandoutsByOrg> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(MIRROR, { signal: controller.signal });
    if (!response.ok) return EMPTY;

    const payload: unknown = await response.json();
    const documents =
      (payload as { documents?: unknown[] } | null)?.documents ?? [];

    const entries = documents.flatMap((doc) => {
      const record = doc as {
        name?: string;
        fields?: { handoutUrls?: { arrayValue?: { values?: { stringValue?: string }[] } } };
      };
      const orgId = record.name?.split("/").pop();
      if (!orgId) return [];

      const urls = (record.fields?.handoutUrls?.arrayValue?.values ?? [])
        .map((value) => value.stringValue)
        .filter((url): url is string => typeof url === "string" && url.length > 0)
        .map(stripToken);

      return urls.length > 0 ? [[orgId, urls] as const] : [];
    });

    return new Map(entries);
  } catch {
    // Offline, blocked, aborted, malformed — the baked-in URLs still work.
    return EMPTY;
  } finally {
    clearTimeout(timer);
  }
};

/** One request per page load, shared by every card on it. */
export const fetchHandoutsByOrg = (): Promise<HandoutsByOrg> => {
  inFlight ??= load();
  return inFlight;
};

/**
 * Pick this partner's current handout.
 *
 * Order matters:
 *   1. The reviewed URL is still one of the org's handouts — nothing changed.
 *   2. It is gone, so the partner replaced it. Take the handout in the SAME
 *      SLOT, which preserves a deliberate choice: ServiceMaster uploaded two and
 *      the agent-facing one was picked on purpose, not the property-owner
 *      brochure. Slot order is the only signal the mirror gives us.
 *   3. Slot is out of range — they uploaded fewer files than before. Fall back to
 *      the first, which is better than showing a card whose button is dead.
 */
export const resolveHandoutUrl = (
  handouts: HandoutsByOrg,
  orgId: string | undefined,
  reviewedUrl: string | undefined,
  slot: number | undefined
): string | undefined => {
  if (!orgId || !reviewedUrl) return reviewedUrl;

  const current = handouts.get(orgId);
  if (!current || current.length === 0) return reviewedUrl;

  if (current.includes(reviewedUrl)) return reviewedUrl;

  const index = typeof slot === "number" && slot >= 0 ? slot : 0;
  return current[index] ?? current[0] ?? reviewedUrl;
};
