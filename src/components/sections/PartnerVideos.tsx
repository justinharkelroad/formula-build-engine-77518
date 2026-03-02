import { AspectRatio } from "@/components/ui/aspect-ratio";

const PartnerVideos = () => {
  const videos = [
    {
      url: "https://youtu.be/FlM2ZQ_FVwQ",
      company: "RICOCHET"
    },
    {
      url: "https://youtu.be/tox1dLwKnPM",
      company: "MEDIA ALPHA"
    },
    {
      url: "https://youtu.be/CjbFq-S9YgQ",
      company: "DISRUPTR"
    },
    {
      url: "https://youtu.be/cUv3cp19CRQ",
      company: "TEAM HIRED"
    },
    {
      url: "https://youtu.be/1_KvGjczv2g",
      company: "SEARCH PERFECT"
    },
    {
      url: "https://youtu.be/n49BfH5Hg3Q",
      company: "EVERGREEN TALENT AGENCY"
    },
    {
      url: "https://youtu.be/MUBj3wFMOvU",
      company: "FILTERED QUOTES"
    },
    {
      url: "https://youtu.be/0_-rbjLaE60",
      company: "BRAISHFIELD ASSOCIATES"
    },
    {
      url: "https://youtu.be/dqshvPjGD0U",
      company: "QUOTE NERDS"
    },
    {
      url: "https://youtu.be/KIsbPgEOeEc",
      company: "COVER DESK"
    },
    {
      url: "https://youtu.be/Cfa7bsE5grs",
      company: "AGENCY TOOL CHEST"
    },
    {
      url: "https://youtu.be/LZ5Z6lMOC84",
      company: "SMARKETING"
    },
    {
      url: "https://youtu.be/q4kAc9UHaXw",
      company: "HAGERTY"
    },
    {
      url: "https://youtu.be/gnCLRzKgRNw",
      company: "TOP TIER RECRUITING AND CONSULTING"
    },
    {
      url: "https://youtu.be/wkPKGCTio2k",
      company: "EOS"
    },
    {
      url: "https://youtu.be/sV5NlFuFaCc",
      company: "PERFORMOLOGY"
    },
    {
      url: "https://youtu.be/vIyGxtvCcto",
      company: "AMERICAN INTEGRITY INSURANCE"
    }
  ];

  const getEmbedUrl = (youtubeUrl: string) => {
    const videoId = youtubeUrl.split('/').pop()?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <section className="py-16 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent mb-4">
            See Our 2025 Partner Podcasts. We're excited for 2026.
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {videos.map((video, index) => (
            <div 
              key={index}
              className="group transform transition-all duration-300 hover:scale-105"
            >
              <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/10 hover:shadow-3xl hover:border-primary/20 transition-all duration-300">
                <div className="mb-4 overflow-hidden rounded-xl shadow-lg">
                  <AspectRatio ratio={16 / 9}>
                    <iframe
                      src={getEmbedUrl(video.url)}
                      title={`${video.company} Video`}
                      className="w-full h-full rounded-xl"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </AspectRatio>
                </div>
                <h3 className="text-xl font-bold text-center text-foreground tracking-wider">
                  {video.company}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Blinking marquee */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-primary/20 to-accent/20 rounded-full px-8 py-3 border border-primary/30">
            <span className="text-xl font-bold text-primary animate-pulse tracking-widest">
              MORE TO COME...
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerVideos;