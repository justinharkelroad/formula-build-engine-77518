import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const UndefinedAbout = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      id="about"
      ref={ref}
      className={`min-h-screen bg-black text-white py-32 px-8 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-xs text-white/50 mb-12 tracking-widest uppercase">[ about us ]</div>
        
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Column - Text */}
          <div>
            <h2 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              The Insurance Agency Growth Event
            </h2>
            <p className="text-xl text-white/70 leading-relaxed mb-6">
              Formula Forum brings together forward-thinking insurance agency owners for three days of intensive workshops, tactical breakouts, and peer collaboration.
            </p>
            <p className="text-xl text-white/70 leading-relaxed">
              Walk away with a complete 90-day growth blueprint designed specifically for your agency—no theory, just proven systems that work.
            </p>
          </div>

          {/* Right Column - Image */}
          <div className="relative overflow-hidden rounded-2xl group">
            <img
              src="/lovable-uploads/109ab2af-5591-4d6c-a9cd-d82bf264fdf8.png"
              alt="Formula Forum Event"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default UndefinedAbout;
