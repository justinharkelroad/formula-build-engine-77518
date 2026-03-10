import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { Clock, Users, PenTool, Target } from "lucide-react";

const Format = () => {
  const title = "The Format Framework | Formula Forum 2026 — How Sessions Work";
  const description = "The Format Framework: Formula Forum's proprietary four-step session cycle — speaker training, takeaway capture, peer breakouts, and speaker close. Designed for implementation.";

  const exampleFlow = [
    {
      icon: Target,
      title: "Speaker",
      duration: "15-20 Minutes",
      description: "Focused training sessions with actionable insights"
    },
    {
      icon: PenTool,
      title: "Takeaways",
      duration: "2-3 Minutes",
      description: "Type out your takeaways and action items"
    },
    {
      icon: Users,
      title: "Breakouts",
      duration: "10 Minutes",
      description: "Small groups to share takeaways and listen to others"
    },
    {
      icon: Clock,
      title: "Speaker Close",
      duration: "3 Minutes",
      description: "Solidify the training and next steps"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEO title={title} description={description} path="/format" />
      <StructuredData page="format" />
      
      {/* Hero Background */}
      <div className="absolute inset-0 hero-bg" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background/50"></div>
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-orb hero-orb-3"></div>
      </div>

      <Navigation />
      
      <main className="relative z-10 container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
            The Format Framework
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-foreground">
            Workshops, Breakouts & Playbooks
          </h2>
          <p className="text-lg text-muted-foreground">Full Agenda Coming Soon</p>
        </header>

        {/* Speakable Format description */}
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-center mb-12" data-speakable="true">
          Formula Forum uses a proprietary four-step Format Framework for every session: a 15–20 minute focused speaker training, a 2–3 minute personal takeaway capture, a 10-minute small-group breakout for peer sharing, and a 3-minute speaker close. This cycle ensures attendees leave with written, actionable plans rather than passive notes.
        </p>

        <section className="max-w-4xl mx-auto space-y-12">
          {/* Example Flow Section */}
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-foreground">Example Flow</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {exampleFlow.map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-6 text-center space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-foreground">{step.title}</h4>
                          <p className="text-sm font-medium text-primary">{step.duration}</p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Implementation Section */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="space-y-4">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Designed for implementation. Hands-on workshops, tactical breakouts, and operator playbooks you can deploy immediately.
              </p>
            </div>
            <Button asChild variant="cta" size="lg" className="text-xl px-8 py-6">
              <Link to="/pricing">Get Tickets</Link>
            </Button>
          </div>
        </section>
      </main>
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default Format;
