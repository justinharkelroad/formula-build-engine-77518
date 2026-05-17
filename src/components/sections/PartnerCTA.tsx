import { ArrowUpRight } from "lucide-react";

const PartnerCTA = () => {
  const handleScrollToLevels = () => {
    document.getElementById("levels")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative text-white py-20 md:py-28 px-5 md:px-12 overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.9)), url(/lovable-uploads/DSC09333.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="eyebrow mb-8">FINAL CALL</div>

        <h2 className="display-bold text-[clamp(2.5rem,12vw,9rem)] md:text-[10vw] lg:text-[8vw] leading-[0.9] mb-10 break-words">
          LOCK YOUR<br />SPOT
        </h2>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-xl">
            Partnership tiers fill in waves — Platinum and Gold typically go first. Secure your position as a 2026 industry leader before the slot you want is gone.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleScrollToLevels}
              className="inline-flex items-center justify-between bg-white text-black px-7 py-4 rounded-full font-bold hover:bg-[hsl(var(--secondary))] hover:text-white transition-colors"
            >
              <span>VIEW PARTNERSHIP LEVELS</span>
              <ArrowUpRight className="w-5 h-5" />
            </button>
            <a
              href="mailto:gregg@f3florida.com"
              className="inline-flex items-center justify-between brand-block-blue px-7 py-4 rounded-full font-bold hover:brightness-110 transition-all"
            >
              <span>I HAVE QUESTIONS</span>
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerCTA;
