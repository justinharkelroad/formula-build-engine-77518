import { Link } from "react-router-dom";
import PartnerHero from "@/components/sections/PartnerHero";
import PartnerLevels from "@/components/sections/PartnerLevels";
import PartnerMarquee from "@/components/sections/PartnerMarquee";
import PartnerVideos from "@/components/sections/PartnerVideos";
import PartnerCTA from "@/components/sections/PartnerCTA";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";

const Partners = () => {
  const title = "Partners & Sponsors | Formula Forum 2026";
  const description = "Formula Forum 2026 partners: Ricochet360, The Standard, and MediaAlpha (Platinum), plus Gold, Silver, and 15+ additional insurance industry sponsors.";
  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} path="/partners" />
      <StructuredData page="general" />
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/">
            <img src="/lovable-uploads/98ddc4b5-a053-48ca-989b-0e1cfae3d8dd.png" alt="Formula Forum 2026" className="h-8" width="120" height="32" fetchPriority="high" />
          </Link>
        </div>
      </header>
      <PartnerHero />
      <PartnerLevels />
      <PartnerMarquee />
      <PartnerVideos />
      <PartnerCTA />
      {/* Mobile padding for sticky CTA */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default Partners;