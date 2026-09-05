import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CircleHelp, Calendar, MapPin, Mail, Phone } from "lucide-react";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { CONFIG } from "@/config/event";
import { formatEventDates } from "@/lib/dateUtils";
import CheckoutVerificationNotice from "@/components/CheckoutVerificationNotice";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <>
      <SEO 
        title="Checkout Next Steps - Formula Forum 2026"
        description="Formula Forum 2026 checkout return page with registration support and event details."
        noindex={true}
      />
      <Navigation />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <CircleHelp className="h-20 w-20 text-primary mx-auto mb-6" />
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your FORMULA 2026 next steps
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Check your registration status below, save the event details, and set up each attendee.
            </p>

            <CheckoutVerificationNotice key={sessionId ?? "no-session"} sessionId={sessionId} />

            {sessionId && (
              <div className="bg-card border rounded-lg p-4 mb-8 text-sm text-muted-foreground">
                <strong>Checkout reference:</strong> {sessionId}
                <span className="block mt-1">Keep this reference if you need support.</span>
              </div>
            )}

            <div className="bg-card border rounded-lg p-6 mb-8 text-left">
              <h2 className="text-2xl font-semibold mb-4 text-center">Event Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{formatEventDates(CONFIG.START_DATETIME_ISO, CONFIG.END_DATETIME_ISO)}</div>
                    <div className="text-sm text-muted-foreground">3 days of intensive training</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{CONFIG.VENUE_NAME}</div>
                    <div className="text-sm text-muted-foreground">{CONFIG.VENUE_STREET}, {CONFIG.CITY}, {CONFIG.STATE} {CONFIG.VENUE_POSTAL}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{CONFIG.ORGANIZER_EMAIL}</div>
                    <div className="text-sm text-muted-foreground">Questions or support</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{CONFIG.ORGANIZER_PHONE}</div>
                    <div className="text-sm text-muted-foreground">Call for immediate assistance</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-2">What to do next</h3>
              <ul className="text-left space-y-2 text-sm">
                <li>Check the inbox and spam folder for the email used at checkout.</li>
                <li>Owners and team members use their named seat email; approved partners use their organization email.</li>
                <li>Contact the FORMULA team with the checkout reference if confirmation is missing.</li>
                <li>Use the setup guide for iPhone, Android and Formula Flow after confirmation.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="default" size="lg">
                <Link to="/" className="w-full sm:w-auto">
                  Return to Home
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/formula-app-guide" className="w-full sm:w-auto">
                  Open setup guide
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
