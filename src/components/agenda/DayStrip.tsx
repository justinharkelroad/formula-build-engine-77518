import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { DAYS, rhythmForDay } from "@/config/agenda";

/**
 * Compact three-day summary for the homepage. Day theme, window, and a few
 * named highlights — no times, no session names. The full rhythm lives on
 * /agenda, which this links to.
 */
const DayStrip = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const v = isVisible ? "is-visible" : "";

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="mt-20">
      <div className={`eyebrow mb-6 reveal-up ${v}`}>THE RHYTHM</div>
      <h3 className={`display-bold text-3xl md:text-5xl mb-10 reveal-up delay-1 ${v}`}>
        THREE DAYS
      </h3>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {DAYS.map((day, i) => {
          const highlights = rhythmForDay(day.id).filter((r) => !r.isWork);
          const hasWork = rhythmForDay(day.id).some((r) => r.isWork);

          return (
            <div
              key={day.id}
              className={`border border-white/15 rounded-lg p-6 md:p-7 reveal-up delay-${Math.min(i + 1, 4)} ${v}`}
            >
              <div className="eyebrow mb-3">
                {day.label} · {day.date}
              </div>
              <h4 className="display-bold text-2xl md:text-3xl leading-[0.95] mb-4">{day.theme}</h4>
              {day.window && <span className="meta-pill text-xs">{day.window}</span>}

              <ul className="mt-5 space-y-1.5">
                {hasWork && (
                  <li className="text-sm md:text-base font-semibold text-[hsl(var(--secondary))]">
                    Working sessions
                  </li>
                )}
                {highlights.map((r) => (
                  <li key={r.title} className="text-sm md:text-base text-white/60">
                    {r.title}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <Link
        to="/agenda"
        className={`mt-10 inline-flex items-center gap-3 border border-white/25 hover:border-white/60 hover:bg-white/[0.04] px-7 py-4 rounded-full text-sm md:text-base font-bold uppercase tracking-widest transition-colors reveal-up delay-3 ${v}`}
      >
        See the full agenda →
      </Link>
    </div>
  );
};

export default DayStrip;
