import { Badge } from "@/components/ui/badge";

const Speakers = () => {
  const speakers = [
    {
      id: 1,
      name: "Garrett J. White",
      company: "Wake Up Warrior",
      image: "/lovable-uploads/e7001560-ab55-4bbb-a9f2-3ffdbe744145.png",
      isKeynote: true,
      socialUrl: "https://www.instagram.com/garrettjwhite/",
      platform: "Instagram"
    },
    {
      id: 2,
      name: "Gregg Blanchard",
      company: "Allstate Insurance",
      image: "/lovable-uploads/485a0b40-a683-463c-9ed8-d71005e4298b.png",
      socialUrl: "https://www.facebook.com/gregg.blanchard.3",
      platform: "Facebook"
    },
    {
      id: 3,
      name: "Vlad Cherchenko",
      company: "Insurance Sales Lab",
      image: "/lovable-uploads/12460175-11b3-44a7-9ec2-b3fc0cc11789.png",
      socialUrl: "https://www.instagram.com/insurance_sales_lab",
      platform: "Instagram"
    },
    {
      id: 4,
      name: "Kelly Spicer",
      company: "Allstate Insurance",
      image: "/lovable-uploads/63f4f7e0-e7aa-4473-8d7d-fd126c7fd53e.png",
      socialUrl: "https://www.facebook.com/kellywoodwall",
      platform: "Facebook"
    },
    {
      id: 5,
      name: "Nicholas Sakha",
      company: "Allstate Insurance",
      image: "/lovable-uploads/4e9ba863-26db-49bc-9ddf-cc06693a66f2.png",
      socialUrl: "https://www.instagram.com/nicksakha/",
      platform: "Instagram"
    },
    {
      id: 6,
      name: "Joe Marranucci",
      company: "Walk on Ventures",
      image: "/lovable-uploads/33c903d8-a8ee-4644-91a7-76db4143f1db.png",
      socialUrl: "https://www.instagram.com/joe.marinucci/",
      platform: "Instagram"
    },
    {
      id: 7,
      name: "David Williams",
      company: "Team Hired",
      image: "/lovable-uploads/38c49db9-f1b6-4536-82cd-fa43cb81dd08.png",
      socialUrl: "https://www.instagram.com/davidwilliamsverified/",
      platform: "Instagram"
    },
    {
      id: 8,
      name: "Jeremy Fitzsimmons",
      company: "Allstate Insurance",
      image: "/lovable-uploads/ac8d2650-ff78-4b21-b3f3-8786a6fcbd0f.png",
      socialUrl: "https://www.facebook.com/jeremy.fitzsimmons.96",
      platform: "Facebook"
    },
    {
      id: 9,
      name: "Ben Berman",
      company: "EOS",
      image: "/lovable-uploads/97b2f5df-e485-4a04-948d-5481f5656b3c.png",
      socialUrl: "https://www.linkedin.com/in/createaselfmanagingbusiness/",
      platform: "LinkedIn"
    },
    {
      id: 10,
      name: "Yandi Eirea",
      company: "Allstate Insurance",
      image: "/lovable-uploads/04167dbb-874e-44f6-b2ba-04e989588679.png",
      socialUrl: "https://www.facebook.com/YandiEirea",
      platform: "Facebook"
    },
    {
      id: 11,
      name: "Justin Harkelroad",
      company: "Standard Playbook",
      image: "/lovable-uploads/76a8b14e-bd41-4c58-862d-344b2b6729db.png",
      socialUrl: "https://www.instagram.com/justinharkelroad/",
      platform: "Instagram"
    },
    {
      id: 12,
      name: "Rob McAfee",
      company: "Farmers Insurance",
      image: "/lovable-uploads/62071b87-4ef3-40ac-b511-88ce8443bcf2.png",
      socialUrl: "https://www.instagram.com/robdoesinsurance",
      platform: "Instagram"
    }
  ];

  const keynote = speakers.find((s) => s.isKeynote);

  return (
    <section className="py-16 bg-gradient-to-br from-background via-accent/5 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-2xl opacity-30"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Speakers that promise to give you{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                actionable takeaways
              </span>{" "}
              for immediate implementation
            </h2>
          </div>
          <div className="flex items-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Each one of these elite speakers will deliver training on specific topics they specialize in. 
              But not only that, they will also be supplying full action maps inside our Formula Playbook 
              you will leave with for quick and precise installment into your agency processes.
            </p>
          </div>
        </div>

        {/* Keynote Speaker */}
        {keynote && (
          <article className="mb-12 relative overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 pointer-events-none" aria-hidden></div>
            <div className="relative grid md:grid-cols-[320px,1fr] gap-6 p-6 md:p-8 items-center">
              <div>
                <div className="rounded-xl p-1 bg-gradient-to-r from-primary to-accent shadow-lg">
                  <img
                    src={keynote.image}
                    alt="Garrett J. White — Wake Up Warrior, Formula Forum 2025 speaker"
                    className="w-full aspect-square object-cover rounded-lg"
                    loading="lazy"
                  />
                </div>
              </div>
              <div>
                <Badge variant="secondary" className="mb-3">Keynote Speaker</Badge>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">Garrett J. White</h3>
                <p className="text-sm uppercase tracking-wide text-muted-foreground">Wake Up Warrior</p>
                <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                  Garrett J. White is the founder of the Wake Up Warrior Movement, bestselling author of Warrior Book, and creator of transformational experiences like Warrior Week. He rebuilt his life on principles of accountability, authenticity, and relentless self-leadership—and now challenges others to do the same.
                </p>
                {keynote.socialUrl && (
                  <a
                    href={keynote.socialUrl}
                    target="_blank"
                    rel="nofollow noopener"
                    className="inline-block mt-3 text-sm text-primary hover:text-primary/80 underline"
                  >
                    Follow on {keynote.platform}
                  </a>
                )}
              </div>
            </div>
          </article>
        )}

        {/* Speakers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {speakers.filter((s) => !s.isKeynote).map((speaker) => (
            <div key={speaker.id} className="group">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-card rounded-2xl p-1 shadow-lg">
                  <img
                    src={speaker.image}
                    alt={`${speaker.name} — ${speaker.company}, Formula Forum 2025 speaker`}
                    className="w-full aspect-square object-cover rounded-xl"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-1">{speaker.name}</h3>
                {speaker.company && (
                  <p className="text-sm text-muted-foreground mb-2">{speaker.company}</p>
                )}
                {speaker.socialUrl && (
                  <a
                    href={speaker.socialUrl}
                    target="_blank"
                    rel="nofollow noopener"
                    className="text-xs text-primary hover:text-primary/80 underline"
                  >
                    {speaker.platform}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Speakers;