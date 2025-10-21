import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  posterSrc: string;
  name: string;
  title: string;
}

const VideoModal = ({ isOpen, onClose, videoSrc, posterSrc, name, title }: VideoModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Auto-play when modal opens
  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play();
      videoRef.current.muted = false;
      setIsPlaying(true);
      setIsMuted(false);
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isOpen]);

  // Auto-hide controls after 3 seconds of no interaction
  const resetHideControlsTimer = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
    resetHideControlsTimer();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
    resetHideControlsTimer();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[90vw] md:max-w-[500px] w-full p-0 bg-black border-white/10 overflow-hidden"
        onMouseMove={resetHideControlsTimer}
        onMouseEnter={() => setShowControls(true)}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video Container */}
        <div className="relative aspect-[9/16] w-full bg-black" onClick={togglePlay}>
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            playsInline
            loop
            preload="metadata"
            className="w-full h-full object-contain"
          />

          {/* Play/Pause Controls */}
          {showControls && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!isPlaying && (
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
                  <Play className="w-10 h-10 text-white ml-1" fill="white" />
                </div>
              )}
              {isPlaying && (
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center pointer-events-auto opacity-0 hover:opacity-100 transition-opacity">
                  <Pause className="w-10 h-10 text-white" fill="white" />
                </div>
              )}
            </div>
          )}

          {/* Mute/Unmute Button */}
          {showControls && (
            <button
              onClick={toggleMute}
              className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all z-10"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </button>
          )}
        </div>

        {/* Name and Title Section */}
        <div className="p-6 bg-black">
          <p className="font-bold text-white text-lg mb-1">{name}</p>
          <p className="text-white/70 text-sm">{title}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
