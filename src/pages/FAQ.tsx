import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import FAQAccordion from "@/components/sections/FAQAccordion";

const FAQ = () => {
  const title = "FAQ | Formula Forum 2026 — Tickets, Hotel, Refunds & More";
  const description = "Frequently asked questions about Formula Forum 2026: refund policy, hotel room block at JW Marriott ($239/night), group discounts, dress code, and what's included.";

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} path="/faq" />
      <StructuredData page="faq" />
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">FAQ</h1>
          <h2 className="text-xl text-muted-foreground">Everything you need to know</h2>
        </header>
        <FAQAccordion />
        
        <div className="bg-muted/50 border border-border rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Refund & Transfer Policy</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>No refunds:</strong> All sales are final</p>
            <p>• <strong>Transfers allowed:</strong> You can transfer your ticket to another person up to 7 days before the event</p>
            <p>• <strong>Room block:</strong> Discounted hotel rates at JW Marriott Orlando Bonnet Creek - <Link to="/venue#room-block" className="text-primary underline">use our room block link</Link> or call with code F3-2026. Cut-off Sep 15, 2026.</p>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Button asChild size="lg">
            <Link to="/contact">Still have questions?</Link>
          </Button>
        </div>
      </main>
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default FAQ;
