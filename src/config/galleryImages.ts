// Gallery Images Configuration
// Add your images to public/lovable-uploads/gallery/ and list them here

export interface GalleryImage {
  src: string;
  alt: string;
}

export const galleryImages: GalleryImage[] = [
  // Example images - replace with your actual gallery images
  { src: '/lovable-uploads/venue-pool-2026.jpg', alt: 'JW Marriott Pool Area' },
  { src: '/lovable-uploads/breakout-session.png', alt: 'Breakout Session' },
  { src: '/lovable-uploads/troy-hawkes.png', alt: 'Troy Hawkes Speaker' },
  
  // Add all 200 images here following this pattern:
  // { src: '/lovable-uploads/gallery/image-001.jpg', alt: 'Description of image' },
];
