import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { CONFIG } from "@/config/event";

const PartnerPodcasts = () => {
  const title = `2025 Partner Podcast Episodes | ${CONFIG.EVENT_NAME}`;
  const description = `Hear from our 2025 Formula Partners - exclusive podcast episodes featuring RICOCHET, Media Alpha, Disruptur, and more.`;

  const podcasts = [
    {
      name: "RICOCHET",
      url: "https://youtu.be/FlM2ZQ_FVwQ",
      embedId: "FlM2ZQ_FVwQ",
    },
    {
      name: "MEDIA ALPHA",
      url: "https://youtu.be/tox1dLwKnPM",
      embedId: "tox1dLwKnPM",
    },
    {
      name: "DISRUPTUR",
      url: "https://youtu.be/CjbFq-S9YgQ",
      embedId: "CjbFq-S9YgQ",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <SEO title={title} description={description} path="/2025partners" />
      <Navigation />
      
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white text-center mb-16">
            HEAR FROM OUR 2025 FORMULA PARTNERS
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {podcasts.map((podcast) => (
              <div
                key={podcast.embedId}
                className="group relative bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300"
              >
                <div className="aspect-video w-full relative overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${podcast.embedId}`}
                    title={`${podcast.name} Podcast Episode`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white text-center">
                    {podcast.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartnerPodcasts;
