import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { PRICING } from "@/config/pricing";
import { ACCESS_PASS_BENEFITS } from "@/config/benefits";
import { Check } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import StructuredData from "@/components/StructuredData";
import { Link } from "react-router-dom";

const Pricing = () => {
  const title = "Pricing — F³ Formula Forum 2026";
  const description = "Pass options for the Formula Forum insurance agency growth event. Oct 14–16, 2026 • JW Marriott Orlando Bonnet Creek.";
  const { agencyOwner, team } = PRICING.earlyBird;

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} path="/pricing" />
      <StructuredData page="pricing" />
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Pricing</h1>
          <h2 className="text-xl text-muted-foreground">Choose your pass</h2>
          <div className="mt-6">
            <CountdownTimer
              fallbackDeadline="2026-03-31T23:59:59"
              label="Price increases after March 31 — lock in your rate:"
              className="text-center"
            />
          </div>
        </header>

        <section className="max-w-4xl mx-auto space-y-8">
          <article className="text-center space-y-4">
            <p data-speakable="true">
              Formula Forum 2026 offers two pass tiers: the Agency Owner Pass at ${agencyOwner.price} for agency owners and senior producers, and the Team Member Pass at ${team.price} for team members and junior producers. Both passes include access to all sessions, the printed Book of Formulas playbook, networking events, meals, and enrollment in the 90-Day Scale-Up Challenge. Limited to 250 attendees.
            </p>
          </article>

          <section aria-labelledby="benefits-heading" className="space-y-4">
            <h3 id="benefits-heading" className="text-lg font-semibold text-center">Access Pass Benefits</h3>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ACCESS_PASS_BENEFITS.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 bg-card border border-border rounded-md px-3 py-2">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-sm text-foreground">{b}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl blur-2xl opacity-30" aria-hidden="true"></div>
                   <img
                     src="/lovable-uploads/13190d3e-be9d-4836-9991-e7cee56f7509.png"
                     alt="F³ Formula Forum 2026 Book of Formulas Playbook — comprehensive guide for insurance agency growth"
                     className="relative z-10 max-w-sm w-full h-auto rounded-2xl shadow-2xl"
                     loading="lazy"
                     width="400"
                     height="600"
                   />
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Button asChild variant="cta" size="lg" className="min-h-16 text-xl md:text-2xl px-8 md:px-12 py-6">
              <a href={agencyOwner.url} target="_blank" rel="noopener noreferrer" aria-label={`Buy Agency Owner pass for $${agencyOwner.price}`}>
                <span className="inline-flex items-center gap-2">
                  <span>Buy Now — {agencyOwner.name}</span>
                  <span className="relative inline-block text-muted-foreground">
                    <span className="line-through opacity-80">${agencyOwner.fullPrice}</span>
                    <span className="absolute inset-0 border-t border-destructive rotate-[-12deg] top-1/2 animate-fade-in" aria-hidden="true"></span>
                  </span>
                  <span className="font-semibold">${agencyOwner.price}</span>
                </span>
              </a>
            </Button>

            <Button asChild variant="secondary" size="lg" className="min-h-16 text-xl md:text-2xl px-8 md:px-12 py-6">
              <a href={team.url} target="_blank" rel="noopener noreferrer" aria-label={`Buy Team Member pass for $${team.price}`}>
                <span className="inline-flex items-center gap-2">
                  <span>Buy Now — {team.name}</span>
                  <span className="relative inline-block text-muted-foreground">
                    <span className="line-through opacity-80">${team.fullPrice}</span>
                    <span className="absolute inset-0 border-t border-destructive rotate-[-12deg] top-1/2 animate-fade-in" aria-hidden="true"></span>
                  </span>
                  <span className="font-semibold">${team.price}</span>
                </span>
              </a>
            </Button>
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-6 mt-8 mb-8">
            <h3 className="text-lg font-semibold mb-4">Refund & Transfer Policy</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• <strong>No refunds:</strong> All sales are final</p>
              <p>• <strong>Transfers allowed:</strong> You can transfer your ticket to another person up to 7 days before the event</p>
              <p>• <strong>Room block:</strong> Discounted hotel rates available - link provided after purchase</p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              <Link to="/venue#room-block" className="text-primary underline">Room block available at JW Marriott Orlando Bonnet Creek</Link>
            </p>
          </div>
        </section>
      </main>
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default Pricing;
