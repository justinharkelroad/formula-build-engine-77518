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
      platform: "Instagram",
      topic: "Keynote: Accountability, Authenticity & Relentless Self-Leadership",
      bio: "Garrett J. White is the founder of the Wake Up Warrior Movement, bestselling author of Warrior Book, and creator of transformational experiences like Warrior Week. He rebuilt his life on principles of accountability, authenticity, and relentless self-leadership—and now challenges others to do the same. At Formula Forum 2026, Garrett delivers the keynote address, setting the tone for 1.5 days of tactical growth, radical ownership, and breakthrough performance."
    },
    {
      id: 2,
      name: "Gregg Blanchard",
      company: "Allstate Insurance",
      image: "/lovable-uploads/485a0b40-a683-463c-9ed8-d71005e4298b.png",
      socialUrl: "https://www.facebook.com/gregg.blanchard.3",
      platform: "Facebook",
      topic: "Streamline, Simplify, Scale — VA Systems That Work",
      bio: "Gregg Blanchard is a top-performing Allstate agency owner who has mastered the art of leveraging virtual assistant systems to scale operations without sacrificing service quality. His agency runs on systematized processes that free him to focus on growth rather than day-to-day tasks. At Formula Forum 2026, Gregg will share his proven VA integration playbook — from hiring and onboarding to daily workflows and KPI tracking — so agency owners and team members can immediately reduce overhead while increasing capacity."
    },
    {
      id: 3,
      name: "Vlad Cherchenko",
      company: "Insurance Sales Lab",
      image: "/lovable-uploads/12460175-11b3-44a7-9ec2-b3fc0cc11789.png",
      socialUrl: "https://www.instagram.com/insurance_sales_lab",
      platform: "Instagram",
      topic: "How To Scale Every Producer to $40k a Month",
      bio: "Vlad Cherchenko is the founder of Insurance Sales Lab, a coaching and training platform dedicated to helping insurance producers hit consistent five-figure monthly production. With years of hands-on experience training agents across multiple carriers, Vlad has developed repeatable systems for prospecting, closing, and retention. At Formula Forum 2026, he co-presents with Rob McAfee to deliver a tactical blueprint for scaling every producer on your team to $40,000 or more per month."
    },
    {
      id: 4,
      name: "Kelly Spicer",
      company: "Allstate Insurance",
      image: "/lovable-uploads/63f4f7e0-e7aa-4473-8d7d-fd126c7fd53e.png",
      socialUrl: "https://www.facebook.com/kellywoodwall",
      platform: "Facebook",
      topic: "Fixing the Disconnect — The Formula for EFS/Agency Success",
      bio: "Kelly Spicer is an accomplished Allstate agency owner who has cracked the code on integrating Exclusive Financial Specialists with agency operations. Many agencies struggle with the EFS relationship, but Kelly has built a system where both sides thrive. At Formula Forum 2026, she will break down the exact formula for aligning EFS and agency goals, improving communication, and driving mutual revenue growth."
    },
    {
      id: 5,
      name: "Nicholas Sakha",
      company: "Allstate Insurance",
      image: "/lovable-uploads/4e9ba863-26db-49bc-9ddf-cc06693a66f2.png",
      socialUrl: "https://www.instagram.com/nicksakha/",
      platform: "Instagram",
      topic: "The Referral Magnet Formula — Brand, Content, Community, Conversion",
      bio: "Nicholas Sakha is an Allstate agency owner who has built a referral engine that consistently generates warm leads through strategic brand building, content marketing, and community engagement. Rather than relying on purchased leads, Nicholas has developed a four-pillar system that turns existing clients and local connections into a steady stream of referrals. At Formula Forum 2026, he will walk through each pillar and show attendees how to build their own referral magnet."
    },
    {
      id: 6,
      name: "Joe Marranucci",
      company: "Walk on Ventures",
      image: "/lovable-uploads/33c903d8-a8ee-4644-91a7-76db4143f1db.png",
      socialUrl: "https://www.instagram.com/joe.marinucci/",
      platform: "Instagram",
      topic: "Creating and Keeping the Mindset of a CEO",
      bio: "Joe Marranucci is the founder of Walk on Ventures and a serial entrepreneur who has built and scaled multiple businesses. His expertise lies in the mental shift required to move from operator to true CEO — delegating effectively, thinking strategically, and maintaining resilience through growth challenges. At Formula Forum 2026, Joe will share the mindset frameworks and daily practices that separate agency owners and team members who plateau from those who break through to the next level."
    },
    {
      id: 7,
      name: "David Williams",
      company: "Team Hired",
      image: "/lovable-uploads/38c49db9-f1b6-4536-82cd-fa43cb81dd08.png",
      socialUrl: "https://www.instagram.com/davidwilliamsverified/",
      platform: "Instagram",
      topic: "The Five Pillars of a Thriving Life and Business",
      bio: "David Williams is the founder of Team Hired, a recruiting and talent development firm serving the insurance industry. With deep expertise in building high-performing teams, David knows that business success starts with personal alignment. At Formula Forum 2026, he will present his Five Pillars framework — covering health, relationships, purpose, finances, and leadership — showing agency owners and team members how to build a business that supports a thriving life, not one that consumes it."
    },
    {
      id: 8,
      name: "Jeremy Fitzsimmons",
      company: "Allstate Insurance",
      image: "/lovable-uploads/ac8d2650-ff78-4b21-b3f3-8786a6fcbd0f.png",
      socialUrl: "https://www.facebook.com/jeremy.fitzsimmons.96",
      platform: "Facebook",
      topic: "Breaking Free When You're Stuck and Out of Options",
      bio: "Jeremy Fitzsimmons is an Allstate agency owner who rebuilt his business from a point of near-failure. After hitting rock bottom operationally and personally, Jeremy developed a systematic approach to identifying what's actually broken, eliminating distractions, and executing a focused recovery plan. At Formula Forum 2026, he will share his raw story and the specific steps he took to turn things around — giving attendees a playbook for breaking through when they feel stuck."
    },
    {
      id: 9,
      name: "Ben Berman",
      company: "EOS",
      image: "/lovable-uploads/97b2f5df-e485-4a04-948d-5481f5656b3c.png",
      socialUrl: "https://www.linkedin.com/in/createaselfmanagingbusiness/",
      platform: "LinkedIn",
      topic: "From Running Behind to Leading Ahead with Clarity",
      bio: "Ben Berman is a certified EOS Implementer who helps business owners gain traction through the Entrepreneurial Operating System. He specializes in helping insurance agencies implement EOS to create organizational clarity, accountability, and healthy team dynamics. At Formula Forum 2026, Ben will show agency owners and team members how to stop running behind putting out fires and start leading ahead with a clear vision, aligned team, and predictable execution rhythm."
    },
    {
      id: 10,
      name: "Yandi Eirea",
      company: "Allstate Insurance",
      image: "/lovable-uploads/04167dbb-874e-44f6-b2ba-04e989588679.png",
      socialUrl: "https://www.facebook.com/YandiEirea",
      platform: "Facebook",
      topic: "The Agent's Oath — Protecting Families Before Profit",
      bio: "Yandi Eirea is an Allstate agency owner whose mission-driven approach to insurance has built a loyal client base and a thriving agency. She believes the best business strategy is genuine care — putting family protection ahead of premium volume. At Formula Forum 2026, Yandi will share how leading with purpose attracts better clients, reduces churn, and creates an agency culture that team members are proud to be part of."
    },
    {
      id: 11,
      name: "Justin Harkelroad",
      company: "Standard Playbook",
      image: "/lovable-uploads/76a8b14e-bd41-4c58-862d-344b2b6729db.png",
      socialUrl: "https://www.instagram.com/justinharkelroad/",
      platform: "Instagram",
      topic: "Scaling Your Capacity with AI",
      bio: "Justin Harkelroad is the founder of Standard Playbook, a platform helping insurance agencies implement AI tools to automate routine tasks and scale operations. As both an agency operator and technology builder, Justin understands the practical challenges of adopting new tools in a fast-moving industry. At Formula Forum 2026, he will demonstrate specific AI workflows that agencies can implement immediately — from automated follow-ups and policy reviews to AI-assisted prospecting and client communication."
    },
    {
      id: 12,
      name: "Rob McAfee",
      company: "Farmers Insurance",
      image: "/lovable-uploads/62071b87-4ef3-40ac-b511-88ce8443bcf2.png",
      socialUrl: "https://www.instagram.com/robdoesinsurance",
      platform: "Instagram",
      topic: "How To Scale Every Producer to $40k a Month",
      bio: "Rob McAfee is a Farmers Insurance agency owner and production specialist who has trained dozens of producers to hit consistent five-figure months. His approach combines tactical sales systems with accountability structures that keep producers on track week after week. At Formula Forum 2026, Rob co-presents with Vlad Cherchenko to deliver a step-by-step blueprint for scaling producer performance across your entire team."
    }
  ];

  const keynote = speakers.find((s) => s.isKeynote);
  const gridSpeakers = speakers.filter((s) => !s.isKeynote);

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
                    alt="Garrett J. White — Wake Up Warrior, Formula Forum 2026 keynote speaker"
                    className="w-full aspect-square object-cover rounded-lg"
                    loading="lazy"
                  />
                </div>
              </div>
              <div>
                <Badge variant="secondary" className="mb-3">Keynote Speaker</Badge>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">Garrett J. White</h3>
                <p className="text-sm uppercase tracking-wide text-muted-foreground">Wake Up Warrior</p>
                <p className="mt-2 text-sm font-semibold text-primary">{keynote.topic}</p>
                <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                  {keynote.bio}
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
          {gridSpeakers.map((speaker) => (
            <div key={speaker.id} className="group">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-card rounded-2xl p-1 shadow-lg">
                  <img
                    src={speaker.image}
                    alt={`${speaker.name} — ${speaker.company}, Formula Forum 2026 speaker`}
                    className="w-full aspect-square object-cover rounded-xl"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-1">{speaker.name}</h3>
                {speaker.company && (
                  <p className="text-sm text-muted-foreground">{speaker.company}</p>
                )}
                <p className="text-xs text-primary font-medium mt-1 leading-snug">{speaker.topic}</p>
                {speaker.socialUrl && (
                  <a
                    href={speaker.socialUrl}
                    target="_blank"
                    rel="nofollow noopener"
                    className="text-xs text-primary/70 hover:text-primary underline mt-2 inline-block"
                  >
                    {speaker.platform}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Speaker Details Section — full bios for SEO */}
        <div className="mt-20">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">
            Speaker Details
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {gridSpeakers.map((speaker) => (
              <article
                key={speaker.id}
                className="rounded-xl border border-border bg-card/50 backdrop-blur p-6 flex gap-5 items-start"
              >
                <img
                  src={speaker.image}
                  alt={`${speaker.name} — ${speaker.company}`}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  loading="lazy"
                />
                <div>
                  <h3 className="text-lg font-bold text-foreground">{speaker.name}</h3>
                  <p className="text-sm text-muted-foreground">{speaker.company}</p>
                  <p className="text-sm font-semibold text-primary mt-1">{speaker.topic}</p>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{speaker.bio}</p>
                  {speaker.socialUrl && (
                    <a
                      href={speaker.socialUrl}
                      target="_blank"
                      rel="nofollow noopener"
                      className="text-xs text-primary hover:text-primary/80 underline mt-2 inline-block"
                    >
                      Follow on {speaker.platform}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Speakers;
