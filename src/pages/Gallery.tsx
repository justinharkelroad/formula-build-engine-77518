import { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import GalleryGrid from '@/components/GalleryGrid';
import GalleryLightbox from '@/components/GalleryLightbox';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';
import UndefinedNavigation from '@/components/UndefinedNavigation';
import { galleryImages, GalleryImage } from '@/config/galleryImages';
import DownloadBucket from '@/components/DownloadBucket';
import DownloadBucketPanel from '@/components/DownloadBucketPanel';
import DownloadDataModal from '@/components/DownloadDataModal';
import { generatePhotoZip } from '@/utils/zipGenerator';
import { useToast } from '@/hooks/use-toast';

const Gallery = () => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(30);
  const [selectedPhotos, setSelectedPhotos] = useState<GalleryImage[]>([]);
  const [isBucketPanelOpen, setIsBucketPanelOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadType, setDownloadType] = useState<'all' | 'selected'>('all');
  const [showDownloadAllButton, setShowDownloadAllButton] = useState(false);
  const bottomObserverRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 30, galleryImages.length));
  };

  const displayedImages = galleryImages.slice(0, displayCount);

  const togglePhotoSelection = (photo: GalleryImage) => {
    setSelectedPhotos(prev => {
      const isSelected = prev.some(p => p.src === photo.src);
      if (isSelected) {
        return prev.filter(p => p.src !== photo.src);
      } else {
        return [...prev, photo];
      }
    });
  };

  const isPhotoSelected = (photo: GalleryImage) => {
    return selectedPhotos.some(p => p.src === photo.src);
  };

  // Observe when user scrolls to bottom to show Download All button
  useEffect(() => {
    if (!bottomObserverRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowDownloadAllButton(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    observer.observe(bottomObserverRef.current);
    
    return () => observer.disconnect();
  }, [displayCount]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Photo Gallery | Formula Forum 2025 Highlights"
        description="Browse photos from Formula Forum 2025: networking events, breakout sessions, speaker presentations, and attendee experiences at JW Marriott Orlando."
        path="/gallery"
      />
      <StructuredData page="general" />
      <UndefinedNavigation />

      <main className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Photo Gallery</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore & Relive the Formula Forum Experience!
          </p>
        </div>

        <p className="text-center text-muted-foreground mb-8">
          Showing {displayedImages.length} of {galleryImages.length} photos
        </p>

        <GalleryGrid 
          images={displayedImages} 
          onImageClick={setLightboxIndex}
          onToggleSelect={togglePhotoSelection}
          isSelected={isPhotoSelected}
        />

        {/* Bottom Observer - triggers Download All button visibility */}
        <div ref={bottomObserverRef} className="h-px" />

        {/* Download All Button - appears at bottom after scrolling */}
        {showDownloadAllButton && displayCount >= galleryImages.length && (
          <div className="flex justify-center mt-12 mb-8">
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => {
                setDownloadType('all');
                setIsDownloadModalOpen(true);
              }}
            >
              <Download className="w-5 h-5" />
              Download All Photos ({galleryImages.length})
            </Button>
          </div>
        )}

        {displayCount < galleryImages.length && (
          <div className="flex justify-center mt-12">
            <Button 
              onClick={handleLoadMore} 
              size="lg"
              variant="outline"
            >
              Load More Photos
            </Button>
          </div>
        )}

        <GalleryLightbox
          images={galleryImages}
          currentIndex={lightboxIndex ?? 0}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          onToggleSelect={togglePhotoSelection}
          isSelected={isPhotoSelected}
        />
      </main>

      {/* Download Bucket Widget */}
      <DownloadBucket
        selectedPhotos={selectedPhotos}
        onOpen={() => setIsBucketPanelOpen(true)}
        onClear={() => setSelectedPhotos([])}
      />

      {/* Download Bucket Panel */}
      <DownloadBucketPanel
        isOpen={isBucketPanelOpen}
        onClose={() => setIsBucketPanelOpen(false)}
        selectedPhotos={selectedPhotos}
        onRemove={(photo) => setSelectedPhotos(prev => 
          prev.filter(p => p.src !== photo.src)
        )}
        onDownload={() => {
          if (selectedPhotos.length === 0) {
            toast({
              title: "No photos selected",
              description: "Please add photos to your bucket first.",
              variant: "destructive"
            });
            return;
          }
          setDownloadType('selected');
          setIsDownloadModalOpen(true);
          setIsBucketPanelOpen(false);
        }}
      />

      {/* Download Data Collection Modal */}
      <DownloadDataModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        downloadType={downloadType}
        photoCount={downloadType === 'all' ? galleryImages.length : selectedPhotos.length}
        selectedPhotos={downloadType === 'selected' ? selectedPhotos : undefined}
        onSubmit={async () => {
          try {
            const imagesToDownload = downloadType === 'all' 
              ? galleryImages 
              : selectedPhotos;
            
            const filename = downloadType === 'all'
              ? 'formula-forum-all-photos.zip'
              : 'formula-forum-selected-photos.zip';
            
            await generatePhotoZip(imagesToDownload, filename);
            
            toast({
              title: "Download started!",
              description: `Downloading ${imagesToDownload.length} photos...`
            });
            
            setIsDownloadModalOpen(false);
            if (downloadType === 'selected') {
              setSelectedPhotos([]);
            }
          } catch (error) {
            console.error('Download error:', error);
            toast({
              title: "Download failed",
              description: "There was an error preparing your download. Please try again.",
              variant: "destructive"
            });
          }
        }}
      />

      <Footer />
    </div>
  );
};

export default Gallery;
