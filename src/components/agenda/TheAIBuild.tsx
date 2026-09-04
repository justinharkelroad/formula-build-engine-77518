import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { AI_BUILD } from "@/config/agenda";

/**
 * "Your 2027 Build": every session compiles into it, the attendee has it the
 * moment the event ends, it connects to their app, and it keeps building as
 * they work through the year.
 *
 * This is NOT the Agency AI Install Walkthrough bonus gift. Do not reference
 * that product here — they are different things.
 */
const TheAIBuild = () => {
  const { ref, isVisible } = useScrollAnimation(0.08);
  const v = isVisible ? "is-visible" : "";

  return (
    <section
      id="ai-build"
      ref={ref}
      className="bg-black text-white border-t border-white/10 py-16 md:py-24 px-5 md:px-12"
    >
      <div className="container mx-auto max-w-7xl">
        <div className={`eyebrow mb-6 reveal-up ${v}`}>{AI_BUILD.eyebrow}</div>
        <h2
          className={`display-bold text-[clamp(2.25rem,8vw,5rem)] leading-[0.92] mb-8 max-w-4xl reveal-up delay-1 ${v}`}
        >
          {AI_BUILD.heading}
        </h2>
        <p className={`max-w-3xl text-lg md:text-2xl text-white/70 mb-14 reveal-up delay-2 ${v}`}>
          {AI_BUILD.lead}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {AI_BUILD.points.map((pt, i) => (
            <div
              key={pt.title}
              className={`border border-white/15 rounded-lg p-6 md:p-7 reveal-up delay-${Math.min(i + 1, 4)} ${v}`}
            >
              <div className="display-bold text-4xl md:text-5xl text-[hsl(var(--secondary))] mb-4">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">{pt.title}</h3>
              <p className="text-sm md:text-base text-white/60">{pt.body}</p>
            </div>
          ))}
        </div>

        <p
          className={`mt-12 display-bold text-2xl md:text-4xl leading-tight reveal-up delay-4 ${v}`}
        >
          {AI_BUILD.kicker}
        </p>
      </div>
    </section>
  );
};

export default TheAIBuild;
