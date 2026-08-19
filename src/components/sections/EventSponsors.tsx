import { CONFIG } from "@/config/event";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

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

const fitByArea = (img: HTMLImageElement) => {
  if (!img.naturalWidth || !img.naturalHeight) return;
  const aspect = img.naturalWidth / img.naturalHeight;
  const height = Math.min(MAX_LOGO_HEIGHT, Math.round(Math.sqrt(LOGO_AREA / aspect)));
  img.style.maxHeight = `${height}px`;
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

        <ul className="grid border-l border-t border-black/15 sm:grid-cols-2 lg:grid-cols-3" aria-label="Formula Forum 2026 sponsors">
          {CONFIG.LOGO_SPONSORS.map((sponsor, index) => {
            const tile = DARK_TILES[sponsor.name] ?? "bg-white";
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
                className={`border-b border-r border-black/15 reveal-up delay-${Math.min(Math.floor(index / 3) + 1, 6)} ${isVisible ? "is-visible" : ""}`}
              >
                {sponsor.linkUrl ? (
                  <a
                    href={sponsor.linkUrl}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    aria-label={`Visit ${sponsor.name} website (opens in a new tab)`}
                    className={`group relative flex min-h-32 items-center justify-center ${tile} px-8 py-10 transition-opacity duration-300 hover:opacity-90 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--secondary))] focus-visible:ring-inset md:min-h-40 md:px-10`}
                  >
                    <span className="absolute right-4 top-4 text-[10px] font-semibold tracking-[0.16em] text-transparent transition-colors duration-300 group-hover:text-black/45 group-focus-visible:text-black/45 md:right-5 md:top-5">
                      VISIT ↗
                    </span>
                    {logo}
                  </a>
                ) : (
                  <div className={`group relative flex min-h-32 items-center justify-center ${tile} px-8 py-10 md:min-h-40 md:px-10`}>
                    {logo}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default EventSponsors;
