import { Link } from "react-router-dom";

interface FormulaResourceFooterProps {
  copy: {
    headline: string;
    body: string;
    supporting?: string;
    ctaLabel: string;
    /** Internal route — this page never sells a ticket. */
    ctaTo: string;
  };
}

const FormulaResourceFooter = ({ copy }: FormulaResourceFooterProps) => (
  <section className="px-[clamp(1.25rem,5vw,3rem)] pb-[clamp(3rem,9vw,5rem)]">
    <div className="brand-block-blue mx-auto max-w-7xl p-[clamp(1.75rem,6vw,3rem)]">
      <h2 className="display-bold m-0 max-w-[30rem] text-[clamp(1.625rem,6vw,3rem)] text-white">
        {copy.headline}
      </h2>

      <p className="mt-4 max-w-[30rem] text-base leading-relaxed text-white/90">{copy.body}</p>

      {!copy.supporting && <div className="h-7" aria-hidden="true" />}

      {copy.supporting && (
        <p className="mb-7 mt-4 text-sm font-bold text-white/70">{copy.supporting}</p>
      )}

      <Link
        to={copy.ctaTo}
        className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-black px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
      >
        {`${copy.ctaLabel} ↗`}
      </Link>
    </div>
  </section>
);

export default FormulaResourceFooter;
