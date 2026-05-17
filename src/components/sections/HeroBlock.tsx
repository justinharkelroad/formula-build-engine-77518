import { ArrowUpRight } from "lucide-react";
import { usePassDialog } from "@/contexts/PassDialogContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import WaveDivider from "@/components/WaveDivider";

const HeroBlock = () => {
  const { open } = usePassDialog();
  const { ref, isVisible } = useScrollAnimation(0.05);

  return (
    <section
      ref={ref}
      className="relative bg-black text-white overflow-hidden pt-28 pb-32 md:pt-40 md:pb-24"
    >
      {/* Florida-flicker orb field — 5 layered glows on irregular timers
          so the background breathes asymmetrically. */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Big blue — left-mid */}
        <div className="hero-orb hero-orb-secondary absolute top-1/4 -left-40 w-[620px] h-[620px] animate-flicker" />
        {/* Warm sun — bottom-right (strongest accent) */}
        <div className="hero-orb hero-orb-primary absolute -bottom-32 -right-32 w-[640px] h-[640px] animate-flicker-slow" />
        {/* Cool blue — top-right corner */}
        <div className="hero-orb hero-orb-secondary absolute -top-32 right-1/4 w-[380px] h-[380px] animate-flicker-fast delay-orb-1" />
        {/* Sunset accent — center-low */}
        <div className="hero-orb hero-orb-accent absolute bottom-1/3 left-1/3 w-[420px] h-[420px] animate-flicker delay-orb-2" />
        {/* Deep-water blue — bottom-left */}
        <div className="hero-orb hero-orb-secondary absolute -bottom-24 left-1/4 w-[340px] h-[340px] animate-flicker-slow delay-orb-3" />
      </div>

      <div className="relative z-10 container mx-auto px-5 md:px-12">
        {/* MEGA HEADLINE */}
        <h1
          className={`display-bold text-[clamp(3.5rem,16vw,11rem)] md:text-[14vw] lg:text-[12vw] mb-8 break-words reveal-up ${isVisible ? "is-visible" : ""}`}
        >
          FORMULA<br />FORUM <span className="display-outline">26</span>
        </h1>

        {/* Meta pills + overview grid */}
        <div className="grid md:grid-cols-2 gap-12 mt-12 md:mt-16">
          {/* Left column — pills + CTA */}
          <div className="flex flex-col gap-4">
            <div className={`flex flex-wrap gap-3 reveal-up delay-1 ${isVisible ? "is-visible" : ""}`}>
              <span className="meta-pill">OCT 14–16</span>
              <span className="meta-pill meta-pill-dot">TICKETS ACTIVE</span>
              <span className="meta-pill">2026</span>
            </div>
            <div className={`flex flex-wrap gap-3 reveal-up delay-2 ${isVisible ? "is-visible" : ""}`}>
              <span className="meta-pill">ORLANDO, FL</span>
              <span className="meta-pill">JW MARRIOTT BONNET CREEK</span>
            </div>

            <button
              onClick={() => open("earlyBird")}
              className={`mt-4 self-start inline-flex items-center gap-2 bg-white text-black px-7 py-4 rounded-full font-bold hover:bg-[hsl(var(--secondary))] hover:text-white transition-colors shadow-lg shadow-black/40 reveal-up delay-3 ${isVisible ? "is-visible" : ""}`}
            >
              BUY TICKET
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right column — meeting overview */}
          <div className={`reveal-up delay-2 ${isVisible ? "is-visible" : ""}`}>
            <div className="text-2xl md:text-3xl font-bold leading-tight mb-6">
              The Operator's Conference for<br />
              Insurance Agency Owners
            </div>
            <div className="space-y-1 text-lg text-white/85">
              <div>Operator-led growth playbooks</div>
              <div>AI installs for daily agency ops</div>
              <div>Producer scale + retention systems</div>
              <div>Format Framework breakouts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave at bottom — blue water cresting up into the black hero,
          flowing into the CountdownBlock that follows */}
      <WaveDivider
        position="bottom"
        fill="hsl(var(--secondary))"
        speed="slow"
        className="absolute bottom-0 left-0 z-[1]"
      />
    </section>
  );
};

export default HeroBlock;
