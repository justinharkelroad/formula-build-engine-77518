import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import DayStrip from "@/components/agenda/DayStrip";
import { EVENT } from "@/config/agenda";

/**
 * Homepage agenda teaser. Deliberately small: the arc, the counters, and the
 * three day themes — then out to /agenda, which owns the eight sessions, their
 * teaser modals, and the full rhythm.
 *
 * Do not put the session cards back here. The homepage links to the agenda;
 * it does not contain it.
 *
 * Keeps id="schedule" — ValuePropsGrid still anchors to it.
 */
const ScheduleBlock = () => {
  const { ref, isVisible } = useScrollAnimation(0.15);
  const v = isVisible ? "is-visible" : "";

  return (
    <section
      id="schedule"
      ref={ref}
      className="bg-black text-white py-20 md:py-24 px-5 md:px-12"
    >
      <div className="container mx-auto max-w-7xl">
        <div className={`eyebrow mb-8 reveal-up ${v}`}>AGENDA</div>

        <div className="grid md:grid-cols-2 gap-8 items-end mb-10 md:mb-12">
          <h2
            className={`display-bold text-[clamp(3rem,15vw,9rem)] md:text-[11vw] lg:text-[9vw] whitespace-nowrap reveal-up delay-1 ${v}`}
          >
            THE BUILD
          </h2>
          <div className={`flex flex-wrap gap-3 md:justify-end reveal-up delay-2 ${v}`}>
            <span className="meta-pill meta-pill-solid">OCT 14-16</span>
            <span className="meta-pill">2026</span>
          </div>
        </div>

        <p className={`max-w-2xl text-lg md:text-2xl text-white/70 mb-10 reveal-up delay-2 ${v}`}>
          Eight working sessions across three days, ending in the 2027 map you build and declare in
          the room.
        </p>

        <div className={`grid grid-cols-3 gap-4 md:gap-8 mb-4 reveal-up delay-3 ${v}`}>
          {EVENT.counters.map((c) => (
            <div key={c.label} className="border-t border-white/15 pt-5">
              <div className="display-bold text-4xl md:text-6xl text-[hsl(var(--secondary))]">
                {c.value}
              </div>
              <div className="mt-2 text-xs md:text-sm uppercase tracking-widest text-white/50">
                {c.label}
              </div>
            </div>
          ))}
        </div>

        <DayStrip />
      </div>
    </section>
  );
};

export default ScheduleBlock;
