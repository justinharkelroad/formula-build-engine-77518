import type { BaseResourceCategory } from "@/config/resources/types";

interface ResourceCategoryNavProps {
  categories: BaseResourceCategory[];
  /** "all" when no filter is applied. */
  activeCategory: string;
  onSelect: (categoryId: string) => void;
  onReset: () => void;
  countFor: (categoryId: string) => number;
  visibleCount: number;
  totalCount: number;
  /** "stack" renders an ordered pathway with ↓ connectors instead of a card grid. */
  display?: "grid" | "stack";
  copy: {
    microLabel: string;
    headline: string;
    lede: string;
    filterGroupLabel: string;
    resetLabel: string;
  };
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--secondary)/0.55)]";

const CARD_BASE =
  "rounded-2xl border p-[1.125rem] pb-4 text-left transition-[background-color,border-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]";

const cardTone = (isActive: boolean) =>
  isActive
    ? "border-[hsl(0_0%_8%)] bg-[hsl(0_0%_8%)] text-white"
    : "border-black/[0.12] bg-white text-[hsl(0_0%_8%)]";

/**
 * The one light section on the page. Filtering is progressive enhancement — the
 * full partner list is what loads, and the reset pill is always on screen.
 */
const ResourceCategoryNav = ({
  categories,
  activeCategory,
  onSelect,
  onReset,
  countFor,
  visibleCount,
  totalCount,
  display = "grid",
  copy,
}: ResourceCategoryNavProps) => {
  const allActive = activeCategory === "all";
  const isStack = display === "stack";

  return (
    <section className="bg-[hsl(0_0%_96%)] px-[clamp(1.25rem,5vw,3rem)] py-[clamp(2.5rem,8vw,4.5rem)] text-[hsl(0_0%_8%)]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-black/45">
          {copy.microLabel}
        </div>

        <h2 className="display-bold m-0 text-[clamp(1.75rem,6.5vw,3rem)] text-[hsl(0_0%_8%)]">
          {copy.headline}
        </h2>

        <p className="mt-4 max-w-[34rem] text-base leading-relaxed text-black/60">{copy.lede}</p>

        <div
          role="group"
          aria-label={copy.filterGroupLabel}
          className={
            isStack
              ? "mt-7 max-w-[44rem]"
              : "mt-7 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]"
          }
        >
          {categories.map((category, index) => {
            const isActive = category.id === activeCategory;
            const card = (
              <button
                key={category.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelect(category.id)}
                className={`${FOCUS_RING} ${CARD_BASE} ${cardTone(isActive)} ${isStack ? "w-full" : ""}`}
              >
                <span className="mb-2.5 flex items-center justify-between gap-2">
                  <span className="text-[0.5625rem] font-bold uppercase tracking-[0.16em] opacity-55">
                    {isStack ? `${String(index + 1).padStart(2, "0")} · ${category.tag}` : category.tag}
                  </span>
                  <span className="text-[0.5625rem] font-bold uppercase tracking-[0.16em] opacity-55">
                    {`${countFor(category.id)} partners`}
                  </span>
                </span>
                <span className="block text-[0.9375rem] font-black uppercase leading-[1.15] tracking-[-0.01em]">
                  {category.label}
                </span>
                <span className="mt-2 block text-xs leading-[1.45] opacity-65">{category.sub}</span>
              </button>
            );

            if (!isStack) return card;

            return (
              <div key={category.id}>
                {card}
                {index < categories.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="py-1.5 text-center text-lg font-bold leading-none text-black/30"
                  >
                    ↓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            aria-pressed={allActive}
            onClick={onReset}
            className={`${FOCUS_RING} inline-flex min-h-[44px] items-center gap-2 rounded-full border px-[1.125rem] py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.2em] transition-[background-color,border-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              allActive
                ? "border-[hsl(0_0%_8%)] bg-[hsl(0_0%_8%)] text-white"
                : "border-black/25 bg-transparent text-[hsl(0_0%_8%)]"
            }`}
          >
            {copy.resetLabel}
          </button>

          <span
            aria-live="polite"
            className="text-xs font-semibold tracking-[0.02em] text-black/55"
          >
            {allActive
              ? `Showing all ${totalCount} partners`
              : `Showing ${visibleCount} of ${totalCount} partners`}
          </span>
        </div>
      </div>
    </section>
  );
};

export default ResourceCategoryNav;
