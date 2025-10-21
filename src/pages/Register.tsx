import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import PassTypeDialog from "@/components/PassTypeDialog";
import CountdownTimer from "@/components/CountdownTimer";

const AGENT_URL = "https://buy.stripe.com/dRmdR94VZ0ku7UY1io3wQ00";
const TEAM_URL = "https://buy.stripe.com/5kQ3cv3RV5EOgrue5a3wQ01";
const COUPON_CODE = "F3100OFF";

const Register = () => {
  const [searchParams] = useSearchParams();
  const canceled = searchParams.get("canceled");
  
  const title = "Register | Formula Forum 2025 | Insurance Agency Growth Conference";
  const description = "Register for Formula Forum 2025 in Orlando. Agent and Team Member passes available. Save $100 with code F3100OFF.";

  useEffect(() => {
    // Fire GA4 begin_checkout event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: 849,
        items: [
          {
            item_id: 'formula-forum-2025',
            item_name: 'Formula Forum 2025 Pass',
            category: 'Conference',
            price: 849,
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
            Register for Formula Forum 2025
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/90 mb-6">
            Insurance Agency Growth Conference in Orlando. Oct 15–17, 2025.
          </p>

          {canceled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                Your checkout was canceled. No payment was processed. You can try again below.
              </p>
            </div>
          )}

          <div className="mb-8">
            <CountdownTimer 
              autoReset={true}
              className="text-center"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Agent Pass</h2>
              <div className="text-3xl font-bold mb-4">
                <span className="line-through text-muted-foreground text-xl">$949</span>
                <span className="ml-2">$849</span>
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
                <span className="line-through text-muted-foreground text-xl">$649</span>
                <span className="ml-2">$549</span>
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
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-lg font-semibold mb-2">Save $100 with code:</p>
                <code className="bg-background px-3 py-1 rounded border text-lg font-mono">
                  {COUPON_CODE}
                </code>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Policy:</p>
                <div className="text-xs text-muted-foreground">
                  <p>• No refunds, transfers allowed up to 7 days before event</p>
                  <p>• Hotel room block link provided after purchase</p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-muted-foreground">
            Questions? <a href="/contact" className="underline underline-offset-4 hover:text-foreground">Contact us</a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;