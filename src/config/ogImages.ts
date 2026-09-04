/**
 * Per-route social preview images (Open Graph / Twitter card).
 *
 * Key: the route path exactly as it appears in seoRoutes.ts and the page's
 * <SEO path=…>. Value: a site-relative path into public/ (e.g. "/og/agenda.jpg")
 * or an absolute URL. Images should be 1200x630 JPG/PNG.
 *
 * Routes not listed here fall back to CONFIG.OG_IMAGE_1200x630, so adding an
 * entry is the only step needed to give a page its own share card. Both the
 * build-time prerender (build/prerenderMeta.ts) and the runtime <SEO> component
 * read this map, so crawlers that skip JavaScript and browsers agree.
 *
 * Keys are exact-match: dynamic routes (/stories/:slug, /partner-welcome/:tier) are
 * not covered by a single entry — pass ogImage directly to <SEO> on those pages.
 *
 * This file deliberately imports nothing: <SEO> is in the main bundle and pages
 * are lazy-loaded, so pulling seoRoutes.ts (and every resource content module)
 * in here would inflate the initial chunk.
 */
export const OG_IMAGES: Record<string, string> = {
  "/agenda": "/og/agenda.jpg",
};

export const ogImageFor = (path: string): string | undefined => OG_IMAGES[path];
