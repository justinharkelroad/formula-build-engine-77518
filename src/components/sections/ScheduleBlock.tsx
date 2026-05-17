import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const sessions = [
  {
    day: "DAY 1",
    title: "Exclusive Welcome Event",
    time: "6:00 PM – 8:00 PM"
  },
  {
    day: "DAY 2",
    title: "Formula General Session",
    time: "9:00 AM – 6:00 PM"
  },
  {
    day: "DAY 3",
    title: "Formula General Session",
    time: "9:00 AM – 12:00 PM"
  }
];

const ScheduleBlock = () => {
  const { ref, isVisible } = useScrollAnimation(0.15);
  return (
    <section
      id="schedule"
      ref={ref}
      className="bg-black text-white py-20 md:py-24 px-5 md:px-12"
    >
      <div className="container mx-auto max-w-7xl">
        <div className={`eyebrow mb-8 reveal-up ${isVisible ? "is-visible" : ""}`}>AGENDA</div>

        {/* Top row: massive headline + date pills */}
        <div className="grid md:grid-cols-2 gap-8 items-end mb-12 md:mb-16">
          <h2 className={`display-bold text-[clamp(3rem,15vw,9rem)] md:text-[11vw] lg:text-[9vw] whitespace-nowrap reveal-up delay-1 ${isVisible ? "is-visible" : ""}`}>
            SCHEDULE
          </h2>
          <div className={`flex flex-wrap gap-3 justify-end reveal-up delay-2 ${isVisible ? "is-visible" : ""}`}>
            <span className="meta-pill meta-pill-solid">OCT 14–16</span>
            <span className="meta-pill">2026</span>
          </div>
        </div>

        {/* Header row — desktop only */}
        <div className="hidden md:grid grid-cols-3 text-xs tracking-widest uppercase text-white/50 mb-2">
          <div>DAY</div>
          <div>SESSION</div>
          <div className="text-right">TIME</div>
        </div>

        <div>
          {sessions.map((s, i) => (
            <div
              key={i}
              className={`bold-row grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-8 py-6 md:py-8 items-start md:items-center reveal-up delay-${i + 2} ${isVisible ? "is-visible" : ""}`}
            >
              <div className="display-bold text-2xl md:text-4xl text-[hsl(var(--secondary))]">
                {s.day}
              </div>
              <div className="text-lg md:text-2xl font-semibold">
                {s.title}
              </div>
              <div className="text-sm md:text-lg text-white/70 md:text-right tracking-wide">
                {s.time}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-xs tracking-widest uppercase text-white/40">
          Full agenda coming soon ◆
        </div>
      </div>
    </section>
  );
};

export default ScheduleBlock;
