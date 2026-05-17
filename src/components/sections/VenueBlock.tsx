import { CONFIG } from "@/config/event";
import { MapPin, ArrowUpRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const VenueBlock = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  return (
    <section
      id="venue"
      ref={ref}
      className="bg-[hsl(0,0%,96%)] text-[hsl(0,0%,8%)] py-20 md:py-24 px-5 md:px-12"
    >
      <div className="container mx-auto max-w-7xl">
        <div className={`eyebrow text-black mb-8 reveal-up ${isVisible ? "is-visible" : ""}`}>VENUE</div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* LEFT — copy */}
          <div className={`reveal-up delay-1 ${isVisible ? "is-visible" : ""}`}>
            <div className="text-xs tracking-widest uppercase text-black/40 mb-4">LOCATION</div>
            <h2 className="display-bold text-[clamp(3rem,16vw,8rem)] md:text-[10vw] lg:text-[8vw] mb-8 break-words">
              JW<br />MARRIOTT
            </h2>

            <h3 className="text-2xl font-bold mb-3">{CONFIG.VENUE_NAME}</h3>
            <p className="text-black/70 leading-relaxed mb-8">
              We are excited to announce that we are going back home to our official first location and making this an amazing tradition — bringing you all back down to experience this beautiful space.
            </p>

            <div className="border-t border-black/10 pt-6 mb-8">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[hsl(var(--secondary))] mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">{CONFIG.VENUE_STREET}</div>
                  <div className="text-black/60 text-sm">{CONFIG.CITY}, {CONFIG.STATE} {CONFIG.VENUE_POSTAL}</div>
                </div>
              </div>
            </div>

            <a
              href={CONFIG.HOTEL_BOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black text-white px-7 py-4 rounded-full font-bold hover:bg-[hsl(var(--secondary))] transition-colors"
            >
              SECURE YOUR DISCOUNTED ROOM
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* RIGHT — large image */}
          <div className={`relative rounded-2xl overflow-hidden aspect-[4/5] md:aspect-[4/5] shadow-2xl reveal-up delay-2 ${isVisible ? "is-visible" : ""}`}>
            <img
              src="/lovable-uploads/JW%20Marriot%20Pool.jpg"
              alt="JW Marriott Orlando Bonnet Creek — pool"
              className="w-full h-full object-cover animate-ken-burns"
              loading="lazy"
              width="800"
              height="1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default VenueBlock;
