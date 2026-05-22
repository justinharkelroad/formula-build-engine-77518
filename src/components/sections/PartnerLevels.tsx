import { ArrowUpRight, Check } from "lucide-react";

type Tier = {
  name: string;
  price: string;
  blurb: string;
  link?: string;
  benefits: string[];
  variant: "platinum" | "gold" | "silver" | "bronze";
  soldOut?: boolean;
};

const tiers: Tier[] = [
  {
    name: "Platinum",
    price: "$15,000",
    blurb: "Top-tier visibility. Co-branding on the welcome reception, stage time, and lead access before doors open.",
    link: "https://buy.stripe.com/28EaEXdsvebk1wAbX23wQ0d",
    variant: "platinum",
    soldOut: true,
    benefits: [
      "Two 6-ft tables in PLATINUM location",
      "Co-branding: Welcome Reception & Thursday-Night Event",
      "8 full-access passes",
      "5-min live stage slot during a General Session",
      "1-on-1 video-podcast interview + full email & social promo",
      "30-sec silent video ad on General Session break screens",
      "30-sec video loop in partnership room & hallways",
      "Attendee lead list 3 days pre-event + email blast",
      "For You Page banner + VIP placement in mobile app",
      "2 Participant Access Passes into General Session"
    ]
  },
  {
    name: "Gold",
    price: "$10,000",
    blurb: "Breakfast & lunch co-branding, on-stage call-out, and a featured podcast spot.",
    link: "https://buy.stripe.com/8x2bJ1corffob7a0ek3wQ0e",
    variant: "gold",
    benefits: [
      "Two 6-ft tables in GOLD location",
      "Co-branding option: Breakfast & Lunch",
      "6 full-access passes",
      "On-stage verbal shout-out during General Session",
      "1-on-1 video-podcast promotion",
      "30-sec silent video ad on General Session break screens",
      "30-sec hallway/partnership-room video loop",
      "Lead list 1 day pre-event",
      "VIP listing in mobile app",
      "1 Participant Access Pass into General Session"
    ]
  },
  {
    name: "Silver",
    price: "$7,500",
    blurb: "Solid booth presence, voice call-out, and post-event lead delivery.",
    link: "https://buy.stripe.com/bJeeVd0FJd7gb7a5yE3wQ02",
    variant: "silver",
    benefits: [
      "One 6-ft table booth in SILVER location",
      "4 full-access passes",
      "General Session voice call-out",
      "1-on-1 video-podcast promotion",
      "30-sec hallway/partnership-room video loop",
      "Lead list 2 days post-event",
      "Standard listing in mobile app",
      "1 Participant Access Pass into General Session"
    ]
  },
  {
    name: "Bronze",
    price: "$5,000",
    blurb: "Entry point into the room — booth + podcast + branded post-event content bundle.",
    link: "https://buy.stripe.com/14A28r9cf5EO0swaSY3wQ03",
    variant: "bronze",
    benefits: [
      "One 6-ft table booth in BRONZE location",
      "2 full-access passes",
      "1-on-1 video-podcast promotion",
      "30-sec hallway/partnership-room video loop",
      "Lead list 10 days post-event",
      "Standard listing in mobile app",
      "Post-event photo/video bundle with branding",
      "1 Participant Access Pass into General Session"
    ]
  }
];

const variantStyles: Record<Tier["variant"], { card: string; text: string; chip: string; cta: string }> = {
  platinum: {
    card: "bg-white text-black",
    text: "text-black/70",
    chip: "bg-black text-white",
    cta: "bg-black text-white hover:bg-[hsl(var(--secondary))]"
  },
  gold: {
    card: "brand-block-blue text-white",
    text: "text-white/85",
    chip: "bg-white text-[hsl(var(--secondary))]",
    cta: "bg-white text-black hover:bg-black hover:text-white"
  },
  silver: {
    card: "bg-[hsl(0,0%,10%)] text-white border border-white/15",
    text: "text-white/70",
    chip: "bg-white text-black",
    cta: "bg-white text-black hover:bg-[hsl(var(--secondary))] hover:text-white"
  },
  bronze: {
    card: "bg-[hsl(0,0%,10%)] text-white border border-white/15",
    text: "text-white/70",
    chip: "bg-[hsl(var(--primary))] text-white",
    cta: "bg-[hsl(var(--primary))] text-white hover:bg-white hover:text-black"
  }
};

const PartnerLevels = () => {
  return (
    <section id="levels" className="bg-black text-white py-20 md:py-28 px-5 md:px-12">
      <div className="container mx-auto max-w-7xl">
        <div className="eyebrow mb-8">PARTNERSHIP LEVELS</div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-end mb-12 md:mb-16">
          <h2 className="display-bold text-[clamp(2.75rem,11vw,7rem)] md:text-[8vw] lg:text-[6vw] leading-[0.9] break-words">
            CHOOSE<br />YOUR LEVEL
          </h2>
          <p className="text-lg text-white/70 leading-relaxed max-w-md md:justify-self-end">
            Four tiers, each with stage, podcast, lead list, and booth placement weighted to your investment. Pick the one that fits your goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {tiers.map((t) => {
            const v = variantStyles[t.variant];
            return (
              <div
                key={t.name}
                className={`${v.card} relative overflow-hidden rounded-2xl md:rounded-3xl p-7 md:p-10 flex flex-col`}
              >
                {/* SOLD OUT corner ribbon — celebratory, brand orange */}
                {t.soldOut && (
                  <div className="pointer-events-none absolute right-0 top-0 z-20 h-32 w-32 overflow-hidden md:h-36 md:w-36">
                    <div className="absolute right-[-58px] top-[28px] w-[220px] rotate-45 bg-[hsl(var(--primary))] py-2 text-center text-sm font-black uppercase tracking-[0.35em] text-white shadow-lg md:top-[32px]">
                      Sold Out
                    </div>
                  </div>
                )}

                {/* Top — name + price */}
                <div className="flex items-start justify-between mb-2">
                  <div className="text-xs tracking-widest uppercase opacity-60">
                    {t.name.toUpperCase()}
                  </div>
                  {!t.soldOut && (
                    <span className={`${v.chip} text-xs tracking-widest uppercase px-2.5 py-1 rounded-full`}>
                      {t.name.toUpperCase()} TIER
                    </span>
                  )}
                </div>
                <div className="display-bold text-5xl sm:text-6xl md:text-7xl leading-none mb-4">
                  {t.price}
                </div>
                <p className={`${v.text} leading-relaxed mb-6`}>{t.blurb}</p>

                {/* Benefits list */}
                <ul className="space-y-2.5 mb-8">
                  {t.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA — sold-out tiers get a big celebratory block instead of a purchase button */}
                {t.soldOut ? (
                  <div className="mt-auto w-full">
                    <div
                      aria-disabled="true"
                      className="relative w-full overflow-hidden rounded-full bg-[hsl(var(--primary))] px-6 py-5 text-center"
                    >
                      <span className="relative z-10 block text-2xl font-black uppercase tracking-[0.2em] text-white md:text-3xl">
                        Sold Out
                      </span>
                      <span className="pointer-events-none absolute inset-0 z-0 animate-pulse bg-white/15" />
                    </div>
                    <p className="mt-3 text-center text-sm font-bold text-black/70">
                      Platinum is officially gone — thank you, partners! 🎉
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (t.link) window.open(t.link, "_blank");
                      else window.location.href = "/contact";
                    }}
                    className={`${v.cta} mt-auto inline-flex items-center justify-between w-full px-6 py-4 rounded-full font-bold transition-colors`}
                  >
                    <span>LOCK IN {t.name.toUpperCase()}</span>
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-xs tracking-widest uppercase text-white/40 text-center">
          ◆ Questions? <a href="mailto:Gregg@f3florida.com" className="text-white underline">Gregg@f3florida.com</a>
        </div>
      </div>
    </section>
  );
};

export default PartnerLevels;
