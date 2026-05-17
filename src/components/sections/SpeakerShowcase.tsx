const SpeakerShowcase = () => {
  return (
    <section className="bg-[hsl(0,0%,96%)] text-[hsl(0,0%,8%)] py-24 px-6 md:px-12">
      <div className="container mx-auto max-w-7xl">
        <div className="eyebrow text-black mb-8">SESSION LEADER</div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* LEFT — bio */}
          <div>
            <div className="text-xs tracking-widest uppercase text-black/40 mb-4">TITLE</div>
            <h2 className="display-bold text-[18vw] md:text-[10vw] lg:text-[8vw] mb-8">
              SPEAKER<span className="text-[hsl(var(--secondary))]">—</span>
            </h2>

            <h3 className="text-2xl font-bold mb-3">Garrett J. White</h3>
            <p className="text-black/70 leading-relaxed mb-6">
              Founder of the Wake Up Warrior Movement, bestselling author of <em>Warrior Book</em>, and creator of transformational experiences like Warrior Week. Garrett rebuilt his life on accountability, authenticity, and relentless self-leadership — and now challenges others to do the same.
            </p>
            <p className="text-black/70 leading-relaxed mb-8">
              At Formula Forum 2026, Garrett delivers the keynote address, setting the tone for 1.5 days of tactical growth, radical ownership, and breakthrough performance.
            </p>

            <div className="border-t border-black/10 pt-6">
              <div className="text-xs tracking-widest uppercase text-black/40 mb-2">TOPIC</div>
              <div className="text-lg font-semibold">
                Keynote: Accountability, Authenticity &amp; Relentless Self-Leadership
              </div>
            </div>
          </div>

          {/* RIGHT — large image */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] md:aspect-[4/5]">
            <img
              src="/lovable-uploads/troy-hawkes.png"
              alt="Formula Forum keynote speaker"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpeakerShowcase;
