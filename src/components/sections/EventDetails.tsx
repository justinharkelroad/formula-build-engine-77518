
import { Calendar, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { venueImages } from "@/assets/venue/images";

const EventDetails = () => {
  const [imagesLoading, setImagesLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<number[]>([]);

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      try {
        const imagePromises = venueImages.map((image, index) => {
          return new Promise<number>((resolve, reject) => {
            const img = new Image();
            img.src = image.src;
            img.onload = () => resolve(index);
            img.onerror = () => reject(new Error(`Failed to load image: ${image.src}`));
          });
        });

        // Wait for all images to load or fail
        const loadedIndexes = await Promise.allSettled(imagePromises);
        const successfullyLoaded = loadedIndexes
          .filter((result): result is PromiseFulfilledResult<number> => result.status === 'fulfilled')
          .map(result => result.value);
        
        setLoadedImages(successfullyLoaded);
        setImagesLoading(false);
      } catch (error) {
        console.error("Error preloading images:", error);
        setImagesLoading(false);
      }
    };

    preloadImages();
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/placeholder.svg";
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient overlay */}
      
      
      {/* Content container */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Heading with decorative elements */}
          <div className="text-center mb-12 relative">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground inline-block relative">
              <span className="relative z-10">AN ELITE LOCATION</span>
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-primary/80 rounded-full transform scale-x-75"></span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience luxury at the JW Marriott Orlando Bonnet Creek
            </p>
          </div>
          
          {/* Main content area with elevated card design */}
          <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-primary/10">
            {/* Image carousel */}
            <div className="relative w-full h-[400px] md:h-[500px]">
              {imagesLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/20 z-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              )}
              
              <Carousel
                opts={{
                  align: "start",
                  loop: true
                }}
                className="w-full h-full"
              >
                <CarouselContent>
                  {venueImages.map((image, index) => (
                    <CarouselItem key={index} className="h-[400px] md:h-[500px]">
                      <div className="relative w-full h-full">
                         <img 
                           src={image.src} 
                           alt={`JW Marriott Orlando Bonnet Creek — ${image.alt}`}
                           className="w-full h-full object-cover transition-all duration-300"
                           onError={handleImageError}
                           loading="lazy"
                           width="800"
                           height="500"
                         />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4 bg-background/80 hover:bg-background backdrop-blur-sm border-primary/20" />
                <CarouselNext className="right-4 bg-background/80 hover:bg-background backdrop-blur-sm border-primary/20" />
              </Carousel>
            </div>
            
            {/* Details area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              <div className="bg-card/50 backdrop-blur-sm p-8 rounded-lg shadow-sm border border-primary/10 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                <Calendar className="text-primary mx-auto mb-4" size={48} />
                <h3 className="text-xl font-semibold mb-2 text-card-foreground text-center">When</h3>
                <p className="text-lg text-muted-foreground text-center mb-4">October 15–17, 2025</p>
                <div className="text-sm text-muted-foreground text-center space-y-1">
                  <div><strong>Wednesday:</strong> PM Welcome Event</div>
                  <div><strong>Thursday:</strong> 9AM - 6PM + PM Special Event</div>
                  <div><strong>Friday:</strong> 9AM - 12:30PM</div>
                </div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm p-8 rounded-lg shadow-sm border border-primary/10 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                <MapPin className="text-primary mx-auto mb-4" size={48} />
                <h3 className="text-xl font-semibold mb-2 text-card-foreground text-center">Where</h3>
                <p className="text-lg text-muted-foreground text-center">JW Marriott Orlando<br />Bonnet Creek, FL</p>
              </div>
            </div>
            
            {/* Room Block Link Button */}
            <div className="flex justify-center mt-8 pb-8">
              <a
                href="https://book.passkey.com/go/FloridaFormulaForumATTENDEE"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Discounted Room Rate →
              </a>
            </div>
          </div>
          
          {/* Description */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground max-w-3xl mx-auto">
              The JW Marriott Orlando Bonnet Creek Resort & Spa brings modern luxury to the magical surroundings of Orlando.
              Located adjacent to Walt Disney World®, this upscale resort offers sophisticated spaces and exceptional amenities.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetails;
