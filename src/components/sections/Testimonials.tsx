import { Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      quote: "F³ gave me a step-by-step plan to 2× my book in six months.",
      name: "Kory H., $16M Agency Owner"
    },
    {
      quote: "Best networking ROI of any conference I've attended.",
      name: "Lisa P., Allstate Agency, Tampa"
    }
  ];

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          What Past Participants Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-sm">
              <Quote className="text-primary mb-4" size={32} />
              <blockquote className="text-lg text-foreground mb-6 italic">
                "{testimonial.quote}"
              </blockquote>
              <cite className="text-muted-foreground font-medium">
                — {testimonial.name}
              </cite>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;