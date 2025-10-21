import HeroSection from "@/components/sections/HeroSection";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";

const Index = () => {
  const title = "Formula Forum 2025 | Insurance Agency Growth Conference | Orlando Oct 15–17";
  const description = "Insurance Agency Growth Conference in Orlando. Oct 15–17, 2025 at JW Marriott Bonnet Creek. Workshops, breakouts, and a 90-day growth plan.";
  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} path="/" />
      <StructuredData page="home" />
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div className="hero-bg absolute inset-0"></div>
          <div className="hero-orb hero-orb-primary animate-float-slower absolute -top-40 -left-32 h-[28rem] w-[28rem]"></div>
          <div className="hero-orb hero-orb-accent animate-float-slow absolute -bottom-40 -right-24 h-[30rem] w-[30rem]"></div>
          <div className="hero-orb hero-orb-secondary animate-float-slower absolute top-1/3 -left-10 h-[22rem] w-[22rem]"></div>
        </div>
        <div className="relative z-10">
          <HeroSection />
        </div>
      </section>
    </div>
  );
};

export default Index;