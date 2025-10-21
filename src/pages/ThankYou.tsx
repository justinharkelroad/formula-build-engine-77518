import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { CONFIG } from "@/config/event";
import { formatEventDates } from "@/lib/dateUtils";

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => setIsLoading(false), 1000);
    
    // Fire GA4 purchase event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'purchase', {
        transaction_id: sessionId,
        currency: 'USD',
        value: 849, // This would be dynamic based on actual purchase
      });
    }

    return () => clearTimeout(timer);
  }, [sessionId]);

  const title = "Thank You | Registration Confirmed | Formula Forum 2025";
  const description = "Your registration for Formula Forum 2025 has been confirmed. Thank you for joining us in Orlando.";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Processing your registration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} path="/thank-you" />
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-green-600">
              Registration Confirmed!
            </h1>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Welcome to Formula Forum 2025</h2>
            <p className="text-lg mb-6">
              Thank you for registering! You'll receive a confirmation email shortly with all the details.
            </p>
            
            {sessionId && (
              <div className="text-sm text-muted-foreground mb-6">
                Confirmation ID: <code className="bg-background px-2 py-1 rounded">{sessionId}</code>
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold mb-2">Event Details</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Dates:</strong> {formatEventDates(CONFIG.START_DATETIME_ISO, CONFIG.END_DATETIME_ISO)}<br />
                  <strong>Location:</strong> {CONFIG.VENUE_NAME}<br />
                  <strong>Address:</strong> {CONFIG.VENUE_STREET}, {CONFIG.CITY}, {CONFIG.STATE} {CONFIG.VENUE_POSTAL}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Email:</strong> {CONFIG.ORGANIZER_EMAIL}<br />
                  <strong>Phone:</strong> {CONFIG.ORGANIZER_PHONE}<br />
                  <strong>Questions?</strong> We're here to help!
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/50 border border-border rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">What's Next?</h3>
            <ol className="text-left space-y-3 text-sm">
              <li><strong>1. Check Your Email:</strong> You'll receive a confirmation email with event details within 5 minutes. If you do not, please reach out to us directly as firewalls can cause delivery.</li>
              <li><strong>2. Book Your Room:</strong> Secure your spot in our room block (see below) - rates expire September 15th.</li>
              <li><strong>3. Join the Community:</strong> <a href="https://www.facebook.com/groups/1637602806874362" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://www.facebook.com/groups/1637602806874362</a></li>
              <li><strong>4. Reach out to us directly</strong> with any questions via <a href="mailto:Ashleeb@f3florida.com" className="text-primary underline">Ashleeb@f3florida.com</a></li>
            </ol>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h3 className="text-2xl font-semibold mb-4">Room block</h3>
            <p className="text-lg mb-4">
              Book online with our group link or call the hotel and mention code <strong>F3-2025</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Button 
                asChild
                variant="default"
                size="lg"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'room_block_click', {
                      page_location: window.location.href,
                      link_url: 'https://book.passkey.com/go/FloridaFormulaForumATTENDEE'
                    });
                  }
                }}
              >
                <a 
                  href="https://book.passkey.com/go/FloridaFormulaForumATTENDEE"
                  rel="nofollow noopener"
                  target="_blank"
                >
                  Book the Formula Forum room block
                </a>
              </Button>
              <Button 
                id="copy-room-link" 
                variant="outline" 
                size="lg"
                data-url="https://book.passkey.com/go/FloridaFormulaForumATTENDEE"
                onClick={() => {
                  const url = (document.getElementById('copy-room-link') as HTMLButtonElement)?.dataset.url;
                  if (url) {
                    navigator.clipboard.writeText(url);
                  }
                }}
              >
                Copy room block link
              </Button>
            </div>
            <p className="text-lg">
              Hotel reservations: <a href="tel:+14073905000" className="text-primary underline">+1 (407) 390-5000</a>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default" size="lg">
              <a href="/">Return to Home</a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ThankYou;