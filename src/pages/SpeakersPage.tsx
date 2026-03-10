import Navigation from "@/components/Navigation";
import Speakers from "@/components/sections/Speakers";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";

const SpeakersPage = () => {
  const title = "Speaker Lineup | Formula Forum 2026 — Operators, Builders & Experts";
  const description = "Meet the 12 speakers at Formula Forum 2026: keynote by Garrett J. White, plus sessions on VA systems, referral marketing, producer scaling, AI, EOS, and agency growth.";

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} path="/speakers" />
      <StructuredData page="speakers" />
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Speakers</h1>
          <h2 className="text-xl text-muted-foreground">Operators, builders, and experts</h2>
        </header>
        <Speakers />
        <div className="text-center mt-8">
          <Button asChild size="lg">
            <Link to="/pricing">View Pricing</Link>
          </Button>
        </div>
      </main>
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default SpeakersPage;
