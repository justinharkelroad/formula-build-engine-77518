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
            <p className="text-xl text-white/70 leading-relaxed">
              Formula proved that growth happens where clarity meets community. Across two immersive days, agency owners gained actionable frameworks, redefined leadership, and built relationships that extend far beyond the event. Attendees described it as "the most impactful insurance conference ever attended"—a space where mindset, execution, and accountability aligned to create lasting results.
            </p>
          </div>

          {/* Right Column - Image */}
          <div className="relative overflow-hidden rounded-2xl group">
            <picture>
              <source srcSet="/lovable-uploads/about-section-image.webp" type="image/webp" />
              <img
                src="/lovable-uploads/about-section-image.png"
                alt="Formula Forum Event"
                loading="lazy"
                width="960"
                height="778"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default UndefinedAbout;
