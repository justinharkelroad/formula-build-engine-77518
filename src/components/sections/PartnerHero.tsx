const PartnerHero = () => {
  return (
    <section className="relative bg-black text-white overflow-hidden pt-28 pb-12 md:pt-40 md:pb-20">
      {/* subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hero-orb hero-orb-secondary absolute top-1/3 -left-32 w-[500px] h-[500px]" />
        <div className="hero-orb hero-orb-primary absolute bottom-0 right-0 w-[400px] h-[400px] opacity-40" />
      </div>

      <div className="relative z-10 container mx-auto px-5 md:px-12">
        {/* MEGA HEADLINE */}
        <h1 className="display-bold text-[clamp(3.25rem,14vw,10rem)] md:text-[12vw] lg:text-[10vw] mb-8 break-words">
          THANK<br />YOU<br /><span className="display-outline">PARTNERS</span>
        </h1>

        {/* Meta pills + intro grid */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 mt-10 md:mt-16">
          {/* This year's partner recognition */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              <span className="meta-pill meta-pill-solid">FORMULA FORUM 2026</span>
              <span className="meta-pill meta-pill-dot">OUR PARTNERS</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="meta-pill">THANK YOU FOR YOUR SUPPORT</span>
            </div>
          </div>

          {/* Right — intro copy */}
          <div>
            <div className="text-2xl md:text-3xl font-bold leading-tight mb-6">
              You help make Formula possible.
            </div>
            <p className="text-lg text-white/85 leading-relaxed">
              Thank you to every partner and sponsor supporting Formula Forum 2026.
              Your support brings our agency community together in Orlando and helps
              make this year's event possible. We're grateful to have you with us.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerHero;
