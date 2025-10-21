import { CheckCircle } from "lucide-react";

const AgendaAtGlance = () => {
  const agendaItems = [
    "Growth frameworks workshop (build your Q4 plan at the table)",
    "Sales systems to increase policies per producer", 
    "Printed Formula Playbook (Must be in seat to receive end of last session)",
    "Leadership & culture sessions",
    "Technology & process roundtables"
  ];

  return (
    <section id="agenda" className="py-16 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-16 text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Agenda at a Glance
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-card/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-primary/10">
            <div className="space-y-6">
              {agendaItems.map((item, index) => (
                <div key={index} className="flex items-start gap-4 group">
                  <div className="relative mt-1">
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
        </div>
      </div>
    </section>
  );
};

export default AgendaAtGlance;