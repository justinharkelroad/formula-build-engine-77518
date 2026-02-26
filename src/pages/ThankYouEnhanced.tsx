import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackPurchase } from '@/hooks/useAnalytics';
import { CONFIG } from "@/config/event";
import { formatEventDates } from "@/lib/dateUtils";

const ThankYouEnhanced = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading for user experience
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Fire GA4 purchase event with mock data
    if (sessionId) {
      trackPurchase(sessionId, "customer@example.com", 49900, "agent");
    }

    return () => clearTimeout(timer);
  }, [sessionId]);

  const copyRoomLink = () => {
    const roomLink = "https://book.passkey.com/go/FloridaFormulaForumATTENDEE";
    navigator.clipboard.writeText(roomLink);
    toast({
      title: "Link copied!",
      description: "Room block link copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Processing your registration...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Registration Confirmed | F³ Formula Forum 2026"
        description="Your registration is confirmed for the F³ Formula Forum 2026"
        noindex={true}
      />
      <Navigation />
      
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Header */}
            <div className="mb-8">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-primary mb-4">
                You're In! 🎉
              </h1>
              <p className="text-xl text-muted-foreground">
                Welcome to the F³ Formula Forum 2026 - The Most Anticipated Agency Growth Event of the Year
              </p>
            </div>

            {/* Transaction Details */}
            {sessionId && (
              <div className="bg-muted p-6 rounded-lg mb-8">
                <h3 className="font-semibold mb-2">Transaction Details</h3>
                <p className="text-sm text-muted-foreground">
                  Session ID: {sessionId}
                </p>
              </div>
            )}

            {/* Event Details */}
            <div className="bg-card p-8 rounded-lg border mb-8 text-left">
              <h3 className="text-2xl font-bold mb-6 text-center">Event Details</h3>
              <div className="space-y-4">
                <div>
                  <strong>Date:</strong> {formatEventDates(CONFIG.START_DATETIME_ISO, CONFIG.END_DATETIME_ISO)}
                </div>
                <div>
                  <strong>Location:</strong> {CONFIG.VENUE_NAME}<br />
                  {CONFIG.VENUE_STREET}, {CONFIG.CITY}, {CONFIG.STATE} {CONFIG.VENUE_POSTAL}
                </div>
                <div>
                  <strong>Contact:</strong> Call {CONFIG.ORGANIZER_PHONE} or email {CONFIG.ORGANIZER_EMAIL}
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-gradient-primary text-white p-8 rounded-lg mb-8">
              <h3 className="text-2xl font-bold mb-6">What's Next?</h3>
              <div className="text-left space-y-4">
                <div className="flex items-start">
                  <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div>
                    <strong>Check Your Email:</strong> You'll receive a confirmation email with event details within 5 minutes. If you do not, please reach out to us directly as firewalls can cause delivery.
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div>
                    <strong>Book Your Room:</strong> Secure your spot in our room block (see below) - rates expire September 15th.
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div>
                    <strong>Join the Community:</strong> <a href="https://www.facebook.com/groups/1637602806874362" target="_blank" rel="noopener noreferrer" className="text-white/80 underline">https://www.facebook.com/groups/1637602806874362</a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1">
                    <span className="text-sm font-bold">4</span>
                  </div>
                  <div>
                    <strong>Reach out to us directly</strong> with any questions via <a href="mailto:Ashleeb@f3florida.com" className="text-white/80 underline">Ashleeb@f3florida.com</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Block */}
            <div className="bg-muted p-6 rounded-lg mb-8">
              <h3 className="text-xl font-bold mb-4">🏨 Book Your Room</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={copyRoomLink} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Room Link
                </Button>
                <Button asChild>
                  <a 
                    href="https://book.passkey.com/go/FloridaFormulaForumATTENDEE" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Book Room Now →
                  </a>
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThankYouEnhanced;