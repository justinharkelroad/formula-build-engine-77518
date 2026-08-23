import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SEO from "@/components/SEO";
import BoldHeader from "@/components/BoldHeader";
import Footer from "@/components/Footer";
import PassDialogHost from "@/components/PassDialogHost";
import { PassDialogProvider } from "@/contexts/PassDialogContext";
import ResourcePageHero from "./ResourcePageHero";
import ResourceCategoryNav from "./ResourceCategoryNav";
import ResourceTopicBlocks from "./ResourceTopicBlocks";
import PartnerResourceCard from "./PartnerResourceCard";
import ProblemMatchGuide from "./ProblemMatchGuide";
import ResourceLibraryNav from "./ResourceLibraryNav";
import FormulaResourceFooter from "./FormulaResourceFooter";
import { trackResourceEvent } from "@/lib/resourceAnalytics";
import type { BaseResourcePartner, ResourcePageContent } from "@/config/resources/types";

/** Matches the .scroll-mt-20 on each partner card, which clears the floating header. */
const JUMP_OFFSET_PX = 80;

const PARTNER_GRID = "grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]";

interface ResourcePageProps {
  content: ResourcePageContent;
}

/**
 * One renderer for every /resources/* workbook page. Sections are driven by the
 * content module: a page with a single partner gets topic blocks instead of
 * filters, and a page with a large ecosystem can group its list by pathway.
 */
const ResourcePage = ({ content }: ResourcePageProps) => {
  const { categories, partners, decision, guide } = content;
  const hasFilters = Boolean(categories && categories.length > 1);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [pendingJump, setPendingJump] = useState<string | null>(null);
  const viewedPartners = useRef<Set<string>>(new Set());

  // A page's partner list is fixed at build time, so reset state if the route
  // swaps the content module underneath us.
  useEffect(() => {
    setActiveCategory("all");
    viewedPartners.current = new Set();
  }, [content.sessionId]);

  const visiblePartners = useMemo(
    () =>
      activeCategory === "all"
        ? partners
        : partners.filter((partner) => partner.categories.includes(activeCategory)),
    [activeCategory, partners]
  );

  const activeCategoryLabel = categories?.find((c) => c.id === activeCategory)?.label;
  const listHeadline = activeCategoryLabel ?? content.partnerList.allHeadline;

  const countFor = useCallback(
    (categoryId: string) => partners.filter((p) => p.categories.includes(categoryId)).length,
    [partners]
  );

  const track = useCallback(
    (event: Parameters<typeof trackResourceEvent>[0], props: Record<string, string> = {}) => {
      trackResourceEvent(event, { session: content.sessionId, ...props });
    },
    [content.sessionId]
  );

  const handleSelectCategory = useCallback(
    (categoryId: string) => {
      setActiveCategory(categoryId);
      track("resource_category_selected", { category: categoryId });
    },
    [track]
  );

  const handleReset = useCallback(() => handleSelectCategory("all"), [handleSelectCategory]);

  const handlePartnerViewed = useCallback(
    (partnerId: string) => {
      if (viewedPartners.current.has(partnerId)) return;
      viewedPartners.current.add(partnerId);
      track("partner_card_viewed", { partner: partnerId });
    },
    [track]
  );

  const handleVisitCompany = useCallback(
    (partner: BaseResourcePartner) => {
      track("partner_company_clicked", { partner: partner.id, category: activeCategory });
    },
    [track, activeCategory]
  );

  const handleFormulaResourceClick = useCallback(
    (partner: BaseResourcePartner) => {
      track("formula_resource_clicked", {
        partner: partner.id,
        category: activeCategory,
        resourceType: partner.formulaResourceType ?? "unspecified",
      });
    },
    [track, activeCategory]
  );

  // Decision-guide chip: clear the filter first so the target card is mounted,
  // then scroll to it on the next render.
  const handleJumpToPartner = useCallback((partnerId: string) => {
    setActiveCategory("all");
    setPendingJump(partnerId);
  }, []);

  useEffect(() => {
    if (!pendingJump) return;

    const target = document.getElementById(`p-${pendingJump}`);
    if (target) {
      const prefersReducedMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - JUMP_OFFSET_PX,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }

    setPendingJump(null);
  }, [pendingJump]);

  const renderCard = (partner: BaseResourcePartner, headingLevel: "h3" | "h4" = "h3") => (
    <PartnerResourceCard
      key={partner.id}
      partner={partner}
      tags={partner.categories
        .map((id) => categories?.find((c) => c.id === id)?.tag)
        .filter((tag): tag is string => Boolean(tag))}
      onView={handlePartnerViewed}
      onVisitCompany={handleVisitCompany}
      onFormulaResourceClick={handleFormulaResourceClick}
      headingLevel={headingLevel}
    />
  );

  // With a large ecosystem, an undifferentiated wall of logos loses the framework
  // the workbook taught — so group the unfiltered list under its pathway headings.
  const grouped =
    content.groupByCategoryWhenUnfiltered && activeCategory === "all" && categories;

  return (
    <PassDialogProvider>
      <div className="min-h-screen bg-black text-white">
        <SEO title={content.seo.title} description={content.seo.description} path={content.seo.path} />
        <BoldHeader />
        <PassDialogHost />

        <main>
          <ResourcePageHero copy={content.hero} />

          {decision && hasFilters && categories && (
            <ResourceCategoryNav
              categories={categories}
              activeCategory={activeCategory}
              onSelect={handleSelectCategory}
              onReset={handleReset}
              countFor={countFor}
              visibleCount={visiblePartners.length}
              totalCount={partners.length}
              display={content.categoryDisplay}
              copy={{
                microLabel: decision.microLabel,
                headline: decision.headline,
                lede: decision.lede,
                filterGroupLabel: decision.filterGroupLabel ?? "Filter partners",
                resetLabel: decision.resetLabel ?? "All Resources",
              }}
            />
          )}

          {decision && !hasFilters && decision.topicBlocks && (
            <ResourceTopicBlocks
              microLabel={decision.microLabel}
              headline={decision.headline}
              lede={decision.lede}
              blocks={decision.topicBlocks}
            />
          )}

          <section
            id="partners"
            className="px-[clamp(1.25rem,5vw,3rem)] py-[clamp(2.5rem,8vw,4.5rem)]"
          >
            <div className="mx-auto max-w-7xl">
              <div className="eyebrow mb-3">{content.partnerList.eyebrow}</div>
              <h2 className="display-bold m-0 mb-7 text-[clamp(1.75rem,6.5vw,3rem)] text-white">
                {listHeadline}
              </h2>

              {grouped ? (
                <div className="flex flex-col gap-10">
                  {categories.map((category) => {
                    const inGroup = partners.filter((p) => p.categories.includes(category.id));
                    if (inGroup.length === 0) return null;
                    return (
                      <section key={category.id} aria-labelledby={`group-${category.id}`}>
                        <h3
                          id={`group-${category.id}`}
                          className="mb-1 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-[hsl(var(--secondary))]"
                        >
                          {category.label}
                        </h3>
                        <p className="mb-4 text-xs leading-[1.45] text-white/45">{category.sub}</p>
                        <div className={PARTNER_GRID}>
                          {inGroup.map((partner) => renderCard(partner, "h4"))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                <div className={PARTNER_GRID}>
                  {visiblePartners.map((partner) => renderCard(partner))}
                </div>
              )}
            </div>
          </section>

          {guide && (
            <ProblemMatchGuide
              rows={guide.rows}
              resolveName={(id) => partners.find((p) => p.id === id)?.name ?? id}
              resolveCategoryLabel={(id) =>
                id === "all"
                  ? decision?.resetLabel ?? "All Resources"
                  : categories?.find((c) => c.id === id)?.label ?? id
              }
              onJump={handleJumpToPartner}
              onSelectCategory={handleSelectCategory}
              copy={{ eyebrow: guide.eyebrow, headline: guide.headline, lede: guide.lede }}
            />
          )}

          {content.disclaimer && (
            <div className="px-[clamp(1.25rem,5vw,3rem)] pb-[clamp(2rem,6vw,3rem)]">
              <p className="mx-auto max-w-7xl text-xs leading-[1.6] text-white/40">
                {content.disclaimer}
              </p>
            </div>
          )}

          <FormulaResourceFooter copy={content.closing} />
          <ResourceLibraryNav currentPath={content.seo.path} />
        </main>

        <Footer />
      </div>
    </PassDialogProvider>
  );
};

export default ResourcePage;
