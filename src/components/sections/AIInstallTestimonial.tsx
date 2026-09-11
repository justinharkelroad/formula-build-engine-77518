import { useState } from "react";
import { Play, Quote } from "lucide-react";

/**
 * Kevin C (California Agency) on the Agency AI Install attendee gift.
 * Portrait 9:16 Vimeo testimonial, click-to-play so the homepage does not
 * pay for a second eager video player below the fold. Poster is committed to
 * the repo because Vimeo CDN thumbnail hashes rotate when a thumb is regenerated.
 */
const VIMEO_ID = "1225795260";
const POSTER_SRC = "/assets/testimonials/kevin-c-california-agency-poster.jpg";
const SPEAKER = "Kevin C";
const SPEAKER_CONTEXT = "California Agency";
const DURATION_LABEL = "90 sec";

interface AIInstallTestimonialProps {
  isVisible: boolean;
}

const AIInstallTestimonial = ({ isVisible }: AIInstallTestimonialProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);

  const playerSrc = `https://player.vimeo.com/video/${VIMEO_ID}?autoplay=1&playsinline=1&title=0&byline=0&portrait=0&dnt=1`;

  return (
    <div
      className={`mt-12 grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-stretch reveal-up delay-3 ${isVisible ? "is-visible" : ""}`}
    >
      {/* Portrait player — 9:16 wrapper never stretches to landscape */}
      <div className="mx-auto w-full max-w-[320px] lg:mx-0 lg:max-w-none">
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-white/14 bg-[hsl(0,0%,5%)] shadow-[0_30px_80px_-30px_rgba(74,144,226,0.45)] md:rounded-3xl">
          {isPlaying ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={playerSrc}
              title={`${SPEAKER}, ${SPEAKER_CONTEXT}, on the Agency AI Install gift`}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              aria-label={`Play ${SPEAKER}'s testimonial about the Agency AI Install gift`}
              className="group absolute inset-0 block h-full w-full cursor-pointer text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--secondary))]"
            >
              {!posterFailed && (
                <img
                  src={POSTER_SRC}
                  alt=""
                  loading="lazy"
                  width="720"
                  height="1280"
                  onError={() => setPosterFailed(true)}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              )}
              {posterFailed && (
                <div className="h-full w-full bg-gradient-to-br from-[hsl(var(--secondary))]/40 via-black to-black" />
              )}

              {/* Top label */}
              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))]" aria-hidden="true" />
                Attendee gift
              </div>

              {/* Play control */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-black shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-110">
                  <Play className="ml-1 h-9 w-9" fill="currentColor" aria-hidden="true" />
                </span>
              </div>

              {/* Bottom gradient + attribution */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
                <div>
                  <p className="text-base font-black leading-tight md:text-lg">{SPEAKER}</p>
                  <p className="text-xs font-semibold text-white/70 md:text-sm">{SPEAKER_CONTEXT}</p>
                </div>
                <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 font-mono text-[0.65rem] font-bold tracking-wide backdrop-blur">
                  {DURATION_LABEL}
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Context card — calls out what the video is */}
      <div className="flex flex-col rounded-2xl bg-[hsl(0,0%,96%)] p-7 text-black md:rounded-3xl md:p-10 lg:p-12">
        <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-[hsl(var(--secondary))]">
          <Quote className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          In their words
        </div>

        <h3 className="mt-5 max-w-xl text-3xl font-black leading-[1.02] md:text-5xl">
          A real owner on the free Agency AI Install.
        </h3>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-black/62 md:text-lg">
          {SPEAKER} runs an agency in California and received the Agency AI Install, the MY BIZ BRAIN gift every final-day attendee unlocks. Press play to hear what he had to say about it, in his own words.
        </p>

        <div className="mt-auto pt-8">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-black/12 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em]">
              {SPEAKER} · {SPEAKER_CONTEXT}
            </span>
            <span className="rounded-full border border-black/12 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em]">
              {DURATION_LABEL} · sound on
            </span>
          </div>
          <p className="mt-5 border-t border-black/12 pt-5 text-sm font-semibold leading-relaxed text-black/60">
            Unlocked for every ticket holder who attends the final day in Orlando.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIInstallTestimonial;
