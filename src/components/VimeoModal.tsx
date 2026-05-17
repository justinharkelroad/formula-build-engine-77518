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
      <DialogContent
        className="max-w-[92vw] md:max-w-[1000px] w-full p-0 bg-black border border-white/15 rounded-3xl overflow-hidden
          [&>button:last-child]:hidden
          shadow-[0_40px_120px_-20px_rgba(74,144,226,0.45)]"
      >
        <button
          onClick={onClose}
          className="absolute -top-14 right-0 z-50 w-11 h-11 rounded-full border border-white/30 bg-black/60 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors backdrop-blur"
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
