import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import PassTypeDialog from "@/components/PassTypeDialog";
import { PRICING } from "@/config/pricing";

const Register = () => {
  const [searchParams] = useSearchParams();
  const canceled = searchParams.get("canceled");
  
  const title = "Register | Formula Forum 2026 | Insurance Agency Growth Conference";
  const description = "Register for Formula Forum 2026 in Orlando. Agency Owner passes are $697 and Team Member passes are $397.";

  useEffect(() => {
    // Fire GA4 begin_checkout event
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "begin_checkout", {
        currency: 'USD',
        value: PRICING.earlyBird.agencyOwner.price,
        items: [
          {
            item_id: 'formula-forum-2026',
            item_name: 'Formula Forum 2026 Pass',
            category: 'Conference',
            price: PRICING.earlyBird.agencyOwner.price,
            quantity: 1,
          }
        ]
      });
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} path="/register" />
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Register for Formula Forum 2026
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/90 mb-6">
            Insurance Agency Growth Conference in Orlando. Oct 14–16, 2026.
          </p>

          {canceled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                Your checkout was canceled. No payment was processed. You can try again below.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Agent Pass</h2>
              <div className="text-3xl font-bold mb-4">
                <span className="line-through text-muted-foreground text-xl">
                  ${PRICING.earlyBird.agencyOwner.fullPrice}
                </span>
                <span className="ml-2">${PRICING.earlyBird.agencyOwner.price}</span>
              </div>
              <p className="text-muted-foreground mb-6">
                For agency owners and senior producers
              </p>
              <div className="text-xs text-muted-foreground mb-4">
                Includes all fees and taxes. Secure checkout with Apple Pay & Google Pay.
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Team Member Pass</h2>
              <div className="text-3xl font-bold mb-4">
                <span className="line-through text-muted-foreground text-xl">
                  ${PRICING.earlyBird.team.fullPrice}
                </span>
                <span className="ml-2">${PRICING.earlyBird.team.price}</span>
              </div>
              <p className="text-muted-foreground mb-6">
                For team members and junior producers
              </p>
              <div className="text-xs text-muted-foreground mb-4">
                Includes all fees and taxes. Secure checkout with Apple Pay & Google Pay.
              </div>
            </div>
          </div>

          <div className="mb-8">
            <PassTypeDialog />
          </div>
          
          <div className="bg-muted/50 border border-border rounded-lg p-6 mb-8">
            <p className="text-sm font-semibold mb-2">Policy:</p>
            <div className="text-xs text-muted-foreground">
              <p>• No refunds, transfers allowed up to 7 days before event</p>
              <p>• Hotel room block link provided after purchase</p>
            </div>
          </div>
          
          <p className="text-muted-foreground">
            Questions? <Link to="/contact" className="underline underline-offset-4 hover:text-foreground">Contact us</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
