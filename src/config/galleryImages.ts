// Gallery Images Configuration
// Add your images to public/lovable-uploads/gallery/ and list them here

export interface GalleryImage {
  src: string;
  alt: string;
  category?: 'venue' | 'speakers' | 'attendees' | 'sessions' | 'networking';
}

export const galleryImages: GalleryImage[] = [
  // Example images - replace with your actual gallery images
  { src: '/lovable-uploads/venue-pool-2026.jpg', alt: 'JW Marriott Pool Area', category: 'venue' },
  { src: '/lovable-uploads/breakout-session.png', alt: 'Breakout Session', category: 'sessions' },
  { src: '/lovable-uploads/troy-hawkes.png', alt: 'Troy Hawkes Speaker', category: 'speakers' },
  
  // Add all 200 images here following this pattern:
  // { src: '/lovable-uploads/gallery/image-001.jpg', alt: 'Description of image', category: 'venue' },
  // { src: '/lovable-uploads/gallery/image-002.jpg', alt: 'Description of image', category: 'speakers' },
  // etc...
];
