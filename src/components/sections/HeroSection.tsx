import { Button } from "@/components/ui/button";
import HeroVideo from "@/components/HeroVideo";
import CountdownTimer from "@/components/CountdownTimer";

const AGENT_URL = "https://buy.stripe.com/dRmdR94VZ0ku7UY1io3wQ00";
const TEAM_URL = "https://buy.stripe.com/5kQ3cv3RV5EOgrue5a3wQ01";
const COUPON_CODE = "F3100OFF"; // Update if the coupon changes

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* background moved to page wrapper */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid md:grid-cols-2 items-center gap-8 md:gap-12 py-14 md:py-24">
          <header className="max-w-3xl text-left text-lg">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Insurance Agency Growth Conference in Orlando. Oct 15–17, 2025.
            </h1>

            <p className="text-xl md:text-2xl text-foreground/90 mb-6 leading-relaxed">
              Build a 90-day growth blueprint in 48 hours.
            </p>

            <div className="mb-8">
              <CountdownTimer 
                autoReset={true}
                className="text-left"
              />
            </div>

            <ul className="list-disc pl-6 space-y-2 mb-8">
              <li>Double your cross-sell rate</li>
              <li>Lift retention with a 3-step renewal play</li>
              <li>Hire, comp, and coach a 2-sales-per-day rep</li>
            </ul>

            <p className="mb-8">
              <a href="#agenda" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold underline underline-offset-4">
                See agenda ↓
              </a>
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button asChild variant="cta" size="lg" className="min-h-11">
                <a href="/register" aria-label="Register now">
                  Register now
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg" className="min-h-11">
                <a href="/#agenda" aria-label="See agenda">
                  See agenda
                </a>
              </Button>
            </div>

            <p className="mt-3">
              <a href="/contact" className="underline underline-offset-4">
                Questions? Talk to us
              </a>
            </p>

            <div className="mt-4 space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-90" aria-hidden="true">
                  <path d="M12 2l3 7h7l-5.5 4 2.5 7-7-4.5L5.5 20l2.5-7L2 9h7l3-7z"></path>
                </svg>
                <span>Save $100 with code {COUPON_CODE}</span>
              </span>
              <p className="text-sm text-muted-foreground">
                Hosted at JW Marriott Orlando Bonnet Creek • Oct 15–17, 2025 • <a href="/#venue-geo" className="text-primary underline">Room block available</a> • Ticket transfers allowed up to 7 days pre-event
              </p>
            </div>
          </header>

          <aside className="w-full">
            <HeroVideo wistiaId="y8elofri75" title="Formula Forum overview video" />
            <p className="text-2xl md:text-3xl text-foreground/90 mt-4">
              Struggling to scale your agency team? This event shows you how.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
