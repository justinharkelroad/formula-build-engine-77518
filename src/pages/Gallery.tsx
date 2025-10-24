import { useState, useMemo } from 'react';
import { galleryImages, GalleryImage } from '@/config/galleryImages';
import GalleryGrid from '@/components/GalleryGrid';
import GalleryLightbox from '@/components/GalleryLightbox';
import SEO from '@/components/SEO';
import UndefinedNavigation from '@/components/UndefinedNavigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const Gallery = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(30);

  const displayedImages = galleryImages.slice(0, displayCount);

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 30, galleryImages.length));
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Photo Gallery | Formula Forum 2026"
        description="View photos from Formula Forum conferences - venue, speakers, sessions, and networking moments."
        path="/gallery"
      />
      <UndefinedNavigation />

      <main className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Photo Gallery</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore moments from Formula Forum conferences
          </p>
        </div>

        {/* Image Count */}
        <p className="text-center text-muted-foreground mb-8">
          Showing {displayedImages.length} of {galleryImages.length} photos
        </p>

        {/* Gallery Grid */}
        <GalleryGrid
          images={displayedImages}
          onImageClick={(index) => setSelectedImageIndex(index)}
        />

        {/* Load More Button */}
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

        {/* Lightbox */}
        <GalleryLightbox
          images={displayedImages}
          currentIndex={selectedImageIndex ?? 0}
          isOpen={selectedImageIndex !== null}
          onClose={() => setSelectedImageIndex(null)}
          onNavigate={(index) => setSelectedImageIndex(index)}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Gallery;
