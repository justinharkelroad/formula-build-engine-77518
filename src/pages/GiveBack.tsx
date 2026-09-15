import { ArrowUpRight, HeartHandshake } from "lucide-react";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import CustomCursor from "@/components/CustomCursor";
import BoldHeader from "@/components/BoldHeader";
import PassDialogHost from "@/components/PassDialogHost";
import { PassDialogProvider } from "@/contexts/PassDialogContext";
import GiantTicketFooter from "@/components/sections/GiantTicketFooter";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { DESTINY_RESCUE } from "@/config/giveBack";

/** Static class names — Tailwind's scanner cannot see an interpolated `delay-${i}`. */
const STAT_DELAYS = ["delay-1", "delay-2", "delay-3"] as const;

const GiveBack = () => {
  const title = "The Room Gives Back | Formula Forum 2026 x Destiny Rescue";
  const description =
    "Formula Forum 2026 partners with Destiny Rescue to rescue children from sexual exploitation. This room raised $31,000 in 2025. Give now and help us beat the number in Orlando.";

  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation(0.15);
  const { ref: closerRef, isVisible: closerVisible } = useScrollAnimation(0.15);

  return (
    <PassDialogProvider>
      <div className="min-h-screen bg-black text-white">
        <SEO title={title} description={description} path="/give-back" />
        <StructuredData page="general" />
        <CustomCursor />
        <BoldHeader />
        <PassDialogHost />

        {/* HERO */}
        <section className="relative overflow-hidden pt-28 pb-16 md:pt-40 md:pb-24">
          <div className="pointer-events-none absolute inset-0">
            <div className="hero-orb hero-orb-primary absolute -left-32 top-1/4 h-[500px] w-[500px]" />
            <div className="hero-orb hero-orb-secondary absolute bottom-0 right-0 h-[400px] w-[400px] opacity-40" />
          </div>

          <div className="container relative z-10 mx-auto max-w-7xl px-5 md:px-12">
            <div className="eyebrow mb-6">THE ROOM GIVES BACK</div>

            <h1 className="display-bold mb-8 break-words text-[clamp(2.25rem,7vw,5.5rem)] leading-[0.9]">
              {/* Hard breaks match the workbook spread on desktop. Below md they are
                  suppressed so the headline wraps naturally instead of leaving an orphan. */}
              Last year this room{" "}
              <span className="hidden md:inline">
                <br />
              </span>
              raised <span className="text-[hsl(var(--primary))]">$31,000</span>.{" "}
              <span className="hidden md:inline">
                <br />
              </span>
              This year we beat it.
            </h1>

            <div className="grid gap-10 md:grid-cols-2 md:gap-12">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-3">
                  <span className="meta-pill meta-pill-solid">DESTINY RESCUE</span>
                  <span className="meta-pill meta-pill-dot">GIVING OPEN NOW</span>
                </div>

                <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row">
                  <a
                    href={DESTINY_RESCUE.GIVE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-radius-pill bg-[hsl(var(--primary))] px-7 py-4 font-bold text-black shadow-lg shadow-black/40 transition-transform hover:-translate-y-0.5 active:translate-y-px"
                  >
                    GIVE TO DESTINY RESCUE
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <a
                    href={DESTINY_RESCUE.ORG_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-radius-pill border border-white/25 px-7 py-4 font-bold text-white transition-colors hover:bg-white/10"
                  >
                    ABOUT DESTINY RESCUE
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <p className="text-lg leading-relaxed text-white/72 md:text-xl" data-speakable="true">
                Formula 2026 partners with Destiny Rescue because the work in the Formula workbook
                is not only about what you build. It is about what you are willing to use it for.
                Every dollar raised in this room goes to rescue operations, aftercare, and keeping
                rescued children free. Give what you decide to give, and let us walk out of Orlando
                past $31,000.
              </p>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section ref={statsRef} className="bg-[hsl(0,0%,5%)] px-5 py-16 md:px-12 md:py-24">
          <div className="container mx-auto max-w-7xl">
            <h2 className="mb-10 max-w-3xl text-3xl font-black leading-tight md:text-5xl">
              What your giving pays for
            </h2>

            <div className="grid gap-px overflow-hidden rounded-2xl bg-white/12 md:grid-cols-3 md:rounded-3xl">
              {DESTINY_RESCUE.STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`bg-[hsl(0,0%,5%)] p-7 md:p-10 reveal-up ${STAT_DELAYS[i]} ${statsVisible ? "is-visible" : ""}`}
                >
                  <div className="text-4xl font-black text-[hsl(var(--primary))] md:text-6xl">
                    {stat.value}
                  </div>
                  <p className="mt-4 text-base font-bold leading-snug text-white/80 md:text-lg">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm leading-relaxed text-white/50">
              Figures reported by Destiny Rescue. More than a million children are still waiting to
              be found.
            </p>
          </div>
        </section>

        {/* CLOSER */}
        <section ref={closerRef} className="bg-black px-5 py-16 md:px-12 md:py-24">
          <div className="container mx-auto max-w-7xl">
            <div
              className={`grid overflow-hidden rounded-2xl border border-white/14 md:rounded-3xl lg:grid-cols-[1.25fr_0.75fr] reveal-up ${closerVisible ? "is-visible" : ""}`}
            >
              <div className="flex flex-col justify-end bg-[hsl(0,0%,5%)] p-7 md:p-12 lg:p-16">
                <HeartHandshake
                  className="mb-8 h-10 w-10 text-[hsl(var(--primary))]"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <h2 className="max-w-2xl text-3xl font-black leading-tight md:text-5xl lg:text-6xl">
                  Give. Then <span className="text-[hsl(var(--primary))]">beat the number</span>.
                  <br />
                  One child is worth the whole room.
                </h2>

                <a
                  href={DESTINY_RESCUE.GIVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-10 inline-flex w-fit items-center gap-2 rounded-radius-pill bg-white px-7 py-4 font-bold text-black transition-transform hover:-translate-y-0.5 active:translate-y-px"
                >
                  GIVE NOW
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>

              <div className="brand-block-blue flex flex-col justify-center p-7 md:p-12">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/72">
                  The number to beat
                </div>
                <div className="mt-3 text-6xl font-black leading-none md:text-7xl">$31,000</div>
                <p className="mt-5 text-sm leading-relaxed text-white/82">
                  Raised by the Formula room in 2025. Every gift in 2026 counts toward passing it.
                </p>
              </div>
            </div>
          </div>
        </section>

        <GiantTicketFooter />
      </div>
    </PassDialogProvider>
  );
};

export default GiveBack;
