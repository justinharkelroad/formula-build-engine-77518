import { CheckCircle } from "lucide-react";

const WhoShouldAttend = () => {
  const bullets = [
    "Crave a scalable blueprint, not more chaos. You want a Monday-morning growth plan, not scribbles on a napkin.",
    "Feel the margin squeeze and need profit systems that work in this unpredictable market.",
    "Refuse to lead from the sidelines. You're ready to level up yourself to be the best leader for your teams.",
    "Prefer workshops over watch-and-leave sessions, flying home with a finished playbook instead of a to-do pile.",
    "Value curated, high-caliber connections and would rather brainstorm with growth-minded operators than mingle with random tire kickers.",
    "Want to reset mindset and daily execution rhythms, changing how you think, feel, and act around scale and leadership.",
    "Need an action plan that scales the whole team, not just the owner—producers, service, and marketing staff all leave with role-specific next steps.",
    "Hate fluff and demand clear, proven formula. Every session must drive clarity and measurable growth or it's out."
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-foreground">
            Built for Agency Owners & Staff Who…
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bullets.map((bullet, index) => (
              <div key={index} className="flex items-start gap-4 text-left bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <CheckCircle className="text-primary mt-1 flex-shrink-0" size={24} />
                <p className="text-base text-foreground leading-relaxed">{bullet}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoShouldAttend;