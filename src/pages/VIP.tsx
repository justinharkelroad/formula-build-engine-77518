import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { PRICING } from "@/config/pricing";
import { ACCESS_PASS_BENEFITS } from "@/config/benefits";
import { Check, Star } from "lucide-react";
import { trackBeginCheckout, trackCTAClick } from "@/hooks/useAnalytics";

const VIP = () => {
  const title = "Past Attendee Exclusive — F³ Formula Forum 2026";
  const description = "Exclusive past attendee pricing for Formula Forum 2026. Agency Owner $448, Team Member $298.";

  const { agencyOwner, team } = PRICING.vip;

  const handleBuyNow = (passType: "agencyOwner" | "team") => {
    const pass = passType === "agencyOwner" ? agencyOwner : team;
    trackBeginCheckout(passType, pass.price);
    trackCTAClick(`vip_checkout_${passType}_pass`);
    window.open(pass.url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} path="/vip" noindex={true} />
      <main className="container mx-auto px-4 py-12">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Star className="h-4 w-4" />
            Past Attendee Exclusive
          </div>
          <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            As a past Formula Forum attendee, you get our deepest discount — locked in just for you.
          </p>
        </header>

        <section className="max-w-3xl mx-auto space-y-6">
          {/* Agency Owner Card */}
          <div className="border border-primary/30 rounded-2xl p-6 bg-card/80 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{agencyOwner.name} Pass</h2>
                <p className="text-muted-foreground mt-1">For agency owners and senior producers</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="line-through text-lg text-muted-foreground">${agencyOwner.fullPrice}</span>
                  <span className="text-3xl font-bold text-primary">${agencyOwner.price}</span>
                </div>
                <p className="text-sm text-primary font-medium mt-1">You save ${agencyOwner.fullPrice - agencyOwner.price}</p>
              </div>
              <Button
                variant="cta"
                size="lg"
                className="min-w-[160px]"
                onClick={() => handleBuyNow("agencyOwner")}
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Team Member Card */}
          <div className="border border-border rounded-2xl p-6 bg-card/80 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{team.name} Pass</h2>
                <p className="text-muted-foreground mt-1">For team members and junior producers</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="line-through text-lg text-muted-foreground">${team.fullPrice}</span>
                  <span className="text-3xl font-bold">${team.price}</span>
                </div>
                <p className="text-sm text-primary font-medium mt-1">You save ${team.fullPrice - team.price}</p>
              </div>
              <Button
                variant="secondary"
                size="lg"
                className="min-w-[160px]"
                onClick={() => handleBuyNow("team")}
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Benefits */}
          <section aria-labelledby="vip-benefits-heading" className="space-y-4 pt-4">
            <h3 id="vip-benefits-heading" className="text-lg font-semibold text-center">Both Passes Include</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACCESS_PASS_BENEFITS.map((b, i) => (
                <li key={i} className="flex items-start gap-2 bg-card border border-border rounded-md px-3 py-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <span className="text-sm text-foreground">{b}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Refund Policy */}
          <div className="bg-muted/50 border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Refund & Transfer Policy</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>No refunds:</strong> All sales are final</p>
              <p><strong>Transfers allowed:</strong> You can transfer your ticket to another person up to 7 days before the event</p>
              <p><strong>Room block:</strong> Discounted hotel rates available - link provided after purchase</p>
            </div>
          </div>

          {/* Hotel Room Block */}
          <div className="text-center pt-2">
            <Button asChild variant="cta" size="lg" className="text-lg">
              <a href="https://book.passkey.com/go/FFF2026" target="_blank" rel="noopener noreferrer">
                Secure Your Discounted Room Before They Sell Out!
              </a>
            </Button>
          </div>
        </section>
      </main>
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default VIP;
