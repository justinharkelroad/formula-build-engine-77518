import { AspectRatio } from "@/components/ui/aspect-ratio";

const videos = [
  { url: "https://youtu.be/FlM2ZQ_FVwQ", company: "RICOCHET" },
  { url: "https://youtu.be/tox1dLwKnPM", company: "MEDIA ALPHA" },
  { url: "https://youtu.be/CjbFq-S9YgQ", company: "DISRUPTR" },
  { url: "https://youtu.be/cUv3cp19CRQ", company: "TEAM HIRED" },
  { url: "https://youtu.be/1_KvGjczv2g", company: "SEARCH PERFECT" },
  { url: "https://youtu.be/n49BfH5Hg3Q", company: "EVERGREEN TALENT AGENCY" },
  { url: "https://youtu.be/MUBj3wFMOvU", company: "FILTERED QUOTES" },
  { url: "https://youtu.be/0_-rbjLaE60", company: "BRAISHFIELD ASSOCIATES" },
  { url: "https://youtu.be/dqshvPjGD0U", company: "QUOTE NERDS" },
  { url: "https://youtu.be/KIsbPgEOeEc", company: "COVER DESK" },
  { url: "https://youtu.be/Cfa7bsE5grs", company: "AGENCY TOOL CHEST" },
  { url: "https://youtu.be/LZ5Z6lMOC84", company: "SMARKETING" },
  { url: "https://youtu.be/q4kAc9UHaXw", company: "HAGERTY" },
  { url: "https://youtu.be/gnCLRzKgRNw", company: "TOP TIER RECRUITING" },
  { url: "https://youtu.be/wkPKGCTio2k", company: "EOS" },
  { url: "https://youtu.be/sV5NlFuFaCc", company: "PERFORMOLOGY" },
  { url: "https://youtu.be/vIyGxtvCcto", company: "AMERICAN INTEGRITY INSURANCE" },
  { url: "https://youtu.be/_mLcM6aXGno", company: "POST PROS" },
  { url: "https://youtu.be/gXiTSNMAzgQ", company: "EMBRACE PET INSURANCE" },
  { url: "https://youtu.be/eiJuHioRR6Q", company: "DESTINY RESCUE" }
];

const getEmbedUrl = (youtubeUrl: string) => {
  const videoId = youtubeUrl.split("/").pop()?.split("?")[0];
  return `https://www.youtube.com/embed/${videoId}`;
};

const PartnerVideos = () => {
  return (
    <section className="bg-[hsl(0,0%,96%)] text-[hsl(0,0%,8%)] py-20 md:py-28 px-5 md:px-12">
      <div className="container mx-auto max-w-7xl">
        <div className="eyebrow text-black mb-8">2025 PARTNER PODCASTS</div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-end mb-12 md:mb-16">
          <h2 className="display-bold text-[clamp(2.5rem,9vw,6rem)] md:text-[6vw] lg:text-[5vw] leading-[0.95] break-words">
            HEAR THEM<br />TELL IT
          </h2>
          <p className="text-base md:text-lg text-black/70 leading-relaxed max-w-md md:justify-self-end">
            Twenty 2025 partners on what they built, who they met, and what changed for their book of business after Orlando.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((v, i) => (
            <div
              key={i}
              className="bg-white border border-black/5 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
            >
              <AspectRatio ratio={16 / 9}>
                <iframe
                  src={getEmbedUrl(v.url)}
                  title={`${v.company} podcast`}
                  className="w-full h-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </AspectRatio>
              <div className="p-5">
                <div className="text-xs tracking-widest uppercase text-black/40 mb-1">PARTNER</div>
                <div className="font-bold text-base md:text-lg">{v.company}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-xs tracking-widest uppercase text-black/40 text-center">
          ◆ More partner stories on the way
        </div>
      </div>
    </section>
  );
};

export default PartnerVideos;
