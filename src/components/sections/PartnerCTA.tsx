import { Button } from "@/components/ui/button";

const PartnerCTA = () => {
  return (
    <section className="py-20 bg-gradient-secondary text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Lock Your Spot Before They're Gone
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Partnership opportunities are limited and fill up fast. Secure your position as an F³ industry leader today.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button 
              variant="secondary"
              size="xl"
              className="w-full md:w-auto bg-white text-foreground hover:bg-white/90"
              onClick={() => window.location.href = 'mailto:gregg@f3florida.com'}
            >
              I Have Questions →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerCTA;