import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";

const Venue = () => {
  const title = "Venue and Travel Information | Formula Forum 2026";
  const description = "JW Marriott Orlando Bonnet Creek venue information for Formula Forum 2026. Address, directions, parking, and travel details.";

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} path="/venue" />
      <StructuredData page="venue" />
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Venue and travel information
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            JW Marriott Orlando Bonnet Creek, 14900 Chelonia Parkway, Orlando, FL 32821
          </p>
        </header>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Speakable venue summary */}
          <p className="text-lg text-muted-foreground" data-speakable="true">
            Formula Forum 2026 takes place at the JW Marriott Orlando Bonnet Creek Resort & Spa, located at 14900 Chelonia Parkway, Orlando, FL 32821. The venue is approximately 21 miles from Orlando International Airport (MCO) and offers a discounted room block at $239 per night for attendees.
          </p>

          {/* Address Block */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Address</h2>
            <p className="text-lg mb-4">
              JW Marriott Orlando Bonnet Creek, 14900 Chelonia Parkway, Orlando, FL 32821
            </p>
            <Button asChild variant="outline">
              <a 
                href="https://www.google.com/maps?q=JW+Marriott+Orlando+Bonnet+Creek"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Google Maps
              </a>
            </Button>
          </section>

          {/* Dates + Schedule */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Event Dates</h2>
            <p className="text-lg">
              Event dates: Oct 14–16, 2026. Registration opens 4:00 p.m. on Wednesday Oct 14.
            </p>
          </section>

          {/* Parking and Logistics */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Parking and On-Site Logistics</h2>
            <ul className="space-y-2 text-lg">
              <li>Parking: self-parking $TBD/day, valet $TBD/day</li>
              <li>WiFi: Available throughout venue (details TBD)</li>
              <li>Registration desk location: TBD</li>
            </ul>
          </section>

          {/* Airport and Transit */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Airport and Transit</h2>
            <p className="text-lg mb-4">
              Airport: Orlando International Airport (MCO). Approx. 21 miles to venue.
            </p>
            <p className="text-lg mb-4">
              Rideshare: pickup/drop-off location at main hotel entrance
            </p>
            <div>
              <h3 className="text-xl font-medium mb-2">Driving Directions</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>From MCO: Take FL-528 W to I-4 W, exit at Bonnet Creek Parkway</li>
                <li>From I-4: Exit 67 for Bonnet Creek Parkway, follow signs to JW Marriott</li>
              </ul>
            </div>
          </section>

          {/* Room Block */}
          <section id="room-block">
            <h2 className="text-2xl font-semibold mb-4">Room block</h2>
            <p className="text-lg mb-4">
              JW Marriott Orlando Bonnet Creek • Group rate: $239/night • Cut-off: Sep 15, 2026
            </p>
            <p className="text-lg mb-4">
              Book online with our group link or call the hotel and mention code <strong>F3-2025</strong>.
            </p>
            <div className="mb-4">
              <Button 
                asChild
                variant="default"
                size="lg"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'room_block_click', {
                      page_location: window.location.href,
                      link_url: 'https://book.passkey.com/event/51189838/owner/49980248/home'
                    });
                  }
                }}
              >
                <a 
                  href="https://book.passkey.com/event/51189838/owner/49980248/home?utm_source=site&utm_medium=roomblock&utm_campaign=f3-2026"
                  rel="nofollow noopener"
                  target="_blank"
                >
                  Book the Formula Forum room block
                </a>
              </Button>
            </div>
            <p className="text-lg">
              Hotel reservations: <a href="tel:+14073905000" className="text-primary underline">+1 (407) 390-5000</a>
            </p>
          </section>

          {/* Map */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Location Map</h2>
            <div className="mb-6 h-[450px]"> {/* Fixed height container to prevent CLS */}
              <iframe
                src="https://www.google.com/maps?q=JW+Marriott+Orlando+Bonnet+Creek&output=embed"
                loading="lazy"
                width="100%"
                height="450"
                style={{ border: 0 }}
                aria-label="Map to JW Marriott Orlando Bonnet Creek"
                className="rounded-lg shadow-sm w-full h-full"
              ></iframe>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Questions?</h2>
            <p className="text-lg">
              Questions: email <a href="mailto:Ashleeb@f3florida.com" className="text-primary underline">Ashleeb@f3florida.com</a>
            </p>
          </section>
        </div>
      </main>
      
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default Venue;
