import { Trash2, Download } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { GalleryImage } from '@/config/galleryImages';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DownloadBucketPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPhotos: GalleryImage[];
  onRemove: (photo: GalleryImage) => void;
  onDownload: () => void;
}

const DownloadBucketPanel = ({ 
  isOpen, 
  onClose, 
  selectedPhotos, 
  onRemove, 
  onDownload 
}: DownloadBucketPanelProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>
            Download Bucket ({selectedPhotos.length})
          </SheetTitle>
        </SheetHeader>

        {selectedPhotos.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <p className="text-muted-foreground">
              No photos selected. Browse the gallery and click + on photos to add them.
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                {selectedPhotos.map((photo, index) => (
                  <div 
                    key={index} 
                    className="relative group aspect-square rounded-lg overflow-hidden"
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => onRemove(photo)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 space-y-2">
              <Button
                onClick={onDownload}
                className="w-full gap-2"
                size="lg"
                disabled={selectedPhotos.length === 0}
              >
                <Download className="w-5 h-5" />
                Download Selected ({selectedPhotos.length})
              </Button>
              <Button
                onClick={() => {
                  selectedPhotos.forEach(photo => onRemove(photo));
                }}
                variant="outline"
                className="w-full"
              >
                Clear All
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default DownloadBucketPanel;
