import { TrendingUp, Users, Briefcase, Wrench } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const props = [
  {
    icon: TrendingUp,
    title: "Operator-led growth playbooks",
    body: "Frameworks installed inside real agencies — not theory. Every speaker brings what's running in their book today."
  },
  {
    icon: Users,
    title: "Format breakouts with peer owners",
    body: "Pressure-test every session against your real situation in small-group breakouts. Leave with a plan, not a notebook."
  },
  {
    icon: Briefcase,
    title: "AI installs for daily ops",
    body: "Concrete AI workflows for service, sales, and producer ramp — owners who've actually wired this in for 2026."
  },
  {
    icon: Wrench,
    title: "Tools you'll deploy in October",
    body: "The Book of Formulas playbook. Action maps from every session. The agency's running it by Monday."
  }
];

const ValuePropsGrid = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  return (
    <section ref={ref} className="bg-[hsl(0,0%,96%)] text-[hsl(0,0%,8%)] py-20 md:py-24 px-5 md:px-12">
      <div className="container mx-auto max-w-7xl">
        <div className={`eyebrow text-black mb-10 reveal-up ${isVisible ? "is-visible" : ""}`}>FORMULA ADVANTAGES</div>

        <div className="grid md:grid-cols-2 gap-16 mb-16">
          <p className={`text-base md:text-lg leading-relaxed text-black/70 max-w-md reveal-up delay-1 ${isVisible ? "is-visible" : ""}`}>
            A 1.5-day conference dedicated to insurance agency owners and team members who want to learn about future trends and projects in the industry — actually installed.
          </p>
          <h2 className={`text-3xl md:text-4xl font-bold leading-tight reveal-up delay-2 ${isVisible ? "is-visible" : ""}`}>
            Gain valuable knowledge — Take<br />
            advantage of the conference and<br />
            discover the most important advantages.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {props.map((p, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl p-8 md:p-10 border border-black/5 lift-hover reveal-up delay-${i + 1} ${isVisible ? "is-visible" : ""}`}
            >
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-12 h-12 rounded-lg bg-[hsl(var(--secondary))]/10 flex items-center justify-center">
                  <p.icon className="w-6 h-6 text-[hsl(var(--secondary))]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                  <p className="text-black/65 leading-relaxed">{p.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex items-center justify-end text-xs tracking-widest uppercase text-black/40">
          <a href="#schedule" className="hover:text-black transition-colors">VIEW NEXT STEP TOWARD SUCCESS →</a>
        </div>
      </div>
    </section>
  );
};

export default ValuePropsGrid;
