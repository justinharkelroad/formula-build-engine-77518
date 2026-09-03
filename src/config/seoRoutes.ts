import { SALES_SEQUENCE } from "./resources/salesSequence";
import { GROWTH_THROUGH_SERVICE } from "./resources/growthThroughService";
import { OPERATING_SYSTEM } from "./resources/operatingSystem";
import { TRAINING } from "./resources/training";
import { MAKING_IT_RAIN } from "./resources/makingItRain";
import { BODY, BALANCE, BEING } from "./resources/personalSessions";
import { FUNDING_THE_BUILD } from "./resources/fundingTheBuild";
import type { ResourcePageContent } from "./resources/types";
import { TESTIMONIAL_STORIES } from "./testimonialStories";

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
    title: "Formula Forum 2026 | The #1 Insurance Agency Growth Conference | Orlando Oct 14-16",
    description:
      "Formula Forum 2026 is the national insurance agency growth conference. Oct 14-16 at JW Marriott Orlando Bonnet Creek. Operator-led workshops, peer breakouts, and the Book of Formulas playbook.",
  },
  {
    path: "/agenda",
    title: "Event Agenda | Formula Forum 2026 — Three Days of Agency Growth",
    description:
      "Formula Forum 2026 three-day agenda: Oct 14 welcome reception, Oct 15 full conference day with breakouts, Oct 16 implementation and action planning.",
  },
  {
    path: "/pricing",
    title: "Ticket Pricing | Formula Forum 2026 — Agency Owner & Team Passes",
    description:
      "Formula Forum 2026 tickets: Agency Owner Pass $647, Team Member Pass $347. Includes all sessions, Book of Formulas playbook, meals, and networking events.",
  },
  {
    path: "/speakers",
    title: "Speaker Lineup | Formula Forum 2026 — Operators, Builders & Experts",
    description:
      "Meet the 12 speakers at Formula Forum 2026: keynote by Garrett J. White, plus sessions on VA systems, referral marketing, producer scaling, AI, EOS, and agency growth.",
  },
  {
    path: "/format",
    title: "The Format Framework | Formula Forum 2026 — How Sessions Work",
    description:
      "The Format Framework: Formula Forum's proprietary four-step session cycle — speaker training, takeaway capture, peer breakouts, and speaker close. Designed for implementation.",
  },
  {
    path: "/venue",
    title: "Venue | JW Marriott Orlando Bonnet Creek — Formula Forum 2026",
    description:
      "Formula Forum 2026 venue: JW Marriott Orlando Bonnet Creek Resort & Spa, 14900 Chelonia Pkwy, Orlando FL 32821. Room block $239/night, code F3-2026.",
  },
  {
    path: "/survey",
    title: "Formula Forum Survey | Share Your Feedback",
    description:
      "Help us make Formula Forum even better. Share your feedback and insights about the insurance agency growth conference.",
  },
  {
    path: "/partners",
    title: "Partner with Formula Forum 2026 | Platinum, Gold, Silver, Bronze",
    description:
      "Become a 2026 Formula Forum partner. Four tiers from $5,000 to $15,000 — stage time, 1-on-1 podcast interviews, booth placement, attendee lead lists, and mobile-app exposure.",
  },
  {
    path: "/2025partners",
    title: "2025 Partner Podcast Episodes | Formula Forum 2026",
    description:
      "Hear from our 2025 Formula Partners - exclusive podcast episodes featuring RICOCHET, Media Alpha, Disruptur, and more.",
  },
  {
    path: "/gallery",
    title: "Photo Gallery | Formula Forum 2025 Highlights",
    description:
      "Browse photos from Formula Forum 2025: networking events, breakout sessions, speaker presentations, and attendee experiences at JW Marriott Orlando.",
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
      "Frequently asked questions about Formula Forum 2026: refund policy, hotel room block at JW Marriott ($239/night), group discounts, dress code, and what's included.",
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
    path: "/vip",
    title: "Past Attendee Exclusive — Formula Forum 2026",
    description:
      "Exclusive past attendee pricing for Formula Forum 2026. Agency Owner $448 (reg. $897), Team Member $298 (reg. $597).",
    noindex: true,
  },
  {
    path: "/payment-success",
    title: "Payment Successful - Formula Forum 2026",
    description:
      "Thank you for registering for Formula Forum 2026. Your payment has been processed successfully.",
    noindex: true,
  },
  {
    path: "/thank-you",
    title: "Registration Confirmed | Formula Forum 2026",
    description: "Your registration is confirmed for the Formula Forum 2026",
    noindex: true,
  },
  {
    path: "/ga-setup",
    title: "GA4 Setup | Formula Forum",
    description: "GA4 configuration page",
    noindex: true,
  },
  { path: "/admin/auth", title: "Admin | Formula Forum", description: "Administrative access.", noindex: true },
  { path: "/admin/registrations", title: "Admin | Formula Forum", description: "Administrative access.", noindex: true },
  { path: "/admin/sales", title: "Admin | Formula Forum", description: "Administrative access.", noindex: true },
];

export const SEO_ROUTES: SeoRoute[] = [
  ...SITE_ROUTES,
  ...RESOURCE_ROUTES,
  ...TESTIMONIAL_ROUTES,
];
