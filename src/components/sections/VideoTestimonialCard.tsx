import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoTestimonialCardProps {
  videoSrc: string;
  posterSrc?: string;
  name: string;
  title: string;
}

const VideoTestimonialCard = ({ videoSrc, posterSrc, name, title }: VideoTestimonialCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      className="relative w-[280px] md:w-[320px] h-[500px] rounded-3xl overflow-hidden border border-white/10 transition-transform duration-300 hover:scale-[1.02] group cursor-hover"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={togglePlay}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterSrc}
        playsInline
        loop
        muted={isMuted}
        preload="metadata"
        className="w-full h-full object-cover"
      />

      {/* Play/Pause Button Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 hover:scale-110">
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Controls on Hover */}
      {isPlaying && showControls && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="flex gap-4">
            <button
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 hover:scale-110"
              onClick={togglePlay}
              aria-label="Pause video"
            >
              <Pause className="w-8 h-8 text-white" fill="white" />
            </button>
            <button
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 hover:scale-110"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? (
                <VolumeX className="w-8 h-8 text-white" />
              ) : (
                <Volume2 className="w-8 h-8 text-white" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />

      {/* Name and Title */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <p className="font-bold text-lg mb-1">{name}</p>
        <p className="text-sm text-white/70">{title}</p>
      </div>
    </div>
  );
};

export default VideoTestimonialCard;
