import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GalleryImage } from '@/config/galleryImages';

interface DownloadBucketProps {
  selectedPhotos: GalleryImage[];
  onOpen: () => void;
  onClear: () => void;
}

const DownloadBucket = ({ selectedPhotos, onOpen, onClear }: DownloadBucketProps) => {
  if (selectedPhotos.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 md:bottom-6 md:right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="relative">
        <Button
          size="lg"
          onClick={onOpen}
          className="rounded-full h-16 w-16 shadow-lg hover:scale-105 transition-transform"
        >
          <Download className="w-6 h-6" />
        </Button>
        
        <Badge 
          className="absolute -top-2 -right-2 h-8 w-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold animate-pulse"
        >
          {selectedPhotos.length}
        </Badge>

        {selectedPhotos.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center justify-center transition-colors"
            aria-label="Clear all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DownloadBucket;
