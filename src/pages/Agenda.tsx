import { useState } from "react";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import BoldHeader from "@/components/BoldHeader";
import PassDialogHost from "@/components/PassDialogHost";
import { PassDialogProvider, usePassDialog } from "@/contexts/PassDialogContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import SessionModal from "@/components/agenda/SessionModal";
import {
  EVENT,
  DAYS,
  BUILD_GROUPS,
  WITHHELD_LINE,
  sessionsForBuild,
  rhythmForDay,
  type AgendaDay,
  type AgendaSession,
  type Track,
} from "@/config/agenda";

const trackColor = (track: Track) =>
  track === "BUSINESS" ? "hsl(var(--secondary))" : "hsl(var(--primary))";

/* ─────────────────────────── Hero ─────────────────────────── */

const AgendaHero = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const v = isVisible ? "is-visible" : "";

  return (
    <section ref={ref} className="bg-black text-white pt-32 pb-16 md:pt-40 md:pb-20 px-5 md:px-12">
      <div className="container mx-auto max-w-7xl">
        <div className={`eyebrow mb-8 reveal-up ${v}`}>AGENDA</div>

        <div className="grid md:grid-cols-2 gap-8 items-end mb-10 md:mb-14">
          <h1
            className={`display-bold text-[clamp(3.5rem,17vw,10rem)] md:text-[12vw] lg:text-[10vw] whitespace-nowrap reveal-up delay-1 ${v}`}
          >
            THE BUILD
          </h1>
          <div className={`flex flex-wrap gap-3 md:justify-end reveal-up delay-2 ${v}`}>
            <span className="meta-pill meta-pill-solid">OCT 14–16</span>
            <span className="meta-pill">2026</span>
            <span className="meta-pill">ORLANDO</span>
          </div>
        </div>

        <p className={`max-w-3xl text-2xl md:text-4xl font-semibold leading-tight reveal-up delay-2 ${v}`}>
          {EVENT.headline}
        </p>
        <p className={`mt-4 text-lg md:text-xl text-white/60 reveal-up delay-3 ${v}`}>
          {EVENT.subhead} · {EVENT.venue}
        </p>

        <div className={`mt-14 md:mt-20 reveal-up delay-3 ${v}`}>
          <div className="eyebrow mb-5">THE ARC</div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
            {EVENT.arc.map((step, i) => (
              <span key={step} className="flex items-center gap-3">
                <span className="display-bold text-lg md:text-2xl tracking-tight">{step}</span>
                {i < EVENT.arc.length - 1 && (
                  <span className="text-[hsl(var(--secondary))] text-lg md:text-2xl">→</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className={`mt-14 grid grid-cols-3 gap-4 md:gap-8 reveal-up delay-4 ${v}`}>
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
      </div>
    </section>
  );
};

/* ───────────────────── The eight (no days, no order) ───────────────────── */

const TheWork = () => {
  const { ref, isVisible } = useScrollAnimation(0.05);
  const [active, setActive] = useState<AgendaSession | null>(null);
  const v = isVisible ? "is-visible" : "";

  return (
    <section
      ref={ref}
      className="bg-black text-white border-t border-white/10 py-16 md:py-24 px-5 md:px-12"
    >
      <div className="container mx-auto max-w-7xl">
        <div className={`eyebrow mb-6 reveal-up ${v}`}>THE WORK</div>
        <h2
          className={`display-bold text-[clamp(2.25rem,9vw,5.5rem)] leading-[0.9] mb-6 reveal-up delay-1 ${v}`}
        >
          EIGHT SESSIONS
        </h2>
        <p className={`max-w-2xl text-lg md:text-2xl text-white/70 mb-14 reveal-up delay-2 ${v}`}>
          Every one of these runs across the three days. We publish the work, not the running order —
          the room finds out when it walks in.
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
      </div>

      <SessionModal session={active} onClose={() => setActive(null)} />
    </section>
  );
};

/* ───────────────────── The rhythm (days, no session names) ───────────────────── */

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

/* ─────────────────────────── Closer ─────────────────────────── */

const AgendaCloser = () => {
  const { ref, isVisible } = useScrollAnimation(0.15);
  const { open } = usePassDialog();
  const v = isVisible ? "is-visible" : "";

  return (
    <section
      ref={ref}
      className="bg-black text-white border-t border-white/10 py-20 md:py-28 px-5 md:px-12"
    >
      <div className="container mx-auto max-w-7xl">
        <h2
          className={`display-bold text-[clamp(2.5rem,10vw,7rem)] leading-[0.9] max-w-4xl reveal-up ${v}`}
        >
          {EVENT.closingLine}
        </h2>
        <button
          onClick={() => open("earlyBird")}
          className={`mt-10 inline-flex items-center gap-3 bg-[hsl(var(--secondary))] text-white px-8 py-5 rounded-full text-base md:text-lg font-bold uppercase tracking-widest hover:opacity-90 transition-opacity reveal-up delay-2 ${v}`}
        >
          Claim your seat →
        </button>
      </div>
    </section>
  );
};

/* ─────────────────────────── Page ─────────────────────────── */

const Agenda = () => (
  <PassDialogProvider>
    <div className="min-h-screen bg-black">
      <SEO
        title="Agenda | Formula Forum 2026 — Eight Working Sessions, One Map You Leave With"
        description="The Formula Forum 2026 agenda: three days in Orlando, eight working sessions across Business, Body, Balance and Being, plus rooftop workouts, partner connect and the map you build and declare in the room."
        path="/agenda"
      />
      <StructuredData page="general" />
      <BoldHeader />
      <PassDialogHost />
      <main>
        <AgendaHero />
        <TheWork />
        <TheRhythm />
        <AgendaCloser />
      </main>
    </div>
  </PassDialogProvider>
);

export default Agenda;
