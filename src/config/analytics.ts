export const ANALYTICS_CONFIG = {
  GA4_MEASUREMENT_ID: "G-THCBG6D7ZM",
  FACEBOOK_PIXEL_ID: "669306169532672",
  ENABLED: true,
};

// GA4 Event Types
export type GAEvent = 
  | 'view_item'
  | 'cta_click'
  | 'begin_checkout'
  | 'purchase'
  | 'faq_expand';

export interface GAEventParams {
  page_location?: string;
  link_url?: string;
  currency?: string;
  value?: number;
  items?: Array<{
    item_id: string;
    item_name: string;
    currency: string;
    price: number;
    quantity: number;
  }>;
}