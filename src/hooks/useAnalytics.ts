import { useEffect } from 'react';
import { ANALYTICS_CONFIG, GAEvent, GAEventParams } from '../config/analytics';
import { trackFBEvent, trackFBPageView, trackFBInitiateCheckout, trackFBPurchase } from './useFacebookPixel';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const usePageView = (path: string) => {
  useEffect(() => {
    if (!ANALYTICS_CONFIG.ENABLED) return;
    
    trackEvent('view_item', {
      page_location: window.location.href
    });
    trackFBPageView();
  }, [path]);
};

export const trackEvent = (eventName: GAEvent, params: GAEventParams = {}) => {
  if (!ANALYTICS_CONFIG.ENABLED || typeof window === 'undefined' || !window.gtag) {
    console.log(`[Analytics] ${eventName}:`, params);
    return;
  }

  window.gtag('event', eventName, params);
};

export const trackCTAClick = (linkUrl: string) => {
  trackEvent('cta_click', {
    page_location: window.location.href,
    link_url: linkUrl
  });
};

export const trackFAQExpand = (question: string) => {
  trackEvent('faq_expand', {
    page_location: window.location.href
  });
};

export const trackBeginCheckout = (passType: string, value: number) => {
  trackEvent('begin_checkout', {
    currency: 'USD',
    value: value,
    items: [{
      item_id: passType,
      item_name: `${passType} Pass`,
      currency: 'USD',
      price: value,
      quantity: 1
    }]
  });
  trackFBInitiateCheckout(value);
};

export const trackPurchase = (sessionId: string, email: string, amount: number, passType: string) => {
  trackEvent('purchase', {
    currency: 'USD',
    value: amount / 100, // Convert cents to dollars
    items: [{
      item_id: passType,
      item_name: `${passType} Pass`,
      currency: 'USD',
      price: amount / 100,
      quantity: 1
    }]
  });
  trackFBPurchase(amount / 100);
};