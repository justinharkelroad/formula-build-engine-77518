import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Target, Users, TrendingUp } from 'lucide-react';

const services = [
  {
    icon: Target,
    title: 'Train',
    description: 'Every trainer will eliminate all the "about-me" parts and simply get straight to training you on their specific expertise.',
  },
  {
    icon: Users,
    title: 'Type',
    description: 'You will immerse yourself in your notes. Writing or typing your biggest takeaways as soon as the trainer is done with their session.',
  },
  {
    icon: TrendingUp,
    title: 'Talk',
    description: 'The breakthroughs happen in the breakouts. "On your feet" will que you to find someone you don\'t know and we will orchestrate powerful quick breakout sessions.',
  },
  {
    icon: Target,
    title: 'Teach',
    description: 'After you come back to your seat, we teach and complete the circle by making sure the lessons can be applied by taking questions and getting powerful takeaways',
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
        
        <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-8 leading-tight max-w-4xl">
          Leading Your Teams With Authenticity, Purpose & Truth will Create Presence With Your Teams
        </h2>

        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FF8C42] to-[#4A90E2] bg-clip-text text-transparent">
            Formulas Learning Cycle
          </h3>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
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
