import { useState } from "react";
import { Plus, Minus, Instagram, Facebook, Youtube, Linkedin } from "lucide-react";

const faqs = [
  {
    q: "How do I register for the conference?",
    a: "Use the registration button at the top or bottom of the page. You'll get instant confirmation, calendar files, and your printed Book of Formulas reserved at the door. Group rates of 20% off kick in at 5 seats — email Gregg@f3florida.com for the code."
  },
  {
    q: "Will sessions be recorded or available afterward?",
    a: "No. For privacy and full peer-to-peer honesty in breakouts, Formula Forum is not recorded. The Book of Formulas captures the action maps from every speaker so you walk out with what to install."
  },
  {
    q: "How do I book the hotel room block?",
    a: "Use the JW Marriott Bonnet Creek booking link on the Venue page or call +1 (407) 390-5000 with code F3-2026. Group rate $239/night. Cut-off: September 15, 2026."
  }
];

const FAQBlock = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-black text-white">
      <div className="grid md:grid-cols-2 min-h-[600px]">
        {/* LEFT — image with dark overlay */}
        <div
          className="relative px-5 md:px-16 py-16 md:py-24 flex flex-col justify-between"
          style={{
            backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.85)), url(/lovable-uploads/DSC09669.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div>
            <div className="eyebrow mb-8">ANSWERS</div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight max-w-md mb-6">
              What attendees ask before they book — popular questions answered up front.
            </h2>
            <p className="text-white/70 text-base mb-8 max-w-md">
              Want to learn more about the event and have a specific question? Submit your question and we'll respond within one business day.
            </p>
            <a
              href="mailto:info@f3florida.com"
              className="text-sm text-white/60 underline hover:text-white"
            >
              contact: info@f3florida.com
            </a>
          </div>

          <div className="flex items-center justify-between mt-10">
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition">←</button>
              <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition">→</button>
            </div>
            <div className="text-xs tracking-widest uppercase text-white/50 flex items-center gap-4">
              MORE ON SOCIAL MEDIA
              <span className="flex items-center gap-3">
                <Instagram className="w-4 h-4" />
                <Facebook className="w-4 h-4" />
                <Youtube className="w-4 h-4" />
                <Linkedin className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — accordion */}
        <div className="px-5 md:px-12 py-12 md:py-24 bg-black">
          <div className="space-y-0">
            {faqs.map((f, i) => {
              const open = openIndex === i;
              return (
                <div key={i} className="bold-row !py-0">
                  <button
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="w-full flex items-center justify-between py-6 text-left group"
                  >
                    <span className="text-lg md:text-xl font-semibold pr-4 group-hover:text-white/90">
                      {f.q}
                    </span>
                    <span className="shrink-0 w-9 h-9 rounded-full border border-white/30 flex items-center justify-center group-hover:border-white">
                      {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  {open && (
                    <div className="pb-6 text-white/65 leading-relaxed pr-12">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQBlock;
