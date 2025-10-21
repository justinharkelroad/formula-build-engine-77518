import { AspectRatio } from "@/components/ui/aspect-ratio";

const DestinyRescuePartnership = () => {
  const getEmbedUrl = (youtubeUrl: string) => {
    const videoId = youtubeUrl.includes('watch?v=') 
      ? youtubeUrl.split('watch?v=')[1].split('&')[0]
      : youtubeUrl.split('/').pop()?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <section className="py-12 bg-muted/20 border-t border-b">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Partnership with Purpose
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left column - Content */}
            <div className="space-y-6">
              <div className="flex justify-center md:justify-start">
                <img 
                  src="/lovable-uploads/36f5b66e-4d8f-4268-a092-87220c6dc05a.png" 
                  alt="Destiny Rescue - Rescuing Children"
                  className="h-16 w-auto object-contain"
                  loading="lazy"
                  width="200"
                  height="64"
                />
              </div>
              <p className="text-lg text-muted-foreground">
                A portion of every ticket will be donated to Destiny Rescue, a global Christian organization 
                dedicated to rescuing children from sexual exploitation and human trafficking. 
                Help us change the world, one child at a time.
              </p>
            </div>
            
            {/* Right column - Video */}
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/10">
              <div className="mb-4 overflow-hidden rounded-xl shadow-lg">
                <AspectRatio ratio={16 / 9}>
                  <iframe
                    src={getEmbedUrl("https://www.youtube.com/watch?v=eiJuHioRR6Q")}
                    title="Destiny Rescue Podcast"
                    className="w-full h-full rounded-xl"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </AspectRatio>
              </div>
              <h4 className="text-lg font-semibold text-center text-foreground">
                Destiny Rescue Podcast
              </h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DestinyRescuePartnership;