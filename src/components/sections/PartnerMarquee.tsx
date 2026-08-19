import { CONFIG } from "@/config/event";

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
        <div className="flex animate-marquee-slow whitespace-nowrap items-center">
          {items}
          {items}
        </div>
      </div>
    </section>
  );
};

export default PartnerMarquee;
