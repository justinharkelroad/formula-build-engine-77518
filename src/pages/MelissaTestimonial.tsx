import { ArrowRight, CheckCircle2, Quote, Sparkles, Users } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { trackCTAClick } from "@/hooks/useAnalytics";

const MELISSA_VIDEO_ID = "BbpXNx7Jixo";

const MelissaTestimonial = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const trackAccessPassClick = () => {
    trackCTAClick("testimonial_melissa_access_pass");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <SEO
        title="Why Melissa Is Coming Back to Formula Forum"
        description="Hear why Melissa, an insurance professional from Tennessee, plans to return to Formula Forum with more of her team."
        path="/stories/melissa"
      />
      <Navigation />

      <main className="relative isolate">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(circle_at_18%_12%,hsl(var(--primary)/0.2),transparent_34%),radial-gradient(circle_at_85%_26%,hsl(var(--secondary)/0.2),transparent_30%)]"
        />

        <section className="container mx-auto px-4 py-12 md:py-16 lg:py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
            <div className="mx-auto w-full max-w-[430px]">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-zinc-950 shadow-[0_32px_90px_-34px_hsl(var(--primary)/0.65)]">
                <div className="pointer-events-none absolute inset-x-6 top-5 z-10 flex items-center justify-between">
                  <span className="rounded-full border border-white/15 bg-black/65 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                    Real attendee story
                  </span>
                  <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                    Tennessee
                  </span>
                </div>
                <div className="aspect-[9/16] bg-zinc-950">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${MELISSA_VIDEO_ID}?rel=0&modestbranding=1`}
                    title="Melissa shares her Formula Forum experience"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
              <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-white/45">
                Melissa · Tennessee
              </p>
            </div>

            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <Sparkles className="h-4 w-4" />
                A Formula Forum story
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-[1.04] tracking-[-0.035em] md:text-6xl lg:text-6xl xl:text-7xl">
                Melissa is coming back—
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  with more of her team.
                </span>
              </h1>

              <div className="relative my-8 border-l-2 border-primary pl-6 md:my-8 md:pl-8">
                <Quote className="absolute -left-4 -top-4 h-8 w-8 fill-primary text-primary" aria-hidden="true" />
                <blockquote className="text-2xl font-semibold leading-snug text-white md:text-3xl">
                  “My only regret is that I wish I would have brought more of my team members.”
                </blockquote>
              </div>

              <div className="grid gap-3 text-base text-white/72 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  “I took a ton of notes on processes we definitely plan on implementing.”
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  “I’ll definitely be back, but this time I’m going to bring a lot more staff.”
                </div>
              </div>

              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Button asChild variant="cta" size="xl" className="w-full sm:w-auto">
                  <Link to="/pricing" onClick={trackAccessPassClick}>
                    Grab Your Access Pass
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <p className="max-w-xs text-sm leading-relaxed text-white/55">
                  Join agency owners and teams ready to turn powerful ideas into action.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.025]">
          <div className="container mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3 md:py-12">
            {[
              {
                icon: Users,
                title: "Bring the team",
                copy: "Shared experiences become shared language when you bring the people who execute with you.",
              },
              {
                icon: CheckCircle2,
                title: "Leave with action",
                copy: "Capture practical ideas and processes you can take straight back to the agency.",
              },
              {
                icon: Sparkles,
                title: "Experience it live",
                copy: "The connections, breakouts, and energy are designed to be felt in the room.",
              },
            ].map(({ icon: Icon, title, copy }) => (
              <article key={title} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="mb-1 font-bold text-white">{title}</h2>
                  <p className="text-sm leading-relaxed text-white/55">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 text-center md:py-24">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            Formula Forum 2026
          </p>
          <h2 className="mx-auto max-w-3xl text-3xl font-black tracking-tight md:text-5xl">
            Don’t hear about the room afterward. Be in it.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/60">
            October 14–16, 2026 · JW Marriott Orlando Bonnet Creek
          </p>
          <Button asChild variant="cta" size="xl" className="mt-8">
            <Link to="/pricing" onClick={trackAccessPassClick}>
              See Access Pass Options
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </section>
      </main>
    </div>
  );
};

export default MelissaTestimonial;
