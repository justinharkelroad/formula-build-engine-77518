import Navigation from "@/components/Navigation";
import PartnerHero from "@/components/sections/PartnerHero";
import PartnerLevels from "@/components/sections/PartnerLevels";
import PartnerMarquee from "@/components/sections/PartnerMarquee";
import PartnerVideos from "@/components/sections/PartnerVideos";
import PartnerCTA from "@/components/sections/PartnerCTA";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { CONFIG } from "@/config/event";

const Partners = () => {
  const title = `${CONFIG.EVENT_NAME} Sponsorships — Reach ${CONFIG.SEAT_CAP}+ Insurance Agencies | ${CONFIG.CITY}, ${CONFIG.STATE}`;
  const description = `Sponsor ${CONFIG.EVENT_NAME} to connect with ${CONFIG.SEAT_CAP}+ growth-focused insurance professionals. Packages, branding, 1:1 meetings & lead access.`;
  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} path="/partners" />
      <StructuredData page="general" />
      <Navigation />
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