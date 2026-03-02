const PartnerMarquee = () => {
  const partners = [
    "Ricochet360", "The Standard", "Media Alpha", "DART Mail",
    "American Integrity", "Performology", "Filtered Quotes", "Wintrust",
    "Embrace Pet Insurance", "Smart Financial", "EOS", "Smarketing",
    "Search Perfect", "Team Hired", "Slide", "Braishfield",
    "Evergreen", "Agency Tool Chest", "Ivantage", "Quote Nerds",
    "TopSphere Media", "Fl Penn / Edison / Ovation", "Cover Desk", "Hagerty"
  ];

  const separator = <span className="mx-6 text-white/30 select-none font-bold">·</span>;

  const items = partners.map((name, index) => (
    <span key={index} className="inline-flex items-center">
      <span className="text-xl font-bold text-white tracking-wide whitespace-nowrap">{name}</span>
      {separator}
    </span>
  ));

  return (
    <section className="py-12 bg-slate-900 border-t border-b border-slate-700">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-white">
          Thank You to Our 2025 Partners
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
