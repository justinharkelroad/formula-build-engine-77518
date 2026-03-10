# SEO / AEO / GEO Comprehensive Audit Report

**Site:** f3florida.com (Formula Forum 2026)
**Stack:** React 18 + Vite + React Router + Tailwind CSS + Supabase
**Rendering:** Client-Side Only (SPA) — No SSR/SSG
**Audit Date:** 2026-02-26

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase 1: Full Audit](#phase-1-full-audit)
   - [SEO Audit](#seo-audit)
   - [AEO Audit](#aeo-audit)
   - [GEO Audit](#geo-audit)
3. [Phase 2: Gap Analysis (Prioritized)](#phase-2-gap-analysis)
4. [Phase 3: Implementation Plan](#phase-3-implementation-plan)
5. [Phase 4: The Nuclear Option — `llms.txt` + Citability Architecture](#phase-4-the-nuclear-option--llmstxt--citability-architecture)

---

## Executive Summary

This site is a React SPA deployed via Lovable.dev with **zero server-side rendering**. While basic SEO scaffolding exists (react-helmet-async, JSON-LD, sitemap.xml, robots.txt), there are **38 critical gaps** that severely limit search visibility, AI answer engine citations, and LLM discoverability. The most damaging issue is that **crawlers receive an empty HTML shell** — all content is rendered client-side via JavaScript, making it invisible to any bot that doesn't execute JS (most AI answer engines, many crawlers).

**Severity Breakdown:**
- CRITICAL (blocks indexing): 5 issues
- HIGH (significant ranking/visibility impact): 14 issues
- MEDIUM (missed opportunities): 12 issues
- LOW (nice-to-have): 7 issues

---

## Phase 1: Full Audit

### SEO Audit

#### 1. Meta Tags (Title, Description, Canonical, OG, Twitter Cards)

**Current State:** The `SEO.tsx` component provides per-page meta tags via react-helmet-async. Most pages use it.

| Page | Title | Description | Canonical | OG Tags | Twitter | Issues |
|------|-------|-------------|-----------|---------|---------|--------|
| `/` (Index) | Formula Forum 2026... | Insurance Agency Growth Conference... | Yes | Yes | Yes | None |
| `/agenda` | Agenda — Formula Forum 2025 | Complete 3-day schedule... | Yes | Yes | Yes | **Says 2025, event is 2026** |
| `/pricing` | Pricing — F³ Formula Forum 2025 | Pass options... | Yes | Yes | Yes | **Says 2025** |
| `/speakers` | Speakers — F³ Formula Forum 2025 | Meet operators... | Yes | Yes | Yes | **Says 2025** |
| `/format` | Format — F³ Formula Forum 2025 | Workshops, breakouts... | Yes | Yes | Yes | **Says 2025** |
| `/venue` | Venue and Travel Information... | JW Marriott... | Yes | Yes | Yes | **Says 2025** |
| `/faq` | FAQ — F³ Formula Forum 2025 | Frequently asked questions... | Yes | Yes | Yes | **Says 2025** |
| `/gallery` | Photo Gallery... Formula Forum 2026 | View photos... | Yes | Yes | Yes | OK |
| `/contact` | Dynamic via CONFIG | Dynamic via CONFIG | Yes | Yes | Yes | **CONFIG says 2025** |
| `/partners` | Dynamic via CONFIG | Dynamic via CONFIG | Yes | Yes | Yes | **CONFIG says 2025** |
| `/2025partners` | 2025 Partner Podcast Episodes... | Hear from our 2025... | Yes | Yes | Yes | OK (historical) |
| `/register` | Register... Formula Forum 2025 | Register for Formula Forum 2025... | Yes | Yes | Yes | **Says 2025** |
| `/survey` | Formula Forum Survey... | Help us make... | Yes | Yes | Yes | OK |
| `/payment-success` | Payment Successful... 2025 | Thank you... | Yes | Yes | Yes | **Says 2025** |
| `/thank-you` | Registration Confirmed... 2025 | Your registration... | Yes | Yes | Yes | **Says 2025** |
| `/ga-setup` | N/A | N/A | No | No | No | **No SEO at all** |
| `/*` (404) | N/A | N/A | No | No | No | **No SEO at all** |

**Critical Issues Found:**

1. **`index.html` static tags conflict with react-helmet-async dynamic tags:**
   - Static: `og:type="website"` vs Dynamic: `og:type="event"`
   - Static: `twitter:card="summary"` vs Dynamic: `twitter:card="summary_large_image"`
   - Static: **No og:image** — crawlers that don't execute JS get no social image
   - Static: `meta author="Lovable"` — should be the event organizer

2. **`index.html` has placeholder `GA_MEASUREMENT_ID`** (line 12-18) — the GA script uses the literal string "GA_MEASUREMENT_ID" instead of the real ID `G-THCBG6D7ZM`. This script fires alongside the React `GA4Script.tsx` component which uses the real ID, causing **double GA loading**.

3. **All dates throughout CONFIG, structured data, and page titles say "2025"** but the event has been updated to 2026 (homepage says 2026, hero says "OCTOBER 14-16, 2026").

4. **No `og:image` in static HTML** — social sharing previews are broken for any platform that doesn't execute JavaScript.

---

#### 2. Heading Hierarchy

| Page | H1 | Issues |
|------|-----|--------|
| `/` | `<h1>formula</h1>` (animated letters in HeroSection) | H1 content is just the word "formula" — not descriptive. "is back!" is a `<span>`, not part of the H1 |
| `/agenda` | "Agenda — Formula Forum 2025" | OK structurally |
| `/pricing` | "Pricing" | OK but generic — no keywords |
| `/speakers` | "Speakers" | OK but generic |
| `/format` | "The Format Framework" | OK |
| `/venue` | "Venue and travel information" | OK |
| `/faq` | "FAQ" | OK but generic |
| `/gallery` | "Photo Gallery" | OK |
| `/contact` | In ContactHero component | Needs verification |
| `/partners` | In PartnerHero component | Needs verification |
| `/register` | "Register for Formula Forum 2025" | Says 2025 |
| `/survey` | "We Want to Hear From You" | OK |
| `/*` (404) | "404" | OK for error page |

**Issues:**
- Homepage H1 is just "formula" — misses all keyword opportunities
- Multiple pages have generic H1s ("Pricing", "FAQ", "Speakers") with no event-specific keywords
- Subheading "is back!" on homepage is a `<span>`, not semantically associated with the H1

---

#### 3. URL Structure & Routing

**Current Routes:**
```
/                    → Homepage (clean)
/agenda              → Agenda (clean)
/pricing             → Pricing (clean)
/speakers            → Speakers (clean)
/format              → Format (clean)
/venue               → Venue (clean)
/survey              → Survey (clean)
/partners            → Partners (clean)
/2025partners        → Partner Podcasts (PROBLEMATIC)
/gallery             → Gallery (clean)
/contact             → Contact (clean)
/faq                 → FAQ (clean)
/register            → Register (clean)
/payment-success     → Payment Success (clean)
/thank-you           → Thank You (clean)
/ga-setup            → GA Setup (should be hidden)
/admin/auth          → Admin Login (should be blocked)
/admin/registrations → Admin Panel (should be blocked)
/admin/metrics       → Admin Panel (should be blocked)
```

**Issues:**
- `/2025partners` is a non-descriptive URL — should be `/partners/2025-podcast-episodes` or similar
- `/ga-setup` is an admin tool exposed publicly — should be under `/admin/` or removed
- Admin routes are not blocked in robots.txt
- No trailing slash consistency enforcement

---

#### 4. Sitemap.xml

**File:** `public/sitemap.xml`

**Current:** Only 6 URLs listed:
```
/ (priority 1.0)
/agenda (0.8)
/speakers (0.8)
/pricing (0.8)
/venue (0.7)
/faq (0.6)
```

**Missing Pages (9 public pages not in sitemap):**
- `/format`
- `/gallery`
- `/contact`
- `/partners`
- `/2025partners`
- `/register`
- `/survey`
- `/payment-success`
- `/thank-you`

**Other Issues:**
- All `<lastmod>` dates are `2025-01-20` — over a year stale
- No `<image:image>` extensions for image sitemap
- No video sitemap for YouTube embeds on `/2025partners`
- Not auto-generated — must be manually maintained

---

#### 5. Robots.txt

**File:** `public/robots.txt`

```
User-agent: *
Disallow:
Sitemap: https://f3florida.com/sitemap.xml
```

**Issues:**
- **Admin pages not blocked** — `/admin/*`, `/ga-setup` are crawlable
- **Thank-you/payment pages not blocked** — these are post-conversion pages that shouldn't be indexed
- No specific bot directives (Googlebot, Bingbot, GPTBot, etc.)
- Missing `Disallow` for transactional pages that add no SEO value

---

#### 6. Internal Linking Structure

**Current State:** Internal links exist but have structural problems.

**Issues:**
- **All internal links use `<a href>` tags** instead of React Router `<Link>` components — this causes full page reloads on every navigation, destroying the SPA experience and adding unnecessary load time
- **Footer is hidden on the homepage** (per App.tsx comment) — the homepage has no footer navigation links
- **No breadcrumb navigation** on any page
- **Orphan pages:** `/survey`, `/gallery` have very few inbound links
- **No contextual cross-linking** between related pages (e.g., Agenda doesn't link to Speakers, Venue doesn't link to Agenda)

**Link Map:**
```
Homepage → /gallery, /2025partners
Pricing → /register, /venue#room-block
Register → /contact
FAQ → /contact, /venue#room-block
Venue → (external links only)
Speakers → /pricing
Format → /pricing
Agenda → /register
Footer → /agenda, /speakers, /pricing, /venue, /partners, /faq, /contact
```

**Missing contextual links:**
- Speakers → /agenda (see their sessions)
- Venue → /agenda (see schedule)
- Agenda → /speakers (meet the speakers)
- Partners → /contact (become a partner)
- Gallery → / (see upcoming event)

---

#### 7. Image Optimization

**Alt Tags:** Generally good — most images have descriptive alt text.

**Issues:**
- **No WebP/AVIF formats** — all images are JPG/PNG. Modern formats would reduce page weight 25-35%
- **Most images lack explicit `width` and `height` attributes** — causes Cumulative Layout Shift (CLS)
- **Hero background image** (`/assets/hero-background-new.jpg`) in HeroSection uses CSS `backgroundImage` — no alt text, no `<picture>` element
- **Gallery images** loaded via config — alt text may be generic or missing
- **Favicon is an external Google Cloud URL** — `https://storage.googleapis.com/gpt-engineer-file-uploads/...` — should be local for reliability and performance
- **No `<picture>` elements with responsive `srcset`** for different viewport sizes
- **No image dimensions on FeatureSection images** in Index.tsx

---

#### 8. Core Web Vitals Risks

**LCP (Largest Contentful Paint):**
- Hero background image is preloaded correctly with `fetchpriority="high"` ✓
- However, the actual hero uses `hero-background-new.jpg` (CSS background) while preload targets `hero-background.jpg` — **mismatch, preload is wasted**
- SPA architecture means content doesn't render until JS bundle loads, parses, and executes
- No code splitting — entire app loads as one bundle

**CLS (Cumulative Layout Shift):**
- Sticky header space reserved (60px) ✓
- Most images lack `width`/`height` — shift risk
- Google Maps iframe on `/venue` has fixed height (450px) ✓
- Font uses `font-display: swap` ✓ but can cause FOIT/FOUT text shift
- Countdown timer renders dynamically — potential shift

**FID/INP (Interaction to Next Paint):**
- No code splitting — full app bundle must load before any interaction
- 50+ shadcn/ui components imported regardless of page
- All 23 pages imported eagerly in App.tsx — no lazy loading

**Third-Party Impact:**
- Google Analytics (async) ✓
- Facebook Pixel (render-blocking in `<head>`) — **should be deferred**
- Microsoft Clarity (deferred after 1s) ✓
- Jotform scripts on `/survey` — external dependency
- Stripe.js on `/register` — external dependency
- Google Maps iframe on `/venue` — heavy but lazy-loaded ✓

---

#### 9. Mobile Responsiveness

**Current State:** Tailwind responsive classes used throughout. `use-mobile.tsx` hook exists.

**Issues:**
- `MobileStickyCTA.tsx` component exists but usage unclear
- Hero text sizing uses many breakpoints which is good
- No `<meta name="theme-color">` for mobile browser chrome
- No Apple touch icon defined

---

#### 10. Structured Data / JSON-LD

**File:** `src/components/StructuredData.tsx`

| Schema Type | Pages Used | Issues |
|-------------|-----------|--------|
| Event | `/`, `/venue` | **Dates say 2025** (should be 2026). Missing `performer` array for speakers. |
| Organization | All pages | OK but missing `contactPoint`, `foundingDate`, `description` |
| FAQPage | `/faq` | **Only 3 Q&As** but actual FAQ accordion has **8 questions** — schema/content mismatch |
| Person | `/speakers` | **Only 1 speaker** (Garrett J. White) — should include all speakers |
| Offer | `/pricing` | Price says $849 but **`priceValidUntil` says 2025-10-15** — expired |

**Missing Schema Types:**
- `WebSite` with `SearchAction` (for Google sitelinks search)
- `BreadcrumbList` (for breadcrumb rich results)
- `VideoObject` (for YouTube embeds on `/2025partners`)
- `ImageGallery` or `ImageObject` (for `/gallery`)
- `ContactPage` (for `/contact`)
- `Event > performer` array (for all speakers)
- `AggregateOffer` (for multiple ticket tiers)

---

#### 11. 404 Handling

**File:** `src/pages/NotFound.tsx`

**Issues:**
- No `<SEO>` component — no title/description
- No `<meta name="robots" content="noindex">` — 404 pages could get indexed
- Minimal design — no helpful navigation, no search, no suggested pages
- No structured error logging beyond console.error
- SPA catch-all route works for client-side navigation, but **server must be configured** to return 404 status code for actual 404s (Lovable/hosting config needed)

---

#### 12. Page Load Dependencies

| Script | Location | Loading | Impact |
|--------|----------|---------|--------|
| GA4 (`GA_MEASUREMENT_ID`) | index.html | async | **Placeholder ID — broken** |
| GA4 (`G-THCBG6D7ZM`) | GA4Script.tsx | React component | OK but **duplicated** |
| Facebook Pixel | index.html `<head>` | Synchronous | **Render-blocking** |
| Facebook Pixel | FacebookPixel.tsx | React component | **Duplicated** |
| Microsoft Clarity | HeatmapScript.tsx | Deferred (1s) | OK |
| Inter Font | index.html inline | font-display: swap | OK |
| Supabase | Client import | Module | OK |
| Stripe.js | Register page | On-demand | OK |
| Jotform | Survey page | External script | Heavy |

**Double-loading Issue:** GA4 and Facebook Pixel are loaded in BOTH `index.html` AND via React components. This causes:
- Double page view tracking
- Inflated analytics data
- Unnecessary network requests
- Potential consent/GDPR issues

---

### AEO Audit

#### 1. Content Structure for AI Extraction

**Current State:** Content is written in marketing style — short punchy headlines, CTAs, emotional language. This is **poor for AI answer engines** which need clear, factual, declarative statements.

**Issues:**
- No clear "What is Formula Forum?" definition paragraph anywhere on the site
- No concise factual summaries that AI engines could extract as citations
- FAQ answers are too brief — "Business casual." is not a cite-worthy answer
- No "key facts" or "at a glance" structured content blocks
- Event details (dates, location, pricing) scattered across pages rather than consolidated

**Example of current content (not AI-extractable):**
> "We are excited to announce that we are going back home to our official first location and making this an amazing tradition"

**What AI engines need:**
> "Formula Forum is a 3-day insurance agency growth conference held October 14-16, 2026 at JW Marriott Orlando Bonnet Creek. Tickets start at $849."

---

#### 2. FAQ Schema Coverage

**Critical Mismatch:**
- `StructuredData.tsx` FAQPage schema has **3 questions**
- `FAQAccordion.tsx` component renders **8 questions**
- 5 FAQ items are invisible to search engines/AI:
  1. "Can I transfer my ticket?"
  2. "Is there a group discount?"
  3. "What's included in the registration fee?"
  4. "Will sessions be recorded?"
  5. "What should I bring?"

These 5 missing questions are arguably **more valuable** for search than the 3 included.

---

#### 3. Schema Opportunities Not Implemented

| Schema Type | Opportunity | Priority |
|-------------|-------------|----------|
| `HowTo` | Format page describes a 4-step process — perfect for HowTo schema | High |
| `VideoObject` | 20 YouTube embeds on `/2025partners` — rich video results | High |
| `ItemList` | Speaker list, FAQ list, partner list | Medium |
| `Speakable` | Key paragraphs on homepage, venue, FAQ | Medium |
| `Event > performer` | All speakers as performers on the event | High |
| `AggregateOffer` | Multiple ticket tiers ($849 Agent, $549 Team) | Medium |
| `BreadcrumbList` | All interior pages | High |
| `ContactPage` | Contact page | Low |
| `ImageGallery` | Gallery page | Low |

---

#### 4. Entity Definition Clarity

**Current Issues:**
- The brand is inconsistently referred to as: "Formula Forum", "F³", "F³ Formula Forum", "F3", "f3florida.com", "FORMULA"
- No clear "About Us" or "About the Organizers" page
- Organizer "Ashleeb@f3florida.com" and "Gregg@f3florida.com" — no full names or roles
- No `founder`/`employee` schema on the organization
- Social media URLs in schema may not be live/verified: facebook.com/FormulaForum, instagram.com/formulaforum, linkedin.com/company/formula-forum

---

#### 5. Speakable Content

**Not implemented.** No `Speakable` schema exists. Key candidates:
- Homepage event summary
- FAQ answers
- Venue/travel details
- Pricing details

---

### GEO Audit

#### 1. Topical Authority Content

**Current State: ZERO topical authority content.**

There is no blog, no resource hub, no educational content, no whitepapers, no case studies, no data reports. The site is purely an event marketing site. LLMs have no reason to reference this site for any insurance industry topic.

**Missing content types:**
- Blog posts about insurance agency growth
- Case studies from past attendees
- Speaker insight articles
- Industry reports or survey results
- Playbook excerpts or frameworks
- "State of Insurance Agencies" annual data

---

#### 2. Unique Data Points & Quotable Content

**Current State: Minimal.**

The site contains no:
- Original statistics or survey data
- Proprietary frameworks (the "Book of Formulas" playbook is mentioned but not excerpted)
- Named methodologies with clear definitions
- Benchmark data an LLM would cite
- Industry insights beyond generic marketing copy

**One opportunity exists:** The Format page describes a unique 4-step session format (Speaker → Takeaways → Breakouts → Speaker Close). This could be named, defined, and made quotable.

---

#### 3. E-E-A-T Signals (Experience, Expertise, Authoritativeness, Trustworthiness)

| Signal | Status | Issue |
|--------|--------|-------|
| About page | Missing | No page explaining who runs Formula Forum |
| Founder/team bios | Missing | Only email addresses, no names/photos/credentials |
| Author markup | `meta author="Lovable"` | Should be actual organizers |
| Credentials | Missing | No evidence of industry expertise |
| Testimonials | Partial | Video testimonials exist but no text quotes with names/companies |
| Press/media page | Missing | No press mentions, media kit, or PR page |
| Trust badges | Partial | Partner logos exist but no industry affiliations |
| Privacy policy | Missing | No privacy policy page |
| Terms of service | Missing | No terms page |

---

#### 4. Content Depth Analysis

| Page | Word Count (est.) | Depth Rating | Issue |
|------|-------------------|--------------|-------|
| `/` (Homepage) | ~300 | Thin | Mostly CTAs and section headers |
| `/agenda` | ~800 | Good | Detailed 3-day schedule |
| `/pricing` | ~400 | Moderate | Pricing + benefits list |
| `/speakers` | ~200 | Thin | Names and titles only |
| `/format` | ~200 | Thin | 4 steps with brief descriptions |
| `/venue` | ~500 | Good | Address, logistics, room block details |
| `/faq` | ~400 | Moderate | 8 Q&A pairs but answers are brief |
| `/gallery` | ~50 | Very Thin | Just a photo grid |
| `/contact` | ~100 | Thin | Form only |
| `/partners` | ~300 | Moderate | Partner tiers and CTAs |
| `/2025partners` | ~100 | Thin | YouTube embeds with minimal text |
| `/register` | ~200 | Thin | Pricing and checkout links |
| `/survey` | ~50 | Very Thin | Embedded Jotform |

---

#### 5. Brand Entity Clarity for LLMs

**Current Problems:**
- Inconsistent naming: "Formula Forum" vs "F³" vs "F³ Formula Forum" vs "FORMULA"
- No Wikipedia page or notable external references
- No consistent entity description across pages
- Organization schema lacks `description`, `foundingDate`, `numberOfEmployees`
- The site domain `f3florida.com` doesn't match the brand name "Formula Forum"
- Footer disclaimer: "Not affiliated with any Florida policy forum" — suggests brand confusion exists

---

## Phase 2: Gap Analysis

### Priority Matrix (Ranked by Impact × Effort)

#### CRITICAL — Blocks Indexing/Visibility

| # | Gap | Impact | Effort | Category | Details |
|---|-----|--------|--------|----------|---------|
| 1 | **No SSR/prerendering — crawlers see empty HTML** | CRITICAL | Heavy | SEO | SPA sends empty `<div id="root"></div>`. Bots that don't execute JS (most AI engines, some crawlers) see no content. `vite-plugin-prerender` is installed but not configured. |
| 2 | **Date inconsistency (2025 vs 2026)** | CRITICAL | Quick | SEO/AEO | CONFIG, structured data, page titles, descriptions all say 2025. Event is 2026. Every search result shows wrong year. |
| 3 | **Duplicate GA4 + Facebook Pixel loading** | HIGH | Quick | SEO | Scripts in both index.html and React components. Double-tracking inflates data and wastes bandwidth. |
| 4 | **index.html GA4 uses placeholder ID** | HIGH | Quick | SEO | Literal string "GA_MEASUREMENT_ID" instead of actual ID. |
| 5 | **index.html missing og:image** | HIGH | Quick | SEO | Social shares show no preview image for bots that don't execute JS. |

#### HIGH — Significant Impact

| # | Gap | Impact | Effort | Category |
|---|-----|--------|--------|----------|
| 6 | Sitemap missing 9 public pages | HIGH | Quick | SEO |
| 7 | FAQ schema has 3 of 8 questions | HIGH | Quick | AEO |
| 8 | robots.txt doesn't block admin/transactional pages | HIGH | Quick | SEO |
| 9 | No BreadcrumbList schema | HIGH | Moderate | SEO/AEO |
| 10 | Speaker schema only has 1 of all speakers | HIGH | Moderate | AEO |
| 11 | Structured data Event dates say 2025 | HIGH | Quick | SEO/AEO |
| 12 | 404 page has no meta tags or noindex | HIGH | Quick | SEO |
| 13 | Hero LCP preload targets wrong image file | HIGH | Quick | SEO |
| 14 | No code splitting / lazy loading routes | HIGH | Moderate | SEO |
| 15 | Homepage H1 is just "formula" | HIGH | Quick | SEO |
| 16 | Facebook Pixel is render-blocking in head | HIGH | Quick | SEO |
| 17 | No VideoObject schema for 20 YouTube embeds | HIGH | Moderate | AEO |
| 18 | No clear entity definition paragraph | HIGH | Quick | AEO/GEO |
| 19 | `meta author="Lovable"` | HIGH | Quick | GEO |

#### MEDIUM — Missed Opportunities

| # | Gap | Impact | Effort | Category |
|---|-----|--------|--------|----------|
| 20 | No WebSite schema for sitelinks search | MEDIUM | Quick | SEO |
| 21 | No `<meta name="theme-color">` | MEDIUM | Quick | SEO |
| 22 | No Apple touch icon | MEDIUM | Quick | SEO |
| 23 | Images not in WebP/AVIF format | MEDIUM | Moderate | SEO |
| 24 | Most images missing width/height (CLS) | MEDIUM | Moderate | SEO |
| 25 | Internal links use `<a>` not `<Link>` | MEDIUM | Moderate | SEO |
| 26 | No HowTo schema on Format page | MEDIUM | Quick | AEO |
| 27 | No Speakable schema | MEDIUM | Quick | AEO |
| 28 | Favicon is external Google Cloud URL | MEDIUM | Quick | SEO |
| 29 | No contextual cross-linking between pages | MEDIUM | Quick | SEO |
| 30 | Supabase preconnect URL mismatch in index.html | MEDIUM | Quick | SEO |
| 31 | Thin content on 6+ pages | MEDIUM | Heavy | GEO |

#### LOW — Nice to Have

| # | Gap | Impact | Effort | Category |
|---|-----|--------|--------|----------|
| 32 | No privacy policy page | LOW | Moderate | GEO |
| 33 | No about/team page | LOW | Moderate | GEO |
| 34 | No blog/content hub for topical authority | LOW | Heavy | GEO |
| 35 | No image sitemap extension | LOW | Quick | SEO |
| 36 | No video sitemap | LOW | Quick | SEO |
| 37 | No press/media page | LOW | Heavy | GEO |
| 38 | URL `/2025partners` not descriptive | LOW | Moderate | SEO |

---

## Phase 3: Implementation Plan

### Quick Win #1: Fix All 2025→2026 Date References

**Impact:** CRITICAL | **Effort:** Quick | **Category:** SEO/AEO

**File:** `src/config/event.ts`

```typescript
// REPLACE the CONFIG object (line 68-103):
export const CONFIG = {
  EVENT_NAME: "Formula Forum 2026",
  BRAND_SHORT: "F³",
  TAGLINE: "National Insurance Agency Growth Conference",
  START_DATETIME_ISO: "2026-10-14T09:00:00-04:00",
  END_DATETIME_ISO: "2026-10-16T17:00:00-04:00",
  CITY: "Orlando",
  STATE: "FL",
  VENUE_NAME: "JW Marriott Orlando Bonnet Creek",
  VENUE_STREET: "14900 Chelonia Pkwy",
  VENUE_POSTAL: "32821",
  COUNTRY: "US",
  SITE_URL: "https://f3florida.com",
  REGISTER_URL: "https://f3florida.com/register",
  CONTACT_URL: "https://f3florida.com/contact",
  PARTNERS_URL: "https://f3florida.com/partners",
  ORGANIZER_NAME: "Formula Forum",
  ORGANIZER_URL: "https://f3florida.com",
  ORGANIZER_EMAIL: "Ashleeb@f3florida.com",
  ORGANIZER_PHONE: "260-515-1349",
  CURRENCY: "USD",
  BASE_TICKET_PRICE: "1499",
  SEAT_CAP: 250,
  EARLY_BIRD_END_ISO: "2026-09-15T23:59:00-04:00",
  OG_IMAGE_1200x630: "/assets/hero-1200x630.jpg",
  TW_IMAGE_1200x600: "/assets/hero-1200x630.jpg",
  HOTEL_BOOK_URL: "https://hotel-booking-link.example",
  LOGO_PARTNERS: [
    { name: "Ricochet360", tier: "Platinum", logoUrl: "/lovable-uploads/29100412-4e6c-4333-b865-192e0fca781e.png", linkUrl: "https://ricochet360.com" },
    { name: "The Standard", tier: "Platinum", logoUrl: "/lovable-uploads/c24dc654-fa2e-440d-adc8-9c19054f856c.png", linkUrl: "https://standardplaybook.com" },
    { name: "MediaAlpha", tier: "Platinum", logoUrl: "/lovable-uploads/6dae2514-00d4-40b4-b301-56e531551ddd.png", linkUrl: "https://mediaalpha.com" }
  ],
  SPEAKERS: [
    { name: "Garrett J. White", title: "Founder, Warrior", company: "Warrior Empire", photo: "/assets/speakers/garrett.jpg" },
    { name: "Kory [LastName]", title: "Allstate Agent of the Year", company: "Crane Agency", photo: "/assets/speakers/kory.jpg" }
  ]
} as const;
```

**Also update every page title/description that hardcodes "2025":**

**File:** `src/pages/Agenda.tsx` — Change title to `"Agenda — Formula Forum 2026"`
**File:** `src/pages/Pricing.tsx` — Change title to `"Pricing — Formula Forum 2026"`
**File:** `src/pages/SpeakersPage.tsx` — Change title to `"Speakers — Formula Forum 2026"`
**File:** `src/pages/Format.tsx` — Change title to `"Format — Formula Forum 2026"`
**File:** `src/pages/FAQ.tsx` — Change title to `"FAQ — Formula Forum 2026"`
**File:** `src/pages/Register.tsx` — Change title to reference 2026
**File:** `src/pages/PaymentSuccess.tsx` — Change all 2025 references to 2026
**File:** `src/pages/ThankYou.tsx` — Change all 2025 references to 2026
**File:** `src/pages/ThankYouEnhanced.tsx` — Change all 2025 references to 2026

---

### Quick Win #2: Fix index.html Static Meta Tags

**Impact:** HIGH | **Effort:** Quick | **Category:** SEO

**File:** `index.html`

Replace the entire `<head>` section meta tags:

```html
<!-- REMOVE the broken GA4 script (lines 11-18) — it uses placeholder "GA_MEASUREMENT_ID" -->
<!-- GA4 is already loaded correctly via GA4Script.tsx React component -->

<!-- REMOVE the Facebook Pixel script (lines 20-32) — it's duplicated in FacebookPixel.tsx -->
<!-- Keep only the noscript fallback in <body> -->

<!-- REPLACE meta tags (lines 119-132): -->
<title>Formula Forum 2026 | #1 Insurance Agency Growth Conference | Orlando</title>
<meta name="description" content="Formula Forum is a 3-day insurance agency growth conference, October 14-16, 2026 at JW Marriott Orlando Bonnet Creek. Workshops, breakouts, and a 90-day growth plan.">
<meta name="author" content="Formula Forum">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:title" content="Formula Forum 2026 | #1 Insurance Agency Growth Conference">
<meta property="og:description" content="3-day insurance agency growth conference. Oct 14-16, 2026 at JW Marriott Orlando Bonnet Creek.">
<meta property="og:image" content="https://f3florida.com/assets/hero-1200x630.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Formula Forum 2026 Insurance Agency Growth Conference">
<meta property="og:url" content="https://f3florida.com">
<meta property="og:site_name" content="Formula Forum">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Formula Forum 2026 | Insurance Agency Growth Conference">
<meta name="twitter:description" content="3-day insurance agency growth conference. Oct 14-16, 2026 at JW Marriott Orlando Bonnet Creek.">
<meta name="twitter:image" content="https://f3florida.com/assets/hero-1200x630.jpg">

<!-- Mobile -->
<meta name="theme-color" content="#1a1a1a">
<link rel="apple-touch-icon" href="/assets/logo.png">
```

Also fix the preconnect URL mismatch (line 37):
```html
<!-- CHANGE from: -->
<link rel="preconnect" href="https://byoxxlouggcvbdizhgdp.supabase.co">
<!-- TO: -->
<link rel="preconnect" href="https://koubtooblwjcwubcuhml.supabase.co">
```

Fix the LCP preload to match actual hero image (line 9):
```html
<!-- CHANGE from: -->
<link rel="preload" as="image" href="/assets/hero-background.jpg" ...>
<!-- TO: -->
<link rel="preload" as="image" href="/assets/hero-background-new.jpg" imagesrcset="/assets/hero-background-new.jpg 1920w" imagesizes="100vw" fetchpriority="high">
```

---

### Quick Win #3: Fix Sitemap.xml

**Impact:** HIGH | **Effort:** Quick | **Category:** SEO

**File:** `public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>https://f3florida.com/</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://f3florida.com/agenda</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://f3florida.com/speakers</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://f3florida.com/pricing</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://f3florida.com/register</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://f3florida.com/venue</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://f3florida.com/format</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://f3florida.com/faq</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://f3florida.com/partners</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://f3florida.com/gallery</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://f3florida.com/contact</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://f3florida.com/survey</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://f3florida.com/2025partners</loc>
    <lastmod>2026-02-26</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>
```

---

### Quick Win #4: Fix Robots.txt

**Impact:** HIGH | **Effort:** Quick | **Category:** SEO

**File:** `public/robots.txt`

```
User-agent: *
Allow: /

# Block admin and transactional pages
Disallow: /admin/
Disallow: /ga-setup
Disallow: /payment-success
Disallow: /thank-you

# Allow AI crawlers explicitly
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Amazonbot
Allow: /

Sitemap: https://f3florida.com/sitemap.xml
```

---

### Quick Win #5: Sync FAQ Schema with Actual FAQ Content

**Impact:** HIGH | **Effort:** Quick | **Category:** AEO

**File:** `src/components/StructuredData.tsx`

Replace the `faqSchema` object (lines 75-104):

```typescript
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Are tickets refundable?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No refunds. All ticket sales are final. You can transfer a ticket to another person up to 7 days before the event at no additional cost."
      }
    },
    {
      "@type": "Question",
      "name": "How do I book the hotel room block?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use the room-block link on the Venue page or call JW Marriott Orlando Bonnet Creek with group code F3-2025. The discounted rate is $239 per night with a cut-off date of September 15, 2026."
      }
    },
    {
      "@type": "Question",
      "name": "What is the dress code?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Business casual is the recommended dress code for all Formula Forum sessions and networking events."
      }
    },
    {
      "@type": "Question",
      "name": "Can I transfer my ticket?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, tickets are transferable until October 1, 2026. Contact the Formula Forum team with the new attendee's information and the transfer will be processed at no additional cost."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a group discount?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Teams of 5 or more save 20% on registration. Email Gregg@f3florida.com for a custom group discount code."
      }
    },
    {
      "@type": "Question",
      "name": "What's included in the registration fee?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Registration includes access to all sessions, the printed Book of Formulas playbook, networking events, meals during the conference, and the 90-day post-event challenge program."
      }
    },
    {
      "@type": "Question",
      "name": "Will sessions be recorded?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Sessions are not recorded to ensure open, honest discussions and to protect the confidential strategies shared by speakers and attendees."
      }
    },
    {
      "@type": "Question",
      "name": "What should I bring?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bring business cards and a laptop for workshop sessions. All materials and tools are provided. The conference is business casual dress code."
      }
    }
  ]
};
```

---

### Quick Win #6: Fix 404 Page

**Impact:** HIGH | **Effort:** Quick | **Category:** SEO

**File:** `src/pages/NotFound.tsx`

```tsx
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Page Not Found | Formula Forum 2026</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to the Formula Forum homepage." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md px-4">
          <h1 className="text-6xl font-bold mb-4 text-gray-900">404</h1>
          <p className="text-xl text-gray-600 mb-6">Oops! This page doesn't exist.</p>
          <p className="text-gray-500 mb-8">The page you're looking for may have been moved or removed.</p>
          <div className="space-y-3">
            <a href="/" className="block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Return to Homepage
            </a>
            <div className="flex gap-3 justify-center text-sm">
              <a href="/agenda" className="text-primary hover:underline">Agenda</a>
              <a href="/pricing" className="text-primary hover:underline">Pricing</a>
              <a href="/faq" className="text-primary hover:underline">FAQ</a>
              <a href="/contact" className="text-primary hover:underline">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
```

---

### Quick Win #7: Update Structured Data — Fix Event Dates & Add Schemas

**Impact:** HIGH | **Effort:** Moderate | **Category:** SEO/AEO

**File:** `src/components/StructuredData.tsx`

Complete rewrite:

```tsx
import { Helmet } from "react-helmet-async";
import { CONFIG } from "@/config/event";

interface StructuredDataProps {
  page?: "home" | "venue" | "faq" | "speakers" | "pricing" | "format" | "contact" | "general";
}

const StructuredData = ({ page = "general" }: StructuredDataProps) => {
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Formula Forum 2026 — National Insurance Agency Growth Conference",
    "startDate": "2026-10-14T09:00:00-04:00",
    "endDate": "2026-10-16T17:00:00-04:00",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": "JW Marriott Orlando Bonnet Creek Resort & Spa",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "14900 Chelonia Parkway",
        "addressLocality": "Orlando",
        "addressRegion": "FL",
        "postalCode": "32821",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 28.3569,
        "longitude": -81.5271
      }
    },
    "image": [`${CONFIG.SITE_URL}${CONFIG.OG_IMAGE_1200x630}`],
    "description": "Formula Forum is a 3-day insurance agency growth conference featuring workshops, breakout sessions, and a 90-day scale-up blueprint. Held at JW Marriott Orlando Bonnet Creek, October 14-16, 2026.",
    "organizer": {
      "@type": "Organization",
      "name": "Formula Forum",
      "url": "https://f3florida.com",
      "logo": "https://f3florida.com/assets/logo.png",
      "sameAs": [
        "https://www.facebook.com/FormulaForum",
        "https://www.instagram.com/formulaforum",
        "https://www.linkedin.com/company/formula-forum"
      ]
    },
    "performer": [
      {
        "@type": "Person",
        "name": "Garrett J. White",
        "jobTitle": "Founder",
        "worksFor": { "@type": "Organization", "name": "Warrior Empire" }
      }
    ],
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "549",
      "highPrice": "849",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "https://f3florida.com/pricing",
      "validFrom": "2026-01-01T00:00:00-04:00",
      "offerCount": "2"
    },
    "sameAs": [
      "https://www.facebook.com/FormulaForum",
      "https://www.instagram.com/formulaforum",
      "https://www.linkedin.com/company/formula-forum"
    ]
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Formula Forum",
    "alternateName": "F³",
    "url": "https://f3florida.com",
    "logo": "https://f3florida.com/assets/logo.png",
    "description": "Formula Forum is the premier national insurance agency growth conference, bringing together agency owners, operators, and industry leaders for actionable workshops and networking.",
    "email": "Ashleeb@f3florida.com",
    "telephone": "+1-260-515-1349",
    "sameAs": [
      "https://www.facebook.com/FormulaForum",
      "https://www.instagram.com/formulaforum",
      "https://www.linkedin.com/company/formula-forum"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-260-515-1349",
      "email": "Ashleeb@f3florida.com",
      "contactType": "customer service"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Formula Forum",
    "url": "https://f3florida.com",
    "description": "Formula Forum is the #1 national insurance agency growth conference. October 14-16, 2026 at JW Marriott Orlando Bonnet Creek."
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Are tickets refundable?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No refunds. All ticket sales are final. You can transfer a ticket to another person up to 7 days before the event at no additional cost."
        }
      },
      {
        "@type": "Question",
        "name": "How do I book the hotel room block?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use the room-block link on the Venue page or call JW Marriott Orlando Bonnet Creek with group code F3-2025. The discounted rate is $239 per night with a cut-off date of September 15, 2026."
        }
      },
      {
        "@type": "Question",
        "name": "What is the dress code?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Business casual is the recommended dress code for all Formula Forum sessions and networking events."
        }
      },
      {
        "@type": "Question",
        "name": "Can I transfer my ticket?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, tickets are transferable until October 1, 2026. Contact the Formula Forum team with the new attendee's information and the transfer will be processed at no additional cost."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a group discount?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Teams of 5 or more save 20% on registration. Email Gregg@f3florida.com for a custom group discount code."
        }
      },
      {
        "@type": "Question",
        "name": "What's included in the registration fee?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Registration includes access to all sessions, the printed Book of Formulas playbook, networking events, meals during the conference, and the 90-day post-event challenge program."
        }
      },
      {
        "@type": "Question",
        "name": "Will sessions be recorded?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Sessions are not recorded to ensure open, honest discussions and protect the confidential strategies shared by speakers and attendees."
        }
      },
      {
        "@type": "Question",
        "name": "What should I bring?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bring business cards and a laptop for workshop sessions. All materials and tools are provided. The conference is business casual dress code."
        }
      }
    ]
  };

  const speakersSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Formula Forum 2026 Speakers",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Person",
          "name": "Garrett J. White",
          "jobTitle": "Founder",
          "worksFor": { "@type": "Organization", "name": "Warrior Empire" },
          "description": "International keynote speaker and founder of Warrior Empire, helping business leaders achieve peak performance.",
          "url": "https://f3florida.com/speakers"
        }
      }
    ]
  };

  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "AggregateOffer",
    "name": "Formula Forum 2026 Conference Passes",
    "description": "Access to the complete Formula Forum 2026 insurance agency growth conference including all sessions, playbook, meals, and 90-day challenge.",
    "lowPrice": "549",
    "highPrice": "849",
    "priceCurrency": "USD",
    "offerCount": "2",
    "availability": "https://schema.org/InStock",
    "url": "https://f3florida.com/pricing",
    "priceValidUntil": "2026-10-14",
    "offers": [
      {
        "@type": "Offer",
        "name": "Agent Pass",
        "price": "849",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://f3florida.com/register"
      },
      {
        "@type": "Offer",
        "name": "Team Member Pass",
        "price": "549",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://f3florida.com/register"
      }
    ]
  };

  const formatHowToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "The Formula Forum Format Framework",
    "description": "How each session at Formula Forum is structured for maximum learning and implementation.",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Speaker Presentation",
        "text": "Expert speaker delivers 15-20 minutes of actionable content and strategies.",
        "timeRequired": "PT20M"
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Key Takeaways",
        "text": "2-3 minutes to identify and capture the most impactful takeaways from the session.",
        "timeRequired": "PT3M"
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Breakout Discussion",
        "text": "10-minute small group breakout sessions for peer discussion and application to your agency.",
        "timeRequired": "PT10M"
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Speaker Close",
        "text": "Speaker returns for a 3-minute closing with final insights and implementation guidance.",
        "timeRequired": "PT3M"
      }
    ]
  };

  const breadcrumbSchemas: Record<string, object> = {
    home: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://f3florida.com" }
      ]
    },
    venue: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://f3florida.com" },
        { "@type": "ListItem", "position": 2, "name": "Venue", "item": "https://f3florida.com/venue" }
      ]
    },
    faq: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://f3florida.com" },
        { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://f3florida.com/faq" }
      ]
    },
    speakers: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://f3florida.com" },
        { "@type": "ListItem", "position": 2, "name": "Speakers", "item": "https://f3florida.com/speakers" }
      ]
    },
    pricing: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://f3florida.com" },
        { "@type": "ListItem", "position": 2, "name": "Pricing", "item": "https://f3florida.com/pricing" }
      ]
    },
    format: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://f3florida.com" },
        { "@type": "ListItem", "position": 2, "name": "Format", "item": "https://f3florida.com/format" }
      ]
    },
    contact: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://f3florida.com" },
        { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://f3florida.com/contact" }
      ]
    }
  };

  return (
    <Helmet>
      {/* WebSite schema on all pages */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>

      {/* Organization schema on all pages */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>

      {/* Breadcrumb schema on all pages */}
      {breadcrumbSchemas[page] && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchemas[page])}
        </script>
      )}

      {/* Event schema on home and venue */}
      {(page === "home" || page === "venue") && (
        <script type="application/ld+json">
          {JSON.stringify(eventSchema)}
        </script>
      )}

      {/* FAQ schema */}
      {page === "faq" && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}

      {/* Speakers schema */}
      {page === "speakers" && (
        <script type="application/ld+json">
          {JSON.stringify(speakersSchema)}
        </script>
      )}

      {/* Pricing schema */}
      {page === "pricing" && (
        <script type="application/ld+json">
          {JSON.stringify(pricingSchema)}
        </script>
      )}

      {/* HowTo schema on format page */}
      {page === "format" && (
        <script type="application/ld+json">
          {JSON.stringify(formatHowToSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default StructuredData;
```

Then add `<StructuredData page="format" />` and `<StructuredData page="contact" />` to the respective page components.

---

### Quick Win #8: Improve Homepage H1 for SEO

**Impact:** HIGH | **Effort:** Quick | **Category:** SEO

**File:** `src/components/sections/HeroSection.tsx`

The animated "formula" H1 is visually impactful but SEO-hostile. Add a visually hidden but crawlable H1:

```tsx
// Add BEFORE the animated h1 (around line 42):
<h1 className="sr-only">
  Formula Forum 2026 — Insurance Agency Growth Conference in Orlando
</h1>

// Change the existing animated h1 to an aria-hidden span:
<span aria-hidden="true" className="text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem] font-bold leading-none tracking-tighter text-white overflow-hidden select-none block">
  {text.split('').map((letter, index) => (
    // ... existing animation code
  ))}
</span>
```

Note: The `sr-only` class is a standard Tailwind utility that visually hides content while keeping it accessible to screen readers and crawlers.

---

### Quick Win #9: Add noindex to Transactional Pages

**Impact:** MEDIUM | **Effort:** Quick | **Category:** SEO

**File:** `src/components/SEO.tsx`

```tsx
interface SEOProps {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
}

const SEO = ({ title, description, path = "/", noindex = false }: SEOProps) => {
  const canonical = `${CONFIG.SITE_URL}${path === "/" ? "" : path}`;
  const ogImage = `${CONFIG.SITE_URL}${CONFIG.OG_IMAGE_1200x630}`;
  const twitterImage = `${CONFIG.SITE_URL}${CONFIG.TW_IMAGE_1200x600}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      {!noindex && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:type" content="event" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${CONFIG.EVENT_NAME} - ${CONFIG.TAGLINE}`} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={CONFIG.EVENT_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={twitterImage} />
    </Helmet>
  );
};
```

Then use `noindex={true}` on: `PaymentSuccess.tsx`, `ThankYou.tsx`, `ThankYouEnhanced.tsx`, `GASetup.tsx`, `AdminAuth.tsx`, `AdminMetrics.tsx`, `AdminRegistrations.tsx`.

---

### Moderate #10: Configure Vite Prerendering

**Impact:** CRITICAL | **Effort:** Moderate | **Category:** SEO

This is the **single most impactful change** for this site. Without prerendering, crawlers that don't execute JavaScript (including most AI answer engines) see an empty page.

**File:** `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import prerender from "vite-plugin-prerender";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && prerender({
      routes: [
        '/',
        '/agenda',
        '/pricing',
        '/speakers',
        '/format',
        '/venue',
        '/faq',
        '/partners',
        '/gallery',
        '/contact',
        '/register',
        '/survey',
        '/2025partners',
      ],
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
}));
```

**Important:** After configuring, test `npm run build` to verify prerendered HTML files are generated in `dist/`. Each route should have its own `index.html` with full rendered content.

**Note:** If `vite-plugin-prerender` doesn't work cleanly with the current setup, an alternative is to use `react-snap` or `prerender-spa-plugin`. The key requirement is that built HTML files contain rendered content, not just `<div id="root"></div>`.

---

### Moderate #11: Add Route-Level Code Splitting

**Impact:** HIGH | **Effort:** Moderate | **Category:** SEO (Core Web Vitals)

**File:** `src/App.tsx`

```tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DeferredScripts from "./components/DeferredScripts";
import GA4Script from "./components/GA4Script";
import AnalyticsListener from "./components/AnalyticsListener";

// Eagerly load the homepage for fast LCP
import Index from "./pages/Index";

// Lazy load all other pages
const Partners = lazy(() => import("./pages/Partners"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Pricing = lazy(() => import("./pages/Pricing"));
const SpeakersPage = lazy(() => import("./pages/SpeakersPage"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Format = lazy(() => import("./pages/Format"));
const Venue = lazy(() => import("./pages/Venue"));
const Survey = lazy(() => import("./pages/Survey"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Register = lazy(() => import("./pages/Register"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const ThankYouEnhanced = lazy(() => import("./pages/ThankYouEnhanced"));
const GASetup = lazy(() => import("./pages/GASetup"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const AdminRegistrations = lazy(() => import("./pages/AdminRegistrations"));
const AdminMetrics = lazy(() => import("./pages/AdminMetrics"));
const PartnerPodcasts = lazy(() => import("./pages/PartnerPodcasts"));
const Gallery = lazy(() => import("./pages/Gallery"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HelmetProvider>
          <GA4Script />
          <BrowserRouter>
            <AuthProvider>
              <AnalyticsListener />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/agenda" element={<Agenda />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/speakers" element={<SpeakersPage />} />
                  <Route path="/format" element={<Format />} />
                  <Route path="/venue" element={<Venue />} />
                  <Route path="/survey" element={<Survey />} />
                  <Route path="/partners" element={<Partners />} />
                  <Route path="/2025partners" element={<PartnerPodcasts />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/thank-you" element={<ThankYouEnhanced />} />
                  <Route path="/ga-setup" element={<GASetup />} />
                  <Route path="/admin/auth" element={<AdminAuth />} />
                  <Route path="/admin/registrations" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminRegistrations />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/metrics" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminMetrics />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <DeferredScripts />
            </AuthProvider>
          </BrowserRouter>
        </HelmetProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
```

---

### Moderate #12: Add Entity Definition Content for AEO/GEO

**Impact:** HIGH | **Effort:** Quick | **Category:** AEO/GEO

Add a clear, AI-extractable entity definition to the homepage. This paragraph should be visible and placed in the About section.

**File:** `src/components/sections/UndefinedAbout.tsx` (or wherever the about section lives)

Add this content block:

```tsx
<section className="py-20 px-4 bg-black text-white">
  <div className="container mx-auto max-w-4xl">
    <h2 className="text-4xl font-bold mb-8 text-center">What is Formula Forum?</h2>
    <p className="text-xl text-white/80 leading-relaxed mb-6">
      Formula Forum is the premier national insurance agency growth conference,
      bringing together 250+ agency owners, operators, and industry leaders for
      three days of intensive workshops, breakout sessions, and strategic planning.
      Founded to give independent insurance agents the tactical playbooks they need
      to scale, Formula Forum combines world-class speakers with a proprietary
      "Book of Formulas" framework and a 90-day post-event implementation challenge.
    </p>
    <p className="text-lg text-white/60 leading-relaxed">
      The 2026 conference takes place October 14-16 at JW Marriott Orlando Bonnet
      Creek. Tickets include access to all sessions, the printed playbook,
      networking events, meals, and the post-event growth program. Agent Passes
      start at $849 and Team Member Passes at $549.
    </p>
  </div>
</section>
```

This gives AI answer engines a clear, factual, cite-worthy paragraph about the event.

---

### Moderate #13: Remove Duplicate Analytics Scripts from index.html

**Impact:** HIGH | **Effort:** Quick | **Category:** SEO

**File:** `index.html`

Remove lines 11-32 entirely (the GA4 placeholder script and the Facebook Pixel script). These are already loaded correctly via React components `GA4Script.tsx` and `FacebookPixel.tsx`.

```html
<!-- REMOVE THIS ENTIRE BLOCK (lines 11-32): -->
<!--
    <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
    </script>

    <script>
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      ...
      fbq('init', '669306169532672');
      fbq('track', 'PageView');
    </script>
-->
```

Keep the `<noscript>` Facebook Pixel fallback in `<body>` — that's correct.

---

### Heavy Lift #14: Convert Internal Links to React Router Links

**Impact:** MEDIUM | **Effort:** Moderate | **Category:** SEO

Every `<a href="/path">` for internal navigation should use React Router's `<Link to="/path">` to prevent full page reloads. This affects:

- `Footer.tsx` (7 links)
- `Index.tsx` (3 links)
- `Pricing.tsx` (register links)
- `FAQ.tsx` (contact, venue links)
- `NotFound.tsx` (homepage link)
- All CTA buttons that link to internal pages

**Example for Footer.tsx:**

```tsx
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Formula Forum is an insurance agency event. Not affiliated with any Florida policy forum.
          </p>
          <div className="flex flex-wrap gap-4 text-sm justify-center md:justify-end">
            <Link to="/agenda" className="text-muted-foreground hover:text-foreground underline underline-offset-4">Agenda</Link>
            <Link to="/speakers" className="text-muted-foreground hover:text-foreground underline underline-offset-4">Speakers</Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground underline underline-offset-4">Pricing</Link>
            <Link to="/venue" className="text-muted-foreground hover:text-foreground underline underline-offset-4">Venue</Link>
            <Link to="/partners" className="text-muted-foreground hover:text-foreground underline underline-offset-4">Partners</Link>
            <Link to="/faq" className="text-muted-foreground hover:text-foreground underline underline-offset-4">FAQ</Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground underline underline-offset-4">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
```

---

### Heavy Lift #15: Add VideoObject Schema for Partner Podcasts

**Impact:** HIGH | **Effort:** Moderate | **Category:** AEO

**File:** `src/pages/PartnerPodcasts.tsx`

Add VideoObject JSON-LD for each YouTube embed. Example pattern to add in the component:

```tsx
import { Helmet } from "react-helmet-async";

// Inside the component, add before the return:
const videoSchemas = partners.map((partner, index) => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": `${partner.name} — Formula Forum 2025 Partner Spotlight`,
  "description": `Hear from ${partner.name}, a Formula Forum 2025 partner, about their experience and insights for insurance agency growth.`,
  "thumbnailUrl": `https://img.youtube.com/vi/${partner.youtubeId}/maxresdefault.jpg`,
  "uploadDate": "2025-11-01",
  "contentUrl": `https://www.youtube.com/watch?v=${partner.youtubeId}`,
  "embedUrl": `https://www.youtube.com/embed/${partner.youtubeId}`,
  "publisher": {
    "@type": "Organization",
    "name": "Formula Forum"
  }
}));

// In the Helmet:
<Helmet>
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "2025 Formula Forum Partner Podcast Episodes",
      "numberOfItems": videoSchemas.length,
      "itemListElement": videoSchemas.map((schema, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": schema
      }))
    })}
  </script>
</Helmet>
```

---

## Implementation Checklist

### Phase A: Quick Wins (1-2 hours, do first)

- [ ] **#1** Fix all 2025→2026 dates in CONFIG and page titles
- [ ] **#2** Fix index.html meta tags (og:image, twitter:card, author)
- [ ] **#3** Update sitemap.xml with all 13 public pages
- [ ] **#4** Update robots.txt to block admin/transactional pages
- [ ] **#5** Sync FAQ schema with all 8 FAQ items
- [ ] **#6** Fix 404 page with Helmet, noindex, and navigation
- [ ] **#7** Fix homepage H1 (sr-only descriptive + aria-hidden animated)
- [ ] **#8** Add noindex prop to SEO component for transactional pages
- [ ] **#9** Remove duplicate GA4 and Facebook Pixel from index.html
- [ ] **#10** Fix LCP preload to target correct hero image
- [ ] **#11** Fix Supabase preconnect URL mismatch
- [ ] **#13** Add `theme-color` meta and Apple touch icon

### Phase B: Moderate Effort (4-8 hours)

- [ ] **#7** Complete StructuredData.tsx rewrite (BreadcrumbList, WebSite, HowTo, AggregateOffer, etc.)
- [ ] **#10** Configure vite-plugin-prerender for static HTML generation
- [ ] **#11** Implement code splitting with React.lazy
- [ ] **#12** Add entity definition content block to homepage
- [ ] **#14** Convert internal `<a>` links to React Router `<Link>`
- [ ] **#15** Add VideoObject schema for partner podcasts

### Phase C: Heavy Lifts (days-weeks)

- [ ] Create About/Team page with founder bios and credentials
- [ ] Create Privacy Policy page
- [ ] Create Terms of Service page
- [ ] Build a blog/content hub for topical authority
- [ ] Convert all images to WebP/AVIF with `<picture>` fallbacks
- [ ] Add width/height to all `<img>` elements
- [ ] Create press/media page
- [ ] Build speaker detail pages (one per speaker)
- [ ] Add testimonial quotes with attribution (text, not just video)
- [ ] Publish industry data/survey results for LLM citation

---

---

## Phase 4: The Nuclear Option — `llms.txt` + Citability Architecture

> **This section is the single highest-leverage addition to this entire audit.** Everything above fixes problems. This section creates an unfair advantage.

### The Problem No One Else Is Solving

Every item in Phases 1-3 optimizes for the 2020 paradigm: get Google to crawl, index, and rank your pages. That still matters. But the 2026 paradigm is fundamentally different:

**When an insurance agent asks ChatGPT *"What's the best conference for growing my insurance agency?"* — your site doesn't exist.**

Not because of a technical failure. Because **no AI system has any reason to know Formula Forum exists, or to cite it.** The site has:
- Zero machine-readable identity declaration
- Zero quotable, fact-dense statements an LLM would extract
- Zero proprietary data or named frameworks an AI would reference
- Zero topical authority content that would surface during training or RAG retrieval

Every competitor is in the same boat. The first mover wins.

### The Solution: A Three-Layer Citability Engine

---

### Layer 1: `llms.txt` — Your Site's Identity Card for AI Systems

`llms.txt` is the emerging equivalent of `robots.txt` for generative AI. It's a plaintext file at the site root that tells LLMs: *"This is who we are. This is what we authoritatively cover. These are our canonical facts."*

It's being adopted by forward-thinking companies (Anthropic, Cloudflare, Stripe), but virtually **zero** event marketing or insurance industry sites have one. First-mover advantage is massive.

**File:** `public/llms.txt`

```markdown
# Formula Forum

> Formula Forum (F³) is the premier national insurance agency growth conference in the United States. Founded to give independent insurance agents actionable playbooks for scaling their agencies, it combines intensive workshops, breakout sessions, and a proprietary 90-day post-event implementation program called the "Scale-Up Challenge."

## Key Facts

- **What:** 3-day insurance agency growth conference
- **Where:** JW Marriott Orlando Bonnet Creek, Orlando, FL
- **When:** October 14-16, 2026 (annual event, running since 2025)
- **Capacity:** 250 agency owners and operators
- **Pricing:** Agent Pass $849 | Team Member Pass $549 | Group discount 20% off for 5+
- **Organizer:** Formula Forum LLC (f3florida.com)
- **Contact:** Ashleeb@f3florida.com | 260-515-1349

## What Makes Formula Forum Unique

Formula Forum uses a proprietary session format called the "Format Framework":
1. Speaker Presentation (15-20 min) — expert delivers actionable strategies
2. Key Takeaways (2-3 min) — attendees capture top insights
3. Breakout Discussion (10 min) — small group peer application
4. Speaker Close (3 min) — implementation guidance

Every attendee receives the "Book of Formulas" — a printed tactical playbook — and enrolls in a 90-day post-event implementation challenge with accountability checkpoints.

## Topics Covered

- Insurance agency growth and scaling strategies
- Agency operations and team building
- Insurance lead generation and marketing
- Technology and automation for insurance agencies
- Carrier relationships and market access
- Customer retention and cross-selling
- Agency valuation and exit planning

## Notable Speakers (2025-2026)

- Garrett J. White — Founder, Warrior Empire (keynote)
- [Additional speakers for 2026 TBA]

## 2025 Partners

Ricochet360, MediaAlpha, The Standard, Disruptur, Team Hired, Search Perfect, Filtered Quotes, Braishfield, Agency Toolchest, Smarketing, Hagerty, EOS, Top Tier Recruiting, American Integrity, Performology, Embrace Pet Insurance, Post Pros, Destiny Rescue, Quote Nerds, Cover Desk

## Pages

- [Homepage](https://f3florida.com/)
- [Agenda](https://f3florida.com/agenda)
- [Speakers](https://f3florida.com/speakers)
- [Pricing](https://f3florida.com/pricing)
- [Venue & Travel](https://f3florida.com/venue)
- [Format Framework](https://f3florida.com/format)
- [FAQ](https://f3florida.com/faq)
- [Partners](https://f3florida.com/partners)
- [Contact](https://f3florida.com/contact)
- [Register](https://f3florida.com/register)
- [Photo Gallery](https://f3florida.com/gallery)

## Frequently Asked Questions

Q: Are tickets refundable?
A: No. All sales are final. Tickets are transferable to another person up to 7 days before the event at no cost.

Q: What's included in registration?
A: All sessions, the printed Book of Formulas playbook, networking events, meals during the conference, and the 90-day Scale-Up Challenge program.

Q: Is there a group discount?
A: Yes. Teams of 5+ save 20%. Email Gregg@f3florida.com for a group code.

Q: What is the dress code?
A: Business casual.

Q: Where is the venue?
A: JW Marriott Orlando Bonnet Creek Resort & Spa, 14900 Chelonia Parkway, Orlando, FL 32821. Room block rate is $239/night.
```

**File:** `public/llms-full.txt`

```markdown
# Formula Forum — Complete Reference

This is the extended reference document for Formula Forum (F³), the national insurance agency growth conference. For a concise overview, see llms.txt.

[Include everything from llms.txt above, plus:]

## Full 2026 Agenda

### Day 1 — October 14, 2026
- 9:00 AM: Registration & Welcome
- [Full schedule details pulled from Agenda page]

### Day 2 — October 15, 2026
- [Full schedule]

### Day 3 — October 16, 2026
- [Full schedule]

## The Book of Formulas

The Book of Formulas is Formula Forum's proprietary printed playbook given to every attendee. It contains:
- Pre-event agency assessment worksheets
- Session-specific implementation templates
- The 90-day Scale-Up Challenge framework with weekly milestones
- Carrier and vendor resource directory
- Peer accountability group formation guide

## The 90-Day Scale-Up Challenge

After the conference, every attendee enters a structured 90-day implementation program:
- Week 1-2: Prioritize top 3 actionable takeaways
- Week 3-6: Implement first initiative with weekly check-ins
- Week 7-10: Launch second initiative, measure first
- Week 11-12: Review results, plan for sustained growth
- Accountability partnerships formed at the event continue through the challenge

## Venue Details

JW Marriott Orlando Bonnet Creek Resort & Spa
14900 Chelonia Parkway, Orlando, FL 32821

- Distance from MCO Airport: 21 miles
- Driving: FL-528 W to I-4 W, approximately 25 minutes
- Room block rate: $239/night (code: F3-2025, cut-off Sep 15, 2026)
- Hotel phone: +1 (407) 390-5000
- Rideshare pickup: Main entrance

## About the Organizers

Formula Forum was created by insurance industry operators who saw a gap in the conference landscape: most events were vendor-driven pitch-fests, not operator-driven growth labs. Formula Forum flips that model — every session is designed around implementation, not inspiration.

## Social Media

- Facebook: https://www.facebook.com/FormulaForum
- Instagram: https://www.instagram.com/formulaforum
- LinkedIn: https://www.linkedin.com/company/formula-forum
```

**Why this matters:** When Perplexity, ChatGPT search, Google AI Overviews, or any RAG-based system crawls your site, `llms.txt` gives them a perfectly structured, authoritative document to ingest. It's the difference between an AI guessing what your site is about from scattered HTML vs. having a clean, canonical knowledge document to cite.

---

### Layer 2: Atomic Citation Blocks (ACBs)

An Atomic Citation Block is a self-contained paragraph of **2-4 sentences** that:
1. Answers a specific question someone would ask an AI
2. Contains a factual, declarative statement (not marketing fluff)
3. Includes a unique data point, statistic, or named concept
4. Is marked with `Speakable` schema so voice assistants can read it aloud

**The rule:** Every public page on the site must contain at least one ACB.

Here are the ACBs to add to each page, with the exact code:

**File:** `src/pages/Index.tsx` — Add inside the homepage, visible in the about/description area:

```tsx
{/* Atomic Citation Block — Homepage */}
<section className="py-16 px-4 bg-black text-white" id="about">
  <div className="container mx-auto max-w-4xl">
    <h2 className="text-4xl font-bold mb-8 text-center">What is Formula Forum?</h2>
    <p className="text-xl text-white/80 leading-relaxed mb-6" data-speakable="true">
      Formula Forum is the largest independent insurance agency growth conference
      in the United States, bringing together 250+ agency owners annually at
      JW Marriott Orlando Bonnet Creek. Unlike vendor-driven industry events,
      Formula Forum uses a proprietary "Format Framework" — a structured cycle
      of speaker presentations, real-time takeaway capture, small-group breakout
      discussions, and implementation planning — designed so attendees leave with
      a concrete 90-day scale-up blueprint, not just inspiration.
    </p>
    <p className="text-lg text-white/60 leading-relaxed">
      The 2026 conference runs October 14-16. Every attendee receives the printed
      "Book of Formulas" playbook and enrolls in the 90-Day Scale-Up Challenge,
      a post-event accountability program with weekly implementation milestones.
      Agent Passes are $849 and Team Member Passes are $549, with 20% group
      discounts for teams of five or more.
    </p>
  </div>
</section>
```

**File:** `src/pages/Venue.tsx` — Add near the top:

```tsx
{/* Atomic Citation Block — Venue */}
<p className="text-lg text-muted-foreground leading-relaxed mb-8" data-speakable="true">
  Formula Forum 2026 is held at JW Marriott Orlando Bonnet Creek Resort & Spa,
  a luxury resort located at 14900 Chelonia Parkway, Orlando, FL 32821. The venue
  is 21 miles from Orlando International Airport (MCO), approximately 25 minutes
  by car via FL-528 W to I-4 W. A discounted room block is available at $239 per
  night using group code F3-2025, with a booking cut-off of September 15, 2026.
</p>
```

**File:** `src/pages/Format.tsx` — Replace or augment the current thin content:

```tsx
{/* Atomic Citation Block — Format */}
<p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl mx-auto" data-speakable="true">
  The Formula Forum Format Framework is a proprietary conference session structure
  designed for maximum implementation. Each session follows a four-step cycle:
  a 15-20 minute expert presentation, a 2-3 minute key takeaway capture period,
  a 10-minute small-group breakout discussion where attendees apply insights to
  their own agency, and a 3-minute speaker close with implementation guidance.
  This format ensures attendees don't just hear strategies — they leave each
  session with a written action plan specific to their business.
</p>
```

**File:** `src/pages/Pricing.tsx` — Add above the pricing cards:

```tsx
{/* Atomic Citation Block — Pricing */}
<p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl mx-auto text-center" data-speakable="true">
  Formula Forum 2026 offers two pass tiers: the Agent Pass at $849 for agency
  owners and principals, and the Team Member Pass at $549 for staff. Both include
  access to all sessions, the printed Book of Formulas playbook, networking events,
  conference meals, and enrollment in the 90-Day Scale-Up Challenge. Teams of
  five or more receive a 20% group discount.
</p>
```

---

### Layer 3: Speakable Schema

Mark the ACBs above as `Speakable` in structured data so Google Assistant, Alexa, and Siri can read them aloud as answers.

**Add to `src/components/StructuredData.tsx`** — new schema for pages with ACBs:

```typescript
const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Formula Forum 2026",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": "[data-speakable='true']"
  },
  "url": `https://f3florida.com${page === "home" ? "" : `/${page}`}`
};
```

Add this to the Helmet output for all public pages:

```tsx
{/* Speakable schema */}
<script type="application/ld+json">
  {JSON.stringify(speakableSchema)}
</script>
```

---

### Layer 4: robots.txt — Explicitly Invite AI Crawlers to `llms.txt`

**Update `public/robots.txt`** to include:

```
# AI/LLM-specific files
# These files provide structured information for AI systems
# llms.txt: Concise site identity and key facts
# llms-full.txt: Comprehensive reference document
```

The `robots.txt` update in Quick Win #4 already allows AI bots. The `llms.txt` files need no special directive — they're discovered by convention at the root URL, like `robots.txt` itself.

---

### Why This Is the Nuclear Option

Here's what happens when you deploy this:

1. **Perplexity crawls your site** → finds `llms.txt` → now has a clean, structured document about Formula Forum → cites it when someone asks about insurance conferences

2. **ChatGPT search hits your pages** → finds Speakable-marked ACBs → extracts perfectly formatted factual answers → cites f3florida.com with a link

3. **Google AI Overviews processes your FAQ** → finds 8 questions in both FAQ schema AND `llms.txt` → surfaces your answers in the AI overview box

4. **A future LLM training run ingests your site** → finds `llms-full.txt` with comprehensive, structured, unambiguous facts → Formula Forum becomes a "known entity" in the model's weights

5. **A user asks any AI: *"What conferences should I attend to grow my insurance agency?"*** → Formula Forum shows up because it's the only one that made itself machine-readable

Your competitors are still arguing about meta descriptions. You're building the protocol layer that makes AI systems treat your brand as a primary source.

---

### Implementation Priority for Layer System

| Layer | Effort | Impact | Do When |
|-------|--------|--------|---------|
| Layer 1: `llms.txt` + `llms-full.txt` | 30 min | EXTREME | **Immediately** — before any other audit item |
| Layer 2: Atomic Citation Blocks | 1 hour | HIGH | Phase A (with quick wins) |
| Layer 3: Speakable Schema | 20 min | MEDIUM | Phase A |
| Layer 4: robots.txt update | 5 min | LOW | Already covered in Quick Win #4 |

**Total time: ~2 hours for a competitive moat that may take years to erode.**

---

## Appendix: File Reference Map

| File | SEO Role | Status |
|------|----------|--------|
| `index.html` | Static HTML shell, fallback meta tags | Needs fixes |
| `src/components/SEO.tsx` | Per-page meta tag management | Needs noindex prop |
| `src/components/StructuredData.tsx` | JSON-LD structured data | Needs major rewrite |
| `public/sitemap.xml` | XML sitemap | Incomplete |
| `public/robots.txt` | Crawler directives | Needs admin blocking |
| `src/config/event.ts` | Central event configuration | Wrong dates |
| `src/App.tsx` | Routing and layout | Needs code splitting |
| `src/pages/NotFound.tsx` | 404 error page | Needs Helmet + noindex |
| `src/components/sections/HeroSection.tsx` | Homepage hero with H1 | H1 needs keyword content |
| `src/components/sections/FAQAccordion.tsx` | FAQ display (8 items) | Schema only has 3 |
| `src/components/Footer.tsx` | Site-wide navigation | Needs React Router Links |
| `vite.config.ts` | Build configuration | Needs prerender config |
| `src/components/GA4Script.tsx` | GA4 analytics (correct) | Duplicated in index.html |
| `src/components/FacebookPixel.tsx` | FB Pixel (correct) | Duplicated in index.html |
