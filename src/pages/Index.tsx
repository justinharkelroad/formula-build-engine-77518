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
      
      {/* Partner Podcasts Section */}
      <section id="partner-podcasts" className="py-24 px-4 bg-black">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white text-center mb-16">
            HEAR FROM OUR 2025 FORMULA PARTNERS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "RICOCHET", embedId: "FlM2ZQ_FVwQ" },
              { name: "MEDIA ALPHA", embedId: "tox1dLwKnPM" },
              { name: "DISRUPTUR", embedId: "CjbFq-S9YgQ" },
              { name: "TEAM HIRED", embedId: "cUv3cp19CRQ" },
              { name: "SEARCH PERFECT", embedId: "1_KvGjczv2g" },
              { name: "EVERYGREEN TALENT AGENCY", embedId: "1_KvGjczv2g" },
              { name: "FILTERED QUOTES", embedId: "MUBj3wFMOvU" },
              { name: "BRAISHFIELD", embedId: "0_-rbjLaE60" },
              { name: "AGENCY TOOLCHEST", embedId: "Cfa7bsE5grs" },
              { name: "SMARKETING", embedId: "LZ5Z6lMOC84" },
              { name: "HAGERTY", embedId: "q4kAc9UHaXw" },
              { name: "EOS", embedId: "wkPKGCTio2k" },
              { name: "TOP TIER RECRUITING", embedId: "gnCLRzKgRNw" },
              { name: "AMERICAN INTEGRITY", embedId: "vIyGxtvCcto" },
              { name: "PERFORMOLOGY", embedId: "sV5NlFuFaCc" },
              { name: "EMBRACE PET INSURANCE", embedId: "gXiTSNMAzgQ" },
              { name: "POST PROS", embedId: "_mLcM6aXGno" },
              { name: "DESTINY RESCUE", embedId: "eiJuHioRR6Q" },
              { name: "QUOTE NERDS", embedId: "dqshvPjGD0U" },
              { name: "COVER DESK", embedId: "KIsbPgEOeEc" },
            ].map((podcast) => (
              <div
                key={podcast.embedId}
                className="group relative bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300"
              >
                <div className="aspect-video w-full relative overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${podcast.embedId}`}
                    title={`${podcast.name} Podcast Episode`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white text-center">
                    {podcast.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <CTASection />
    </div>
  );
};

export default Index;