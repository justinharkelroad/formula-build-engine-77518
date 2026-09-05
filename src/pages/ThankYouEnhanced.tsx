import { useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CircleHelp, ArrowLeft, Download, Hotel, Users, Monitor, BookOpen } from "lucide-react";
import { CONFIG } from "@/config/event";
import { formatEventDates } from "@/lib/dateUtils";
import CheckoutVerificationNotice from "@/components/CheckoutVerificationNotice";

const IOS_APP_URL = "https://apps.apple.com/us/app/formula-forum/id6759879318";
const ANDROID_APP_URL = "https://play.google.com/store/apps/details?id=com.triumphboxandryde.formulaforum";
const FORMULA_FLOW_URL = "https://flow.theformulaforum.com/";
const FACEBOOK_GROUP_URL = "https://www.facebook.com/groups/1637602806874362";

const ThankYouEnhanced = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <>
      <SEO
        title="Checkout Next Steps | Formula Forum 2026"
        description="Formula Forum 2026 checkout return page with attendee setup links and registration support."
        noindex={true}
      />
      <Navigation />

      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <CircleHelp className="h-20 w-20 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-primary mb-4">Your FORMULA 2026 next steps.</h1>
              <p className="text-xl text-muted-foreground">
                Check your registration status, save the event details, and complete attendee setup.
              </p>
            </div>

            <CheckoutVerificationNotice key={sessionId ?? "no-session"} sessionId={sessionId} />

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
                  Checkout reference: {sessionId}<br />
                  Keep this reference if you need support.
                </p>
              )}
            </section>

            <section className="bg-gradient-primary text-white p-8 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-3">Set up each named attendee.</h2>
              <p className="mb-6 text-white/90">
                Owners and team members use the email assigned to their named attendee seat.
                Approved partner owners and staff use the email connected to their approved partner
                organization. Everyone uses their own account and signs in to Formula Flow with the
                same Formula credentials. Owners and team members complete email verification before
                a first ticket claim.
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
                <Button asChild variant="secondary" className="h-auto py-3">
                  <a href={ANDROID_APP_URL} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    Download the Android app
                  </a>
                </Button>
                <Button asChild variant="secondary" className="h-auto py-3">
                  <Link to="/formula-app-guide">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Follow the app setup guide
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="h-auto py-3">
                  <a href={FORMULA_FLOW_URL} target="_blank" rel="noopener noreferrer">
                    <Monitor className="w-4 h-4 mr-2" />
                    Open Formula Flow
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

            <section className="bg-card p-6 rounded-lg border mb-8 text-left text-sm text-muted-foreground space-y-3">
              <h2 className="text-lg font-bold text-foreground">How plans work</h2>
              <p>After each session, photograph or upload all three completed Formula workbook pages: the assessment and Mirror scores, the written reflection and discussion, and the Domino through declaration.</p>
              <p>Owners, team members and partners each build a private plan in their own account.</p>
              <p>Team members can download or copy business actions to hand to an agency owner. Personal Body, Balance and Being work stays private to the attendee.</p>
              <p>Approved partner owners and staff should also complete the <Link className="text-primary underline" to="/partners/partner-hub-guide">Partner Hub guide</Link> with separate accounts instead of sharing a password.</p>
            </section>

            <p className="text-sm text-muted-foreground mb-8">
              Keep your purchase confirmation email. Contact the FORMULA support team if the status
              above remains pending or attendee names need to be assigned.
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
