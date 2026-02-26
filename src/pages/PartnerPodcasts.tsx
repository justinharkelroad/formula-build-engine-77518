import UndefinedNavigation from "@/components/UndefinedNavigation";
import SEO from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { CONFIG } from "@/config/event";

const PartnerPodcasts = () => {
  const title = `2025 Partner Podcast Episodes | ${CONFIG.EVENT_NAME}`;
  const description = `Hear from our 2025 Formula Partners - exclusive podcast episodes featuring RICOCHET, Media Alpha, Disruptur, and more.`;

  const podcasts = [
    { name: "RICOCHET", embedId: "FlM2ZQ_FVwQ" },
    { name: "MEDIA ALPHA", embedId: "tox1dLwKnPM" },
    { name: "DISRUPTUR", embedId: "CjbFq-S9YgQ" },
    { name: "TEAM HIRED", embedId: "cUv3cp19CRQ" },
    { name: "SEARCH PERFECT", embedId: "1_KvGjczv2g" },
    { name: "EVERYGREEN TALENT AGENCY", embedId: "1_KvGjczv2g" },
    { name: "FILTERED QUOTES", embedId: "MUBj3wFMOvU" },
    { name: "BRAISHFIELD", embedId: "0_-rbjLaE60" },
    { name: "AGENCY TOOLCHEST", embedId: "Cfa7bsE5grs" },
    { name: "SMARKETING", embedId: "LZ5Z6lMOC84" },
    { name: "HAGERTY", embedId: "q4kAc9UHaXw" },
    { name: "EOS", embedId: "wkPKGCTio2k" },
    { name: "TOP TIER RECRUITING", embedId: "gnCLRzKgRNw" },
    { name: "AMERICAN INTEGRITY", embedId: "vIyGxtvCcto" },
    { name: "PERFORMOLOGY", embedId: "sV5NlFuFaCc" },
    { name: "EMBRACE PET INSURANCE", embedId: "gXiTSNMAzgQ" },
    { name: "POST PROS", embedId: "_mLcM6aXGno" },
    { name: "DESTINY RESCUE", embedId: "eiJuHioRR6Q" },
    { name: "QUOTE NERDS", embedId: "dqshvPjGD0U" },
    { name: "COVER DESK", embedId: "KIsbPgEOeEc" },
  ];

  const videoObjectSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "2025 Formula Forum Partner Podcast Episodes",
    "numberOfItems": podcasts.length,
    "itemListElement": podcasts.map((podcast, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "VideoObject",
        "name": `${podcast.name} — Formula Forum 2025 Partner Podcast`,
        "description": `Podcast episode featuring ${podcast.name}, a Formula Forum 2025 partner.`,
        "thumbnailUrl": `https://img.youtube.com/vi/${podcast.embedId}/hqdefault.jpg`,
        "embedUrl": `https://www.youtube.com/embed/${podcast.embedId}`,
        "uploadDate": "2025-10-01",
        "publisher": {
          "@type": "Organization",
          "name": "Formula Forum",
          "url": "https://f3florida.com"
        }
      }
    }))
  };

  return (
    <div className="min-h-screen bg-black">
      <SEO title={title} description={description} path="/2025partners" />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(videoObjectSchema)}
        </script>
      </Helmet>
      <UndefinedNavigation />
      
      <section className="pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white text-center mb-16">HEAR FROM OUR 2025 FORMULA PARTNERS</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {podcasts.map((podcast, index) => (
              <div
                key={`${podcast.embedId}-${index}`}
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
