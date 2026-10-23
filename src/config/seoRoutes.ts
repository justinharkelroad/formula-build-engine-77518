import { SALES_SEQUENCE } from "./resources/salesSequence";
import { GROWTH_THROUGH_SERVICE } from "./resources/growthThroughService";
import { OPERATING_SYSTEM } from "./resources/operatingSystem";
import { TRAINING } from "./resources/training";
import { MAKING_IT_RAIN } from "./resources/makingItRain";
import { BODY, BALANCE, BEING } from "./resources/personalSessions";
import { FUNDING_THE_BUILD } from "./resources/fundingTheBuild";
import type { ResourcePageContent } from "./resources/types";
import { TESTIMONIAL_STORIES } from "./testimonialStories";
import { ogImageFor } from "./ogImages";

/**
 * Every prerenderable route and the metadata its <head> should carry.
 *
 * This is consumed at BUILD time by the prerender plugin in vite.config.ts, which
 * writes one static HTML file per route so crawlers that do not execute JavaScript
 * see per-page metadata. At RUNTIME the same values are rendered by react-helmet-async
 * (src/components/SEO.tsx), which claims the prerendered data-rh tags on boot rather
 * than duplicating them.
 *
 * The nine /resources/* entries are derived from their content modules, so they can
 * never drift. The remaining entries mirror the values their page components pass to
 * <SEO>; if you change a page's title or description, update it here too.
 *
 * Dynamic routes (/partner-welcome/:tier) and pure redirects (/register) are omitted
 * on purpose — there is no single static head for them.
 */
export interface SeoRoute {
  path: string;
  title: string;
  description: string;
  /** Emits robots="noindex, nofollow" and no canonical, matching SEO.tsx. */
  noindex?: boolean;
  /** Route-specific share image; omit to use CONFIG.OG_IMAGE_1200x630. Usually set via src/config/ogImages.ts. */
  ogImage?: string;
}

const fromResourcePage = (content: ResourcePageContent): SeoRoute => ({
  path: content.seo.path,
  title: content.seo.title,
  description: content.seo.description,
});

const RESOURCE_ROUTES: SeoRoute[] = [
  SALES_SEQUENCE,
  GROWTH_THROUGH_SERVICE,
  BODY,
  OPERATING_SYSTEM,
  TRAINING,
  BALANCE,
  MAKING_IT_RAIN,
  BEING,
  FUNDING_THE_BUILD,
].map(fromResourcePage);

const TESTIMONIAL_ROUTES: SeoRoute[] = TESTIMONIAL_STORIES.map((story) => ({
  path: `/stories/${story.slug}`,
  title: `${story.name}’s Formula Forum Story`,
  description: `Hear why ${story.name}, an insurance professional from ${story.location}, recommends experiencing Formula Forum in person.`,
}));

const SITE_ROUTES: SeoRoute[] = [
  {
    path: "/",
    title: "Formula Forum 2026 | That's Formula | The Insurance Agency Growth Conference",
    description:
      "Formula Forum 2026 brought insurance agency owners and their teams to Orlando, Oct 14-16. Watch the Formula Opener, see the room, and join the Nov 2 reunion call.",
  },
  {
    path: "/agenda",
    title: "Event Agenda | Formula Forum 2026 — Three Days of Agency Growth",
    description:
      "Formula Forum 2026 three-day agenda: Oct 14 welcome reception, Oct 15 full conference day with breakouts, Oct 16 implementation and action planning.",
  },
  {
    path: "/format",
    title: "The Format Framework | Formula Forum 2026 — How Sessions Work",
    description:
      "Five 60-minute Business sessions and three 40-minute Personal sessions follow one eight-step Formula workbook pattern.",
  },
  {
    path: "/venue",
    title: "Venue | JW Marriott Orlando Bonnet Creek — Formula Forum 2026",
    description:
      "Formula Forum 2026 venue: JW Marriott Orlando Bonnet Creek Resort & Spa, 14900 Chelonia Pkwy, Orlando FL 32821. Room block $299/night, code F3-2026.",
  },
  {
    path: "/survey",
    title: "Formula 2026 Feedback",
    description: "Help us understand what delivered value and where the experience fell short.",
    noindex: true,
  },
  {
    path: "/survey/attendee",
    title: "Attendee Feedback | Formula 2026",
    description: "Help us understand what delivered value and where the experience fell short.",
    noindex: true,
  },
  {
    path: "/survey/partner",
    title: "Partner Feedback | Formula 2026",
    description: "Help us understand what delivered value and where the experience fell short.",
    noindex: true,
  },
  {
    path: "/partners",
    title: "Thank You to Our 2026 Partners | Formula Forum",
    description:
      "Thank you to the partners and sponsors supporting Formula Forum 2026. Meet the companies helping bring our agency community together in Orlando.",
  },
  {
    path: "/gallery",
    title: "Photo Gallery | Formula Forum 2026 Highlights",
    description:
      "Browse photos from Formula Forum 2026 in Orlando: check-in, the welcome reception, general sessions, breakouts, and Casino Night at JW Marriott Orlando Bonnet Creek.",
  },
  {
    path: "/what-to-expect",
    title: "What to Expect at Formula Forum 2026 | Sessions, Your 2027 Map, and Progress",
    description:
      "Eight working sessions, one Domino each, your 2027 Map, and 90 days of follow-through in the Formula app. What agency owners, their teams, and partners experience in Orlando and after.",
  },
  {
    path: "/give-back",
    title: "The Room Gives Back | Formula Forum x Destiny Rescue",
    description:
      "Formula Forum partners with Destiny Rescue to rescue children from sexual exploitation. In two events the Formula room has raised $52,000+.",
  },
  {
    path: "/contact",
    title: "Contact Us | Formula Forum 2026",
    description:
      "Contact the Formula Forum team: info@f3florida.com, (260) 515-1349. Questions about tickets, partnerships, group discounts, or event logistics.",
  },
  {
    path: "/faq",
    title: "FAQ | Formula Forum 2026 — Tickets, Hotel, Refunds & More",
    description:
      "Frequently asked questions about Formula Forum 2026: refund policy, hotel room block at JW Marriott ($299/night), group discounts, dress code, and what's included.",
  },
  {
    path: "/privacy",
    title: "Privacy Policy — The Formula Forum",
    description:
      "Privacy Policy for The Formula Forum mobile application operated by Triumph Box and Ryde INC.",
  },
  {
    path: "/terms",
    title: "Terms of Service — Formula Forum",
    description: "Terms of Service for the Formula Forum app and website.",
  },

  // Public but deliberately unindexed — prerendered so the noindex directive is in
  // the raw HTML, not only in JavaScript-rendered output.
  {
    path: "/desk",
    title: "Partner Desk | Formula Forum 2026",
    description:
      "Floor reference for partner team access at Formula Forum 2026. Staff only; linked from nowhere.",
    noindex: true,
  },
  {
    path: "/vip",
    title: "Past Attendee Exclusive — Formula Forum 2026",
    description:
      "Exclusive past attendee pricing for Formula Forum 2026. Agency Owner $448 (reg. $897), Team Member $298 (reg. $597).",
    noindex: true,
  },
  {
    path: "/payment-success",
    title: "Checkout Next Steps - Formula Forum 2026",
    description:
      "Formula Forum 2026 checkout return page with registration support and event details.",
    noindex: true,
  },
  {
    path: "/thank-you",
    title: "Checkout Next Steps | Formula Forum 2026",
    description: "Formula Forum 2026 checkout return page with attendee setup links and registration support.",
    noindex: true,
  },
  {
    path: "/ga-setup",
    title: "GA4 Setup | Formula Forum",
    description: "GA4 configuration page",
    noindex: true,
  },
  // Keep these two in sync with the <SEO> props on their pages. Without an
  // entry here a page is not prerendered, and link-preview bots (which do not
  // run JavaScript) get the homepage's title and description instead.
  {
    path: "/formula-app-guide",
    title: "The Formula App | Built in the Room, Run Through Q1 2027",
    description:
      "After Formula Forum, the app turns your workbook pages into AI-built session plans, assembles your 2027 Map, and runs a 30, 60 or 90-day Progress plan with weekly check-ins and an accountability partner.",
  },
  {
    path: "/partners/partner-hub-guide",
    title: "Create Your Formula Forum Partner Hub | Partner Walkthrough",
    description:
      "Build your Formula Forum Partner Hub on your computer or in the Formula App. Step-by-step walkthrough for your logo, banner, company details, video, booking link, and event offer.",
  },
  {
    path: "/ai-portal",
    title: "Formula AI Toolkit | Formula Forum 2026",
    description: "Private replays, guides, and starter files for Formula 2026 attendees.",
    noindex: true,
  },
  { path: "/admin/auth", title: "Admin | Formula Forum", description: "Administrative access.", noindex: true },
  { path: "/admin/set-password", title: "Set Password | Formula Admin", description: "Administrative access.", noindex: true },
  { path: "/admin/registrations", title: "Admin | Formula Forum", description: "Administrative access.", noindex: true },
  { path: "/admin/sales", title: "Admin | Formula Forum", description: "Administrative access.", noindex: true },
  { path: "/admin/ai-portal", title: "AI Portal | Formula Admin", description: "Administrative access.", noindex: true },
  { path: "/admin/survey-results", title: "Survey Results | Formula Admin", description: "Administrative access.", noindex: true },
];

export const SEO_ROUTES: SeoRoute[] = [
  ...SITE_ROUTES,
  ...RESOURCE_ROUTES,
  ...TESTIMONIAL_ROUTES,
].map((route) => ({ ...route, ogImage: route.ogImage ?? ogImageFor(route.path) }));
