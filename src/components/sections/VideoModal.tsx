import { X } from 'lucide-react';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[90vw] md:max-w-[500px] w-full p-0 bg-black border-white/10 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* YouTube Embed Container */}
        <div className="relative aspect-[9/16] w-full bg-black">
          <iframe
            className="w-full h-full"
            src={`${videoSrc}?autoplay=1&rel=0&modestbranding=1`}
            title={`${name} testimonial`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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
