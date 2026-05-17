import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import CustomCursor from "@/components/CustomCursor";
import BoldHeader from "@/components/BoldHeader";
import PassDialogHost from "@/components/PassDialogHost";
import { PassDialogProvider } from "@/contexts/PassDialogContext";
import PartnerHero from "@/components/sections/PartnerHero";
import PartnerLevels from "@/components/sections/PartnerLevels";
import PartnerMarquee from "@/components/sections/PartnerMarquee";
import PartnerVideos from "@/components/sections/PartnerVideos";
import PartnerCTA from "@/components/sections/PartnerCTA";
import GiantTicketFooter from "@/components/sections/GiantTicketFooter";

const Partners = () => {
  const title = "Partner with Formula Forum 2026 | Platinum, Gold, Silver, Bronze";
  const description = "Become a 2026 Formula Forum partner. Four tiers from $5,000 to $15,000 — stage time, 1-on-1 podcast interviews, booth placement, attendee lead lists, and mobile-app exposure.";

  return (
    <PassDialogProvider>
      <div className="min-h-screen bg-black">
        <SEO title={title} description={description} path="/partners" />
        <StructuredData page="general" />
        <CustomCursor />
        <BoldHeader />
        <PassDialogHost />

        <PartnerHero />
        <PartnerLevels />
        <PartnerMarquee />
        <PartnerVideos />
        <PartnerCTA />
        <GiantTicketFooter />
      </div>
    </PassDialogProvider>
  );
};

export default Partners;
