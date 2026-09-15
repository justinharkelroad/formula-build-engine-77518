import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { DESTINY_RESCUE } from "@/config/giveBack";

/**
 * Slim homepage band pointing at /give-back. Deliberately short — the full ask,
 * the stats, and the give button live on the page, not here.
 */
const GiveBackBlurb = () => {
  const { ref, isVisible } = useScrollAnimation(0.15);

  return (
    <section
      id="give-back"
      ref={ref}
      className="bg-black px-5 py-12 text-white md:px-12 md:py-16"
    >
      <div className="container mx-auto max-w-7xl">
        <div
          className={`flex flex-col gap-6 rounded-2xl border border-white/14 bg-[hsl(0,0%,5%)] p-7 md:flex-row md:items-center md:justify-between md:gap-10 md:rounded-3xl md:p-10 reveal-up ${isVisible ? "is-visible" : ""}`}
        >
          <div className="max-w-2xl">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--primary))]">
              The room gives back
            </div>
            <h2 className="text-2xl font-black leading-tight md:text-4xl">
              This room raised{" "}
              <span className="text-[hsl(var(--primary))]">{DESTINY_RESCUE.NUMBER_TO_BEAT}</span> for
              Destiny Rescue. In 2026 we beat it.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/72">
              Formula partners with Destiny Rescue to rescue children from sexual exploitation.
              Every dollar given goes to rescue operations, aftercare, and keeping rescued children
              free.
            </p>
          </div>

          <Link
            to="/give-back"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-radius-pill bg-[hsl(var(--primary))] px-7 py-4 font-bold text-black transition-transform hover:-translate-y-0.5 active:translate-y-px"
          >
            SEE HOW TO GIVE
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GiveBackBlurb;
