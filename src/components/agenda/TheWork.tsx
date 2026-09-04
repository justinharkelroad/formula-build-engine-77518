import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import SessionModal from "@/components/agenda/SessionModal";
import {
  BUILD_GROUPS,
  WITHHELD_LINE,
  sessionsForBuild,
  type AgendaSession,
  type Track,
} from "@/config/agenda";

const trackColor = (track: Track) =>
  track === "BUSINESS" ? "hsl(var(--secondary))" : "hsl(var(--primary))";

interface TheWorkProps {
  /** Rendered as the section heading. */
  heading?: string;
  intro?: string;
  /** Homepage passes its own <section> wrapper, so skip ours. */
  bare?: boolean;
}

const TheWork = ({
  heading = "EIGHT SESSIONS",
  intro = "Every one of these runs across the three days. We publish the work, not the running order — the room finds out when it walks in.",
  bare = false,
}: TheWorkProps) => {
  const { ref, isVisible } = useScrollAnimation(0.05);
  const [active, setActive] = useState<AgendaSession | null>(null);
  const v = isVisible ? "is-visible" : "";

  const body = (
    <>
      {!bare && (
        <>
          <div className={`eyebrow mb-6 reveal-up ${v}`}>THE WORK</div>
          <h2
            className={`display-bold text-[clamp(2.25rem,9vw,5.5rem)] leading-[0.9] mb-6 reveal-up delay-1 ${v}`}
          >
            {heading}
          </h2>
        </>
      )}
      <p className={`max-w-2xl text-lg md:text-2xl text-white/70 mb-14 reveal-up delay-2 ${v}`}>
        {intro}
      </p>

      {BUILD_GROUPS.map((group, gi) => (
        <div key={group.id} className="mb-14 last:mb-0">
          <div className={`flex flex-wrap items-baseline gap-4 mb-3 reveal-up delay-${gi + 1} ${v}`}>
            <h3 className="display-bold text-2xl md:text-4xl">{group.label}</h3>
            <span className="text-sm text-white/40 uppercase tracking-widest">
              {sessionsForBuild(group.id).length} sessions
            </span>
          </div>
          <p className={`max-w-2xl text-sm md:text-base text-white/50 mb-8 reveal-up delay-${gi + 1} ${v}`}>
            {group.blurb}
          </p>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {sessionsForBuild(group.id).map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => setActive(s)}
                aria-label={`${s.title} — read the teaser`}
                className={`group text-left w-full border border-white/15 rounded-lg p-6 md:p-7 hover:border-white/40 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 transition-colors reveal-up delay-${Math.min(i + 1, 4)} ${v}`}
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span
                    className="text-[0.6rem] md:text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
                    style={{ color: trackColor(s.track), border: `1px solid ${trackColor(s.track)}` }}
                  >
                    {s.track}
                  </span>
                  <span className="text-xs text-white/40 uppercase tracking-widest">
                    {s.minutes} min
                  </span>
                </div>

                <h4 className="text-xl md:text-2xl font-bold mb-2">{s.title}</h4>
                <p className="text-sm md:text-base text-white/55 mb-5">{s.line}</p>

                <div className="border-t border-white/10 pt-4">
                  <div className="text-[0.6rem] uppercase tracking-widest text-white/40 mb-1">
                    You leave with
                  </div>
                  <p className="text-base md:text-lg font-medium text-white/90">{s.outcome}</p>
                </div>

                <div
                  className="mt-4 text-xs font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ color: trackColor(s.track) }}
                >
                  The question →
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className={`mt-12 text-xs md:text-sm tracking-widest uppercase text-white/40 reveal-up ${v}`}>
        ◆ {WITHHELD_LINE}
      </div>

      <SessionModal session={active} onClose={() => setActive(null)} />
    </>
  );

  if (bare) return <div ref={ref as React.RefObject<HTMLDivElement>}>{body}</div>;

  return (
    <section
      ref={ref}
      className="bg-black text-white border-t border-white/10 py-16 md:py-24 px-5 md:px-12"
    >
      <div className="container mx-auto max-w-7xl">{body}</div>
    </section>
  );
};

export default TheWork;
