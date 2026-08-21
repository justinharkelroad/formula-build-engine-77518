import { useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Download, Hotel, Users } from "lucide-react";
import { CONFIG } from "@/config/event";
import { formatEventDates } from "@/lib/dateUtils";

const IOS_APP_URL = "https://apps.apple.com/us/app/formula-forum/id6759879318";
const FACEBOOK_GROUP_URL = "https://www.facebook.com/groups/1637602806874362";

const ThankYouEnhanced = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <>
      <SEO
        title="Registration Confirmed | Formula Forum 2026"
        description="Your registration is confirmed for the Formula Forum 2026"
        noindex={true}
      />
      <Navigation />

      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-primary mb-4">You are in.</h1>
              <p className="text-xl text-muted-foreground">
                Your payment and FORMULA 2026 registration are confirmed.
              </p>
            </div>

            <section className="bg-card p-8 rounded-lg border mb-8 text-left">
              <h2 className="text-2xl font-bold mb-6 text-center">Save these event details</h2>
              <div className="space-y-4">
                <p>
                  <strong>Date:</strong>{" "}
                  {formatEventDates(CONFIG.START_DATETIME_ISO, CONFIG.END_DATETIME_ISO)}
                </p>
                <p>
                  <strong>Location:</strong> {CONFIG.VENUE_NAME}<br />
                  {CONFIG.VENUE_STREET}, {CONFIG.CITY}, {CONFIG.STATE} {CONFIG.VENUE_POSTAL}
                </p>
                <p>
                  <strong>Questions:</strong>{" "}
                  <a className="text-primary underline" href={`mailto:${CONFIG.ORGANIZER_EMAIL}`}>
                    {CONFIG.ORGANIZER_EMAIL}
                  </a>
                  {" "}or {CONFIG.ORGANIZER_PHONE}
                </p>
              </div>
              {sessionId && (
                <p className="mt-6 pt-4 border-t text-xs text-muted-foreground break-all">
                  Registration reference: {sessionId}
                </p>
              )}
            </section>

            <section className="bg-gradient-primary text-white p-8 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-3">Everything you need is here.</h2>
              <p className="mb-6 text-white/90">
                We are also emailing these links to the address used at checkout. You can use
                this page immediately if the email is delayed or filtered.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button asChild variant="secondary" className="h-auto py-3">
                  <a href={CONFIG.HOTEL_BOOK_URL} target="_blank" rel="noopener noreferrer">
                    <Hotel className="w-4 h-4 mr-2" />
                    Reserve your room
                  </a>
                </Button>
                <Button asChild variant="secondary" className="h-auto py-3">
                  <a href={IOS_APP_URL} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    Download the iPhone app
                  </a>
                </Button>
                <Button asChild variant="secondary" className="h-auto py-3 sm:col-span-2">
                  <a href={FACEBOOK_GROUP_URL} target="_blank" rel="noopener noreferrer">
                    <Users className="w-4 h-4 mr-2" />
                    Join the attendee Facebook group
                  </a>
                </Button>
              </div>
            </section>

            <p className="text-sm text-muted-foreground mb-8">
              If your confirmation email does not arrive, contact us. The registration on this
              page remains valid.
            </p>

            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
};

export default ThankYouEnhanced;
