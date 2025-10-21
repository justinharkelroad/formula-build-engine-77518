import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, MapPin, Mail, Phone } from "lucide-react";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { CONFIG } from "@/config/event";
import { formatEventDates } from "@/lib/dateUtils";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Payment Successful - F³ Formula Forum 2025"
        description="Thank you for registering for F³ Formula Forum 2025. Your payment has been processed successfully."
      />
      <Navigation />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Payment Successful!
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Congratulations! You've successfully registered for the F³ Formula Forum 2025.
            </p>

            {sessionId && (
              <div className="bg-card border rounded-lg p-4 mb-8 text-sm text-muted-foreground">
                <strong>Transaction ID:</strong> {sessionId}
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
              <h3 className="text-lg font-semibold mb-2">What's Next?</h3>
              <ul className="text-left space-y-2 text-sm">
                <li>✅ You'll receive a confirmation email shortly</li>
                <li>✅ Detailed event information will be sent 2 weeks before</li>
                <li>✅ Don't forget to book your discounted hotel rate</li>
                <li>✅ Follow up communications will include venue details and schedule</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="default" size="lg">
                <a href="/" className="w-full sm:w-auto">
                  Return to Home
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a 
                  href="https://book.passkey.com/go/FloridaFormulaForumATTENDEE" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  Book Hotel Room
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;