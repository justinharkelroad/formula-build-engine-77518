import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface GalleryGridProps {
  images: { src: string; alt: string }[];
  onImageClick: (index: number) => void;
  onToggleSelect: (image: { src: string; alt: string }) => void;
  isSelected: (image: { src: string; alt: string }) => boolean;
}

const GalleryGrid = ({ images, onImageClick, onToggleSelect, isSelected }: GalleryGridProps) => {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  };

  return (
    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {images.map((image, index) => (
        <div
          key={index}
          className="break-inside-avoid relative group overflow-hidden rounded-lg"
        >
          {!loadedImages.has(index) && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            onLoad={() => handleImageLoad(index)}
            onClick={() => onImageClick(index)}
            className={`w-full h-auto transition-all duration-300 cursor-pointer ${
              loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
            } group-hover:scale-105 group-hover:brightness-110`}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 pointer-events-none" />
          
          {/* Add/Remove button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(image);
            }}
            className={`absolute top-2 right-2 z-10 p-2 rounded-full transition-all duration-200 ${
              isSelected(image)
                ? 'bg-primary text-primary-foreground scale-100'
                : 'bg-white/80 text-black opacity-0 group-hover:opacity-100'
            }`}
            aria-label={isSelected(image) ? "Remove from bucket" : "Add to bucket"}
          >
            {isSelected(image) ? (
              <Check className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
          
          {/* Selected badge */}
          {isSelected(image) && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
              Added
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GalleryGrid;
