import { useState } from "react";
import { Play } from "lucide-react";
import VimeoModal from "@/components/VimeoModal";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { trackCTAClick } from "@/hooks/useAnalytics";
import { FORMULA_FILM, filmPlayerUrl, formatTimestamp, type FormulaChapter } from "@/config/formulaFilm";

/**
 * One of the five Formula chapters. Opens with the chapter's line from the
 * film, a "hear it" link that plays the film from that moment, and the 2026
 * photos for that idea. Chapter-specific content (sponsors, the call, the AI
 * portal) renders after this section on the page.
 */
const FormulaChapterSection = ({ chapter }: { chapter: FormulaChapter }) => {
  const { ref, isVisible } = useScrollAnimation(0.08);
  const [open, setOpen] = useState(false);
  const [lead, ...rest] = chapter.photos;
  const v = isVisible ? "is-visible" : "";

  const handleHear = () => {
    trackCTAClick(`film_chapter_${chapter.id}`);
    setOpen(true);
  };

  return (
    <section
      id={chapter.id}
      ref={ref}
      aria-labelledby={`${chapter.id}-heading`}
      className="scroll-mt-24 bg-black px-5 py-20 text-white md:px-12 md:py-28"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid gap-6 md:gap-10">
          <div className={`reveal-up ${v}`}>
            <div className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-white/50">
              Chapter {chapter.number}
            </div>
            <h2
              id={`${chapter.id}-heading`}
              className="display-bold text-[clamp(2.25rem,9.5vw,9rem)] leading-[0.85] text-[hsl(var(--primary))]"
            >
              {chapter.name}
            </h2>
          </div>

          <div className={`md:ml-auto md:max-w-3xl reveal-up delay-1 ${v}`}>
            <blockquote className="text-2xl font-bold leading-snug md:text-3xl">
              &ldquo;{chapter.line}&rdquo;
            </blockquote>
            <button
              type="button"
              onClick={handleHear}
              className="mt-6 inline-flex items-center gap-3 rounded-radius-pill border border-white/25 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              Hear it · {formatTimestamp(chapter.startSeconds)}
            </button>
          </div>
        </div>

        {lead && (
          <div
            className={`mt-12 grid grid-cols-2 gap-3 md:mt-16 md:gap-4 ${rest.length >= 4 ? "md:grid-cols-4" : "md:grid-cols-3"} reveal-up delay-2 ${v}`}
          >
            <figure className={`col-span-2 overflow-hidden rounded-2xl md:rounded-3xl ${rest.length > 0 ? "md:row-span-2" : ""}`}>
              <img
                src={lead.src}
                alt={lead.alt}
                width={2000}
                height={1125}
                loading="lazy"
                decoding="async"
                className={`aspect-video h-full w-full object-cover ${rest.length > 0 ? "md:aspect-auto" : ""}`}
              />
            </figure>
            {rest.map((p) => (
              <figure key={p.src} className="overflow-hidden rounded-xl md:rounded-2xl">
                <img
                  src={p.src}
                  alt={p.alt}
                  width={2000}
                  height={1125}
                  loading="lazy"
                  decoding="async"
                  className="aspect-video h-full w-full object-cover"
                />
              </figure>
            ))}
          </div>
        )}
      </div>

      <VimeoModal
        isOpen={open}
        onClose={() => setOpen(false)}
        vimeoId={FORMULA_FILM.vimeoId}
        src={filmPlayerUrl(chapter.startSeconds)}
      />
    </section>
  );
};

export default FormulaChapterSection;
