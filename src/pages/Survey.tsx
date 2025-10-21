import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const Survey = () => {
  return (
    <>
      <SEO 
        title="Formula Forum Survey | Share Your Feedback"
        description="Help us make Formula Forum even better. Share your feedback and insights about the insurance agency growth conference."
        path="/survey"
      />
      
      <Navigation />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section with background orbs */}
        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
            <div className="hero-bg absolute inset-0"></div>
            <div className="hero-orb hero-orb-primary animate-float-slower absolute -top-40 -left-32 h-[28rem] w-[28rem]"></div>
            <div className="hero-orb hero-orb-accent animate-float-slow absolute -bottom-40 -right-24 h-[30rem] w-[30rem]"></div>
            <div className="hero-orb hero-orb-secondary animate-float-slower absolute top-1/3 -left-10 h-[22rem] w-[22rem]"></div>
          </div>
          <div className="relative z-10 container mx-auto px-4">
            <div className="max-w-5xl mx-auto py-14 md:py-20">
              <header className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                  We Want to Hear From You
                </h1>
                <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed">
                  Help us shape the future of Formula Forum
                </p>
              </header>

              {/* YouTube Video */}
              <div className="mb-12">
                <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.youtube.com/embed/vwM2BwNW_MQ"
                    title="Formula Forum Survey Introduction"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </AspectRatio>
              </div>

              {/* Jotform Embed */}
              <div className="bg-card rounded-lg shadow-lg p-4 md:p-8">
                <iframe
                  id="JotFormIFrame-252925974335164"
                  title="FORMULA SURVEY"
                  onLoad={() => window.parent.scrollTo(0, 0)}
                  allow="geolocation; microphone; camera; fullscreen; payment"
                  src="https://form.jotform.com/252925974335164"
                  style={{
                    minWidth: '100%',
                    maxWidth: '100%',
                    height: '539px',
                    border: 'none'
                  }}
                  scrolling="no"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Jotform Scripts */}
      <script src='https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js'></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.jotformEmbedHandler("iframe[id='JotFormIFrame-252925974335164']", "https://form.jotform.com/")`
        }}
      />
    </>
  );
};

export default Survey;
