import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import BoldHeader from "@/components/BoldHeader";
import PassDialogHost from "@/components/PassDialogHost";
import { PassDialogProvider, usePassDialog } from "@/contexts/PassDialogContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import TheWork from "@/components/agenda/TheWork";
import TheRhythm from "@/components/agenda/TheRhythm";
import { EVENT } from "@/config/agenda";

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
