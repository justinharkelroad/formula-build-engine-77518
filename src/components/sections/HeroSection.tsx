import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import heroBackground from '@/assets/hero-background.png';

const HeroSection = () => {
  const [letterIndex, setLetterIndex] = useState(0);
  const text = "formula";

  useEffect(() => {
    if (letterIndex < text.length) {
      const timeout = setTimeout(() => {
        setLetterIndex(letterIndex + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [letterIndex, text.length]);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 parallax"
        style={{
          backgroundImage: `url(${heroBackground})`,
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-start justify-center container mx-auto px-4 md:px-8">
        <h1 className="text-[5rem] sm:text-[8rem] md:text-[12rem] lg:text-[15rem] xl:text-[20rem] font-bold leading-none tracking-tighter text-white overflow-hidden select-none">
          {text.split('').map((letter, index) => (
            <span
              key={index}
              className={`letter-animate ${index < letterIndex ? 'opacity-100' : 'opacity-0'}`}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {letter}
            </span>
          ))}
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/70 mt-4 md:mt-8 max-w-2xl">
          THE RETURN IN FALL OF 2026
        </p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 animate-bounce-slow">
        <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center cursor-hover">
          <ChevronDown className="w-6 h-6 text-white/50" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
