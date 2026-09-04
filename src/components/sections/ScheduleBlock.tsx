import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import TheWork from "@/components/agenda/TheWork";
import DayStrip from "@/components/agenda/DayStrip";
import { EVENT } from "@/config/agenda";

/**
 * Homepage agenda section. Condensed: the eight working sessions with their
 * teaser modals, plus a compact three-day strip. The full rhythm — meals,
 * workouts, partner time — lives on /agenda, which DayStrip links to.
 *
 * Keeps id="schedule" so the BoldHeader nav anchor keeps working.
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

        <div className="grid md:grid-cols-2 gap-8 items-end mb-12 md:mb-16">
          <h2
            className={`display-bold text-[clamp(3rem,15vw,9rem)] md:text-[11vw] lg:text-[9vw] whitespace-nowrap reveal-up delay-1 ${v}`}
          >
            THE BUILD
          </h2>
          <div className={`flex flex-wrap gap-3 justify-end reveal-up delay-2 ${v}`}>
            <span className="meta-pill meta-pill-solid">OCT 14-16</span>
            <span className="meta-pill">2026</span>
          </div>
        </div>

        <TheWork
          bare
          intro={`${EVENT.counters[0].value} working sessions across three days. We publish the work, not the running order — the room finds out when it walks in.`}
        />

        <DayStrip />
      </div>
    </section>
  );
};

export default ScheduleBlock;
