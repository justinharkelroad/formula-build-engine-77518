import { ANALYTICS_CONFIG } from '../config/analytics';

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

export const trackFBEvent = (eventName: string, parameters: any = {}) => {
  if (!ANALYTICS_CONFIG.ENABLED || typeof window === 'undefined' || !window.fbq) {
    console.log(`[Facebook Pixel] ${eventName}:`, parameters);
    return;
  }

  window.fbq('track', eventName, parameters);
};

export const trackFBPageView = () => {
  trackFBEvent('PageView');
};

export const trackFBInitiateCheckout = (value: number, currency: string = 'USD') => {
  trackFBEvent('InitiateCheckout', {
    value: value,
    currency: currency
  });
};

export const trackFBPurchase = (value: number, currency: string = 'USD') => {
  trackFBEvent('Purchase', {
    value: value,
    currency: currency
  });
};

export const trackFBLead = () => {
  trackFBEvent('Lead');
};