import { useEffect, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

// Event start — Oct 14, 2026 at 6:00 PM Eastern (EDT, UTC-4)
const EVENT_TARGET = new Date("2026-10-14T18:00:00-04:00");

type Countdown = {
  months: number;
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
};

const getCountdown = (target: Date): Countdown => {
  const now = new Date();
  if (target <= now) return { months: 0, days: 0, hours: 0, minutes: 0, isPast: true };

  // Calendar-aware month diff, then break the remainder into days/hours/minutes
  let months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  const monthAnchor = new Date(now);
  monthAnchor.setMonth(monthAnchor.getMonth() + months);
  if (monthAnchor > target) {
    months--;
    monthAnchor.setMonth(monthAnchor.getMonth() - 1);
  }

  let remaining = target.getTime() - monthAnchor.getTime();
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  remaining -= days * 1000 * 60 * 60 * 24;
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  remaining -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(remaining / (1000 * 60));

  return { months, days, hours, minutes, isPast: false };
};

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="text-center">
    <div className="display-bold text-[clamp(2.75rem,12vw,8rem)] md:text-[8vw] lg:text-[6.5vw] leading-none tabular-nums">
      {String(value).padStart(2, "0")}
    </div>
    <div className="text-[10px] md:text-xs tracking-[0.2em] uppercase opacity-80 mt-2 md:mt-3 font-semibold">
      {label}
    </div>
  </div>
);

const CountdownBlock = () => {
  const [time, setTime] = useState<Countdown>(() => getCountdown(EVENT_TARGET));
  const { ref, isVisible } = useScrollAnimation(0.15);

  useEffect(() => {
    const id = setInterval(() => setTime(getCountdown(EVENT_TARGET)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      ref={ref}
      className="relative bg-[hsl(var(--secondary))] text-white py-16 md:py-24 px-5 md:px-12 overflow-hidden"
    >
      {/* Subtle warm glow on the right — coastal sunset vibe */}
      <div className="absolute -right-32 -bottom-32 w-[500px] h-[500px] hero-orb hero-orb-primary animate-flicker-slow pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-end mb-10 md:mb-14">
          <div className={`reveal-up ${isVisible ? "is-visible" : ""}`}>
            <div className="eyebrow text-white/80 mb-4">COUNTDOWN TO ORLANDO</div>
            <h2 className="display-bold text-[clamp(2rem,7vw,4.5rem)] md:text-[4.5vw] lg:text-[3.5vw] leading-[0.95]">
              {time.isPast ? "WE'RE LIVE" : "OCT 14 · 6:00 PM ET"}
            </h2>
          </div>
          <p className={`text-base md:text-lg text-white/85 md:justify-self-end max-w-md reveal-up delay-2 ${isVisible ? "is-visible" : ""}`}>
            {time.isPast
              ? "Doors are open at the JW Marriott Bonnet Creek. Let's go."
              : "Doors open in Orlando. The clock is live — secure your seat before the next price tier."}
          </p>
        </div>

        <div className={`grid grid-cols-4 gap-2 md:gap-8 reveal-up delay-3 ${isVisible ? "is-visible" : ""}`}>
          <CountdownUnit value={time.months} label="Months" />
          <CountdownUnit value={time.days} label="Days" />
          <CountdownUnit value={time.hours} label="Hours" />
          <CountdownUnit value={time.minutes} label="Minutes" />
        </div>
      </div>
    </section>
  );
};

export default CountdownBlock;
