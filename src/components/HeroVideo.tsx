import { useEffect, useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface HeroVideoProps {
  wistiaId: string;
  title?: string;
}

const HeroVideo = ({ wistiaId, title = "Event video" }: HeroVideoProps) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Auto-load the video on component mount
    setLoaded(true);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <AspectRatio ratio={16 / 9}>
        {loaded ? (
          <iframe
            src={`https://fast.wistia.net/embed/iframe/${wistiaId}?seo=true&videoFoam=true&autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            className="h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="group relative h-full w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Play video"
          >
            <img 
              src="/assets/hero-1200x630.jpg"
              alt="Insurance agency growth conference in Orlando at JW Marriott Bonnet Creek Oct 14–16 2026"
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
              width={1200}
              height={630}
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="inline-flex items-center justify-center rounded-full bg-white/90 text-black h-16 w-16 shadow-lg transition-transform group-hover:scale-105">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </button>
        )}
      </AspectRatio>
    </div>
  );
};

export default HeroVideo;
