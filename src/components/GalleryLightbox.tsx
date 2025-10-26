import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Plus, Check } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface GalleryLightboxProps {
  images: { src: string; alt: string }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onToggleSelect: (image: { src: string; alt: string }) => void;
  isSelected: (image: { src: string; alt: string }) => boolean;
}

const GalleryLightbox = ({ images, currentIndex, isOpen, onClose, onNavigate, onToggleSelect, isSelected }: GalleryLightboxProps) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  if (!images[currentIndex]) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-xl w-full h-[90vh] p-0 bg-black/95 border-0">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Add to Bucket Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(images[currentIndex]);
            }}
            className={`absolute top-4 right-28 z-50 p-2 rounded-full transition-colors ${
              isSelected(images[currentIndex])
                ? 'bg-primary text-primary-foreground'
                : 'bg-white/10 hover:bg-white/20'
            }`}
            aria-label={isSelected(images[currentIndex]) ? "Remove from bucket" : "Add to bucket"}
          >
            {isSelected(images[currentIndex]) ? (
              <Check className="w-6 h-6 text-white" />
            ) : (
              <Plus className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Download Button */}
          <a
            href={images[currentIndex].src}
            download={`formula-forum-${currentIndex + 1}.jpg`}
            className="absolute top-4 right-16 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Download image"
          >
            <Download className="w-6 h-6 text-white" />
          </a>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 z-50 px-4 py-2 rounded-full bg-white/10 text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Previous Button */}
          {currentIndex > 0 && (
            <button
              onClick={() => onNavigate(currentIndex - 1)}
              className="absolute left-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Image */}
          <img
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            className="max-w-full max-h-full object-contain"
          />

          {/* Next Button */}
          {currentIndex < images.length - 1 && (
            <button
              onClick={() => onNavigate(currentIndex + 1)}
              className="absolute right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryLightbox;
