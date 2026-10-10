import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import CustomCursor from "@/components/CustomCursor";
import BoldHeader from "@/components/BoldHeader";
import PassDialogHost from "@/components/PassDialogHost";
import { PassDialogProvider } from "@/contexts/PassDialogContext";
import PartnerHero from "@/components/sections/PartnerHero";
import PlatinumSponsors from "@/components/sections/PlatinumSponsors";
import EventSponsors from "@/components/sections/EventSponsors";
import GiantTicketFooter from "@/components/sections/GiantTicketFooter";

const Partners = () => {
  const title = "Thank You to Our 2026 Partners | Formula Forum";
  const description = "Thank you to the partners and sponsors supporting Formula Forum 2026. Meet the companies helping bring our agency community together in Orlando.";

  return (
    <PassDialogProvider>
      <div className="min-h-screen bg-black">
        <SEO title={title} description={description} path="/partners" />
        <StructuredData page="general" />
        <CustomCursor />
        <BoldHeader />
        <PassDialogHost />

        <PartnerHero />
        <PlatinumSponsors />
        <EventSponsors />
        <GiantTicketFooter />
      </div>
    </PassDialogProvider>
  );
};

export default Partners;
