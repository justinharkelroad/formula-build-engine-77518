import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Plugin } from "vite";
import { SEO_ROUTES, type SeoRoute } from "../src/config/seoRoutes";
import { CONFIG } from "../src/config/event";

/**
 * Bakes per-route <head> metadata into static HTML at build time.
 *
 * Why this exists: the app is a client-rendered SPA, so react-helmet-async only
 * produces metadata once JavaScript runs. Crawlers that do not execute JS — most
 * social-preview bots and several AI crawlers — saw only index.html, which meant
 * one shared title, description and canonical for the entire site.
 *
 * This plugin writes dist/<route>/index.html for every route in SEO_ROUTES, with
 * that route's own head tags. Static hosts serve those files directly for a hard
 * navigation and fall back to index.html for anything unmatched, so SPA routing is
 * untouched.
 *
 * The injected tags carry data-rh="true", which is react-helmet-async's ownership
 * marker: on boot Helmet claims and replaces them instead of appending a second
 * copy. That is what keeps the head free of duplicates once JS runs.
 *
 * No headless browser and no new dependency, so this cannot break a deploy that
 * lacks Chromium. Body content is still client-rendered — this bakes metadata,
 * not markup.
 */

const escapeAttr = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const escapeText = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Head tags this plugin owns. Stripped from the template before injection so a
 *  prerendered file never carries both the index.html default and the route value. */
const STRIP_PATTERNS: RegExp[] = [
  /[ \t]*<title>[\s\S]*?<\/title>\r?\n?/gi,
  /[ \t]*<meta\s+name="description"[^>]*>\r?\n?/gi,
  /[ \t]*<meta\s+name="robots"[^>]*>\r?\n?/gi,
  /[ \t]*<link\s+rel="canonical"[^>]*>\r?\n?/gi,
  /[ \t]*<meta\s+property="og:[^"]*"[^>]*>\r?\n?/gi,
  /[ \t]*<meta\s+name="twitter:[^"]*"[^>]*>\r?\n?/gi,
];

const absolute = (url: string): string =>
  url.startsWith("http") ? url : `${CONFIG.SITE_URL}${url}`;

const headFor = (route: SeoRoute): string => {
  const canonical = `${CONFIG.SITE_URL}${route.path === "/" ? "" : route.path}`;
  const ogImage = absolute(CONFIG.OG_IMAGE_1200x630);
  const twitterImage = absolute(CONFIG.TW_IMAGE_1200x600);
  const t = escapeAttr(route.title);
  const d = escapeAttr(route.description);

  const tags = [
    `<title data-rh="true">${escapeText(route.title)}</title>`,
    `<meta data-rh="true" name="description" content="${d}">`,
    `<meta data-rh="true" name="robots" content="${route.noindex ? "noindex, nofollow" : "index,follow"}">`,
    ...(route.noindex ? [] : [`<link data-rh="true" rel="canonical" href="${canonical}">`]),
    `<meta data-rh="true" property="og:type" content="event">`,
    `<meta data-rh="true" property="og:site_name" content="${escapeAttr(CONFIG.EVENT_NAME)}">`,
    `<meta data-rh="true" property="og:title" content="${t}">`,
    `<meta data-rh="true" property="og:description" content="${d}">`,
    `<meta data-rh="true" property="og:image" content="${escapeAttr(ogImage)}">`,
    `<meta data-rh="true" property="og:image:width" content="1200">`,
    `<meta data-rh="true" property="og:image:height" content="630">`,
    `<meta data-rh="true" property="og:image:alt" content="${escapeAttr(`${CONFIG.EVENT_NAME} - ${CONFIG.TAGLINE}`)}">`,
    `<meta data-rh="true" property="og:url" content="${canonical}">`,
    `<meta data-rh="true" name="twitter:card" content="summary_large_image">`,
    `<meta data-rh="true" name="twitter:site" content="@formulaforum">`,
    `<meta data-rh="true" name="twitter:title" content="${t}">`,
    `<meta data-rh="true" name="twitter:description" content="${d}">`,
    `<meta data-rh="true" name="twitter:image" content="${escapeAttr(twitterImage)}">`,
  ];

  return tags.map((tag) => `    ${tag}`).join("\n");
};

export const prerenderMeta = (): Plugin => ({
  name: "formula-prerender-meta",
  apply: "build",
  closeBundle() {
    const outDir = "dist";
    const templatePath = join(outDir, "index.html");

    let template: string;
    try {
      template = readFileSync(templatePath, "utf8");
    } catch {
      this.warn("prerender-meta: dist/index.html not found — skipped.");
      return;
    }

    const stripped = STRIP_PATTERNS.reduce((html, re) => html.replace(re, ""), template);
    if (!stripped.includes("</head>")) {
      this.warn("prerender-meta: no </head> in template — skipped.");
      return;
    }

    let written = 0;
    for (const route of SEO_ROUTES) {
      // "/" is the template itself; leaving it alone keeps the SPA fallback intact.
      if (route.path === "/") continue;

      const html = stripped.replace("</head>", `${headFor(route)}\n  </head>`);
      const filePath = join(outDir, route.path.replace(/^\//, ""), "index.html");
      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, html, "utf8");
      written += 1;
    }

    // The root document is the fallback for unmatched URLs, so it keeps generic
    // metadata but still gets the home route's canonical and title.
    const home = SEO_ROUTES.find((r) => r.path === "/");
    if (home) {
      writeFileSync(
        templatePath,
        stripped.replace("</head>", `${headFor(home)}\n  </head>`),
        "utf8"
      );
      written += 1;
    }

    this.info?.(`prerender-meta: wrote ${written} route documents.`);
  },
});
