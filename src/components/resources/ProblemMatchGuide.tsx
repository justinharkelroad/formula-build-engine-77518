import type { ProblemMatchRow } from "@/config/resources/types";

interface ProblemMatchGuideProps {
  rows: ProblemMatchRow[];
  /** Resolves a partner id to its display name. */
  resolveName: (partnerId: string) => string;
  /** Resolves a category id to its display label ("all" → the reset label). */
  resolveCategoryLabel: (categoryId: string) => string;
  /** Clears the active filter, then jumps to that partner's card. */
  onJump: (partnerId: string) => void;
  /** Applies a category filter ("all" resets). */
  onSelectCategory: (categoryId: string) => void;
  copy: {
    eyebrow: string;
    headline: string;
    lede: string;
  };
}

const CHIP =
  "inline-flex min-h-[36px] items-center rounded-full border border-white/20 bg-transparent px-3 py-[0.4375rem] text-[0.6875rem] font-semibold tracking-[0.02em] text-white/80 transition-colors hover:border-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--secondary)/0.55)]";

const ProblemMatchGuide = ({
  rows,
  resolveName,
  resolveCategoryLabel,
  onJump,
  onSelectCategory,
  copy,
}: ProblemMatchGuideProps) => (
  <section className="px-[clamp(1.25rem,5vw,3rem)] pb-[clamp(2.5rem,8vw,4.5rem)]">
    <div className="mx-auto max-w-7xl">
      <div className="eyebrow mb-3">{copy.eyebrow}</div>

      <h2 className="display-bold m-0 text-[clamp(1.75rem,6.5vw,3rem)] text-white">
        {copy.headline}
      </h2>

      <p className="mb-6 mt-3.5 max-w-[32rem] text-sm leading-relaxed text-white/70">{copy.lede}</p>

      <div>
        {rows.map((row) => (
          <div key={row.problem} className="bold-row grid gap-2.5">
            <div className="text-[0.6875rem] font-bold uppercase leading-[1.4] tracking-[0.16em] text-white">
              {row.problem}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(row.partnerIds ?? []).map((partnerId) => {
                const name = resolveName(partnerId);
                return (
                  <button
                    key={partnerId}
                    type="button"
                    onClick={() => onJump(partnerId)}
                    aria-label={`Jump to ${name}`}
                    className={CHIP}
                  >
                    {`${name} →`}
                  </button>
                );
              })}

              {(row.categoryIds ?? []).map((categoryId) => {
                const label = resolveCategoryLabel(categoryId);
                return (
                  <button
                    key={categoryId}
                    type="button"
                    onClick={() => onSelectCategory(categoryId)}
                    aria-label={`Show ${label}`}
                    className={CHIP}
                  >
                    {`${label} →`}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProblemMatchGuide;
