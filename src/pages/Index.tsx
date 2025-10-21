import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/sections/HeroSection";
import AgendaAtGlance from "@/components/sections/AgendaAtGlance";
import BenefitsGrid from "@/components/sections/BenefitsGrid";
import WhoShouldAttend from "@/components/sections/WhoShouldAttend";
import EventDetails from "@/components/sections/EventDetails";
import Differentiators from "@/components/sections/Differentiators";
import WhatsIncluded from "@/components/sections/WhatsIncluded";
import PartnerMarquee from "@/components/sections/PartnerMarquee";
import Speakers from "@/components/sections/Speakers";

import PartnerLogos from "@/components/sections/PartnerLogos";
import TrustLine from "@/components/sections/TrustLine";
import RegisterCTA from "@/components/sections/RegisterCTA";
import Urgency from "@/components/sections/Urgency";
import PartnerVideos from "@/components/sections/PartnerVideos";
import FinalCTA from "@/components/sections/FinalCTA";
import DestinyRescuePartnership from "@/components/sections/DestinyRescuePartnership";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { CONFIG } from "@/config/event";

const Index = () => {
  const title = "Formula Forum 2025 | Insurance Agency Growth Conference | Orlando Oct 15–17";
  const description = "Insurance Agency Growth Conference in Orlando. Oct 15–17, 2025 at JW Marriott Bonnet Creek. Workshops, breakouts, and a 90-day growth plan.";
  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} path="/" />
      <StructuredData page="home" />
      <Navigation />
      <Urgency />
      <section className="py-6 bg-background">
        <div className="container mx-auto px-4 text-center">
          <Button asChild variant="cta" size="lg">
            <a href="https://whova.com/portal/J9K1YaVKgfF-4nYwLorEGJ1ecYt4rgNLquD1zUEO@58=/?source=download_page" target="_blank" rel="noopener noreferrer">
              Download Event App
            </a>
          </Button>
        </div>
      </section>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div className="hero-bg absolute inset-0"></div>
          <div className="hero-orb hero-orb-primary animate-float-slower absolute -top-40 -left-32 h-[28rem] w-[28rem]"></div>
          <div className="hero-orb hero-orb-accent animate-float-slow absolute -bottom-40 -right-24 h-[30rem] w-[30rem]"></div>
          <div className="hero-orb hero-orb-secondary animate-float-slower absolute top-1/3 -left-10 h-[22rem] w-[22rem]"></div>
        </div>
        <div className="relative z-10">
          <HeroSection />
          <PartnerMarquee />
          <RegisterCTA />
          <DestinyRescuePartnership />
          <AgendaAtGlance />
          <RegisterCTA />
          <BenefitsGrid />
          <WhoShouldAttend />
          <EventDetails />
        </div>
      </section>
      
      <section id="venue-geo" className="py-16 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Venue</h2>
            <p className="text-lg mb-4">
              JW Marriott Orlando Bonnet Creek, 14900 Chelonia Parkway, Orlando, FL 32821. 21 miles from MCO.
            </p>
            <p className="text-lg mb-8">
              Dates: Oct 15–17, 2025.
            </p>
            <div className="mb-8 h-80"> {/* Fixed height container to prevent CLS */}
              <iframe
                src="https://www.google.com/maps?q=JW+Marriott+Orlando+Bonnet+Creek&output=embed"
                loading="lazy"
                width="100%"
                height="320"
                style={{ border: 0 }}
                aria-label="Map to JW Marriott Orlando Bonnet Creek"
                className="rounded-lg shadow-sm w-full h-full"
              ></iframe>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild variant="secondary" size="lg">
                <a href="/agenda">View Agenda</a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href="/venue">Venue Details</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <TrustLine className="bg-muted/30" />
      <Differentiators />
      <WhatsIncluded />
      <section id="speakers">
        <Speakers />
        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg">
            <a href="/speakers">View All Speakers</a>
          </Button>
        </div>
      </section>
      <RegisterCTA />
      <PartnerLogos />
      <RegisterCTA />
      <PartnerVideos />
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Explore More</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild variant="outline">
              <a href="/pricing">View Pricing</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/faq">FAQ</a>
            </Button>
          </div>
        </div>
      </section>
      <FinalCTA />
      {/* Mobile padding for sticky CTA */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default Index;