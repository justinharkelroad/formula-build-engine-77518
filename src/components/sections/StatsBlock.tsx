const StatsBlock = () => {
  return (
    <section className="bg-[hsl(0,0%,96%)] text-[hsl(0,0%,8%)] py-24 px-6 md:px-12 border-t border-black/10">
      <div className="container mx-auto max-w-7xl">
        <div className="eyebrow text-black mb-8">ABOUT US</div>

        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div />
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            We continuously expand the playbook —<br />
            by gathering the operators actually<br />
            installing what they teach.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* 20+ */}
          <div className="brand-block-blue p-10 md:p-12 flex flex-col justify-between min-h-[280px]">
            <div className="display-bold text-[28vw] md:text-[14vw] lg:text-[10vw] leading-none">20+</div>
            <div>
              <div className="text-xl font-bold mb-2">Operator-led sessions</div>
              <p className="text-white/85 leading-relaxed mb-4 max-w-md">
                Speakers who run real agencies and real software companies — every session is something they've already installed.
              </p>
              <a href="#schedule" className="text-sm text-white underline">Read descriptions ↗</a>
            </div>
          </div>

          {/* 600+ */}
          <div className="brand-block-blue p-10 md:p-12 flex flex-col justify-between min-h-[280px]">
            <div className="display-bold text-[28vw] md:text-[14vw] lg:text-[10vw] leading-none">600+</div>
            <div>
              <div className="text-xl font-bold mb-2">Agency owners in the room</div>
              <p className="text-white/85 leading-relaxed">
                1.5 days of peer-to-peer growth with owners across the country — the network is the second product you buy.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-8 text-sm text-black/60">
          <p>
            We continuously strive to expand our reach by inviting well-known and experienced operators connecting with new audiences.
          </p>
          <div className="flex items-center justify-between gap-4">
            <a href="#schedule" className="uppercase tracking-widest text-xs hover:text-black">VIEW NEXT STEP TOWARD SUCCESS →</a>
            <a href="/pricing" className="uppercase tracking-widest text-xs hover:text-black">REGISTER UPDATED EMAIL →</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsBlock;
