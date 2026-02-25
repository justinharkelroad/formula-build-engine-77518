import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WaitlistModal } from '@/components/WaitlistModal';
import PortraitVideo from '@/components/PortraitVideo';

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
    <section className="relative min-h-screen lg:h-screen overflow-visible lg:overflow-hidden">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 parallax bg-[#1a1a1a]"
        style={{
          backgroundImage: `url(/assets/hero-background-new.jpg)`,
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 py-10 sm:py-12 lg:py-0">
      <div className="grid lg:grid-cols-[1fr,auto] gap-8 lg:gap-12 items-center">
        {/* Portrait Video - Shows on mobile above text, right column on desktop */}
        <div className="flex items-center justify-center relative z-10 w-full max-w-[280px] mx-auto mb-8 lg:mb-0 lg:w-[420px] xl:w-[480px] lg:max-w-none shrink-0 h-auto lg:h-[80vh] lg:max-h-[800px]">
          <PortraitVideo mediaId="5emnt0yofp" />
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem] font-bold leading-none tracking-tighter text-white overflow-hidden select-none">
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
            OCTOBER 14–16, 2026
          </p>
          
          <WaitlistModal>
            <Button variant="cta" size="xl" className="mt-6 md:mt-8">
              Get Access to All of It
            </Button>
          </WaitlistModal>
        </div>
      </div>
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
