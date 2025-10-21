import { CONFIG } from "@/config/event";

const PartnerLogos = () => {
  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Our Partners</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {CONFIG.LOGO_PARTNERS.map((partner, index) => (
            <div key={index} className="flex justify-center items-center">
              <a
                href={partner.linkUrl}
                target="_blank"
                rel="nofollow noopener"
                className="block hover:opacity-80 transition-opacity"
              >
                <img
                  src={partner.logoUrl}
                  alt={`${partner.name} - ${partner.tier} partner`}
                  className="h-16 w-auto object-contain"
                  width="200"
                  height="64"
                  loading="lazy"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerLogos;