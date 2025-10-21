import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MobileStickyCTA = () => {
  const location = useLocation();
  
  // Don't show on contact page
  if (location.pathname === '/contact') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur border-t border-border p-3 md:hidden z-50">
      <div className="container mx-auto px-0">
        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="cta" size="lg" className="w-full">
            <a href="https://buy.stripe.com/dRmdR94VZ0ku7UY1io3wQ00" aria-label="Register Agent pass for $849">
              <span className="inline-flex items-center gap-2">
                <span className="line-through text-xs opacity-70">$949</span>
                <span>Agent — $849</span>
              </span>
            </a>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full">
            <a href="https://buy.stripe.com/5kQ3cv3RV5EOgrue5a3wQ01" aria-label="Register Team Member pass for $549">
              <span>Team — $549</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileStickyCTA;
