import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Award, Crown } from "lucide-react";

type Tier = {
  name: string;
  soldOut?: boolean;
  limit?: number;
  price: string;
  icon: any;
  color: string;
  link?: string;
  benefits: string[];
};

const PartnerLevels = () => {
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
      limit: 3,
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier, index) => (
            <div key={index} className="bg-card rounded-lg shadow-sm border hover:shadow-brand transition-shadow relative">
              {tier.soldOut && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-destructive text-white px-3 py-1 rounded-full text-sm font-semibold">
                    SOLD OUT
                  </span>
                </div>
              )}
              {tier.limit && !tier.soldOut && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-destructive text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Only {tier.limit} Left
                  </span>
                </div>
              )}
              
              <div className="p-8">
                <div className={`${tier.color} w-16 h-16 rounded-lg flex items-center justify-center mb-6 mx-auto`}>
                  <tier.icon className="text-white" size={32} />
                </div>
                
                <h3 className="text-2xl font-bold text-center mb-2 text-card-foreground">
                  {tier.name}
                </h3>
                
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                </div>
                
                <div className="space-y-3 mb-8">
                  {tier.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-start gap-3">
                      <CheckCircle className="text-primary mt-0.5 flex-shrink-0" size={18} />
                      <span className="text-sm text-card-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant={tier.soldOut ? "outline" : "cta"} 
                  className="w-full"
                  onClick={() => {
                    if (tier.soldOut) return;
                    if (tier.link) {
                      window.open(tier.link, '_blank');
                    } else {
                      window.location.href = '/contact';
                    }
                  }}
                  disabled={tier.soldOut}
                >
                  {tier.soldOut ? 'SOLD OUT' : 
                   tier.name === 'Silver' ? 'LOCK IN SILVER' :
                   tier.name === 'Bronze' ? 'LOCK IN BRONZE' :
                   `Apply for ${tier.name}`}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerLevels;