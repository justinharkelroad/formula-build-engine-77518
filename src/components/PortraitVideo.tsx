import { useState } from "react";
import { Play } from "lucide-react";

interface PortraitVideoProps {
  mediaId: string;
}

const PortraitVideo = ({ mediaId }: PortraitVideoProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0">
      {/* 9:16 aspect ratio wrapper */}
      <div className="relative w-full" style={{ paddingTop: '177.78%' }}>
        {/* Poster thumbnail - shows instantly */}
        <div className="absolute top-0 left-0 w-full h-full rounded-lg bg-gradient-to-br from-primary/20 via-background to-primary/10 flex items-center justify-center border border-border/20">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm border border-primary/30">
              <Play className="w-8 h-8 text-primary fill-primary ml-1" />
            </div>
            <p className="text-sm text-muted-foreground">Loading video...</p>
          </div>
        </div>

        {/* Iframe - fades in when loaded */}
        <iframe
          src={`https://fast.wistia.com/embed/iframe/${mediaId}?videoFoam=1`}
          className={`absolute top-0 left-0 w-full h-full rounded-lg shadow-elegant transition-opacity duration-700 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          allow="autoplay; fullscreen"
          allowFullScreen
          title="Portrait video"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </div>
  );
};

export default PortraitVideo;
