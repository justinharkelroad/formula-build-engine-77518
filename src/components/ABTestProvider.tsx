import React, { createContext, useContext, useEffect, useState } from 'react';
import { trackEvent } from '@/hooks/useAnalytics';

interface ABTestContextType {
  heroVariant: 'original' | 'alternative';
  countdownVariant: 'hero' | 'pricing';
}

const ABTestContext = createContext<ABTestContextType>({
  heroVariant: 'original',
  countdownVariant: 'hero'
});

export const useABTest = () => useContext(ABTestContext);

interface ABTestProviderProps {
  children: React.ReactNode;
}

export const ABTestProvider: React.FC<ABTestProviderProps> = ({ children }) => {
  const [variants, setVariants] = useState<ABTestContextType>({
    heroVariant: 'original',
    countdownVariant: 'hero'
  });

  useEffect(() => {
    // Check for existing test assignments in localStorage
    const existingHeroVariant = localStorage.getItem('ab_test_hero_variant');
    const existingCountdownVariant = localStorage.getItem('ab_test_countdown_variant');

    let heroVariant: 'original' | 'alternative';
    let countdownVariant: 'hero' | 'pricing';

    if (existingHeroVariant && ['original', 'alternative'].includes(existingHeroVariant)) {
      heroVariant = existingHeroVariant as 'original' | 'alternative';
    } else {
      // Randomly assign 50/50 split
      heroVariant = Math.random() < 0.5 ? 'original' : 'alternative';
      localStorage.setItem('ab_test_hero_variant', heroVariant);
    }

    if (existingCountdownVariant && ['hero', 'pricing'].includes(existingCountdownVariant)) {
      countdownVariant = existingCountdownVariant as 'hero' | 'pricing';
    } else {
      // Randomly assign 50/50 split
      countdownVariant = Math.random() < 0.5 ? 'hero' : 'pricing';
      localStorage.setItem('ab_test_countdown_variant', countdownVariant);
    }

    setVariants({ heroVariant, countdownVariant });

    // Track experiment assignment
    trackEvent('view_item', {
      page_location: window.location.href,
    });
  }, []);

  return (
    <ABTestContext.Provider value={variants}>
      {children}
    </ABTestContext.Provider>
  );
};