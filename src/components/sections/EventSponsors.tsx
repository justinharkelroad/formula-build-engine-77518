import { CONFIG } from "@/config/event";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import PartnerPodcastModal from "@/components/PartnerPodcastModal";

// Any logo that only exists as white-on-dark artwork gets a dark card rather
// than having its brand colours altered. Empty today — every sponsor currently
// supplies a light-background lockup.
const DARK_TILES: Record<string, string> = {};

// Fitting every logo into one box sizes it by its proportions, so a 9:1 wordmark
// lands far smaller than a squarish one. Instead give each logo the same optical
// AREA: height = sqrt(AREA / aspect), read from the file itself on load so it
// stays correct when a logo is swapped. Capped so tall marks can't blow out the row.
const LOGO_AREA = 11500;
const MAX_LOGO_HEIGHT = 80;
// Equal area on a very wide wordmark (CRC Tapco is 7.45:1) cashes out almost
// entirely as width, so it spans the cell edge-to-edge and reads as oversized
// next to neighbours that sit with margin. Cap the width too.
const MAX_LOGO_WIDTH = 272;

// Equal area still reads unevenly: a hairline pale wordmark like Performology
// covers ~20% of its box in ink where a heavy slab like GOAL covers ~55%, so it
// looks smaller at identical dimensions. Measure how much ink each logo actually
// lays down and give the sparse ones a bounded boost. Square-rooted so a very
// light logo is nudged, not inflated, and never shrunk below the base area.
const TARGET_INK_DENSITY = 0.5;
const MAX_INK_BOOST = 1.5;

const inkDensity = (img: HTMLImageElement): number | null => {
  try {
    const width = 120;
    const height = Math.max(1, Math.round((width * img.naturalHeight) / img.naturalWidth));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, width, height);
    const { data } = ctx.getImageData(0, 0, width, height);
    let ink = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 40) continue;
      const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (luminance < 242) ink += 1;
    }
    return ink / (width * height);
  } catch {
    return null; // a tainted canvas just falls back to plain area sizing
  }
};

const fitByArea = (img: HTMLImageElement) => {
  if (!img.naturalWidth || !img.naturalHeight) return;
  const aspect = img.naturalWidth / img.naturalHeight;

  const density = inkDensity(img);
  const boost = density && density > 0
    ? Math.min(MAX_INK_BOOST, Math.max(1, Math.sqrt(TARGET_INK_DENSITY / density)))
    : 1;

  const height = Math.min(
    MAX_LOGO_HEIGHT,
    MAX_LOGO_WIDTH / aspect,
    Math.round(Math.sqrt((LOGO_AREA * boost) / aspect))
  );
  img.style.maxHeight = `${Math.round(height)}px`;
};

const EventSponsors = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section
      ref={ref}
      aria-labelledby="event-sponsors-heading"
      className="bg-[hsl(0,0%,96%)] px-5 pb-20 pt-4 text-[hsl(0,0%,8%)] md:px-12 md:pb-28 md:pt-6"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid items-end gap-6 pb-8 md:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)] md:pb-10">
          <div className={`reveal-up ${isVisible ? "is-visible" : ""}`}>
            <div className="eyebrow mb-4 text-black">2026 SPONSORS</div>
            <h2
              id="event-sponsors-heading"
              className="max-w-3xl text-[clamp(1.75rem,4vw,3rem)] font-black leading-[0.95] tracking-[-0.045em] text-balance"
            >
              And the brands standing beside them.
            </h2>
          </div>

          <p className={`max-w-md text-sm leading-relaxed text-black/65 md:justify-self-end md:text-base reveal-up delay-1 ${isVisible ? "is-visible" : ""}`}>
            Every one of these companies backs Formula Forum 2026. Click any logo to see what they build for agency owners.
          </p>
        </div>

        <div className="space-y-12">
          {([
            { tier: "Silver", heading: "Silver Sponsor", note: null },
            { tier: "Bronze", heading: "Bronze Sponsors", note: null },
            {
              tier: "Additional",
              heading: "Additional Partner",
              note: "Ask Fetch is included as a participating partner; its 2026 sponsor tier is still to be confirmed.",
            },
          ] as const).map((group) => {
            const sponsors = CONFIG.LOGO_SPONSORS.filter((sponsor) => sponsor.tier === group.tier);
            if (sponsors.length === 0) return null;

            return (
              <section key={group.tier} aria-labelledby={`sponsor-tier-${group.tier.toLowerCase()}`}>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <h3 id={`sponsor-tier-${group.tier.toLowerCase()}`} className="text-sm font-black uppercase tracking-[0.18em] text-black/70">
                    {group.heading}
                  </h3>
                  {group.note && <p className="max-w-2xl text-xs leading-relaxed text-black/55">{group.note}</p>}
                </div>
                <ul className="grid border-l border-t border-black/15 sm:grid-cols-2 lg:grid-cols-3" aria-label={`Formula Forum 2026 ${group.heading.toLowerCase()}`}>
                  {sponsors.map((sponsor, index) => {
                    const tile = DARK_TILES[sponsor.name] ?? "bg-white";
                    const podcast = "podcast" in sponsor ? sponsor.podcast : undefined;
                    const logo = (
                      <img
                        src={sponsor.logoUrl}
                        alt={`${sponsor.name} logo`}
                        loading="lazy"
                        onLoad={(event) => fitByArea(event.currentTarget)}
                        ref={(node) => { if (node?.complete) fitByArea(node); }}
                        style={{ maxHeight: "3.5rem" }}
                        className="max-w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.025]"
                      />
                    );

                    return (
                      <li
                        key={sponsor.name}
                        className={`relative border-b border-r border-black/15 reveal-up delay-${Math.min(Math.floor(index / 3) + 1, 6)} ${isVisible ? "is-visible" : ""}`}
                      >
                        {sponsor.linkUrl ? (
                          <a
                            href={sponsor.linkUrl}
                            target="_blank"
                            rel="sponsored noopener noreferrer"
                            aria-label={`Visit ${sponsor.name} website (opens in a new tab)`}
                            className={`group relative flex h-full min-h-32 items-center justify-center ${tile} px-8 py-10 transition-opacity duration-300 hover:opacity-90 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--secondary))] focus-visible:ring-inset md:min-h-40 md:px-10 ${podcast ? "pb-20 md:pb-20" : ""}`}
                          >
                            <span className="absolute right-4 top-4 text-[10px] font-semibold tracking-[0.16em] text-transparent transition-colors duration-300 group-hover:text-black/45 group-focus-visible:text-black/45 md:right-5 md:top-5">
                              VISIT ↗
                            </span>
                            {logo}
                          </a>
                        ) : (
                          <div className={`group relative flex h-full min-h-32 items-center justify-center ${tile} px-8 py-10 md:min-h-40 md:px-10 ${podcast ? "pb-20 md:pb-20" : ""}`}>
                            {logo}
                          </div>
                        )}
                        {podcast && <PartnerPodcastModal podcast={podcast} />}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EventSponsors;
