import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface FeatureSectionProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}

const FeatureSection = ({ title, description, imageSrc, imageAlt, reverse = false, id }: FeatureSectionProps & { id?: string }) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      id={id}
      className={`min-h-screen bg-black text-white py-32 px-8 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
    >
      <div className="container mx-auto max-w-7xl">
        <div className={`grid md:grid-cols-2 gap-16 items-center ${reverse ? 'md:grid-flow-dense' : ''}`}>
          {/* Text Column */}
          <div className={reverse ? 'md:col-start-2' : ''}>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
              {title}
            </h2>
            <p className="text-xl text-white/70 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Image Column */}
          <div className={`relative overflow-hidden rounded-2xl group ${reverse ? 'md:col-start-1 md:row-start-1' : ''}`}>
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
