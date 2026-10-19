import { useState } from "react";
import { Play } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { trackCTAClick } from "@/hooks/useAnalytics";
import { FORMULA_CHAPTERS, FORMULA_FILM, filmPlayerUrl } from "@/config/formulaFilm";

/**
 * Post-event hero. The Formula Opener film is the centerpiece: a poster with a
 * play button that swaps to the Vimeo player (sound + captions) on click, so
 * the page never autoplays a silent talking head.
 */
const FilmHero = () => {
  const { ref, isVisible } = useScrollAnimation(0.05);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    trackCTAClick("film_hero_play");
    setPlaying(true);
  };

  return (
    <section
      id="film"
      ref={ref}
      className="relative overflow-hidden bg-black px-5 pb-16 pt-28 text-white md:px-12 md:pb-24 md:pt-36"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-orb hero-orb-primary absolute -bottom-40 -right-32 h-[640px] w-[640px] animate-flicker-slow" />
        <div className="hero-orb hero-orb-secondary absolute -left-40 top-1/4 h-[520px] w-[520px] animate-flicker" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl">
        <div className={`mb-6 flex flex-wrap gap-3 reveal-up ${isVisible ? "is-visible" : ""}`}>
          <span className="meta-pill">OCT 14-16 · ORLANDO</span>
          <span className="meta-pill meta-pill-dot">THAT&apos;S A WRAP</span>
        </div>

        <h1
          className={`display-bold text-[clamp(3.25rem,14vw,10rem)] leading-[0.86] reveal-up delay-1 ${isVisible ? "is-visible" : ""}`}
        >
          THAT&apos;S<br />
          <span className="text-[hsl(var(--primary))]">FORMULA.</span>
        </h1>

        <ol
          className={`mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold uppercase tracking-[0.18em] text-white/70 md:text-base reveal-up delay-2 ${isVisible ? "is-visible" : ""}`}
          aria-label="The five chapters of Formula"
        >
          {FORMULA_CHAPTERS.map((chapter) => (
            <li key={chapter.id}>
              <a href={`#${chapter.id}`} className="transition-colors hover:text-[hsl(var(--primary))]">
                <span className="text-[hsl(var(--primary))]">{chapter.number}</span> {chapter.name}
              </a>
            </li>
          ))}
        </ol>

        <div
          className={`relative mt-10 aspect-video w-full overflow-hidden rounded-2xl border border-white/12 bg-black shadow-[0_40px_120px_-30px_rgba(255,129,66,0.35)] md:mt-14 md:rounded-3xl reveal-up delay-3 ${isVisible ? "is-visible" : ""}`}
        >
          {playing ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={filmPlayerUrl()}
              title={FORMULA_FILM.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={handlePlay}
              className="group absolute inset-0 h-full w-full text-left"
              aria-label={`Play ${FORMULA_FILM.title}`}
            >
              <img
                src={FORMULA_FILM.posterSrc}
                alt=""
                width={1920}
                height={1080}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-black shadow-2xl transition-transform group-hover:scale-110 md:h-28 md:w-28">
                  <Play className="ml-1 h-8 w-8 fill-current md:h-11 md:w-11" aria-hidden="true" />
                </span>
              </span>
              <span className="absolute bottom-8 left-8 hidden md:block">
                <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--primary))] md:text-sm">
                  Watch the film
                </span>
                <span className="mt-1 block text-xl font-black md:text-3xl">{FORMULA_FILM.title}</span>
                <span className="mt-1 block text-sm text-white/70">{FORMULA_FILM.subtitle}</span>
              </span>
            </button>
          )}
        </div>
        <p className="mt-4 text-sm text-white/70 md:hidden">
          <span className="font-bold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">Watch the film</span>{" "}
          · {FORMULA_FILM.title}, {FORMULA_FILM.subtitle}
        </p>
      </div>
    </section>
  );
};

export default FilmHero;
