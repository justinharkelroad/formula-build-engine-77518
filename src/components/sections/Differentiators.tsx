import { Users, Star, Network, Target } from "lucide-react";

const Differentiators = () => {
  const points = [
    {
      icon: Users,
      title: "Workshop-style sessions — build your plan live",
      description: "No death by PowerPoint. Roll up your sleeves and create your growth strategy in real-time."
    },
    {
      icon: Star,
      title: "Coach Garrett White & elite speakers on stage",
      description: "Learn from proven industry leaders who've built and scaled successful agencies."
    },
    {
      icon: Network,
      title: "Curated networking, zero random badge-scans",
      description: "Connect with pre-qualified agency owners, team members, and industry professionals who share your ambitions."
    },
    {
      icon: Target,
      title: "Actionable playbook you build on-site",
      description: "Walk away with a custom growth plan you created during the sessions — not just notes, but a real strategy."
    }
  ];

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          What Makes This Different
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {points.map((point, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-brand transition-shadow">
              <point.icon className="text-primary mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                {point.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Differentiators;