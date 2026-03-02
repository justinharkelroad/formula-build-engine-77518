import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRight } from "lucide-react";
import { PRICING, type PricingTier } from "@/config/pricing";
import { trackBeginCheckout, trackCTAClick } from '@/hooks/useAnalytics';

const DEADLINE = new Date("2026-03-31T23:59:59").getTime();

const PriceCountdown = () => {
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = DEADLINE - Date.now();
      if (diff <= 0) { setT({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setT({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-orange-500 rounded-lg px-4 py-3 text-white text-center">
      <p className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-90">
        ⚡ Price increases after March 31
      </p>
      <div className="flex justify-center gap-2">
        {[["Days", t.days], ["Hrs", t.hours], ["Min", t.minutes], ["Sec", t.seconds]].map(([label, val]) => (
          <div key={label as string} className="bg-white/20 rounded px-3 py-1.5 min-w-[48px]">
            <div className="text-lg font-bold leading-none">{String(val).padStart(2, "0")}</div>
            <div className="text-[10px] mt-0.5 opacity-80">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PassTypeDialogProps {
  tier?: PricingTier;
}

const PassTypeDialog = ({ tier = "earlyBird" }: PassTypeDialogProps) => {
  const [open, setOpen] = useState(false);
  const prices = PRICING[tier];

  const handleBuyNow = (passType: "agencyOwner" | "team") => {
    const pass = prices[passType];
    trackBeginCheckout(passType, pass.price);
    trackCTAClick(`checkout_${tier}_${passType}_pass`);
    window.open(pass.url, '_blank');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="cta"
          size="lg"
          className="whitespace-nowrap"
          onClick={() => trackCTAClick('reserve_my_seat')}
        >
          EARLY BIRD PRICING
          <ArrowRight className="ml-2" size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Pass</DialogTitle>
          <DialogDescription>
            Complete checkout securely with Stripe.
          </DialogDescription>
        </DialogHeader>
        <PriceCountdown />
        <div className="flex flex-col gap-4 py-4">
          {/* Agency Owner Pass */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Agency Owner Pass</span>
              <span className="flex items-center gap-2">
                <span className="line-through text-sm opacity-70">${prices.agencyOwner.fullPrice}</span>
                <span className="font-semibold">${prices.agencyOwner.price}</span>
              </span>
            </div>
            <Button
              variant="default"
              size="lg"
              className="w-full"
              onClick={() => handleBuyNow("agencyOwner")}
            >
              Buy Now
            </Button>
          </div>

          {/* Team Member Pass */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Team Member Pass</span>
              <span className="flex items-center gap-2">
                <span className="line-through text-sm opacity-70">${prices.team.fullPrice}</span>
                <span className="font-semibold">${prices.team.price}</span>
              </span>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => handleBuyNow("team")}
            >
              Buy Now
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Secure checkout powered by Stripe
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PassTypeDialog;
