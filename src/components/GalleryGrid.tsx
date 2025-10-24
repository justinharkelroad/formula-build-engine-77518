import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface GalleryGridProps {
  images: { src: string; alt: string }[];
  onImageClick: (index: number) => void;
}

const GalleryGrid = ({ images, onImageClick }: GalleryGridProps) => {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  };

  return (
    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {images.map((image, index) => (
        <div
          key={index}
          className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-lg"
          onClick={() => onImageClick(index)}
        >
          {!loadedImages.has(index) && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            onLoad={() => handleImageLoad(index)}
            className={`w-full h-auto transition-all duration-300 ${
              loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
            } group-hover:scale-105 group-hover:brightness-110`}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
        </div>
      ))}
    </div>
  );
};

export default GalleryGrid;
