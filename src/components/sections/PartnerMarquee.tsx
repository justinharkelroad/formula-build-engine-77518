import { CONFIG } from "@/config/event";

const PartnerMarquee = () => {
  const otherPartners = [
    "Smart Financial", "EOS", "Performology", "Smarketing", "Search Perfect",
    "Team Hired", "Slide", "Braishfield", "Evergreen", "Agency Tool Chest",
    "Ivantage", "DART", "Quote Nerds", "American Integrity", "Wintrust",
    "Embrace Per Insurance", "The Standard", "Disruptr", "TopSphere Media",
    "Fl Penn/ Edison / Ovation", "Cover Desk", "Hagerty", "Filtered Leads"
  ];

  return (
    <section className="py-8 bg-muted/30 border-t border-b">
      <div className="container mx-auto px-4">
        {/* Platinum Partners */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-center mb-4 text-foreground">
            Platinum Partners
          </h3>
          <div className="flex justify-center items-center gap-12 py-8">
            {CONFIG.LOGO_PARTNERS.map((partner, index) => (
              <div key={index} className="flex items-center justify-center">
                <a 
                  href={partner.linkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-80"
                >
                   <img 
                     src={partner.logoUrl} 
                     alt={`${partner.name} — ${partner.tier} sponsor of Formula Forum 2025`}
                     className="h-16 w-auto object-contain"
                     loading="lazy"
                     width="120"
                     height="64"
                   />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Gold Partners */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-center mb-4 text-foreground">
            Gold Partners
          </h3>
          <div className="flex justify-center items-center gap-8 py-6">
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/f94b9d73-a968-4821-bf60-e7dc1a5b6651.png" 
                alt="DART Direct Mail — Gold sponsor of Formula Forum 2025"
                className="h-12 w-auto object-contain"
                loading="lazy"
                width="100"
                height="48"
              />
            </div>
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/bc0a2283-299a-48a5-811d-28dbf72e2ff4.png" 
                alt="American Integrity Insurance Group — Gold sponsor of Formula Forum 2025"
                className="h-12 w-auto object-contain"
                loading="lazy"
                width="100"
                height="48"
              />
            </div>
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/ddf4777e-7b38-415c-839a-41a63cee77b6.png" 
                alt="Performology — Gold sponsor of Formula Forum 2025"
                className="h-12 w-auto object-contain"
                loading="lazy"
                width="100"
                height="48"
              />
            </div>
          </div>
        </div>

        {/* Silver Partners */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-center mb-4 text-foreground">
            Silver Partners
          </h3>
          <div className="flex justify-center items-center gap-6 py-4">
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/ac365c28-3a26-45ff-9d31-10668ab9a2a0.png" 
                alt="Filtered Quotes — Silver sponsor of Formula Forum 2025"
                className="h-10 w-auto object-contain"
                loading="lazy"
                width="80"
                height="40"
              />
            </div>
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/a474ceba-29b9-4043-a099-e7d3dafe8c9f.png" 
                alt="Wintrust — Silver sponsor of Formula Forum 2025"
                className="h-10 w-auto object-contain"
                loading="lazy"
                width="80"
                height="40"
              />
            </div>
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/d39ad3b8-1a11-4139-9458-afefcdbe5801.png" 
                alt="Embrace Pet Insurance — Silver sponsor of Formula Forum 2025"
                className="h-10 w-auto object-contain"
                loading="lazy"
                width="80"
                height="40"
              />
            </div>
          </div>
        </div>

        {/* Other Partners */}
        <div>
          <h3 className="text-lg font-semibold text-center mb-4 text-foreground">
            Confirmed Formula³ Partners for 2025
          </h3>
          <div className="overflow-hidden">
            <div className="flex animate-marquee-slow whitespace-nowrap">
              {otherPartners.concat(otherPartners).map((partner, index) => (
                <span
                  key={index}
                  className="mx-6 text-base text-muted-foreground"
                >
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerMarquee;
