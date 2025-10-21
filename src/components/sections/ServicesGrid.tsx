import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Target, Users, TrendingUp } from 'lucide-react';

const services = [
  {
    icon: Target,
    title: 'Cross-Sell Strategy',
    description: 'Double your cross-sell rate with proven frameworks that turn single-policy clients into multi-line relationships.',
  },
  {
    icon: Users,
    title: 'Team Building',
    description: 'Hire, compensate, and coach producers who consistently hit 2+ sales per day without burning out.',
  },
  {
    icon: TrendingUp,
    title: 'Retention Playbook',
    description: 'Deploy our 3-step renewal system that lifts retention rates and creates predictable revenue streams.',
  },
];

const ServicesGrid = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      id="event"
      ref={ref}
      className={`min-h-screen bg-black text-white py-32 px-8 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-xs text-white/50 mb-12 tracking-widest uppercase">[ what you'll master ]</div>
        
        <h2 className="text-6xl md:text-7xl font-bold mb-20 leading-tight max-w-4xl">
          Build your agency growth blueprint in 48 hours
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-700 hover:scale-105 cursor-hover"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#4A90E2] flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-white/70 leading-relaxed">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
