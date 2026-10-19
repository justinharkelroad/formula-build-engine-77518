import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { REVIEWS, REVIEW_SOURCE_LABEL, type Review } from "@/config/reviews";

/**
 * Association in practice: what attendees posted and sent after Orlando.
 * Quote cards stay readable on a phone; the original screenshot opens on click.
 */
const ReviewsSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.08);
  const [active, setActive] = useState<Review | null>(null);

  if (REVIEWS.length === 0) return null;

  return (
    <section
      id="reviews"
      ref={ref}
      aria-labelledby="reviews-heading"
      className="bg-[hsl(0,0%,96%)] px-5 py-20 text-black md:px-12 md:py-28"
    >
      <div className="container mx-auto max-w-7xl">
        <div className={`eyebrow mb-4 text-black reveal-up ${isVisible ? "is-visible" : ""}`}>
          WHAT THE ROOM SAID
        </div>
        <h2
          id="reviews-heading"
          className={`max-w-3xl text-3xl font-black leading-tight md:text-5xl reveal-up delay-1 ${isVisible ? "is-visible" : ""}`}
        >
          In their words, after Orlando.
        </h2>

        <div className={`mt-12 columns-1 gap-4 md:columns-2 lg:columns-3 reveal-up delay-2 ${isVisible ? "is-visible" : ""}`}>
          {REVIEWS.map((review) => {
            const body = (
              <>
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-black/45">
                  {REVIEW_SOURCE_LABEL[review.source]}
                </div>
                <blockquote className="mt-4 text-lg font-semibold leading-snug">&ldquo;{review.quote}&rdquo;</blockquote>
                <div className="mt-5 text-sm">
                  <span className="font-bold">{review.name}</span>
                  {review.detail && <span className="text-black/55"> · {review.detail}</span>}
                </div>
                {review.screenshotSrc && (
                  <div className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[hsl(var(--secondary))]">
                    See the original
                  </div>
                )}
              </>
            );
            const cardClass =
              "mb-4 block w-full break-inside-avoid rounded-2xl bg-white p-6 text-left shadow-sm md:p-7";
            return review.screenshotSrc ? (
              <button
                key={`${review.name}-${review.quote.slice(0, 24)}`}
                type="button"
                onClick={() => setActive(review)}
                className={`${cardClass} transition-transform hover:-translate-y-0.5`}
              >
                {body}
              </button>
            ) : (
              <figure key={`${review.name}-${review.quote.slice(0, 24)}`} className={cardClass}>
                {body}
              </figure>
            );
          })}
        </div>
      </div>

      <Dialog open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-h-[90vh] max-w-[92vw] overflow-auto border-white/15 bg-black p-4 md:max-w-xl [&>button:last-child]:hidden">
          <DialogTitle className="sr-only">
            {active ? `${REVIEW_SOURCE_LABEL[active.source]} from ${active.name}` : "Review"}
          </DialogTitle>
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/70 text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          {active?.screenshotSrc && (
            <img
              src={active.screenshotSrc}
              alt={`Original ${REVIEW_SOURCE_LABEL[active.source]} from ${active.name}`}
              className="w-full rounded-xl"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ReviewsSection;
