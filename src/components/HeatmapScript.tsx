import { useEffect } from 'react';

const HeatmapScript = () => {
  useEffect(() => {
    // Defer Microsoft Clarity loading to avoid CLS impact
    const loadClarity = () => {
      // Example Microsoft Clarity script - replace with your actual project ID
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "YOUR_CLARITY_PROJECT_ID");
    };

    // Load after initial render and DOM is ready
    const timer = setTimeout(loadClarity, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
};

export default HeatmapScript;