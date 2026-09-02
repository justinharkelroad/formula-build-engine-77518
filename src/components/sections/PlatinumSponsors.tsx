import { CONFIG } from "@/config/event";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import PartnerPodcastModal from "@/components/PartnerPodcastModal";

const PlatinumSponsors = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section
      ref={ref}
      aria-labelledby="platinum-sponsors-heading"
      className="bg-[hsl(0,0%,96%)] px-5 pb-16 pt-20 text-[hsl(0,0%,8%)] md:px-12 md:pb-24 md:pt-28"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid items-end gap-8 border-b border-black/15 pb-10 md:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)] md:pb-12">
          <div className={`reveal-up ${isVisible ? "is-visible" : ""}`}>
            <div className="eyebrow mb-5 text-black">2026 PLATINUM SPONSORS</div>
            <h2
              id="platinum-sponsors-heading"
              className="max-w-4xl text-[clamp(2.75rem,7vw,5.75rem)] font-black leading-[0.92] tracking-[-0.055em] text-balance"
            >
              Thank you to our Platinum sponsors.
            </h2>
          </div>

          <p className={`max-w-md text-base leading-relaxed text-black/65 md:justify-self-end md:text-lg reveal-up delay-1 ${isVisible ? "is-visible" : ""}`}>
            Their partnership helps bring Formula Forum 2026 to Orlando. Visit each sponsor to learn more about their work.
          </p>
        </div>

        <ul className="grid border-l border-black/15 md:grid-cols-2" aria-label="Formula Forum 2026 Platinum sponsors">
          {CONFIG.LOGO_PARTNERS.map((partner, index) => {
            const podcast = "podcast" in partner ? partner.podcast : undefined;
            return (
              <li
                key={partner.name}
                className={`relative border-b border-r border-black/15 reveal-up delay-${index + 1} ${isVisible ? "is-visible" : ""}`}
              >
                <a
                  href={partner.linkUrl}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  aria-label={`Visit ${partner.name} website (opens in a new tab)`}
                  className={`group relative flex min-h-40 items-center justify-center bg-white px-8 py-12 transition-colors duration-300 hover:bg-[hsl(0,0%,98%)] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--secondary))] focus-visible:ring-inset md:min-h-52 md:px-14 ${podcast ? "pb-20 md:pb-20" : ""}`}
                >
                  <span className="absolute left-4 top-4 text-[10px] font-semibold tracking-[0.2em] text-black/35 md:left-5 md:top-5">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="absolute right-4 top-4 text-[10px] font-semibold tracking-[0.16em] text-black/35 transition-colors duration-300 group-hover:text-black md:right-5 md:top-5">
                    VISIT ↗
                  </span>
                  <img
                    src={partner.logoUrl}
                    alt={`${partner.name} logo`}
                    loading="lazy"
                    className="max-h-16 w-full max-w-[28rem] object-contain transition-transform duration-300 ease-out group-hover:scale-[1.025] md:max-h-24"
                  />
                </a>
                {podcast && <PartnerPodcastModal podcast={podcast} />}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default PlatinumSponsors;
