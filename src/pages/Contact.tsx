import UndefinedNavigation from "@/components/UndefinedNavigation";
import ContactHero from "@/components/sections/ContactHero";
import ContactInfo from "@/components/sections/ContactInfo";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import CustomCursor from "@/components/CustomCursor";

const Contact = () => {
  const title = "Contact Us | Formula Forum 2026";
  const description = "Contact the Formula Forum team: info@f3florida.com, (260) 515-1349. Questions about tickets, partnerships, group discounts, or event logistics.";
  return (
    <div className="min-h-screen bg-black">
      <SEO title={title} description={description} path="/contact" />
      <StructuredData page="contact" />
      <CustomCursor />
      <UndefinedNavigation />
      <ContactHero />
      <ContactInfo />
    </div>
  );
};

export default Contact;