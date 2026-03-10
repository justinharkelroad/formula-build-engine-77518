import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { Calendar } from "lucide-react";

const Agenda = () => {
  const title = "Event Agenda | Formula Forum 2026 — Three Days of Agency Growth";
  const description = "Formula Forum 2026 three-day agenda: Oct 14 welcome reception, Oct 15 full conference day with breakouts, Oct 16 implementation and action planning.";

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} path="/agenda" />
      <StructuredData page="general" />
      <Navigation />

      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-accent/5 to-background pointer-events-none" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-2xl opacity-30 pointer-events-none" />

      <main className="container mx-auto px-4 py-12 relative z-10">
        <section id="agenda">
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Agenda — Formula Forum 2026
            </h1>
            <h2 className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Three days of insurance agency growth strategies with industry-leading speakers
            </h2>
          </header>

          <div className="max-w-4xl mx-auto">
            {/* 3-Day Date Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <div className="text-center p-8 rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-sm">
                <Calendar className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-primary mb-2">Day 1</h3>
                <p className="text-lg font-semibold text-foreground">October 14, 2026</p>
                <p className="text-muted-foreground mt-2">Welcome & Networking</p>
              </div>
              <div className="text-center p-8 rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-sm">
                <Calendar className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-primary mb-2">Day 2</h3>
                <p className="text-lg font-semibold text-foreground">October 15, 2026</p>
                <p className="text-muted-foreground mt-2">Main Conference Day</p>
              </div>
              <div className="text-center p-8 rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-sm">
                <Calendar className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-primary mb-2">Day 3</h3>
                <p className="text-lg font-semibold text-foreground">October 16, 2026</p>
                <p className="text-muted-foreground mt-2">Implementation & Action Planning</p>
              </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="text-center p-12 rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-sm mb-16">
              <h3 className="text-3xl font-bold text-foreground mb-4">Full Agenda Coming Soon</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The detailed session schedule for Formula Forum 2026 is being finalized. Check back soon for speaker sessions, breakout times, and networking events.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="max-w-2xl mx-auto mb-8">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Ready to Transform Your Agency?</h3>
              <p className="text-lg text-muted-foreground">
                Join us for three days of actionable strategies, proven systems, and industry-leading expertise.
              </p>
            </div>
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/pricing">Register Now — Limited Seats Available</Link>
            </Button>
          </div>
        </section>
      </main>
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default Agenda;
