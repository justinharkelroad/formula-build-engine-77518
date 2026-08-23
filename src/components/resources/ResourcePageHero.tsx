import type { ResourcePageCopy } from "@/config/resources/types";

interface ResourcePageHeroProps {
  copy: ResourcePageCopy;
}

/**
 * Workbook resource hero. Deliberately short — the attendee scanned a QR code to
 * reach the partners, so the hero orients and gets out of the way.
 */
const ResourcePageHero = ({ copy }: ResourcePageHeroProps) => (
  <section
    id="top"
    className="relative overflow-hidden px-[clamp(1.25rem,5vw,3rem)] pb-[clamp(2.5rem,7vw,4rem)] pt-[clamp(7rem,14vw,9rem)]"
  >
    {/* Orb field — same treatment the rest of the site uses behind dark heroes */}
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="hero-orb hero-orb-secondary animate-flicker absolute -left-32 top-1/3 h-[500px] w-[500px]" />
      <div className="hero-orb hero-orb-primary animate-flicker-slow delay-orb-2 absolute bottom-0 right-0 h-[400px] w-[400px] opacity-40" />
    </div>

    <div className="relative mx-auto max-w-7xl">
      <div className="eyebrow mb-4">{copy.eyebrow}</div>

      <h1 className="display-bold m-0 text-[clamp(2rem,7vw,4.5rem)] text-white">
        {copy.headlineLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h1>

      <p className="mt-4 text-[clamp(1.0625rem,4.5vw,1.5rem)] font-bold text-[hsl(var(--secondary))]">
        {copy.supportLine}
      </p>

      <p className="mt-4 max-w-[34rem] text-base leading-relaxed text-white/70">
        {copy.lede}
      </p>

      {copy.metaPills.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {copy.metaPills.map((pill) => (
            <span key={pill} className="meta-pill px-4 py-[0.4375rem] text-xs">
              {pill}
            </span>
          ))}
        </div>
      )}

      {copy.whyThisMatters && (
        <div className="mt-8 max-w-[30rem] rounded-r-2xl border-l-[3px] border-[hsl(var(--secondary))] bg-white/[0.04] px-[1.125rem] py-4">
          <div className="mb-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--secondary))]">
            {copy.whyThisMattersLabel}
          </div>
          <p className="m-0 text-sm leading-normal text-white/70">{copy.whyThisMatters}</p>
        </div>
      )}
    </div>
  </section>
);

export default ResourcePageHero;
