import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { GalleryImage } from '@/config/galleryImages';

/**
 * Fetches an image from URL and returns as Blob
 */
async function fetchImageAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${url}`);
  }
  return response.blob();
}

/**
 * Extracts filename from image src path
 */
function getFilenameFromSrc(src: string): string {
  const parts = src.split('/');
  return parts[parts.length - 1];
}

/**
 * Downloads images and creates a ZIP file
 */
export async function generatePhotoZip(
  images: GalleryImage[],
  filename: string
): Promise<void> {
  const zip = new JSZip();
  const failedImages: string[] = [];

  // Add each image to the ZIP
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const imageName = getFilenameFromSrc(image.src);

    try {
      // Fetch the image with retry logic
      let blob: Blob | null = null;
      let retries = 3;
      
      while (retries > 0 && !blob) {
        try {
          blob = await fetchImageAsBlob(image.src);
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (blob) {
        zip.file(imageName, blob);
      }
    } catch (error) {
      console.error(`Failed to add image ${imageName}:`, error);
      failedImages.push(imageName);
    }
  }

  // Generate the ZIP file
  const content = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  // Trigger download
  saveAs(content, filename);

  // Log any failures
  if (failedImages.length > 0) {
    console.warn(`Failed to include ${failedImages.length} images:`, failedImages);
  }
}
