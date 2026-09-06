import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import {
  BookOpen,
  CheckCircle2,
  Gauge,
  Hammer,
  MessageCircle,
  PenTool,
  Signature,
  Target,
} from "lucide-react";

const workbookSteps = [
  { icon: BookOpen, title: "Learn", description: "Keep the Formula workbook closed and listen to operators who have already solved it." },
  { icon: Gauge, title: "Assess", description: "Score the three Mirror questions honestly against the five-star standard." },
  { icon: PenTool, title: "Reflect", description: "Write privately about what is actually true." },
  { icon: MessageCircle, title: "Discuss", description: "Work in quads for Business sessions and pairs for Body, Balance, and Being." },
  { icon: Target, title: "Choose the Domino", description: "Choose the one move that starts the rest of the change." },
  { icon: Hammer, title: "Build 2027", description: "Define the target, owner, support, measure, cadence, and first 30 days." },
  { icon: CheckCircle2, title: "Align", description: "Stress-test the build in the Walk & Talk and decide who needs to know and hold you to it." },
  { icon: Signature, title: "Declare", description: "Sign the commitment in the room in front of a witness." },
] as const;

const Format = () => {
  const title = "How Formula Sessions Work | Formula Forum 2026";
  const description = "Eight working sessions use one repeated Formula workbook pattern: Learn, Assess, Reflect, Discuss, choose the Domino, Build 2027, Align, and Declare.";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEO title={title} description={description} path="/format" />
      <StructuredData page="format" />

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
            How Formula Works
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-foreground">
            Eight sessions. One repeated workbook pattern.
          </h2>
          <p className="text-lg text-muted-foreground">October 14–16, 2026</p>
        </header>

        <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-center mb-10" data-speakable="true">
          Formula Forum has five 60-minute Business sessions and three 40-minute Personal sessions. In each one, the room moves through the same eight steps in the Formula workbook so an insight becomes a decision with an owner, a measure, and a witness.
        </p>

        <div className="mx-auto mb-12 grid max-w-3xl gap-4 sm:grid-cols-2">
          <Card className="border-border/50 bg-card/70 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-black text-primary">60 MIN</p>
              <p className="mt-2 font-semibold text-foreground">Five Business sessions</p>
              <p className="mt-1 text-sm text-muted-foreground">Team builds discussed in quads</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/70 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-black text-primary">40 MIN</p>
              <p className="mt-2 font-semibold text-foreground">Three Personal sessions</p>
              <p className="mt-1 text-sm text-muted-foreground">Body, Balance, and Being discussed in pairs</p>
            </CardContent>
          </Card>
        </div>

        <section className="max-w-5xl mx-auto space-y-12" aria-labelledby="workbook-pattern-heading">
          <div className="text-center space-y-8">
            <h3 id="workbook-pattern-heading" className="text-3xl font-bold text-foreground">The Workbook Pattern</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {workbookSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <Card key={step.title} className="relative group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6 text-center space-y-4">
                      <span className="absolute right-4 top-3 text-xs font-bold text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-lg text-foreground">{step.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center md:p-8">
            <h3 className="text-xl font-bold text-foreground">Bring all three completed session pages into the Formula app.</h3>
            <p className="mx-auto mt-3 max-w-3xl text-muted-foreground">
              After each session, photograph or upload the assessment and Mirror scores page, the reflection and discussion page, and the Domino through declaration page. The scores, written reflections, and final commitment give the app the full context for your build.
            </p>
          </div>

          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Work the page that matches the room. Business sessions end in a team build; Body, Balance, and Being remain private unless you choose to share them.
            </p>
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
