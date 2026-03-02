import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const PartnerHero = () => {
  const handleScrollToLevels = () => {
    const levelsElement = document.getElementById('levels');
    if (levelsElement) {
      levelsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-primary py-20 md:py-32 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Fuel Agency Success. Amplify Your Brand.
          </h1>
          <Button
            variant="secondary"
            size="xl"
            className="mb-10"
            onClick={handleScrollToLevels}
          >
            View Partnership Levels
          </Button>

          <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
            <AspectRatio ratio={16 / 9}>
              <iframe
                src="https://player.vimeo.com/video/1169705054?badge=0&autopause=0&player_id=0&app_id=58479"
                title="Formula Forum Partner Video"
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                allowFullScreen
              />
            </AspectRatio>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default PartnerHero;