import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import PassTypeDialog from '@/components/PassTypeDialog';

const CTASection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      id="contact"
      ref={ref}
      className={`min-h-screen bg-gradient-to-br from-[#FF8C42] via-[#4A90E2] to-black text-white py-32 px-8 transition-all duration-1000 flex items-center justify-center ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
    >
      <div className="container mx-auto max-w-5xl text-center">
        <div className="text-xs text-white/70 mb-8 tracking-widest uppercase">[ save the date ]</div>

        <h2 className="text-5xl sm:text-7xl md:text-9xl font-bold mb-12 leading-none">
          Oct 14–16th, 2026
        </h2>

        <p className="text-2xl md:text-3xl text-white/90 mb-16 max-w-3xl mx-auto leading-relaxed">
          Formula returns in the fall of 2026 with agency, mental, emotional and personal growth training designed to transform how you lead.
        </p>

        <div className="flex justify-center">
          <PassTypeDialog />
        </div>
      </div>
    </section>
  );
};

export default CTASection;
