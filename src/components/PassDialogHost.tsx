import { Dialog, DialogContent, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { X, ArrowRight } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { usePassDialog } from "@/contexts/PassDialogContext";
import { PRICING } from "@/config/pricing";
import { trackBeginCheckout, trackCTAClick } from "@/hooks/useAnalytics";

const PassDialogHost = () => {
  const { isOpen, tier, close } = usePassDialog();
  const prices = PRICING[tier];

  const handleBuyNow = (passType: "agencyOwner" | "team") => {
    const pass = prices[passType];
    trackBeginCheckout(passType, pass.price);
    trackCTAClick(`checkout_${tier}_${passType}_pass`);
    window.open(pass.url, "_blank");
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && close()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/85 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
            w-[92vw] max-w-xl
            bg-black border border-white/15 text-white
            rounded-3xl p-8 md:p-10
            shadow-[0_40px_120px_-20px_rgba(74,144,226,0.45)]
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {/* Close */}
          <DialogPrimitive.Close
            className="absolute top-5 right-5 w-10 h-10 rounded-full border border-white/20
              flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </DialogPrimitive.Close>

          {/* Header */}
          <div className="eyebrow mb-3">CHOOSE YOUR PASS</div>
          <DialogPrimitive.Title className="display-bold text-4xl md:text-5xl mb-2 leading-none">
            FORMULA<br />FORUM 26
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-white/60 text-sm mb-8">
            Complete checkout securely with Stripe. Confirmation is sent instantly.
          </DialogPrimitive.Description>

          {/* Tier pills */}
          <div className="flex items-center gap-2 mb-8">
            <span className={`meta-pill ${tier === "earlyBird" ? "meta-pill-solid" : ""}`}>
              EARLY BIRD
            </span>
            {tier === "vip" && <span className="meta-pill meta-pill-solid">VIP DISCOUNT</span>}
          </div>

          <div className="mb-6 rounded-2xl border border-[hsl(var(--secondary)/0.5)] bg-[hsl(var(--secondary)/0.16)] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--secondary))]">
              Final-Day Attendee Gift
            </div>
            <p className="mt-1 text-sm leading-relaxed text-white/78">
              Attend the final day to unlock the Agency AI Install Walkthrough, starter files, skill library, and secure portal access.
            </p>
          </div>

          {/* Agency Owner */}
          <button
            onClick={() => handleBuyNow("agencyOwner")}
            className="group w-full text-left bg-white text-black rounded-2xl p-6 mb-3
              hover:bg-[hsl(var(--primary))] hover:text-white transition-colors"
          >
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-bold text-lg">Agency Owner Pass</span>
              <span className="flex items-baseline gap-2">
                <span className="line-through text-sm opacity-50">${prices.agencyOwner.fullPrice}</span>
                <span className="display-bold text-3xl">${prices.agencyOwner.price}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-sm opacity-70 group-hover:opacity-100">
              <span>Full access, Book of Formulas, networking</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Team Member */}
          <button
            onClick={() => handleBuyNow("team")}
            className="group w-full text-left brand-block-blue p-6 mb-6
              hover:brightness-110 transition-all"
          >
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-bold text-lg">Team Member Pass</span>
              <span className="flex items-baseline gap-2">
                <span className="line-through text-sm opacity-50">${prices.team.fullPrice}</span>
                <span className="display-bold text-3xl">${prices.team.price}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-sm opacity-90">
              <span>Bring your producer or service lead</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <div className="text-xs tracking-widest uppercase text-white/40 text-center">
            ◆ Secure checkout powered by Stripe
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default PassDialogHost;
