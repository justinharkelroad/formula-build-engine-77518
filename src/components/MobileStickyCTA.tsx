import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/config/pricing";

const MobileStickyCTA = () => {
  const location = useLocation();

  // Don't show on contact or vip page
  if (location.pathname === '/contact' || location.pathname === '/vip') return null;

  const { agencyOwner, team } = PRICING.earlyBird;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur border-t border-border p-3 md:hidden z-50">
      <div className="container mx-auto px-0">
        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="cta" size="lg" className="w-full">
            <a href={agencyOwner.url} target="_blank" rel="noopener noreferrer" aria-label={`Register Agency Owner pass for $${agencyOwner.price}`}>
              <span className="inline-flex items-center gap-2">
                <span className="line-through text-xs opacity-70">${agencyOwner.fullPrice}</span>
                <span>Owner — ${agencyOwner.price}</span>
              </span>
            </a>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full">
            <a href={team.url} target="_blank" rel="noopener noreferrer" aria-label={`Register Team Member pass for $${team.price}`}>
              <span>Team — ${team.price}</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileStickyCTA;
