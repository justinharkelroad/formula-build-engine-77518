import { ANALYTICS_CONFIG } from "@/config/analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export type ResourceEvent =
  | "resource_category_selected"
  | "partner_card_viewed"
  | "partner_company_clicked"
  | "formula_resource_clicked";

export interface ResourceEventProps {
  /** Which workbook session page fired the event, e.g. "sales-sequence" */
  session: string;
  category?: string;
  partner?: string;
  resourceType?: string;
  source?: string;
}

/**
 * Resource-page event helper.
 *
 * The site already loads GA4 through GA4Script.tsx, so events go to gtag when
 * it is present and fall back to a raw dataLayer push otherwise. No vendor is
 * added, and the helper no-ops silently when neither exists (SSR/prerender).
 */
export const trackResourceEvent = (
  event: ResourceEvent,
  props: ResourceEventProps
): void => {
  if (!ANALYTICS_CONFIG.ENABLED || typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", event, props);
    return;
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event, ...props });
  }
};
