import { X } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VimeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  vimeoId: string;
}

const VimeoModal = ({ isOpen, onClose, vimeoId }: VimeoModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] md:max-w-[900px] w-full p-0 bg-black border-white/10 overflow-hidden [&>button:last-child]:hidden">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 z-50 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/80 transition-colors shadow-lg"
          aria-label="Close video"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="relative aspect-video w-full bg-black">
          {isOpen && (
            <iframe
              className="w-full h-full"
              src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=0&title=0&byline=0&portrait=0`}
              title="Video"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VimeoModal;
