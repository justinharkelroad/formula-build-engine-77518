import PassTypeDialog from "@/components/PassTypeDialog";

const FinalCTA = () => {
  const handleScrollToCheckout = () => {
    const checkoutElement = document.getElementById('checkout');
    if (checkoutElement) {
      checkoutElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="checkout" className="py-20 bg-gradient-primary text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Crack the Code?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join ambitious agency owners and team members who refuse to settle for average results.
          </p>
          <div className="flex justify-center">
            <PassTypeDialog />
          </div>
          <div className="mt-8 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-white/80">
              Questions? Call 260-515-1349 or email Gregg@f3florida.com
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;