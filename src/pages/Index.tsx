import HeroSection from "@/components/sections/HeroSection";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import CustomCursor from "@/components/CustomCursor";
import UndefinedNavigation from "@/components/UndefinedNavigation";
import UndefinedAbout from "@/components/sections/UndefinedAbout";
import ServicesGrid from "@/components/sections/ServicesGrid";
import FeatureSection from "@/components/sections/FeatureSection";
import CTASection from "@/components/sections/CTASection";
import VideoTestimonialsGrid from "@/components/sections/VideoTestimonialsGrid";

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
      <VideoTestimonialsGrid />
      <UndefinedAbout />
      <ServicesGrid />
      
      <FeatureSection
        title="2026 Location Coming Soon!"
        description="The JW Marriott Bonnet Creek was exquisite for our event. It is not out of the running for 2026 but we will make that decision and announcement soon for what city and hotel will house FORMULA in 2026!"
        imageSrc="/lovable-uploads/venue-pool-2026.jpg"
        imageAlt="Luxury resort pool at sunset"
        reverse={false}
        id="location"
      />
      
      <FeatureSection
        title="Breakouts Create Breakthroughs"
        description="Ask any attendee from 2025. We're built through truth and authenticity and that can only be done through connection. This is not your average conference format. We are active throughout the day and a half. We find ourselves in uncomfortable situations so when something like that happens in life, were trained."
        imageSrc="/lovable-uploads/breakout-session.png"
        imageAlt="Breakout session with attendees in discussion"
        reverse={true}
      />
      
      {/* Partner Podcasts CTA */}
      <section className="py-16 px-4 bg-black">
        <div className="container mx-auto max-w-7xl text-center">
          <a href="/2025partners">
            <button className="bg-gradient-primary text-white px-12 py-5 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-brand">
              2025 Partner Podcast Episodes
            </button>
          </a>
        </div>
      </section>
      
      <CTASection />
    </div>
  );
};

export default Index;