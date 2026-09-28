import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

/**
 * Slim homepage band pointing at /what-to-expect, placed right after the agenda
 * teaser. The sessions → Map → Progress story lives on the page, not here.
 */
const WhatToExpectBlurb = () => {
  const { ref, isVisible } = useScrollAnimation(0.15);

  return (
    <section id="what-to-expect" ref={ref} className="bg-black px-5 pb-12 text-white md:px-12 md:pb-16">
      <div className="container mx-auto max-w-7xl">
        <div
          className={`brand-block-blue flex flex-col gap-6 rounded-2xl p-7 md:flex-row md:items-center md:justify-between md:gap-10 md:rounded-3xl md:p-10 reveal-up ${isVisible ? "is-visible" : ""}`}
        >
          <div className="max-w-2xl">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-white/70">Before you land</div>
            <h2 className="text-2xl font-black leading-tight md:text-4xl">
              What you'll experience in the room, and what happens after.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              Eight sessions, one Domino each, your 2027 Map, and ninety days of follow-through in
              the Formula app.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col">
            <Link
              to="/what-to-expect"
              className="inline-flex w-fit items-center gap-2 rounded-radius-pill bg-white px-7 py-4 font-bold text-black transition-transform hover:-translate-y-0.5 active:translate-y-px"
            >
              OWNERS &amp; TEAMS
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/what-to-expect?for=partner"
              className="inline-flex w-fit items-center gap-2 rounded-radius-pill border border-white/60 px-7 py-4 font-bold text-white transition-transform hover:-translate-y-0.5 active:translate-y-px"
            >
              PARTNERS
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatToExpectBlurb;
