import { CheckCircle } from "lucide-react";
import { ACCESS_PASS_BENEFITS } from "@/config/benefits";

const WhatsIncluded = () => {
  const checklist = ACCESS_PASS_BENEFITS;

  return (
    <section className="py-16 bg-gradient-to-br from-background via-background to-accent/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/20 rounded-full blur-2xl opacity-30"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Your Ticket Includes
        </h2>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Benefits List */}
            <div className="bg-card/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-primary/10">
              <div className="space-y-6">
                {checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 group">
                    <div className="relative">
                      <CheckCircle className="text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-200" size={24} />
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    <p className="text-lg font-semibold text-card-foreground tracking-wide">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Playbook Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                 <img 
                   src="/lovable-uploads/13190d3e-be9d-4836-9991-e7cee56f7509.png" 
                   alt="F³ Formula Forum 2026 Book of Formulas Playbook — comprehensive guide for insurance agency growth"
                   className="relative z-10 max-w-sm w-full h-auto rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                   loading="lazy"
                   width="400"
                   height="600"
                 />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsIncluded;