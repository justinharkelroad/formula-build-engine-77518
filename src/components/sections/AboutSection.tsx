import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const AboutSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  return (
    <section
      id="about"
      ref={ref}
      className="bg-black text-white py-20 md:py-28 px-5 md:px-12"
    >
      <div className="container mx-auto max-w-7xl">
        <div className={`eyebrow mb-10 md:mb-14 reveal-up ${isVisible ? "is-visible" : ""}`}>ABOUT US</div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left — copy */}
          <div>
            <h2 className={`display-bold text-[clamp(2.75rem,9vw,6rem)] md:text-[6vw] lg:text-[5vw] mb-8 leading-[0.95] break-words reveal-up delay-1 ${isVisible ? "is-visible" : ""}`}>
              The Insurance<br />Agency Growth<br />Event
            </h2>
            <p className={`text-lg md:text-xl text-white/70 leading-relaxed max-w-xl reveal-up delay-2 ${isVisible ? "is-visible" : ""}`}>
              Formula proved that growth happens where clarity meets community. Across two immersive days, agency owners and team members gained actionable frameworks, redefined leadership, and built relationships that extend far beyond the event. Attendees described it as "the most impactful insurance conference ever attended" — a space where mindset, execution, and accountability aligned to create lasting results.
            </p>
          </div>

          {/* Right — image with subtle Ken Burns motion */}
          <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl group shadow-2xl reveal-up delay-3 ${isVisible ? "is-visible" : ""}`}>
            <picture>
              <source srcSet="/lovable-uploads/about-section-image.webp" type="image/webp" />
              <img
                src="/lovable-uploads/about-section-image.png"
                alt="Formula Forum — speaker on stage"
                loading="lazy"
                width="960"
                height="778"
                className="w-full h-full object-cover animate-ken-burns"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
