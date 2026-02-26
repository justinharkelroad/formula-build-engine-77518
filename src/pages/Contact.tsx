import UndefinedNavigation from "@/components/UndefinedNavigation";
import ContactHero from "@/components/sections/ContactHero";
import ContactInfo from "@/components/sections/ContactInfo";
import PixelTester from "@/components/PixelTester";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import CustomCursor from "@/components/CustomCursor";
import { CONFIG } from "@/config/event";

const Contact = () => {
  const title = `Contact ${CONFIG.EVENT_NAME} — National Insurance Agency Conference | ${CONFIG.CITY}, ${CONFIG.STATE}`;
  const description = `Questions about ${CONFIG.EVENT_NAME}? Reach the organizer regarding tickets, partners, and logistics.`;
  return (
    <div className="min-h-screen bg-black">
      <SEO title={title} description={description} path="/contact" />
      <StructuredData page="contact" />
      <CustomCursor />
      <UndefinedNavigation />
      <ContactHero />
      <ContactInfo />
      <div className="container mx-auto px-4">
        <PixelTester />
      </div>
    </div>
  );
};

export default Contact;