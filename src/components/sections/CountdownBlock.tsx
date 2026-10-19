import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { trackCTAClick } from "@/hooks/useAnalytics";
import { AI_PORTAL_PATH, REUNION_CALL, getReunionCallPhase, type ReunionCallPhase } from "@/config/postEvent";

const CALL_TARGET = new Date(REUNION_CALL.startsAtIso);

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  phase: ReunionCallPhase;
};

const getCountdown = (target: Date): Countdown => {
  const now = new Date();
  const phase = getReunionCallPhase(now);
  const remaining = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);
  return { days, hours, minutes, seconds, phase };
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

const COPY: Record<ReunionCallPhase, { eyebrow: string; headline: string; body: string }> = {
  upcoming: {
    eyebrow: "THE FORMULA REUNION CALL",
    headline: REUNION_CALL.dateLabel,
    body: "We're bringing the room back together on Zoom to set up your plan for what comes next, and every attendee gets the link to their Agency AI Install build.",
  },
  live: {
    eyebrow: "THE FORMULA REUNION CALL",
    headline: "WE'RE LIVE",
    body: "The reunion call is happening now. Register to get the Zoom link and jump in.",
  },
  past: {
    eyebrow: "THE FORMULA REUNION CALL",
    headline: "THANK YOU FOR SHOWING UP",
    body: "The Nov 2 reunion call is done. Attendees, your Agency AI Install build lives in the AI portal.",
  },
};

const CountdownBlock = () => {
  const [time, setTime] = useState<Countdown>(() => getCountdown(CALL_TARGET));
  const { ref, isVisible } = useScrollAnimation(0.15);

  useEffect(() => {
    const id = setInterval(() => setTime(getCountdown(CALL_TARGET)), 1000);
    return () => clearInterval(id);
  }, []);

  const copy = COPY[time.phase];

  return (
    <section
      id="reunion-call"
      ref={ref}
      className="relative bg-[hsl(var(--secondary))] text-white py-16 md:py-24 px-5 md:px-12 overflow-hidden"
    >
      {/* Subtle warm glow on the right — coastal sunset vibe */}
      <div className="absolute -right-32 -bottom-32 w-[500px] h-[500px] hero-orb hero-orb-primary animate-flicker-slow pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-end mb-10 md:mb-14">
          <div className={`reveal-up ${isVisible ? "is-visible" : ""}`}>
            <div className="eyebrow text-white/80 mb-4">{copy.eyebrow}</div>
            <h2 className="display-bold text-[clamp(2rem,7vw,4.5rem)] md:text-[4.5vw] lg:text-[3.5vw] leading-[0.95]">
              {copy.headline}
            </h2>
          </div>
          <p className={`text-base md:text-lg text-white/85 md:justify-self-end max-w-md reveal-up delay-2 ${isVisible ? "is-visible" : ""}`}>
            {copy.body}
          </p>
        </div>

        {time.phase === "upcoming" && (
          <div className={`grid grid-cols-4 gap-2 md:gap-8 reveal-up delay-3 ${isVisible ? "is-visible" : ""}`}>
            <CountdownUnit value={time.days} label="Days" />
            <CountdownUnit value={time.hours} label="Hours" />
            <CountdownUnit value={time.minutes} label="Minutes" />
            <CountdownUnit value={time.seconds} label="Seconds" />
          </div>
        )}

        <div className={`mt-10 md:mt-14 flex flex-wrap items-center gap-4 reveal-up delay-3 ${isVisible ? "is-visible" : ""}`}>
          {time.phase === "past" ? (
            <Link
              to={AI_PORTAL_PATH}
              onClick={() => trackCTAClick("reunion_call_ai_portal")}
              className="inline-flex items-center gap-2 bg-white text-black px-7 py-4 rounded-radius-pill font-bold hover:bg-black hover:text-white transition-colors"
            >
              OPEN THE AI PORTAL
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <a
                href={REUNION_CALL.registerUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCTAClick("reunion_call_register")}
                className="inline-flex items-center gap-2 bg-white text-black px-7 py-4 rounded-radius-pill font-bold hover:bg-black hover:text-white transition-colors"
              >
                REGISTER FOR THE CALL
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <span className="text-sm text-white/75">Register on Zoom and your join link arrives by email.</span>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CountdownBlock;
