import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CONFIG } from "@/config/event";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { fitByArea } from "@/lib/sponsorLogoSizing";

// Compact grid logos use the same optical sizing as the full wall, scaled down.
const COMPACT_LOGO_SCALE = 0.62;

/**
 * Homepage partner thank-you, kept short: the Platinum row is always visible,
 * Silver and Bronze sit behind one accordion. The full walls, with partner
 * podcasts, live on /partners.
 */
const HomeSponsors = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const v = isVisible ? "is-visible" : "";
  const supporting = [
    ...CONFIG.LOGO_SPONSORS.filter((s) => s.tier === "Silver"),
    ...CONFIG.LOGO_SPONSORS.filter((s) => s.tier === "Bronze"),
  ];

  return (
    <section
      ref={ref}
      aria-labelledby="home-sponsors-heading"
      className="bg-[hsl(0,0%,96%)] px-5 py-14 text-[hsl(0,0%,8%)] md:px-12 md:py-20"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className={`reveal-up ${v}`}>
            <div className="eyebrow mb-3 text-black">2026 PARTNERS</div>
            <h2
              id="home-sponsors-heading"
              className="text-[clamp(1.75rem,4vw,3rem)] font-black leading-[0.95] tracking-[-0.045em]"
            >
              Thank you to the partners who built the room.
            </h2>
          </div>
          <Link
            to="/partners"
            className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-black/70 transition-colors hover:text-black reveal-up delay-1 ${v}`}
          >
            Meet every partner
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <ul
          className={`mt-8 grid grid-cols-2 border-l border-t border-black/15 md:grid-cols-4 reveal-up delay-2 ${v}`}
          aria-label="Formula Forum 2026 Platinum sponsors"
        >
          {CONFIG.LOGO_PARTNERS.map((partner) => (
            <li key={partner.name} className="border-b border-r border-black/15">
              <a
                href={partner.linkUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                aria-label={`Visit ${partner.name} website (opens in a new tab)`}
                className="group flex h-full min-h-24 items-center justify-center bg-white px-6 py-6 transition-colors hover:bg-[hsl(0,0%,98%)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[hsl(var(--secondary))] md:min-h-32"
              >
                <img
                  src={partner.logoUrl}
                  alt={`${partner.name} logo`}
                  loading="lazy"
                  className="max-h-10 w-full max-w-[12rem] object-contain transition-transform duration-300 group-hover:scale-[1.03] md:max-h-14"
                />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-black/45">Platinum sponsors</p>

        <Accordion type="single" collapsible className={`mt-6 reveal-up delay-3 ${v}`}>
          <AccordionItem value="supporting" className="border-b border-t border-black/15">
            <AccordionTrigger className="py-5 text-left text-base font-black hover:no-underline md:text-lg">
              Silver &amp; Bronze sponsors · {supporting.length}
            </AccordionTrigger>
            <AccordionContent>
              <ul
                className="grid grid-cols-2 border-l border-t border-black/15 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                aria-label="Formula Forum 2026 Silver and Bronze sponsors"
              >
                {supporting.map((sponsor) => {
                  const logo = (
                    <img
                      src={sponsor.logoUrl}
                      alt={`${sponsor.name} logo`}
                      loading="lazy"
                      onLoad={(e) => fitByArea(e.currentTarget, sponsor.name, COMPACT_LOGO_SCALE)}
                      ref={(node) => {
                        if (node?.complete) fitByArea(node, sponsor.name, COMPACT_LOGO_SCALE);
                      }}
                      style={{ maxHeight: "2.25rem" }}
                      className="max-w-full object-contain"
                    />
                  );
                  const tileClass = "flex h-full min-h-20 items-center justify-center bg-white px-4 py-5";
                  return (
                    <li key={sponsor.name} className="border-b border-r border-black/15">
                      {sponsor.linkUrl ? (
                        <a
                          href={sponsor.linkUrl}
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          aria-label={`Visit ${sponsor.name} website (opens in a new tab)`}
                          className={`${tileClass} transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[hsl(var(--secondary))]`}
                        >
                          {logo}
                        </a>
                      ) : (
                        <div className={tileClass}>{logo}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

export default HomeSponsors;
