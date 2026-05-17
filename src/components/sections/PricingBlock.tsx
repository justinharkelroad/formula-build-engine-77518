import { PRICING } from "@/config/pricing";
import { Instagram, Facebook, Youtube, Linkedin, ArrowUpRight } from "lucide-react";
import { usePassDialog } from "@/contexts/PassDialogContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const PricingBlock = () => {
  const { open } = usePassDialog();
  const prices = PRICING.earlyBird;
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section
      ref={ref}
      className="relative text-white py-20 md:py-24 px-5 md:px-12 overflow-hidden animate-tide"
      style={{
        backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.78), rgba(0,0,0,0.92)), url(/lovable-uploads/Pricing%20Section.jpg)",
        backgroundPosition: "center"
      }}
    >
      <div className="container mx-auto max-w-7xl">
        {/* top eyebrow + socials */}
        <div className="flex items-center justify-between mb-10 md:mb-12 gap-4 flex-wrap">
          <div className="eyebrow text-white">PRICING — REGISTRATION OPEN</div>
          <div className="flex items-center gap-2 md:gap-3">
            {[Instagram, Facebook, Youtube, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Section intro */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
          <div>
            <div className="text-xs tracking-widest uppercase text-white/50 mb-3">CONFERENCE</div>
            <p className="text-white/85 leading-relaxed max-w-md">
              A systems workshop bridging foundation, operator routines, and AI installs. 1.5 days in Orlando dedicated to agency owners and team members building a real business on real fundamentals.
            </p>
          </div>
          <div>
            <div className="text-xs tracking-widest uppercase text-white/50 mb-3">EARLY BIRD ACTIVE</div>
            <h2 className="display-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9]">
              CHOOSE<br />YOUR PASS
            </h2>
          </div>
        </div>

        {/* TWO TICKET CARDS */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {/* Agency Owner Pass — white */}
          <button
            onClick={() => open("earlyBird")}
            className={`group text-left bg-white text-black rounded-2xl md:rounded-3xl p-7 md:p-10 hover:bg-[hsl(var(--primary))] hover:text-white transition-colors flex flex-col lift-hover reveal-up delay-1 ${isVisible ? "is-visible" : ""}`}
          >
            <div className="text-xs tracking-widest uppercase text-black/50 group-hover:text-white/80 mb-3">AGENCY OWNER PASS</div>
            <div className="display-bold text-6xl sm:text-7xl md:text-8xl leading-none mb-4">
              ${prices.agencyOwner.price}
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm line-through opacity-50">${prices.agencyOwner.fullPrice}</span>
              <span className="text-xs uppercase tracking-widest bg-black text-white group-hover:bg-white group-hover:text-black px-2 py-1 rounded-full">SAVE ${prices.agencyOwner.fullPrice - prices.agencyOwner.price}</span>
            </div>
            <p className="text-sm opacity-80 leading-relaxed mb-6">
              For agency owners and senior producers. Full access to all sessions, printed Book of Formulas playbook, networking events, and meals.
            </p>
            <div className="mt-auto flex items-center justify-between text-sm font-bold">
              <span>SECURE THIS PASS</span>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </button>

          {/* Team Member Pass — blue */}
          <button
            onClick={() => open("earlyBird")}
            className={`group text-left brand-block-blue p-7 md:p-10 hover:brightness-110 transition-all flex flex-col lift-hover reveal-up delay-2 ${isVisible ? "is-visible" : ""}`}
          >
            <div className="text-xs tracking-widest uppercase text-white/60 mb-3">TEAM MEMBER PASS</div>
            <div className="display-bold text-6xl sm:text-7xl md:text-8xl leading-none mb-4">
              ${prices.team.price}
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm line-through opacity-60">${prices.team.fullPrice}</span>
              <span className="text-xs uppercase tracking-widest bg-white text-[hsl(var(--secondary))] px-2 py-1 rounded-full">SAVE ${prices.team.fullPrice - prices.team.price}</span>
            </div>
            <p className="text-sm text-white/85 leading-relaxed mb-6">
              For team members and junior producers. Bring your producer or service lead — they get the same access, same playbook, same room.
            </p>
            <div className="mt-auto flex items-center justify-between text-sm font-bold">
              <span>SECURE THIS PASS</span>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Bottom strip */}
        <div className="mt-10 md:mt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-white/65 border-t border-white/15 pt-6">
          <div>
            ◆ Teams of 5+ save an additional 20% — email <a href="mailto:Gregg@f3florida.com" className="text-white underline">Gregg@f3florida.com</a>
          </div>
          <a href="mailto:info@f3florida.com" className="text-white/60 underline hover:text-white text-xs tracking-widest uppercase">
            contact: info@f3florida.com
          </a>
        </div>
      </div>
    </section>
  );
};

export default PricingBlock;
