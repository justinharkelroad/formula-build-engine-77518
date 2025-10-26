// Gallery Images Configuration
// Add your images to public/lovable-uploads/gallery/ and list them here

export interface GalleryImage {
  src: string;
  alt: string;
}

export const galleryImages: GalleryImage[] = [
  // Upload your 250 photos to public/lovable-uploads/gallery/ 
  // Then add them here in this format:
  // { src: '/lovable-uploads/gallery/ff2025-001.jpg', alt: 'Speaker presenting on stage' },
  // { src: '/lovable-uploads/gallery/ff2025-002.jpg', alt: 'Attendees networking at pool area' },
  // { src: '/lovable-uploads/gallery/ff2025-003.jpg', alt: 'Breakout session discussion' },
  // ... continue for all 250 images
  
  // Temporary example images (remove these once you add your 250 photos):
  { src: '/lovable-uploads/venue-pool-2026.jpg', alt: 'JW Marriott Pool Area' },
  { src: '/lovable-uploads/breakout-session.png', alt: 'Breakout Session' },
  { src: '/lovable-uploads/troy-hawkes.png', alt: 'Troy Hawkes Speaker' },
];
