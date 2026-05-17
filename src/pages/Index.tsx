import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import CustomCursor from "@/components/CustomCursor";
import BoldHeader from "@/components/BoldHeader";
import VimeoModal from "@/components/VimeoModal";
import PassDialogHost from "@/components/PassDialogHost";
import { PassDialogProvider } from "@/contexts/PassDialogContext";
import HeroBlock from "@/components/sections/HeroBlock";
import CountdownBlock from "@/components/sections/CountdownBlock";
import ValuePropsGrid from "@/components/sections/ValuePropsGrid";
import VideoTestimonialsGrid from "@/components/sections/VideoTestimonialsGrid";
import AboutSection from "@/components/sections/AboutSection";
import ScheduleBlock from "@/components/sections/ScheduleBlock";
import VenueBlock from "@/components/sections/VenueBlock";
import PricingBlock from "@/components/sections/PricingBlock";
import GiantTicketFooter from "@/components/sections/GiantTicketFooter";
import { CONFIG } from "@/config/event";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const HOMEPAGE_VIMEO_ID = "1168470992";

const Index = () => {
  const title = "Formula Forum 2026 | The #1 Insurance Agency Growth Conference | Orlando Oct 14-16";
  const description = "Formula Forum 2026 is the national insurance agency growth conference. Oct 14-16 at JW Marriott Orlando Bonnet Creek. Operator-led workshops, peer breakouts, and the Book of Formulas playbook.";
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (searchParams.get("video") === "1") setShowVideo(true);
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
        if (el) el.scrollIntoView({ behavior: "smooth" });
        navigate(location.pathname, { replace: true, state: {} });
      }, 0);
    }
  }, [location, navigate]);

  return (
    <PassDialogProvider>
    <div className="min-h-screen bg-black">
      <SEO title={title} description={description} path="/" />
      <StructuredData page="home" />
      <CustomCursor />
      <BoldHeader />
      <PassDialogHost />

      <VimeoModal isOpen={showVideo} onClose={handleCloseVideo} vimeoId={HOMEPAGE_VIMEO_ID} />

      {/* 1. Hero — massive headline + meta pills + overview */}
      <HeroBlock />

      {/* 1b. Countdown — blue brand block bridging black hero & light advantages */}
      <CountdownBlock />

      {/* 2. Value props — light section */}
      <ValuePropsGrid />

      {/* 3. Video testimonials — front-and-center (preserved) */}
      <section className="bg-black py-16 md:py-20 px-5 md:px-12">
        <div className="container mx-auto max-w-7xl mb-10 md:mb-12">
          <div className="eyebrow mb-4">VOICES — REAL OWNERS</div>
          <h2 className="text-2xl md:text-5xl font-bold leading-tight max-w-3xl">
            Hear from agency owners and team members who installed the Formula playbook — in their words.
          </h2>
        </div>
        <VideoTestimonialsGrid />
      </section>

      {/* 4. About — bold-block About Us with stage photo */}
      <AboutSection />

      {/* 5. Sponsor strip */}
      <section className="bg-[hsl(0,0%,96%)] py-10 md:py-12 px-5 md:px-12 border-t border-black/10">
        <div className="container mx-auto max-w-7xl">
          <div className="eyebrow text-black mb-8">2026 PLATINUM SPONSORS</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {CONFIG.LOGO_PARTNERS.map((p, i) => (
              <a key={i} href={p.linkUrl} target="_blank" rel="nofollow noopener" className="flex justify-center items-center min-h-[56px] grayscale hover:grayscale-0 transition-all">
                {p.logoUrl ? (
                  <img src={p.logoUrl} alt={p.name} className="h-12 md:h-14 w-auto object-contain" loading="lazy" />
                ) : (
                  <span className="text-base md:text-lg font-bold tracking-tight text-black/80">{p.name}</span>
                )}
              </a>
            ))}
            <a href="/partners" className="flex items-center justify-center text-xs tracking-widest uppercase text-black/50 hover:text-black border border-black/20 rounded-full px-4 py-3">
              JOIN AS A PARTNER →
            </a>
          </div>
        </div>
      </section>

      {/* 6. Schedule */}
      <ScheduleBlock />

      {/* 7. Venue */}
      <VenueBlock />

      {/* 8. Pricing */}
      <PricingBlock />

      {/* 10. Massive BUY TICKET footer */}
      <GiantTicketFooter />
    </div>
    </PassDialogProvider>
  );
};

export default Index;
