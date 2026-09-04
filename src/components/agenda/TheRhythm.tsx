import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { DAYS, rhythmForDay, type AgendaDay } from "@/config/agenda";

const DayRhythm = ({ day }: { day: AgendaDay }) => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const v = isVisible ? "is-visible" : "";
  const items = rhythmForDay(day.id);

  return (
    <section ref={ref} className="mb-16 last:mb-0">
      <div className="grid md:grid-cols-2 gap-4 items-end mb-8">
        <div>
          <div className={`eyebrow mb-3 reveal-up ${v}`}>
            {day.label} · {day.date}
          </div>
          <h3 className={`display-bold text-[clamp(2rem,7vw,4rem)] leading-[0.9] reveal-up delay-1 ${v}`}>
            {day.theme}
          </h3>
        </div>
        {day.window && (
          <div className={`md:text-right reveal-up delay-2 ${v}`}>
            <span className="meta-pill">{day.window}</span>
          </div>
        )}
      </div>

      <p className={`max-w-2xl text-base md:text-xl text-white/60 mb-8 reveal-up delay-2 ${v}`}>
        {day.promise}
      </p>

      <div>
        {items.map((r, i) => (
          <div
            key={day.id + r.title}
            className={`bold-row grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-8 md:items-baseline reveal-up delay-${Math.min(i + 1, 4)} ${v}`}
          >
            <div
              className={`md:col-span-3 text-sm md:text-base tracking-wide ${
                r.time ? "text-white/70" : "text-white/30"
              }`}
            >
              {r.time ?? "TIME TBA"}
            </div>

            <div className="md:col-span-9">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`text-lg md:text-2xl font-semibold ${
                    r.isWork ? "text-[hsl(var(--secondary))]" : ""
                  }`}
                >
                  {r.title}
                </span>
                {r.isWork && (
                  <span className="text-[0.6rem] font-bold uppercase tracking-widest px-2 py-1 rounded border border-[hsl(var(--secondary))] text-[hsl(var(--secondary))]">
                    Sessions
                  </span>
                )}
              </div>
              {r.note && <p className="mt-1 text-sm md:text-base text-white/45">{r.note}</p>}

              {r.within && (
                <ul className="mt-4 border-l border-white/15 pl-5 space-y-3">
                  {r.within.map((w) => (
                    <li key={w.title}>
                      <span className="text-base md:text-lg font-semibold text-white/90">
                        {w.title}
                      </span>
                      {w.note && (
                        <p className="mt-0.5 text-sm text-white/45">{w.note}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const TheRhythm = () => {
  const { ref, isVisible } = useScrollAnimation(0.05);
  const v = isVisible ? "is-visible" : "";

  return (
    <section
      id="rhythm"
      ref={ref}
      className="bg-black text-white border-t border-white/10 py-16 md:py-24 px-5 md:px-12"
    >
      <div className="container mx-auto max-w-7xl">
        <div className={`eyebrow mb-6 reveal-up ${v}`}>THE RHYTHM</div>
        <h2
          className={`display-bold text-[clamp(2.25rem,9vw,5.5rem)] leading-[0.9] mb-6 reveal-up delay-1 ${v}`}
        >
          THREE DAYS
        </h2>
        <p className={`max-w-2xl text-lg md:text-2xl text-white/70 mb-16 reveal-up delay-2 ${v}`}>
          How the days actually run — when you eat, when you move, when you meet the partners, and
          when the room goes to work.
        </p>

        {DAYS.map((day) => (
          <DayRhythm key={day.id} day={day} />
        ))}
      </div>
    </section>
  );
};

export default TheRhythm;
