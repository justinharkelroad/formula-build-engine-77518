import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRICING, type PassType } from "@/config/pricing";
import { trackBeginCheckout, trackCTAClick } from '@/hooks/useAnalytics';

const PassTypeDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<PassType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agentQuantity, setAgentQuantity] = useState("1");
  const [teamQuantity, setTeamQuantity] = useState("1");

  const handleCheckout = async (passType: PassType) => {
    setLoading(passType);
    setError(null);

    // Track the checkout attempt
    trackBeginCheckout(passType, passType === 'agent' ? 499 : 299);
    trackCTAClick(`checkout_${passType}_pass`);

    const quantity = parseInt(passType === "agent" ? agentQuantity : teamQuantity);

    try {
      const { data, error: supabaseError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: { passType, quantity }
        }
      );

      if (supabaseError) throw supabaseError;

      // If we get a checkout URL, redirect to it
      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      // If fallback is indicated, use Payment Links
      if (data?.fallback) {
        const fallbackUrl = PRICING[passType].url;
        window.open(fallbackUrl, '_blank');
        setOpen(false);
        return;
      }

      throw new Error('No checkout URL received');
    } catch (err: any) {
      console.error('Checkout failed:', err);
      setError('Checkout failed. Redirecting to fallback...');
      
      // Fallback to Payment Links after short delay
      setTimeout(() => {
        const fallbackUrl = PRICING[passType].url;
        window.open(fallbackUrl, '_blank');
        setOpen(false);
        setError(null);
      }, 1500);
    } finally {
      setLoading(null);
    }
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
          Reserve My Seat
          <ArrowRight className="ml-2" size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Pass</DialogTitle>
          <DialogDescription>
            Complete checkout securely with Stripe. Promo codes supported.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {/* Agent Pass */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Agent Pass</span>
              <span className="flex items-center gap-2">
                <span className="line-through text-sm opacity-70">${PRICING.agent.old}</span>
                <span>${PRICING.agent.new}</span>
              </span>
            </div>
            <div className="flex gap-3">
              <Select value={agentQuantity} onValueChange={setAgentQuantity}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="default"
                size="lg"
                className="flex-1"
                onClick={() => handleCheckout("agent")}
                disabled={loading !== null}
              >
                <span>Add to Cart</span>
                {loading === "agent" && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            </div>
          </div>

          {/* Team Member Pass */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Team Member Pass</span>
              <span className="flex items-center gap-2">
                <span className="line-through text-sm opacity-70">${PRICING.team.old}</span>
                <span>${PRICING.team.new}</span>
              </span>
            </div>
            <div className="flex gap-3">
              <Select value={teamQuantity} onValueChange={setTeamQuantity}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => handleCheckout("team")}
                disabled={loading !== null}
              >
                <span>Add to Cart</span>
                {loading === "team" && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="text-sm text-destructive text-center py-2">
            {error}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground text-center">
          Secure checkout powered by Stripe
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PassTypeDialog;