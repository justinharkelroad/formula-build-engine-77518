const PartnerMarquee = () => {
  const logoPartners = [
    { name: "Ricochet360", logoUrl: "/lovable-uploads/29100412-4e6c-4333-b865-192e0fca781e.png", linkUrl: "https://ricochet360.com" },
    { name: "The Standard", logoUrl: "/lovable-uploads/c24dc654-fa2e-440d-adc8-9c19054f856c.png", linkUrl: "https://standardplaybook.com" },
    { name: "MediaAlpha", logoUrl: "/lovable-uploads/6dae2514-00d4-40b4-b301-56e531551ddd.png", linkUrl: "https://mediaalpha.com" },
    { name: "DART", logoUrl: "/lovable-uploads/f94b9d73-a968-4821-bf60-e7dc1a5b6651.png", linkUrl: null },
    { name: "American Integrity", logoUrl: "/lovable-uploads/bc0a2283-299a-48a5-811d-28dbf72e2ff4.png", linkUrl: null },
    { name: "Performology", logoUrl: "/lovable-uploads/ddf4777e-7b38-415c-839a-41a63cee77b6.png", linkUrl: null },
    { name: "Filtered Quotes", logoUrl: "/lovable-uploads/ac365c28-3a26-45ff-9d31-10668ab9a2a0.png", linkUrl: null },
    { name: "Wintrust", logoUrl: "/lovable-uploads/a474ceba-29b9-4043-a099-e7d3dafe8c9f.png", linkUrl: null },
    { name: "Embrace Pet Insurance", logoUrl: "/lovable-uploads/d39ad3b8-1a11-4139-9458-afefcdbe5801.png", linkUrl: null },
  ];

  const textPartners = [
    "Smart Financial", "EOS", "Smarketing", "Search Perfect",
    "Team Hired", "Slide", "Braishfield", "Evergreen", "Agency Tool Chest",
    "Ivantage", "Quote Nerds", "TopSphere Media", "Fl Penn / Edison / Ovation",
    "Cover Desk", "Hagerty"
  ];

  const separator = <span className="mx-6 text-primary font-bold text-2xl select-none">·</span>;

  const marqueeItems = (
    <>
      {logoPartners.map((partner, index) => (
        <span key={`logo-${index}`} className="inline-flex items-center mx-8">
          {partner.linkUrl ? (
            <a href={partner.linkUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img
                src={partner.logoUrl}
                alt={partner.name}
                className="h-12 w-auto object-contain"
                loading="lazy"
                width="120"
                height="48"
              />
            </a>
          ) : (
            <img
              src={partner.logoUrl}
              alt={partner.name}
              className="h-12 w-auto object-contain"
              loading="lazy"
              width="120"
              height="48"
            />
          )}
          {separator}
        </span>
      ))}
      {textPartners.map((name, index) => (
        <span key={`text-${index}`} className="inline-flex items-center mx-8">
          <span className="text-xl font-bold text-foreground tracking-wide whitespace-nowrap">
            {name}
          </span>
          {separator}
        </span>
      ))}
    </>
  );

  return (
    <section className="py-12 bg-muted/30 border-t border-b">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground">
          Thank You to Our 2025 Partners
        </h2>
      </div>
      <div className="overflow-hidden">
        <div className="flex animate-marquee-slow whitespace-nowrap items-center">
          {marqueeItems}
          {marqueeItems}
        </div>
      </div>
    </section>
  );
};

export default PartnerMarquee;
