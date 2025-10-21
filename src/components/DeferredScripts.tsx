import { useEffect } from 'react';
import HeatmapScript from './HeatmapScript';

const DeferredScripts = () => {
  useEffect(() => {
    // Defer non-critical scripts
    const loadNonCriticalScripts = () => {
      // Load any additional analytics or tracking scripts here
      // This ensures they don't block initial render or affect CLS
    };

    // Load after initial render
    const timer = setTimeout(loadNonCriticalScripts, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return <HeatmapScript />;
};

export default DeferredScripts;