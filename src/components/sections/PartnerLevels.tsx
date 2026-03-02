import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Award, Crown, ChevronDown } from "lucide-react";
import { useState } from "react";

type Tier = {
  name: string;
  limit?: number;
  price: string;
  icon: any;
  color: string;
  link?: string;
  benefits: string[];
};

const PartnerLevels = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const tiers: Tier[] = [
    {
      name: "Platinum",
      price: "$15,000",
      icon: Crown,
      color: "bg-gradient-to-br from-slate-400 to-slate-600",
      benefits: [
        "Premium booth: Two 6-ft tables in a prime spot",
        "Co-branding: Welcome Reception & Thursday-Night Event",
        "8 full-access passes (sessions, meals, evening events)",
        "5-min live stage slot during a General Session",
        "Logo on event Step-and-Repeat backdrop",
        "1-on-1 video-podcast interview promoted to full email list + socials",
        "30-sec silent video ad on every General Session break screen",
        "Branded F³ swag for your attending team",
        "30-sec video loop on partnership-room & hallway screens",
        "Attendee lead list 30 days pre-event + exclusive email blast",
        "Primary + VIP placement in the mobile app",
        "Full photo/video package with your logo clearly visible"
      ]
    },
    {
      name: "Gold",
      price: "$10,000",
      icon: Award,
      color: "bg-gradient-to-br from-accent to-warning",
      benefits: [
        "Two 6-ft tables (premium placement)",
        "Option to co-brand Welcome Reception & Thursday-Night Event",
        "6 full-access passes",
        "On-stage verbal shout-out during General Session",
        "1-on-1 video-podcast promotion",
        "30-sec silent video ad on General Session break screens",
        "Team swag packs",
        "30-sec hallway/partnership-room video loop",
        "Lead list 10 days pre-event",
        "VIP listing in the mobile app",
        "Post-event photo/video bundle with branding"
      ]
    },
    {
      name: "Silver",
      price: "$7,500",
      icon: Star,
      color: "bg-gradient-to-br from-slate-300 to-slate-500",
      link: "https://buy.stripe.com/bJeeVd0FJd7gb7a5yE3wQ02",
      benefits: [
        "One 6-ft table booth",
        "4 full-access passes",
        "General Session voice call-out",
        "1-on-1 video-podcast promotion",
        "Team swag packs",
        "30-sec hallway/partnership-room video loop",
        "Lead list 5 days post-event",
        "Standard listing in the mobile app",
        "Post-event photo/video bundle with branding"
      ]
    },
    {
      name: "Bronze",
      price: "$5,000",
      icon: Star,
      color: "bg-gradient-to-br from-amber-600 to-amber-800",
      link: "https://buy.stripe.com/14A28r9cf5EO0swaSY3wQ03",
      benefits: [
        "One 6-ft table booth",
        "2 full-access passes",
        "1-on-1 video-podcast promotion",
        "Team swag packs",
        "Lead list 10 days post-event",
        "Standard listing in the mobile app",
        "Post-event photo/video bundle with branding"
      ]
    }
  ];

  return (
    <section id="levels" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          Partnership Levels
        </h2>
        <p className="text-lg text-center mb-12 text-muted-foreground max-w-2xl mx-auto">
          Choose the level that best fits your goals. All partnerships include brand exposure to growth-focused insurance professionals.
        </p>

        <div className="max-w-3xl mx-auto space-y-3">
          {tiers.map((tier, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="bg-card rounded-lg border shadow-sm overflow-hidden">
                {/* Accordion header — always visible */}
                <button
                  type="button"
                  className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <div className={`${tier.color} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <tier.icon className="text-white" size={20} />
                  </div>
                  <div className="flex-1 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-card-foreground">{tier.name}</span>
                      {tier.limit && (
                        <span className="text-xs font-semibold bg-destructive text-white px-2 py-0.5 rounded-full">
                          Only {tier.limit} Left
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-foreground">{tier.price}</span>
                      <ChevronDown
                        size={20}
                        className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>
                </button>

                {/* Accordion body — benefits + CTA */}
                {isOpen && (
                  <div className="px-6 pb-6 border-t">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-5 mb-6">
                      {tier.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-start gap-2">
                          <CheckCircle className="text-primary mt-0.5 flex-shrink-0" size={16} />
                          <span className="text-sm text-card-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="cta"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        if (tier.link) {
                          window.open(tier.link, '_blank');
                        } else {
                          window.location.href = '/contact';
                        }
                      }}
                    >
                      {tier.name === 'Silver' ? 'LOCK IN SILVER' :
                       tier.name === 'Bronze' ? 'LOCK IN BRONZE' :
                       `Apply for ${tier.name}`}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PartnerLevels;
