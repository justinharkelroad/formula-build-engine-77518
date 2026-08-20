import { useEffect, useRef } from "react";
import { CONFIG } from "@/config/event";

// The CSS class ships a fixed 25s loop, which got faster and faster as sponsors
// were added — 27 names scrolled past at ~310px/s, too quick to read. Drive the
// duration off the measured track width instead so the speed stays constant no
// matter how long the roster grows.
const MARQUEE_PX_PER_SECOND = 120;

// Marquee-only abbreviations — the full legal lockups are too long to read at
// scroll speed. Everything else renders straight from the sponsor config.
const MARQUEE_NAMES: Record<string, string> = {
  "Standard": "The Standard",
  "MediaAlpha": "Media Alpha",
  "QuoteWizard by LendingTree": "QuoteWizard",
  "NW Preferred Federal Credit Union": "NW Preferred"
};

const PartnerMarquee = () => {
  // Platinum first, then the rest — same source of truth as the homepage logo walls.
  const partners = [...CONFIG.LOGO_PARTNERS, ...CONFIG.LOGO_SPONSORS].map(
    (partner) => MARQUEE_NAMES[partner.name] ?? partner.name
  );

  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // The track holds two copies and the keyframe travels -50%, so one copy's
    // width is the distance actually covered per loop.
    const setDuration = () => {
      const distance = track.scrollWidth / 2;
      if (distance > 0) {
        track.style.animationDuration = `${Math.round(distance / MARQUEE_PX_PER_SECOND)}s`;
      }
    };

    setDuration();
    // Re-measure once webfonts land, since they change how wide the names are.
    document.fonts?.ready.then(setDuration).catch(() => {});

    window.addEventListener("resize", setDuration);
    return () => window.removeEventListener("resize", setDuration);
  }, [partners.length]);

  const separator = (
    <span className="mx-6 md:mx-10 text-[hsl(var(--secondary))] select-none">◆</span>
  );

  const items = partners.map((name, i) => (
    <span key={i} className="inline-flex items-center">
      <span className="display-bold text-2xl md:text-4xl text-white tracking-tight whitespace-nowrap uppercase">
        {name}
      </span>
      {separator}
    </span>
  ));

  return (
    <section className="bg-black border-t border-b border-white/10 py-14 md:py-20">
      <div className="container mx-auto px-5 md:px-12 mb-8 md:mb-10">
        <div className="eyebrow mb-4">2026 PARTNERS</div>
        <h2 className="text-2xl md:text-4xl font-bold text-white max-w-3xl leading-tight">
          Thank you to the operators and brands building 2026 with us.
        </h2>
      </div>
      <div className="overflow-hidden">
        {/* w-max is load-bearing: the keyframe travels translateX(-50%), and a
            percentage translate resolves against the element's OWN width. As a
            block-level flex row the track was only viewport-wide, so it scrolled
            ~720px and snapped back, stranding most of the roster off-screen.
            Sizing it to its content makes -50% equal exactly one copy of the list. */}
        <div ref={trackRef} className="flex w-max animate-marquee-slow whitespace-nowrap items-center">
          {items}
          {items}
        </div>
      </div>
    </section>
  );
};

export default PartnerMarquee;
