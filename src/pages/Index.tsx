import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import CustomCursor from "@/components/CustomCursor";
import BoldHeader from "@/components/BoldHeader";
import VimeoModal from "@/components/VimeoModal";
import PassDialogHost from "@/components/PassDialogHost";
import { PassDialogProvider } from "@/contexts/PassDialogContext";
import FilmHero from "@/components/sections/FilmHero";
import CallStrip from "@/components/sections/CallStrip";
import FormulaChapterSection from "@/components/sections/FormulaChapterSection";
import PlatinumSponsors from "@/components/sections/PlatinumSponsors";
import EventSponsors from "@/components/sections/EventSponsors";
import ReviewsSection from "@/components/sections/ReviewsSection";
import CountdownBlock from "@/components/sections/CountdownBlock";
import AIPortalBlock from "@/components/sections/AIPortalBlock";
import GiveBackBlurb from "@/components/sections/GiveBackBlurb";
import GiantTicketFooter from "@/components/sections/GiantTicketFooter";
import { FORMULA_CHAPTERS, FORMULA_FILM, filmPlayerUrl } from "@/config/formulaFilm";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const chapter = (id: string) => {
  const found = FORMULA_CHAPTERS.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown Formula chapter: ${id}`);
  return found;
};

const Index = () => {
  const title = "Formula Forum 2026 | That's Formula | The Insurance Agency Growth Conference";
  const description = "Formula Forum 2026 brought insurance agency owners and their teams to Orlando, Oct 14-16. Watch the Formula Opener, see the room, and join the Nov 2 reunion call.";
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
    const sectionId = (location.state as { scrollTo?: string } | null)?.scrollTo;
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

      {/* ?video=1 deep link opens the Formula Opener */}
      <VimeoModal
        isOpen={showVideo}
        onClose={handleCloseVideo}
        vimeoId={FORMULA_FILM.vimeoId}
        src={filmPlayerUrl()}
      />

      {/* Hero — the Formula Opener film */}
      <FilmHero />

      {/* Slim reunion-call band until Nov 2 */}
      <CallStrip />

      {/* 01 Access — the room, and the partners who built it */}
      <FormulaChapterSection chapter={chapter("access")} />
      <PlatinumSponsors />
      <EventSponsors />

      {/* 02 Association — breakouts and the people in them */}
      <FormulaChapterSection chapter={chapter("association")} />

      {/* 03 Accountability — the Nov 2 reunion call (#reunion-call) */}
      <FormulaChapterSection chapter={chapter("accountability")} />
      <CountdownBlock />

      {/* 04 Acceleration — the Agency AI Install, behind the AI portal */}
      <FormulaChapterSection chapter={chapter("acceleration")} />
      <AIPortalBlock />

      {/* 05 Ascension — what comes next, what the room said, giving back */}
      <FormulaChapterSection chapter={chapter("ascension")} />
      <ReviewsSection />
      <GiveBackBlurb />

      {/* Closing line of the film */}
      <GiantTicketFooter />
    </div>
    </PassDialogProvider>
  );
};

export default Index;
