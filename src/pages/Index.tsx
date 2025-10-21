import HeroSection from "@/components/sections/HeroSection";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import CustomCursor from "@/components/CustomCursor";
import UndefinedNavigation from "@/components/UndefinedNavigation";
import UndefinedAbout from "@/components/sections/UndefinedAbout";
import ServicesGrid from "@/components/sections/ServicesGrid";
import FeatureSection from "@/components/sections/FeatureSection";
import CTASection from "@/components/sections/CTASection";

const Index = () => {
  const title = "Formula Forum 2026 | Insurance Agency Growth Conference | Orlando Oct 15–17";
  const description = "Insurance Agency Growth Conference in Orlando. Oct 15–17, 2026 at JW Marriott Bonnet Creek. Workshops, breakouts, and a 90-day growth plan.";
  
  return (
    <div className="min-h-screen bg-black">
      <SEO title={title} description={description} path="/" />
      <StructuredData page="home" />
      <CustomCursor />
      <UndefinedNavigation />
      
      <HeroSection />
      <UndefinedAbout />
      <ServicesGrid />
      
      <FeatureSection
        title="JW Marriott Bonnet Creek Resort"
        description="Three days at one of Orlando's premier luxury resorts. World-class meeting spaces, multiple dining options, and resort amenities—all steps from your room."
        imageSrc="/lovable-uploads/e7a76666-bec2-4ea3-bc14-767103436da5.png"
        imageAlt="JW Marriott Bonnet Creek Resort"
        reverse={false}
      />
      
      <FeatureSection
        title="Intensive Workshop Format"
        description="No passive listening. You'll work alongside peers and mentors to build your actual 90-day growth plan. Every session is hands-on, tactical, and designed for immediate implementation."
        imageSrc="/lovable-uploads/3bcb9d4f-a156-4d11-9786-f14e083aee89.png"
        imageAlt="Workshop Format"
        reverse={true}
      />
      
      <CTASection />
    </div>
  );
};

export default Index;