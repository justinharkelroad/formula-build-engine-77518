import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const PartnerHero = () => {
  const handleScrollToLevels = () => {
    document.getElementById("levels")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative bg-black text-white overflow-hidden pt-28 pb-12 md:pt-40 md:pb-20">
      {/* subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hero-orb hero-orb-secondary absolute top-1/3 -left-32 w-[500px] h-[500px]" />
        <div className="hero-orb hero-orb-primary absolute bottom-0 right-0 w-[400px] h-[400px] opacity-40" />
      </div>

      <div className="relative z-10 container mx-auto px-5 md:px-12">
        {/* MEGA HEADLINE */}
        <h1 className="display-bold text-[clamp(3.25rem,14vw,10rem)] md:text-[12vw] lg:text-[10vw] mb-8 break-words">
          PARTNER<br />WITH<br /><span className="display-outline">FORMULA</span>
        </h1>

        {/* Meta pills + intro grid */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 mt-10 md:mt-16">
          {/* Left — pills + CTA */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              <span className="meta-pill meta-pill-solid">2026 PARTNER PROGRAM</span>
              <span className="meta-pill meta-pill-dot">SPOTS OPEN</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="meta-pill">PLATINUM · GOLD</span>
              <span className="meta-pill">SILVER · BRONZE</span>
            </div>

            <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row">
              <button
                onClick={handleScrollToLevels}
                className="inline-flex items-center gap-2 bg-white text-black px-7 py-4 rounded-full font-bold hover:bg-[hsl(var(--secondary))] hover:text-white transition-colors shadow-lg shadow-black/40"
              >
                VIEW PARTNERSHIP LEVELS
                <ArrowDown className="w-4 h-4" />
              </button>
              <Link
                to="/partners/partner-hub-guide"
                className="inline-flex items-center gap-2 border border-white/25 bg-white/5 text-white px-7 py-4 rounded-full font-bold hover:bg-white/10 transition-colors"
              >
                PARTNER HUB GUIDE
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right — intro copy */}
          <div>
            <div className="text-2xl md:text-3xl font-bold leading-tight mb-6">
              Fuel Agency Success.<br />
              Amplify Your Brand.
            </div>
            <div className="space-y-1 text-lg text-white/85">
              <div>Stage time + 1-on-1 podcast interviews</div>
              <div>Booth placement in high-traffic flow</div>
              <div>Attendee lead lists pre- and post-event</div>
              <div>App + screen ad placement throughout</div>
            </div>
          </div>
        </div>

        {/* Intro video — full width */}
        <div className="mt-12 md:mt-20 max-w-5xl mx-auto rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          <AspectRatio ratio={16 / 9}>
            <iframe
              src="https://player.vimeo.com/video/1169705054?badge=0&autopause=0&player_id=0&app_id=58479"
              title="Formula Forum Partner Video"
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              allowFullScreen
            />
          </AspectRatio>
        </div>
      </div>
    </section>
  );
};

export default PartnerHero;
