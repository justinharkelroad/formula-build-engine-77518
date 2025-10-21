import HeroVideo from "@/components/HeroVideo";
import CountdownTimer from "@/components/CountdownTimer";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* background moved to page wrapper */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid md:grid-cols-2 items-center gap-8 md:gap-12 py-14 md:py-24">
          <header className="max-w-3xl text-left text-lg">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Insurance Agency Growth Conference in Orlando. Oct 15–17, 2025.
            </h1>

            <p className="text-xl md:text-2xl text-foreground/90 mb-6 leading-relaxed">
              Build a 90-day growth blueprint in 48 hours.
            </p>

            <div className="mb-8">
              <CountdownTimer 
                autoReset={true}
                className="text-left"
              />
            </div>

            <ul className="list-disc pl-6 space-y-2 mb-8">
              <li>Double your cross-sell rate</li>
              <li>Lift retention with a 3-step renewal play</li>
              <li>Hire, comp, and coach a 2-sales-per-day rep</li>
            </ul>
          </header>

          <aside className="w-full">
            <HeroVideo wistiaId="y8elofri75" title="Formula Forum overview video" />
            <p className="text-2xl md:text-3xl text-foreground/90 mt-4">
              Struggling to scale your agency team? This event shows you how.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
