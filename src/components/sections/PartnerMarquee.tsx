const PartnerMarquee = () => {
  const partners = [
    "The Standard", "Media Alpha", "DART Mail",
    "American Integrity", "Performology", "Filtered Quotes", "Wintrust",
    "Embrace Pet Insurance", "Smart Financial", "EOS", "Smarketing",
    "Search Perfect", "Team Hired", "Slide", "Braishfield",
    "Evergreen", "Agency Tool Chest", "Ivantage", "Quote Nerds",
    "TopSphere Media", "Fl Penn / Edison / Ovation", "Cover Desk", "Hagerty", "Post Pros",
    "Destiny Rescue", "Top Tier Recruiting"
  ];

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
        <div className="eyebrow mb-4">2025 PARTNERS</div>
        <h2 className="text-2xl md:text-4xl font-bold text-white max-w-3xl leading-tight">
          Thank you to the operators and brands who built 2025 with us.
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
