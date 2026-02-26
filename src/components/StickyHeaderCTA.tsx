import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const StickyHeaderCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 100px
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't show on survey or vip page
  if (location.pathname === "/survey" || location.pathname === "/vip") return null;

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur border-b border-border p-3 z-40 h-[60px]">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <Button asChild variant="cta" size="sm">
            <a href="/pricing" aria-label="View pricing">
              Register now
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyHeaderCTA;
