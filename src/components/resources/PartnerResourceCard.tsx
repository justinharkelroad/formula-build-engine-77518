import { useEffect, useRef } from "react";
import type { BaseResourcePartner } from "@/config/resources/types";
import PartnerLogo from "./PartnerLogo";
import FormulaResourcePlaceholder from "./FormulaResourcePlaceholder";

interface PartnerResourceCardProps {
  partner: BaseResourcePartner;
  /** Category tags for this partner, already resolved to display labels. */
  tags: string[];
  /** Fired once when the card first scrolls into view. */
  onView: (partnerId: string) => void;
  onVisitCompany: (partner: BaseResourcePartner) => void;
  onFormulaResourceClick: (partner: BaseResourcePartner) => void;
  /** Drops to h4 when cards sit under a category group heading. */
  headingLevel?: "h3" | "h4";
}

const CTA_BASE =
  "inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-5 py-[0.8125rem] text-xs font-bold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--secondary)/0.55)]";

const PartnerResourceCard = ({
  partner,
  tags,
  onView,
  onVisitCompany,
  onFormulaResourceClick,
  headingLevel: Heading = "h3",
}: PartnerResourceCardProps) => {
  const cardRef = useRef<HTMLElement | null>(null);
  const hasResource = Boolean(partner.formulaResourceUrl);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver !== "function") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          onView(partner.id);
          observer.disconnect();
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [partner.id, onView]);

  return (
    <article
      ref={cardRef}
      id={`p-${partner.id}`}
      data-partner={partner.id}
      className="ash-card lift-hover flex scroll-mt-20 flex-col gap-4 p-[1.125rem]"
    >
      <PartnerLogo logo={partner.logo} logoAlt={partner.logoAlt} name={partner.name} />

      <div>
        <Heading className="display-bold m-0 text-[1.375rem] text-white">{partner.name}</Heading>
        {tags.length > 0 && (
          <div className="mt-2 text-[0.5625rem] font-bold uppercase tracking-[0.16em] text-white/45">
            {tags.join(" · ")}
          </div>
        )}
      </div>

      <div>
        <div className="mb-[0.3125rem] text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-white/45">
          Helps with
        </div>
        <p className="m-0 text-sm leading-normal text-white/70">{partner.helpsWith}</p>
      </div>

      <div>
        <div className="mb-[0.3125rem] text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-white/45">
          Best fit if
        </div>
        <p className="m-0 text-sm leading-normal text-white/70">{partner.bestFit}</p>
      </div>

      <FormulaResourcePlaceholder
        title={partner.formulaResourceTitle}
        description={partner.formulaResourceDescription}
        url={partner.formulaResourceUrl}
        type={partner.formulaResourceType}
        badge={partner.formulaResourceBadge}
      />

      <div className="flex flex-col gap-2">
        {hasResource ? (
          <a
            href={partner.formulaResourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onFormulaResourceClick(partner)}
            aria-label={`View the Formula resource for ${partner.name} (opens in a new tab)`}
            className={`${CTA_BASE} border border-[hsl(214_73%_58%/0.5)] bg-[hsl(214_73%_58%/0.14)] text-white hover:bg-[hsl(var(--secondary))]`}
          >
            Resource not available
          </a>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className={`${CTA_BASE} cursor-not-allowed border border-white/10 bg-white/[0.06] text-white/40`}
          >
            View Formula Resource
          </button>
        )}

        <a
          href={partner.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onVisitCompany(partner)}
          aria-label={`Visit ${partner.name} (opens in a new tab)`}
          className={`${CTA_BASE} border border-white bg-white text-black hover:border-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))] hover:text-white`}
        >
          Visit Company ↗
        </a>
      </div>
    </article>
  );
};

export default PartnerResourceCard;
