import type { ResourceTopicBlock } from "@/config/resources/types";

interface ResourceTopicBlocksProps {
  microLabel: string;
  headline: string;
  lede: string;
  blocks: ResourceTopicBlock[];
}

/**
 * The light section for pages that don't warrant filters. Same card language as
 * ResourceCategoryNav, minus the interactivity — four buttons that all lead to
 * the same partner would be theatre, so these are plain blocks that name the
 * workbook areas instead.
 */
const ResourceTopicBlocks = ({ microLabel, headline, lede, blocks }: ResourceTopicBlocksProps) => (
  <section className="bg-[hsl(0_0%_96%)] px-[clamp(1.25rem,5vw,3rem)] py-[clamp(2.5rem,8vw,4.5rem)] text-[hsl(0_0%_8%)]">
    <div className="mx-auto max-w-7xl">
      <div className="mb-3 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-black/45">
        {microLabel}
      </div>

      <h2 className="display-bold m-0 text-[clamp(1.75rem,6.5vw,3rem)] text-[hsl(0_0%_8%)]">
        {headline}
      </h2>

      <p className="mt-4 max-w-[34rem] text-base leading-relaxed text-black/60">{lede}</p>

      <div className="mt-7 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {blocks.map((block) => (
          <div
            key={block.label}
            className="rounded-2xl border border-black/[0.12] bg-white p-[1.125rem] pb-4"
          >
            <span className="block text-[0.9375rem] font-black uppercase leading-[1.15] tracking-[-0.01em]">
              {block.label}
            </span>
            <span className="mt-2 block text-xs leading-[1.45] text-black/65">{block.sub}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ResourceTopicBlocks;
