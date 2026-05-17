import { CONFIG } from "@/config/event";
import { usePassDialog } from "@/contexts/PassDialogContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import WaveDivider from "@/components/WaveDivider";

const GiantTicketFooter = () => {
  const { open } = usePassDialog();
  const { ref, isVisible } = useScrollAnimation(0.15);
  return (
    <section ref={ref} className="relative bg-black text-white pt-20 md:pt-24 pb-10 md:pb-12 px-5 md:px-12 overflow-hidden">
      {/* Wave divider at top — coastal vibe entering the final CTA */}
      <WaveDivider position="top" fill="hsl(var(--secondary) / 0.18)" speed="slow" className="absolute top-0 left-0" />

      <div className="container mx-auto max-w-7xl">
        {/* Massive BUY TICKET CTA */}
        <button
          onClick={() => open("earlyBird")}
          className={`block group cursor-pointer text-left w-full reveal-up ${isVisible ? "is-visible" : ""}`}
        >
          <h2 className="display-bold text-[clamp(2.5rem,16vw,13rem)] md:text-[16vw] lg:text-[14vw] leading-[0.85] flex items-baseline gap-2 md:gap-4 flex-wrap">
            <span className="text-[hsl(var(--secondary))] animate-sun inline-block">●</span>
            <span className="group-hover:text-[hsl(var(--secondary))] transition-colors">BUY TICKET</span>
          </h2>
        </button>

        {/* Footer meta row */}
        <div className={`mt-12 md:mt-16 grid md:grid-cols-3 gap-4 md:gap-8 pt-6 md:pt-8 border-t border-white/15 text-sm reveal-up delay-2 ${isVisible ? "is-visible" : ""}`}>
          <div className="text-xs tracking-widest uppercase text-white/50">
            THEFORMULAFORUM.COM
          </div>
          <div className="md:text-center text-white/70 text-xs md:text-sm">
            {CONFIG.VENUE_NAME} · Orlando, FL · Oct 14–16, 2026
          </div>
          <div className="md:text-right text-white/50 text-xs tracking-widest uppercase">
            ©2026 FORMULA FORUM
          </div>
        </div>
      </div>
    </section>
  );
};

export default GiantTicketFooter;
