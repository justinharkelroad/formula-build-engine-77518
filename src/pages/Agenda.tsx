import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import BoldHeader from "@/components/BoldHeader";
import PassDialogHost from "@/components/PassDialogHost";
import { PassDialogProvider, usePassDialog } from "@/contexts/PassDialogContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  EVENT,
  DAYS,
  WITHHELD_LINE,
  sessionsForDay,
  momentsForDay,
  type AgendaDay,
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

        <p
          className={`max-w-3xl text-2xl md:text-4xl font-semibold leading-tight reveal-up delay-2 ${v}`}
        >
          {EVENT.headline}
        </p>
        <p className={`mt-4 text-lg md:text-xl text-white/60 reveal-up delay-3 ${v}`}>
          {EVENT.subhead} · {EVENT.venue}
        </p>

        {/* Macro arc */}
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

        {/* Counters */}
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

/* ─────────────────────────── Day block ─────────────────────────── */

const DayBlock = ({ day, index }: { day: AgendaDay; index: number }) => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const v = isVisible ? "is-visible" : "";
  const sessions = sessionsForDay(day.id);
  const moments = momentsForDay(day.id);

  return (
    <section
      ref={ref}
      className="bg-black text-white border-t border-white/10 py-16 md:py-24 px-5 md:px-12"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Day header */}
        <div className="grid md:grid-cols-2 gap-6 items-end mb-10 md:mb-14">
          <div>
            <div className={`eyebrow mb-4 reveal-up ${v}`}>
              {day.label} · {day.date}
            </div>
            <h2
              className={`display-bold text-[clamp(2.25rem,9vw,5.5rem)] leading-[0.9] reveal-up delay-1 ${v}`}
            >
              {day.theme}
            </h2>
          </div>
          <div className={`md:text-right reveal-up delay-2 ${v}`}>
            {day.window && <span className="meta-pill">{day.window}</span>}
          </div>
        </div>

        <p className={`max-w-2xl text-lg md:text-2xl text-white/70 mb-12 reveal-up delay-2 ${v}`}>
          {day.promise}
        </p>

        {/* Sessions */}
        {sessions.length > 0 && (
          <div className="mb-12">
            <div className="hidden md:grid grid-cols-12 gap-8 text-xs tracking-widest uppercase text-white/40 mb-2">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Session</div>
              <div className="col-span-4">You leave with</div>
              <div className="col-span-1 text-right">Min</div>
            </div>

            {sessions.map((s, i) => (
              <div
                key={s.n}
                className={`bold-row grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 reveal-up delay-${Math.min(i + 1, 4)} ${v}`}
              >
                <div
                  className="col-span-1 display-bold text-3xl md:text-4xl"
                  style={{ color: trackColor(s.track) }}
                >
                  {s.n}
                </div>

                <div className="col-span-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl md:text-3xl font-bold">{s.title}</h3>
                    <span
                      className="text-[0.6rem] md:text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
                      style={{ color: trackColor(s.track), border: `1px solid ${trackColor(s.track)}` }}
                    >
                      {s.track}
                    </span>
                  </div>
                  <p className="mt-2 text-sm md:text-base text-white/55 max-w-xl">{s.line}</p>
                </div>

                <div className="col-span-4 md:pt-1">
                  <span className="md:hidden text-[0.6rem] uppercase tracking-widest text-white/40">
                    You leave with
                  </span>
                  <p className="text-base md:text-lg font-medium text-white/90">{s.outcome}</p>
                </div>

                <div className="col-span-1 text-sm text-white/50 md:text-right md:pt-2">
                  {s.minutes}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Named moments */}
        {moments.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-10">
            {moments.map((m, i) => (
              <div
                key={m.title}
                className={`border border-white/15 rounded-lg p-6 reveal-up delay-${Math.min(i + 1, 4)} ${v}`}
              >
                <div className="display-bold text-xl md:text-2xl mb-2">{m.title}</div>
                <p className="text-sm md:text-base text-white/60">{m.note}</p>
              </div>
            ))}
          </div>
        )}

        {/* The redaction line */}
        <div
          className={`text-xs md:text-sm tracking-widest uppercase text-white/40 reveal-up delay-3 ${v}`}
        >
          ◆ {WITHHELD_LINE}
        </div>
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
        title="Agenda | Formula Forum 2026 — Eight Sessions, One Map You Leave With"
        description="The Formula Forum 2026 agenda: three days in Orlando, eight working sessions across Business, Body, Balance and Being, ending in the 2027 map you build and declare in the room."
        path="/agenda"
      />
      <StructuredData page="general" />
      <BoldHeader />
      <PassDialogHost />
      <main>
        <AgendaHero />
        {DAYS.map((day, i) => (
          <DayBlock key={day.id} day={day} index={i} />
        ))}
        <AgendaCloser />
      </main>
    </div>
  </PassDialogProvider>
);

export default Agenda;
