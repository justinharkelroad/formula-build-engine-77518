import { FORMULA_RESOURCE_PLACEHOLDER } from "@/config/resources/formulaResource";

interface FormulaResourcePlaceholderProps {
  title?: string;
  description?: string;
  /** Present only once a real Formula resource exists. */
  url?: string;
  type?: string;
  badge?: string;
}

/**
 * The blue-tinted Formula resource panel. Holds the same footprint whether the
 * resource is live or still pending, so populating a URL never reflows the card.
 */
const FormulaResourcePlaceholder = ({
  title,
  description,
  url,
  type,
  badge,
}: FormulaResourcePlaceholderProps) => {
  const isLive = Boolean(url);
  const badgeLabel = badge ?? (isLive ? type : FORMULA_RESOURCE_PLACEHOLDER.badge);

  return (
    <div className="mt-auto min-h-[118px] rounded-xl border border-[hsl(214_73%_58%/0.3)] bg-[hsl(214_73%_58%/0.07)] px-4 py-[0.9375rem]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-[hsl(var(--secondary))]">
          Formula resource
        </span>
        {badgeLabel && (
          <span className="rounded-full border border-[hsl(214_73%_58%/0.5)] px-2 py-1 text-[0.5rem] font-bold uppercase tracking-[0.16em] text-[hsl(var(--secondary))]">
            {badgeLabel}
          </span>
        )}
      </div>

      <p className="m-0 text-[0.8125rem] font-bold leading-[1.35] text-white">
        {title ?? FORMULA_RESOURCE_PLACEHOLDER.title}
      </p>
      <p className="mt-1.5 text-xs leading-[1.45] text-white/55">
        {description ?? FORMULA_RESOURCE_PLACEHOLDER.description}
      </p>
    </div>
  );
};

export default FormulaResourcePlaceholder;
