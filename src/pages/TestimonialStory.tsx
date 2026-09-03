import { ArrowUpRight, Quote } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import BoldHeader from "@/components/BoldHeader";
import CustomCursor from "@/components/CustomCursor";
import PassDialogHost from "@/components/PassDialogHost";
import SEO from "@/components/SEO";
import WaveDivider from "@/components/WaveDivider";
import GiantTicketFooter from "@/components/sections/GiantTicketFooter";
import { getTestimonialStory, type TestimonialStory as TestimonialStoryData } from "@/config/testimonialStories";
import { PassDialogProvider, usePassDialog } from "@/contexts/PassDialogContext";
import { trackCTAClick } from "@/hooks/useAnalytics";
import NotFound from "@/pages/NotFound";

const StoryContent = ({ story }: { story: TestimonialStoryData }) => {
  const { open: openPassDialog } = usePassDialog();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [story.slug]);

  const handleAccessPassClick = () => {
    trackCTAClick(`testimonial_${story.slug}_access_pass`);
    openPassDialog("earlyBird");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO
        title={`${story.name}’s Formula Forum Story`}
        description={`Hear why ${story.name}, an insurance professional from ${story.location}, recommends experiencing Formula Forum in person.`}
        path={`/stories/${story.slug}`}
      />
      <CustomCursor />
      <BoldHeader />
      <PassDialogHost />

      <main>
        <section className="relative overflow-hidden bg-black px-5 pb-28 pt-32 md:px-12 md:pb-36 md:pt-40">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="hero-orb hero-orb-secondary absolute -left-48 top-20 h-[620px] w-[620px] animate-flicker" />
            <div className="hero-orb hero-orb-primary absolute -right-44 bottom-0 h-[620px] w-[620px] animate-flicker-slow" />
            <div className="hero-orb hero-orb-accent absolute right-1/3 top-1/4 h-[360px] w-[360px] animate-flicker-fast" />
          </div>

          <div className="container relative z-10 mx-auto max-w-7xl">
            <div className="eyebrow mb-8">VOICES — REAL OWNERS</div>

            <div className="grid items-center gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
              <div className="mx-auto w-full max-w-[430px] lg:mx-0">
                <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-black shadow-2xl shadow-black/60">
                  <div className="absolute left-4 top-4 z-10 flex gap-2">
                    <span className="meta-pill bg-black/75">{story.name.toUpperCase()}</span>
                    <span className="meta-pill meta-pill-solid">{story.locationCode}</span>
                  </div>
                  <div className="aspect-[9/16]">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${story.videoId}?rel=0&modestbranding=1`}
                      title={`${story.name} shares their Formula Forum experience`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
                <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-white/45">
                  Press play to hear {story.name}'s story
                </p>
              </div>

              <div>
                <div className="mb-6 flex flex-wrap gap-3">
                  <span className="meta-pill">FORMULA FORUM</span>
                  <span className="meta-pill meta-pill-dot">REAL ATTENDEE</span>
                  <span className="meta-pill">{story.location.toUpperCase()}</span>
                </div>

                <h1 className="display-bold text-[clamp(3.1rem,8vw,7.5rem)] leading-[0.84]">
                  {story.headlineLead}
                  <span className="mt-2 block display-outline">{story.headlineOutline}</span>
                  <span className="mt-2 block">{story.headlineClose}</span>
                </h1>

                <div className="mt-9 max-w-2xl border-l-2 border-[hsl(var(--primary))] pl-6">
                  <blockquote className="text-xl font-semibold leading-snug text-white/90 md:text-2xl">
                    “{story.secondaryQuote}”
                  </blockquote>
                </div>

                <button
                  type="button"
                  onClick={handleAccessPassClick}
                  className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 font-bold text-black shadow-lg shadow-black/40 transition-colors hover:bg-[hsl(var(--secondary))] hover:text-white"
                >
                  GRAB YOUR ACCESS PASS
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <WaveDivider
            position="bottom"
            fill="hsl(var(--secondary))"
            speed="slow"
            className="absolute bottom-0 left-0 z-[1]"
          />
        </section>

        <section className="bg-[hsl(var(--secondary))] px-5 py-20 text-white md:px-12 md:py-28">
          <div className="container mx-auto max-w-7xl">
            <div className="grid gap-10 md:grid-cols-[0.28fr_1fr] md:gap-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/10">
                <Quote className="h-8 w-8 fill-white text-white" aria-hidden="true" />
              </div>
              <blockquote className="display-bold text-[clamp(2.35rem,6.5vw,6rem)] leading-[0.92]">
                “{story.primaryQuote}”
              </blockquote>
            </div>
          </div>
        </section>

        <section className="bg-[hsl(0,0%,96%)] px-5 py-20 text-[hsl(0,0%,8%)] md:px-12 md:py-28">
          <div className="container mx-auto max-w-7xl">
            <div className="eyebrow mb-10 text-black">WHY FORMULA FEELS DIFFERENT</div>

            <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
              <h2 className="display-bold text-[clamp(3rem,8vw,7rem)] leading-[0.88]">
                COME FOR<br />
                THE IDEAS.<br />
                <span className="text-[hsl(var(--secondary))]">LEAVE READY</span><br />
                TO EXECUTE.
              </h2>

              <div className="flex flex-col justify-center gap-5">
                <article className="rounded-2xl border border-black/5 bg-white p-7 shadow-sm md:p-9">
                  <p className="text-xl font-bold leading-snug md:text-2xl">
                    “{story.secondaryQuote}”
                  </p>
                  <div className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                    {story.name} · {story.location}
                  </div>
                </article>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/5 bg-white p-6">
                    <div className="mb-3 text-4xl font-black text-[hsl(var(--primary))]">01</div>
                    <h3 className="text-lg font-bold">Actionable takeaways</h3>
                    <p className="mt-2 text-sm leading-relaxed text-black/60">
                      Practical ideas and operating systems built to move from notes into action.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-black/5 bg-white p-6">
                    <div className="mb-3 text-4xl font-black text-[hsl(var(--secondary))]">02</div>
                    <h3 className="text-lg font-bold">Real connections</h3>
                    <p className="mt-2 text-sm leading-relaxed text-black/60">
                      Owners and team members learning together, sharing honestly, and raising the bar.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAccessPassClick}
                  className="mt-2 inline-flex self-start items-center gap-2 rounded-full bg-black px-7 py-4 font-bold text-white transition-colors hover:bg-[hsl(var(--secondary))]"
                >
                  SEE ACCESS PASS OPTIONS
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <GiantTicketFooter />
      </main>
    </div>
  );
};

const TestimonialStory = () => {
  const { slug } = useParams<{ slug: string }>();
  const story = getTestimonialStory(slug);

  if (!story) return <NotFound />;

  return (
    <PassDialogProvider>
      <StoryContent story={story} />
    </PassDialogProvider>
  );
};

export default TestimonialStory;
