import HeroSection from "@/components/sections/HeroSection";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import CustomCursor from "@/components/CustomCursor";
import UndefinedNavigation from "@/components/UndefinedNavigation";
import UndefinedAbout from "@/components/sections/UndefinedAbout";
import ServicesGrid from "@/components/sections/ServicesGrid";
import FeatureSection from "@/components/sections/FeatureSection";
import { Button } from "@/components/ui/button";
import CTASection from "@/components/sections/CTASection";
import VideoTestimonialsGrid from "@/components/sections/VideoTestimonialsGrid";
import VimeoModal from "@/components/VimeoModal";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams, Link } from "react-router-dom";

const HOMEPAGE_VIMEO_ID = "1168470992";

const Index = () => {
  const title = "Formula Forum 2026 | Insurance Agency Growth Conference | Orlando Oct 14–16";
  const description = "Insurance Agency Growth Conference in Orlando. Oct 14–16, 2026 at JW Marriott Bonnet Creek. Workshops, breakouts, and a 90-day growth plan.";
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showVideo, setShowVideo] = useState(false);

  // Open video modal only when ?video=1 is in the URL
  useEffect(() => {
    if (searchParams.get("video") === "1") {
      setShowVideo(true);
    }
  }, [searchParams]);

  const handleCloseVideo = () => {
    setShowVideo(false);
    searchParams.delete("video");
    setSearchParams(searchParams, { replace: true });
  };
  
  useEffect(() => {
    const sectionId = (location.state as any)?.scrollTo;
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        navigate(location.pathname, { replace: true, state: {} });
      }, 0);
    }
  }, [location, navigate]);
  
  return (
    <div className="min-h-screen bg-black">
      <SEO title={title} description={description} path="/" />
      <StructuredData page="home" />
      <CustomCursor />
      <UndefinedNavigation />
      
      <VimeoModal isOpen={showVideo} onClose={handleCloseVideo} vimeoId={HOMEPAGE_VIMEO_ID} />
      <HeroSection />
      <VideoTestimonialsGrid />

      {/* What is Formula Forum? — Atomic Citation Block */}
      <section className="py-20 px-8 bg-black text-white" data-speakable="true">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">What is Formula Forum?</h2>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-6">
            Formula Forum (F³) is the national insurance agency growth conference held annually in Orlando, Florida. It brings together insurance agency owners, producers, and industry partners for three days of operator-led training, peer breakout sessions, and actionable implementation planning. The 2026 event takes place October 14–16 at the JW Marriott Orlando Bonnet Creek Resort & Spa.
          </p>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed">
            Unlike traditional conferences, Formula Forum uses a proprietary Format Framework where every session cycles through focused speaker training, personal takeaway capture, small-group breakouts, and speaker close.
          </p>
        </div>
      </section>

      {/* Photos Section */}
      <section className="min-h-screen bg-black text-white py-32 px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-xs text-white/50 mb-12 tracking-widest uppercase">[ photos ]</div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Image Column - Left */}
            <div className="relative overflow-hidden rounded-2xl group">
              <picture>
                <source srcSet="/lovable-uploads/photos-section.webp" type="image/webp" />
                <img
                  src="/lovable-uploads/photos-section.jpg"
                  alt="Formula Forum 2025 attendees"
                  loading="lazy"
                  width="960"
                  height="540"
                  className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>

            {/* Text Column - Right */}
            <div>
              <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
                See All The Photos From The 2025 Formula Experience!
              </h2>
              <p className="text-xl text-white/70 leading-relaxed mb-8">
                Click below to gain access to all the photos from this years event. Add the photos you want to download to your bucket, and immediately get them saved to your device!
              </p>
              <Link to="/gallery">
                <button className="bg-gradient-primary text-white px-12 py-5 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-brand">
                  View Gallery
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <UndefinedAbout />
      <ServicesGrid />
      
      <FeatureSection
        title="JW Marriott Bonnet Creek"
        description="We are excited to announce that we are going back home to our official first location and making this an amazing tradition and bringing you all back down to experience this beautiful space."
        imageSrc="/lovable-uploads/venue-pool-2026.jpg"
        webpSrc="/lovable-uploads/venue-pool-2026.webp"
        imageAlt="Luxury resort pool at sunset"
        reverse={false}
        id="location"
      >
        <Button asChild variant="cta" size="lg" className="mt-6 text-lg">
          <a href="https://book.passkey.com/go/FFF2026" target="_blank" rel="noopener noreferrer">
            Secure Your Discounted Room Before They Sell Out!
          </a>
        </Button>
      </FeatureSection>
      
      <FeatureSection
        title="Breakouts Create Breakthroughs"
        description="Ask any attendee from 2025. We're built through truth and authenticity and that can only be done through connection. This is not your average conference format. We are active throughout the day and a half. We find ourselves in uncomfortable situations so when something like that happens in life, were trained."
        imageSrc="/lovable-uploads/breakout-session.png"
        webpSrc="/lovable-uploads/breakout-session.webp"
        imageAlt="Breakout session with attendees in discussion"
        reverse={true}
      />
      
      {/* Partner Podcasts CTA */}
      <section className="py-16 px-4 bg-black">
        <div className="container mx-auto max-w-7xl text-center">
          <Link to="/2025partners">
            <button className="bg-gradient-primary text-white px-12 py-5 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-brand">
              2025 Partner Podcast Episodes
            </button>
          </Link>
        </div>
      </section>
      
      <CTASection />
    </div>
  );
};

export default Index;