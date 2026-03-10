# GEO Compliance Fix — The Formula Forum

Read `GEO-AUDIT-THEFORMULAFORUM.md` in this project directory for full context. That audit scored the site 31/100. Your job is to fix everything possible in the codebase to reach maximum compliance. Attack in this exact order — each phase depends on the one before it.

---

## PHASE 1: Server-Side Rendering (BLOCKER — Everything depends on this)

The entire site is a client-side React SPA on Lovable.app. Every page serves an empty `<div id="root"></div>`. AI crawlers see nothing.

**Determine the framework and implement the best SSR/SSG solution:**
- If this is a Vite + React project: migrate to **Astro** or **Next.js** with static/server rendering, OR add **vite-plugin-ssr** / **vike**
- If migration is too invasive: implement **pre-rendering** using `vite-plugin-prerender` or a Cloudflare Workers script that serves pre-rendered HTML to bot user agents (GPTBot, ClaudeBot, PerplexityBot, Googlebot, Bingbot, ChatGPT-User, OAI-SearchBot, Google-Extended, Amazonbot, Bytespider, CCBot, Applebot-Extended)
- At absolute minimum: ensure every route produces full HTML with real content in the initial server response — not just an empty div that JavaScript fills in

**Verify:** After implementation, `curl -s https://theformulaforum.com/speakers` should return HTML containing actual speaker names, not just `<div id="root"></div>`.

---

## PHASE 2: Per-Page Meta Tags & Canonicals

Currently every route serves identical meta tags (homepage title/description on all pages). Fix this:

1. **Unique `<title>` per page:**
   - `/` → "Formula Forum 2026 | The #1 Insurance Agency Growth Conference | Orlando Oct 14-16"
   - `/agenda` → "Event Agenda | Formula Forum 2026 — Three Days of Agency Growth"
   - `/speakers` → "Speaker Lineup | Formula Forum 2026 — Operators, Builders & Experts"
   - `/pricing` → "Ticket Pricing | Formula Forum 2026 — Agency Owner & Team Passes"
   - `/venue` → "Venue | JW Marriott Orlando Bonnet Creek — Formula Forum 2026"
   - `/faq` → "FAQ | Formula Forum 2026 — Tickets, Hotel, Refunds & More"
   - `/format` → "The Format Framework | Formula Forum 2026 — How Sessions Work"
   - `/partners` → "Partners & Sponsors | Formula Forum 2026"
   - `/contact` → "Contact Us | Formula Forum 2026"
   - `/gallery` → "Photo Gallery | Formula Forum 2025 Highlights"

2. **Unique `<meta name="description">` per page** — each should be 140-160 chars, factual, and information-dense (not marketing fluff). Use the OG description style, not the current "Hop on the waitlist" style.

3. **Self-referencing `<link rel="canonical">` on every page** — e.g., `/speakers` canonicals to `https://theformulaforum.com/speakers`, NOT to `/`.

4. **Unique `og:url`** per page matching the canonical.

5. **Unique `og:title` and `og:description`** per page matching the title/description.

6. **Add `<meta name="robots" content="index, follow">` to all public pages.**

---

## PHASE 3: Move Schema Markup to HTML `<head>`

The audit found comprehensive schema.org markup already exists in the JavaScript bundle but is invisible to crawlers. Extract it and place it in server-rendered `<script type="application/ld+json">` tags in the `<head>` of each page. These MUST be in the initial HTML response, not injected by client-side JavaScript.

**Homepage** — add these JSON-LD blocks:
- `Event` schema (name, dates Oct 14-16 2026, location JW Marriott, offers with pricing, organizer, performers)
- `Organization` schema with `sameAs` linking to Facebook, Instagram, LinkedIn
- `WebSite` schema

**`/speakers`** — add:
- `Person` schema for each of the 12 speakers (name, jobTitle, worksFor, sameAs to their social profiles)

**`/pricing`** — add:
- `Event` with `offers` array (Agency Owner Pass $647, Team Member Pass $347, VIP if applicable)

**`/venue`** — add:
- `Place` schema (JW Marriott Orlando Bonnet Creek, 14900 Chelonia Pkwy, Orlando FL 32821, geo coordinates)

**`/faq`** — add:
- `FAQPage` schema with all Q&A pairs (refunds, hotel booking, group discount, what's included, recording policy, etc.)

**`/format`** — add:
- `HowTo` schema describing the four-step Format Framework

**`/agenda`** — add:
- `Event` with `subEvent` array for each session (once agenda content exists)

**All subpages** — add:
- `BreadcrumbList` schema (Home > Current Page)
- `WebPage` schema with `speakable` property pointing to main heading + key content CSS selectors

Use the complete JSON-LD templates from the audit report as reference. Replace all `[REPLACE: ...]` placeholders with actual data from the site.

---

## PHASE 4: Fix Sitemap, Robots.txt, and Domain Issues

1. **Fix sitemap.xml** — replace ALL `f3florida.com` URLs with `theformulaforum.com` URLs. Use actual lastmod dates per page (not all identical). Example:
   ```xml
   <url>
     <loc>https://theformulaforum.com/</loc>
     <lastmod>2026-03-10</lastmod>
     <changefreq>weekly</changefreq>
     <priority>1.0</priority>
   </url>
   ```

2. **Fix robots.txt:**
   - Change sitemap reference from `https://f3florida.com/sitemap.xml` to `https://theformulaforum.com/sitemap.xml`
   - Add explicit Allow for: `OAI-SearchBot`, `Bytespider`, `CCBot`, `Applebot-Extended`, `FacebookBot`, `Cohere-ai`
   - Keep existing AI crawler allowances (GPTBot, ClaudeBot, PerplexityBot, ChatGPT-User, Google-Extended, Amazonbot)

3. **Create llms.txt** at the web root (`/llms.txt`) — use the exact template from the audit report. This is critical as a workaround while SSR is being perfected.

4. **Create llms-full.txt** at the web root with expanded content — include all FAQ Q&A pairs, full Format Framework description, complete speaker list with bios, all pricing details, and venue information in plain text.

5. **Fix f3florida.com redirects** — if you have access to DNS/hosting config, set up wildcard 301 redirects: `f3florida.com/*` → `theformulaforum.com/*` (not just the root domain).

---

## PHASE 5: Content Fixes

1. **Speaker bios** — write a 100-200 word bio for each of the 12 speakers. Include: credentials, what they'll present, what attendees will learn, and why they're qualified. Currently only Garrett J. White has a bio.

2. **Publish the agenda** — replace "Full Agenda Coming Soon" with actual session content. Even preliminary session titles and topics are better than nothing. Structure with semantic `<h3>` headings per session.

3. **Create an About page** (`/about`) — who organizes Formula Forum, founding story, team bios with photos, mission statement. Currently no organizer information exists on the site.

4. **FAQ page structure** — use semantic `<h3>` headings for each question (not just accordion buttons). This enables passage ranking for AI search.

5. **Remove the Facebook Pixel Debug Tool** from the production Contact page — it's a visible dev artifact ("Facebook Pixel Tester (Dev Tool)").

6. **Fix the hotel room block code** — FAQ references "F3-2025" for the 2026 event. Update to the correct 2026 code.

7. **Add attendee testimonials** with full names, companies, titles, and specific outcomes (not just generic praise).

8. **Consolidate brand identity:**
   - The site uses three identities: theformulaforum.com (domain), f3florida.com (emails), "Triumph Box and Ryde INC" (legal entity)
   - Add a clear explanation of the relationship on the About page
   - Consider switching contact emails to @theformulaforum.com

---

## PHASE 6: Security & Performance Headers

Add these HTTP headers (via Cloudflare, server config, or meta tags):

1. **Content-Security-Policy** — restrict script sources to known origins (self, Cloudflare, Facebook, Supabase, Wistia, YouTube, Google Fonts)
2. **X-Frame-Options: SAMEORIGIN** — prevent clickjacking
3. **Permissions-Policy** — restrict camera, microphone, geolocation, etc.
4. **Cache-Control** — appropriate caching for HTML (short/no-cache) and static assets (long cache)
5. **Add `charset=utf-8`** to Content-Type response header

---

## PHASE 7: Platform-Specific Optimizations

1. **IndexNow for Bing** — generate API key, deploy key file at `/{key}.txt`, configure automatic pings on content changes
2. **Bing Webmaster Tools** — add `<meta name="msvalidate.01" content="YOUR_CODE">` verification tag
3. **Google Search Console** — verify ownership if not already done
4. **Add `twitter:site` meta tag** with the official Twitter/X handle

---

## VERIFICATION CHECKLIST

After all phases, verify:
- [ ] `curl -s https://theformulaforum.com/ | grep -c '<script type="application/ld+json">'` returns 3+ (Event, Organization, WebSite schemas)
- [ ] `curl -s https://theformulaforum.com/speakers` returns HTML containing actual speaker names in the body
- [ ] `curl -s https://theformulaforum.com/faq` returns HTML containing FAQ questions and answers
- [ ] Each page has a unique `<title>` tag (not all identical)
- [ ] Each page has a self-referencing `<link rel="canonical">`
- [ ] `curl -s https://theformulaforum.com/llms.txt` returns the llms.txt content
- [ ] `curl -s https://theformulaforum.com/sitemap.xml` contains only theformulaforum.com URLs
- [ ] `curl -s https://theformulaforum.com/robots.txt` references theformulaforum.com sitemap and lists 10+ AI crawlers
- [ ] No Facebook Pixel Debug Tool visible on /contact
- [ ] All 12 speakers have bios on the /speakers page
