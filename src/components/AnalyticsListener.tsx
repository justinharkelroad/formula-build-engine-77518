import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageView } from '@/hooks/useAnalytics';

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

const AnalyticsListener = () => {
  const location = useLocation();
  
  // Track GA4 page views
  usePageView(location.pathname);
  
  return null;
};

export default AnalyticsListener;