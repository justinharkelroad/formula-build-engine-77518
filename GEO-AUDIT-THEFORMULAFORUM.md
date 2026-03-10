# GEO Audit Report: The Formula Forum (theformulaforum.com)

**Audit Date:** March 10, 2026
**Business Type:** Event / Conference (Insurance Agency Growth)
**Primary Domain:** theformulaforum.com
**Alternate Domain:** f3florida.com (broken — returns 405 errors)
**Platform:** Lovable.app (React SPA, client-side rendered)
**Event:** October 14-16, 2026 | JW Marriott Orlando Bonnet Creek Resort & Spa

---

## Composite GEO Score: 31/100 — POOR

```
  0        20        40        60        80       100
  |---------|---------|---------|---------|---------|
  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  31/100
                  ^
              YOU ARE HERE
```

| Category | Score | Weight | Weighted |
|---|---|---|---|
| AI Citability & Visibility | 38/100 | 25% | 9.5 |
| Brand Authority Signals | 18/100 | 20% | 3.6 |
| Content Quality & E-E-A-T | 52/100 | 20% | 10.4 |
| Technical Foundations | 27/100 | 15% | 4.1 |
| Structured Data | 0/100 | 10% | 0.0 |
| Platform Optimization | 34/100 | 10% | 3.4 |
| **COMPOSITE** | | | **31/100** |

**Interpretation:** The Formula Forum has **minimal AI discoverability**. Rich content exists but is trapped inside a JavaScript bundle invisible to AI crawlers. The robots.txt explicitly welcomes 6 AI crawlers — to pages that return an empty `<div>`.

---

## AI Platform Readiness

| Platform | Score | Status |
|---|---|---|
| Google AI Overviews | 28/100 | Poor |
| ChatGPT Web Search | 38/100 | Fair |
| Perplexity AI | 30/100 | Poor |
| Google Gemini | 32/100 | Poor |
| Bing Copilot | 28/100 | Poor |

**Strongest:** ChatGPT Web Search (38) — explicit GPTBot + ChatGPT-User allowed; decent OG tags
**Weakest:** Google AI Overviews & Bing Copilot (28) — SPA returns empty body; no schema in HTML

---

## The #1 Problem: AI Crawlers See an Empty Page

The Formula Forum is built as a **client-side rendered React SPA** on the Lovable.app platform. Every page serves this HTML body:

```html
<body>
  <div class="sticky-header-space"></div>
  <div id="root"></div>
</body>
```

**What AI crawlers actually see when they visit any page:**

| Element | What's There |
|---------|-------------|
| Title | "FORMULA The #1 Agency Growth Event Returns in 2026" (same on ALL pages) |
| Description | "Formula will return in the fall of 2026! Hop on the waitlist..." (same on ALL pages) |
| Body content | **Empty** — 0 words |
| Headings | **None** |
| Internal links | **None** |
| Schema markup | **None** in HTML (exists in JS bundle only) |

**The irony:** The site has invested in comprehensive schema.org markup (Event, Organization, FAQPage, SpeakableSpecification, BreadcrumbList, and more) — but it's ALL injected via JavaScript at runtime, invisible to every AI crawler.

**The hidden good news:** Content quality inside the JS bundle is actually decent:
- Format Framework description: 78/100 citability (proprietary methodology)
- Event definition: 72/100 citability (clear, factual, self-contained)
- FAQ answers: 68/100 citability (8 specific Q&A pairs)
- Pricing data: 65/100 citability (specific tiers and dollar amounts)

**Impact:** Until SSR/pre-rendering is fixed, every other optimization has severely reduced effect.

---

## Detailed Findings by Category

---

### 1. AI Citability & Visibility — 38/100

| Component | Score |
|---|---|
| Citability (passage quality) | 40/100 |
| AI Crawler Access (robots.txt) | 90/100 |
| Brand Mentions | 18/100 |
| llms.txt | 0/100 |

**Citability (40/100):** Would-be-excellent content is locked behind JavaScript. The only text accessible to crawlers is meta/OG tags. The OG description is the strongest accessible block: "Formula Forum 2026: the national insurance agency growth conference. Oct 14-16 at JW Marriott Orlando Bonnet Creek. Workshops, breakouts, and a 90-day growth plan."

**Crawler Access (90/100):** Excellent robots.txt — explicitly allows GPTBot, ClaudeBot, PerplexityBot, ChatGPT-User, Google-Extended, Amazonbot. Sensible disallows for /admin/, /payment-success, /thank-you, /vip. Deducted 10 points for sitemap domain mismatch (references f3florida.com, which returns 405).

**Brand Mentions (18/100):** Near-zero external presence:
- Wikipedia: Absent (0/30)
- Reddit: Absent (0/20)
- YouTube: 15 testimonial videos on other channels (5/15)
- LinkedIn: Basic company page exists (4/10)
- Industry sources: No press, no reviews (9/25)

**llms.txt (0/100):** No llms.txt or llms-full.txt exists. This is especially critical given the SPA problem — llms.txt would be the one text file AI models could actually read.

---

### 2. Brand Authority Signals — 18/100

| Platform | Status | Details |
|---|---|---|
| Wikipedia | Absent | No article for "Formula Forum," "F3 Florida," or related terms |
| Reddit | Absent | Zero discussions found |
| YouTube | Minimal | 15 testimonials on attendee/partner channels; no official channel |
| LinkedIn | Minimal | Company page exists at linkedin.com/company/formula-forum |
| Industry Press | Absent | No Insurance Journal, Independent Agent Magazine, or trade coverage |
| Review Sites | Absent | No Trustpilot, G2, or Google Business reviews |

The brand "Formula Forum" / "F3 Florida" is effectively unknown to AI models. Without Wikipedia, Wikidata, or significant third-party coverage, AI systems have no external signals to verify the entity exists.

---

### 3. Content Quality & E-E-A-T — 52/100

| Dimension | Score | Key Evidence |
|---|---|---|
| Experience | 14/25 | 2025 photo gallery, 20 partner podcast videos, past event references; lacks case studies, outcome metrics |
| Expertise | 11/25 | 12 speakers listed but only 1 has a bio (Garrett J. White); no credentials for 11 speakers |
| Authoritativeness | 12/25 | 27 named 2025 partners, JW Marriott venue, Stripe payments; no media mentions or awards |
| Trustworthiness | 12/25 | HTTPS, contact info, privacy/terms (March 2026), clear refund policy; FB Pixel debug tool in production, brand identity fragmented |

**Critical content gaps:**
- **Only 1 of 12 speakers has a biography** — the other 11 have just names and company affiliations
- **Agenda page says "Full Agenda Coming Soon"** while tickets are actively selling at $647/$347
- **No "About" page** — organizers behind Formula Forum are not identified
- **Brand identity split three ways:** theformulaforum.com (domain), f3florida.com (emails), "Triumph Box and Ryde INC" (privacy policy legal entity)
- **~2,500-3,000 total words across 7 pages** — thin content averaging ~400 words/page
- **No blog, articles, or thought leadership** — zero topical authority beyond event logistics
- **Facebook Pixel Debug Tool visible on production Contact page** — development artifact
- **5 of 12 speakers are from Allstate** with no disclosure of financial relationship
- **Hotel room block code says "F3-2025"** for the 2026 event — likely carryover error

---

### 4. Technical Foundations — 27/100

| Component | Score |
|---|---|
| Server-Side Rendering | 5/100 |
| Meta Tags & Indexability | 25/100 |
| Crawlability | 20/100 |
| Security Headers | 60/100 |
| Core Web Vitals Risk | 45/100 |
| Mobile Optimization | 50/100 |
| URL Structure | 70/100 |
| Response & Status Codes | 0/100 |

**Critical issues:**
1. **Pure client-side SPA** — every page serves identical empty HTML shell
2. **f3florida.com completely broken** — returns HTTP 405 for ALL requests
3. **Sitemap points to broken domain** — all 12 URLs reference f3florida.com (405 errors)
4. **No canonical tags** — combined with dual domains, creates severe duplicate content
5. **All pages share identical meta tags** — `/speakers` has the homepage title and description
6. **Missing CSP, X-Frame-Options, Permissions-Policy headers**
7. **Cloudflare cookie leaks hosting platform** — `__cf_bm` domain set to `lovable.app`

**Positives:**
- Clean URL structure: `/agenda`, `/speakers`, `/pricing`, `/venue`, `/faq`
- HTTPS with strong HSTS (1 year, includeSubDomains)
- Hero image preloaded with fetchpriority="high" in WebP
- font-display: swap for CLS prevention
- Preconnect hints for 5 external origins

---

### 5. Structured Data — 0/100

**Zero structured data in server-rendered HTML across all 8 pages.**

| Schema Type | In HTML? | In JS Bundle? | GEO Impact |
|---|---|---|---|
| Event | No | Yes | CRITICAL |
| Organization + sameAs | No | Yes | CRITICAL |
| FAQPage | No | Yes | HIGH |
| Person (speakers) | No | Partial | HIGH |
| AggregateOffer | No | Yes | HIGH |
| Place (venue) | No | Yes | HIGH |
| WebSite | No | Yes | MEDIUM |
| BreadcrumbList | No | Yes | LOW |
| SpeakableSpecification | No | Yes | MEDIUM |
| HowTo (Format Framework) | No | Yes | MEDIUM |

**Key insight:** Someone invested significant effort building comprehensive schema — it's all trapped in JavaScript. Moving these to the HTML `<head>` is a quick win with massive impact.

**sameAs entity linking:** Zero platform links in crawlable HTML. The JS bundle references Facebook, Instagram, and LinkedIn profiles, but these are invisible to crawlers.

---

### 6. Platform Optimization — 34/100

**Google AI Overviews (28/100):**
- SPA returns empty body — no headings, content, or structure for passage ranking
- No JSON-LD schema for event rich results
- FAQ page uses accordion buttons, not semantic H2/H3 headings
- OG description is the strongest accessible signal

**ChatGPT Web Search (38/100):**
- GPTBot + ChatGPT-User explicitly allowed (strong signal)
- No Wikipedia/Wikidata entity for recognition
- No OAI-SearchBot listed (covered by wildcard but not explicit)
- OG description packs useful facts into one passage

**Perplexity AI (30/100):**
- PerplexityBot explicitly allowed but sees empty page
- Zero Reddit/community presence (Perplexity's primary citation source)
- No original data or research content
- Proprietary Format Framework would score highly if accessible

**Google Gemini (32/100):**
- No YouTube channel (20 partner videos exist but not centralized)
- No Google Business Profile
- No Knowledge Panel likely without Wikipedia/Wikidata
- Domain transition (f3florida.com → theformulaforum.com) may cause entity confusion

**Bing Copilot (28/100):**
- No IndexNow protocol support
- No Bing Webmaster Tools verification
- LinkedIn page exists (positive Microsoft ecosystem signal)
- Bingbot JS rendering is weak — SPA is a bigger problem here than on Google

---

## Prioritized Action Plan

### Quick Wins (1-2 Weeks) — Low Effort, High Impact

| # | Action | Impact | Effort |
|---|---|---|---|
| 1 | **Move JSON-LD schema from JS bundle to static HTML `<head>`** — Event, Organization, FAQPage schemas already exist; extract into server-rendered `<script type="application/ld+json">` tags | Schema: 0 → ~60 | Low |
| 2 | **Create and deploy llms.txt** at `/llms.txt` with event details, pricing, FAQ, format description (template provided below) | Immediate AI visibility workaround | Low |
| 3 | **Fix sitemap domain** — replace f3florida.com URLs with theformulaforum.com in sitemap.xml and robots.txt | Fixes 12 broken crawler URLs | Low |
| 4 | **Add canonical tags** — `<link rel="canonical">` on every page | Resolves duplicate content | Low |
| 5 | **Add unique per-page `<title>` and `<meta description>`** | Differentiates pages for search | Low-Med |
| 6 | **Fix f3florida.com wildcard redirects** — `f3florida.com/*` → `theformulaforum.com/*` | Fixes broken alternate domain | Low |
| 7 | **Remove Facebook Pixel Debug Tool** from Contact page | Removes dev artifact | Low |
| 8 | **Add OAI-SearchBot, Bytespider, CCBot, Applebot-Extended** to robots.txt | Explicit AI crawler welcome | Low |
| 9 | **Implement IndexNow protocol** for Bing | Bing Copilot: +10-15 points | Low |

### Medium-Term (2-6 Weeks) — Medium Effort

| # | Action | Impact | Effort |
|---|---|---|---|
| 10 | **Implement SSR or pre-rendering** — Migrate from Lovable SPA to Next.js/Astro OR add pre-rendering (Prerender.io/Cloudflare Workers) | **BIGGEST SINGLE IMPACT**: 31 → ~58 composite | High |
| 11 | **Write speaker bios for all 12 speakers** — 100-200 words each with credentials, topic, learning outcomes | E-E-A-T Expertise: 11 → 20+ | Medium |
| 12 | **Publish full event agenda** with session titles, descriptions, times, speakers | Trust + Citability boost | Medium |
| 13 | **Create "About" page** with organizer bios, founding story, team photos | Fills critical E-E-A-T gap | Medium |
| 14 | **Create Wikidata entry** for "Formula Forum" (annual event, Orlando, insurance) | Foundation for AI entity recognition | Medium |
| 15 | **Create branded YouTube channel** — upload 20 existing partner podcast videos + event recaps | Brand Authority + Gemini: +15-20 | Medium |
| 16 | **Consolidate brand identity** — consistent naming, switch emails to theformulaforum.com domain | Resolves three-way identity confusion | Medium |
| 17 | **Add detailed attendee testimonials** with names, companies, specific outcomes | Social proof for E-E-A-T | Medium |

### Strategic (1-3 Months) — Long-Term Impact

| # | Action | Impact | Effort |
|---|---|---|---|
| 18 | **Build content hub/blog** — 10-15 articles on insurance agency growth topics | Topical Authority: 10% → 50%+ | High |
| 19 | **Publish Formula Forum 2025 recap** with attendance data, outcomes, metrics | Proves experience track record | High |
| 20 | **Establish Reddit presence** in r/InsuranceAgent, r/InsurancePros, r/smallbusiness | Brand Authority on Perplexity's top source | Medium |
| 21 | **Secure partner backlinks/mentions** — get 27 partners to reference Formula Forum | Brand Authority: +10-15 | Medium |
| 22 | **Pursue insurance trade press coverage** — Insurance Journal, Independent Agent Magazine | Wikipedia notability + brand authority | High |
| 23 | **Create Google Business Profile** as event organizer | Gemini entity recognition | Low |
| 24 | **Add Bing Webmaster Tools verification** | Direct Bing indexation control | Low |
| 25 | **Publish original research** — "State of Agency Growth 2026" from attendee survey data | Premium citable content | High |

---

## Projected Score Improvement

| Scenario | Actions | Projected Score |
|---|---|---|
| **Current state** | — | **31/100** |
| **Quick wins only** (#1-9) | Schema to HTML, llms.txt, fix sitemap/domain | **~42/100** (+11) |
| **+ SSR/Pre-rendering** (#10) | Content becomes visible to all crawlers | **~58/100** (+16) |
| **+ Content improvements** (#11-17) | Speaker bios, agenda, about page, YouTube | **~68/100** (+10) |
| **+ Brand building** (#18-25) | Blog, Reddit, press, Wikidata, research | **~78/100** (+10) |

---

## Ready-to-Deploy Assets

### Recommended llms.txt

```
# Formula Forum

> Formula Forum (F3) is the national insurance agency growth conference held annually in Orlando, Florida. It brings together insurance agency owners, team members, and industry partners for operator-led training, peer breakout sessions, and actionable implementation planning.

## Event Details
- [Formula Forum 2026](https://theformulaforum.com): October 14-16, 2026 at JW Marriott Orlando Bonnet Creek Resort & Spa, Orlando, FL
- [Pricing](https://theformulaforum.com/pricing): Agency Owner Pass ($647) and Team Member Pass ($347)
- [Venue](https://theformulaforum.com/venue): JW Marriott Orlando Bonnet Creek, 14900 Chelonia Pkwy, Orlando, FL 32821
- [FAQ](https://theformulaforum.com/faq): Refund policy, hotel booking, group discounts, dress code

## Format
- [The Format Framework](https://theformulaforum.com/format): Proprietary four-step session cycle — Speaker training (15-20 min), Takeaway capture (2-3 min), Small-group breakouts (10 min), Speaker close (3 min)

## Speakers
- [2026 Speaker Lineup](https://theformulaforum.com/speakers): Keynote by Garrett J. White (Wake Up Warrior), plus sessions from agency operators across Allstate, Farmers, and independent firms

## Agenda
- [Full Agenda](https://theformulaforum.com/agenda): Three-day schedule covering agency scaling, referral systems, producer development, AI applications, leadership, and EOS implementation

## Contact
- [Contact](https://theformulaforum.com/contact): info@f3florida.com, (260) 515-1349

## Partners
- [Partners](https://theformulaforum.com/partners): Ricochet360, The Standard, MediaAlpha (Platinum sponsors)
- [Gallery](https://theformulaforum.com/gallery): Photos from the 2025 Formula experience
```

### Critical JSON-LD: Event Schema (Homepage)

```json
{
  "@context": "https://schema.org",
  "@type": "BusinessEvent",
  "@id": "https://theformulaforum.com/#event",
  "name": "FORMULA: The #1 Agency Growth Event",
  "alternateName": "F3 Florida",
  "description": "Formula Forum is the national insurance agency growth conference held annually in Orlando, Florida, bringing together agency owners, team members, and industry partners for operator-led training, peer breakout sessions, and actionable implementation planning.",
  "url": "https://theformulaforum.com",
  "startDate": "2026-10-14T09:00:00-04:00",
  "endDate": "2026-10-16T17:00:00-04:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "@id": "https://theformulaforum.com/#venue",
    "name": "JW Marriott Orlando Bonnet Creek Resort & Spa",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "14900 Chelonia Pkwy",
      "addressLocality": "Orlando",
      "addressRegion": "FL",
      "postalCode": "32821",
      "addressCountry": "US"
    }
  },
  "organizer": {
    "@type": "Organization",
    "@id": "https://theformulaforum.com/#organizer",
    "name": "Formula Forum",
    "url": "https://theformulaforum.com"
  },
  "offers": [
    {
      "@type": "Offer",
      "name": "Agency Owner Pass",
      "price": "647",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "https://theformulaforum.com/pricing"
    },
    {
      "@type": "Offer",
      "name": "Team Member Pass",
      "price": "347",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "https://theformulaforum.com/pricing"
    }
  ],
  "maximumAttendeeCapacity": 250,
  "isAccessibleForFree": false,
  "inLanguage": "en"
}
```

### Critical JSON-LD: Organization Schema (All Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://theformulaforum.com/#organizer",
  "name": "Formula Forum",
  "alternateName": ["F3 Florida", "The Formula Forum", "F3"],
  "url": "https://theformulaforum.com",
  "sameAs": [
    "https://www.facebook.com/FormulaForum",
    "https://www.instagram.com/formulaforum",
    "https://www.linkedin.com/company/formula-forum"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "info@f3florida.com",
    "telephone": "+1-260-515-1349"
  },
  "event": {
    "@id": "https://theformulaforum.com/#event"
  }
}
```

### Critical JSON-LD: FAQPage Schema (/faq)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Are tickets refundable?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. All sales are final. Tickets may be transferred to another person up to 7 days before the event."
      }
    },
    {
      "@type": "Question",
      "name": "How do I book the hotel room block?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use the room-block link on the venue page. The group rate is $239/night at JW Marriott Orlando Bonnet Creek. Cut-off date is September 15, 2026."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a group discount?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Teams of five or more save 20%."
      }
    },
    {
      "@type": "Question",
      "name": "What's included in registration?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "All sessions, printed Book of Formulas playbook, networking events, and meals."
      }
    },
    {
      "@type": "Question",
      "name": "Will sessions be recorded?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. For the privacy and engagement of attendees, sessions are not recorded."
      }
    }
  ]
}
```

*Additional templates generated: Person (speakers), Place (venue), Offer (pricing), BreadcrumbList, WebSite, WebPage + speakable, EventSchedule (agenda), Sponsor (partners). Available upon request.*

---

## Methodology

This audit evaluates Generative Engine Optimization (GEO) readiness — how well a website is positioned to appear in AI-generated search results from ChatGPT, Perplexity, Google AI Overviews, Gemini, and Bing Copilot.

**Scoring weights:**
- AI Citability & Visibility (25%): Passage scoring, answer block quality, AI crawler access
- Brand Authority Signals (20%): Mentions on Reddit, YouTube, Wikipedia, LinkedIn; entity presence
- Content Quality & E-E-A-T (20%): Expertise signals, original data, author credentials
- Technical Foundations (15%): SSR, Core Web Vitals, crawlability, mobile, security
- Structured Data (10%): Schema completeness, JSON-LD validation, rich result eligibility
- Platform Optimization (10%): Platform-specific readiness across 5 AI search engines

**Analysis performed by:** 5 parallel specialized subagents (AI Visibility, Platform Analysis, Technical SEO, Content Quality, Schema Markup)

---

*Report generated March 10, 2026 by Claude Code GEO Audit Tool*
*The Formula Forum — https://theformulaforum.com*
