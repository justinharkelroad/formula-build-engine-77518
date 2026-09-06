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
          REGISTER NOW
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
