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
      <DialogContent className="max-w-[90vw] md:max-w-[500px] w-full p-0 bg-black border-white/10 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          aria-label="Close video"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="relative aspect-[9/16] w-full bg-black">
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
