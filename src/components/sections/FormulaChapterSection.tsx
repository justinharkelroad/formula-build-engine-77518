import { useState } from "react";
import { Play } from "lucide-react";
import VimeoModal from "@/components/VimeoModal";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { trackCTAClick } from "@/hooks/useAnalytics";
import { FORMULA_FILM, filmPlayerUrl, formatTimestamp, type FormulaChapter } from "@/config/formulaFilm";
import { REVIEW_SOURCE_LABEL } from "@/config/reviews";

/**
 * One of the five Formula chapters. Opens with the chapter's line from the
 * film, a "hear it" link that plays the film from that moment, an attendee's
 * words backing it up, and the 2026 photos for that idea. Chapter-specific content (sponsors, the call, the AI
 * portal) renders after this section on the page.
 */
// Literal class names so Tailwind keeps them in the build.
const GRID_COLS: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
};

const FormulaChapterSection = ({ chapter }: { chapter: FormulaChapter }) => {
  const { ref, isVisible } = useScrollAnimation(0.08);
  const [open, setOpen] = useState(false);
  const [lead, ...rest] = chapter.photos;
  const tall = rest.filter((p) => p.tall);
  const wide = rest.filter((p) => !p.tall);
  // Lead takes two columns, each tall portrait one, 16:9 photos stack two per column.
  const gridColumns = 2 + tall.length + Math.ceil(wide.length / 2);
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
            <figure>
              <blockquote className="text-2xl font-bold leading-snug md:text-3xl">
                &ldquo;{chapter.line}&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-sm font-semibold text-white/50">
                Justin Harkelroad · {FORMULA_FILM.title}
              </figcaption>
            </figure>
            <button
              type="button"
              onClick={handleHear}
              className="mt-6 inline-flex items-center gap-3 rounded-radius-pill border border-white/25 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              Hear it · {formatTimestamp(chapter.startSeconds)}
            </button>

            {chapter.quote && (
              <figure className="mt-10 border-l-4 border-[hsl(var(--primary))] pl-5 md:pl-7">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--primary))]">
                  From the room
                </div>
                <blockquote className="mt-3 text-lg leading-relaxed text-white/85 md:text-xl">
                  &ldquo;{chapter.quote.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-3 text-sm">
                  <span className="font-bold">{chapter.quote.name}</span>
                  <span className="text-white/50">
                    {" "}· {chapter.quote.detail ?? "Formula 2026 attendee"} · {REVIEW_SOURCE_LABEL[chapter.quote.source]}
                  </span>
                </figcaption>
              </figure>
            )}
          </div>
        </div>

        {lead && (
          <div
            className={`mt-12 grid grid-cols-2 gap-3 md:mt-16 md:gap-4 ${GRID_COLS[gridColumns] ?? "md:grid-cols-4"} reveal-up delay-2 ${v}`}
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
            {tall.map((p) => (
              <figure key={p.src} className="row-span-2 overflow-hidden rounded-xl md:rounded-2xl">
                <img
                  src={p.src}
                  alt={p.alt}
                  width={1125}
                  height={2000}
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: "50% 30%" }}
                  className="h-full w-full object-cover"
                />
              </figure>
            ))}
            {wide.map((p) => (
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
