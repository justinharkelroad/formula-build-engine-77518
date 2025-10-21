const BenefitsGrid = () => {
  const benefits = [
    { icon: "🔥", label: "Scalable Growth Strategy" },
    { icon: "🔐", label: "Rock-Solid Profit Systems" },
    { icon: "📈", label: "Brand Power & Equity" },
    { icon: "💥", label: "Purpose-Driven Leadership" }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          Why You Are Supposed To Be Here
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center p-6 rounded-lg bg-card shadow-sm hover:shadow-brand transition-shadow">
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="font-semibold text-lg text-card-foreground">
                {benefit.label}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsGrid;