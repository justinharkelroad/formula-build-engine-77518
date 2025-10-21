import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { Clock, MapPin } from "lucide-react";

const Agenda = () => {
  const title = "Agenda — Formula Forum 2025";
  const description = "Complete 3-day schedule for Formula Forum 2025 insurance agency growth conference in Orlando, October 15-17.";

  const speakers = [
    {
      name: "Garrett J. White",
      image: "/lovable-uploads/e7001560-ab55-4bbb-a9f2-3ffdbe744145.png",
      isKeynote: true
    },
    {
      name: "Gregg Blanchard",
      image: "/lovable-uploads/485a0b40-a683-463c-9ed8-d71005e4298b.png"
    },
    {
      name: "Vlad Cherchenko",
      image: "/lovable-uploads/12460175-11b3-44a7-9ec2-b3fc0cc11789.png"
    },
    {
      name: "Rob McAfee",
      image: "/lovable-uploads/62071b87-4ef3-40ac-b511-88ce8443bcf2.png"
    },
    {
      name: "Kelly Spicer",
      image: "/lovable-uploads/63f4f7e0-e7aa-4473-8d7d-fd126c7fd53e.png"
    },
    {
      name: "Nicholas Sakha",
      image: "/lovable-uploads/4e9ba863-26db-49bc-9ddf-cc06693a66f2.png"
    },
    {
      name: "Joe Marranucci",
      image: "/lovable-uploads/33c903d8-a8ee-4644-91a7-76db4143f1db.png"
    },
    {
      name: "David Williams",
      image: "/lovable-uploads/38c49db9-f1b6-4536-82cd-fa43cb81dd08.png"
    },
    {
      name: "Jeremy Fitzsimmons",
      image: "/lovable-uploads/ac8d2650-ff78-4b21-b3f3-8786a6fcbd0f.png"
    },
    {
      name: "Ben Berman",
      image: "/lovable-uploads/97b2f5df-e485-4a04-948d-5481f5656b3c.png"
    },
    {
      name: "Yandi Eirea",
      image: "/lovable-uploads/04167dbb-874e-44f6-b2ba-04e989588679.png"
    },
    {
      name: "Justin Harkelroad",
      image: "/lovable-uploads/76a8b14e-bd41-4c58-862d-344b2b6729db.png"
    },
    {
      name: "Troy Hawkes",
      image: "/lovable-uploads/troy-hawkes.png"
    }
  ];

  const getSpeakerImage = (name: string) => {
    const speaker = speakers.find(s => s.name.includes(name) || name.includes(s.name.split(' ')[0]));
    return speaker?.image || "/lovable-uploads/e7001560-ab55-4bbb-a9f2-3ffdbe744145.png";
  };

  const SpeakerSession = ({ time, speaker, title, isKeynote = false }: {
    time: string;
    speaker: string;
    title: string;
    isKeynote?: boolean;
  }) => (
    <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
      isKeynote 
        ? 'border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm' 
        : 'border-primary/20 bg-card/80 backdrop-blur-sm hover:border-primary/40'
    }`}>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative p-6 flex items-center gap-6">
        <div className="flex-shrink-0">
          <div className={`relative ${isKeynote ? 'w-20 h-20' : 'w-16 h-16'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
            <img
              src={getSpeakerImage(speaker)}
              alt={`${speaker} speaker photo`}
              className={`relative ${isKeynote ? 'w-20 h-20' : 'w-16 h-16'} object-cover rounded-full border-2 border-primary/20 group-hover:border-primary/60 transition-colors`}
              loading="lazy"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary flex-shrink-0" />
            <time className={`${isKeynote ? 'text-base' : 'text-sm'} font-medium text-primary`}>{time}</time>
            {isKeynote && <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">KEYNOTE</span>}
          </div>
          <h3 className={`${isKeynote ? 'text-xl' : 'text-lg'} font-bold text-foreground mb-1 group-hover:text-primary transition-colors`}>
            {title}
          </h3>
          <p className={`${isKeynote ? 'text-base' : 'text-sm'} text-muted-foreground font-medium`}>{speaker}</p>
        </div>
      </div>
    </div>
  );

  const RegularSession = ({ time, title, description, location }: {
    time: string;
    title: string;
    description: string;
    location?: string;
  }) => (
    <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative p-6 flex items-center gap-6">
        <div className="flex-shrink-0">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
            <img
              src="/lovable-uploads/fbdeac05-bb42-487e-8a74-42c0558bf8ce.png"
              alt="Session icon"
              className="relative w-16 h-16 object-cover rounded-full border-2 border-primary/20 group-hover:border-primary/60 transition-colors"
              loading="lazy"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary flex-shrink-0" />
            <time className="text-sm font-medium text-primary">{time}</time>
            {location && (
              <>
                <MapPin className="w-4 h-4 text-muted-foreground ml-2 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{location}</span>
              </>
            )}
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} path="/agenda" />
      <StructuredData page="home" />
      <Navigation />
      
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-accent/5 to-background pointer-events-none" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-2xl opacity-30 pointer-events-none" />
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        <section id="agenda">
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Agenda — Formula Forum 2025
            </h1>
            <h2 className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Three days of insurance agency growth strategies with industry-leading speakers
            </h2>
          </header>

          <div className="max-w-6xl mx-auto space-y-16">
            {/* Day 1: October 15, 2025 */}
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-primary">October 15, 2025</h2>
                <p className="text-lg text-muted-foreground">Welcome & Networking</p>
              </div>
              <div className="grid gap-6 max-w-4xl mx-auto">
                <RegularSession
                  time="4:00 – 6:00 PM"
                  title="Check-In"
                  description="Welcome reception and registration at JW Marriott Orlando Bonnet Creek"
                  location="JW Marriott Lobby"
                />
                <RegularSession
                  time="6:00 – 7:00 PM"
                  title="Welcome Reception"
                  description="Network and get to know each other + Meet the trainers"
                  location="Unreserved Restaurant and Beer Garden"
                />
              </div>
            </div>

            {/* Day 2: October 16, 2025 */}
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-primary">October 16, 2025</h2>
                <p className="text-lg text-muted-foreground">Main Conference Day</p>
              </div>
              <div className="grid gap-6">
                <RegularSession
                  time="6:00 – 6:45 AM"
                  title="Optional Outdoor Group Workout"
                  description="A magical way to wake up your body & mind for the day's events"
                  location="Activity Garden"
                />
                <RegularSession
                  time="8:00 – 9:00 AM"
                  title="Breakfast"
                  description="Continental breakfast and morning networking"
                  location="Formula Partner Room - Griffin ABC"
                />
                
                <RegularSession
                  time="9:00 AM"
                  title="General Session Begins"
                  description="Main conference programming starts"
                  location="Formula Room - Griffin DE"
                />
                
                <SpeakerSession
                  time="9:10 – 9:40 AM"
                  speaker="Garrett J White"
                  title="Welcome to Formula"
                />
                
                <SpeakerSession
                  time="9:50 – 10:30 AM"
                  speaker="Nicholas Sakha"
                  title="The Referral Magnet Formula: Brand, Content, Community, Conversion"
                />
                
                <SpeakerSession
                  time="10:35 – 11:05 AM"
                  speaker="Ben Berman"
                  title="From Running Behind to Leading Ahead with Clarity"
                />
                
                <SpeakerSession
                  time="11:25 AM – 12:05 PM"
                  speaker="Troy Hawkes"
                  title="Getting To Know The Man Beyond The Suit"
                />
                
                <RegularSession
                  time="12:05 – 12:50 PM"
                  title="Lunch Break"
                  description="Networking lunch with fellow attendees"
                  location="Formula Partner Room - Griffin ABC"
                />
                
                <RegularSession
                  time="12:50 – 1:00 PM"
                  title="Meditation Session"
                  description="Mindfulness and mental clarity"
                  location="Formula Room - Griffin DE"
                />
                
                <SpeakerSession
                  time="1:05 – 1:45 PM"
                  speaker="Jeremy Fitzsimmons"
                  title="Breaking Free When You're Stuck and Out of Options"
                />
                
                <SpeakerSession
                  time="1:50 – 2:20 PM"
                  speaker="Gregg Blanchard"
                  title="Streamline, Simplify, Scale, VA Systems That Work"
                />
                
                <SpeakerSession
                  time="2:35 – 3:05 PM"
                  speaker="Joe Marranucci"
                  title="Creating and Keeping the Mindset of a CEO"
                />
                
                <SpeakerSession
                  time="3:15 – 3:55 PM"
                  speaker="Kelly Spicer"
                  title="Fixing the Disconnect: The Formula for EFS/Agency Success"
                />
                
                <RegularSession
                  time="4:15 – 4:55 PM"
                  title="Trainer Open Q&A + Walk & Talk"
                  description="Interactive session with all speakers"
                />
                
                <SpeakerSession
                  time="5:00 – 6:00 PM"
                  speaker="Garrett J White"
                  title="Keynote: The Warrior's Path to Agency Excellence"
                  isKeynote={true}
                />
                
                <RegularSession
                  time="8:30 – 11:30 PM"
                  title="Formula Rooftop Party"
                  description="Cocktails, Music, Lights & an Exclusive View of The Epcot Fireworks"
                  location="Illume Rooftop"
                />
              </div>
            </div>

            {/* Day 3: October 17, 2025 */}
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-primary">October 17, 2025</h2>
                <p className="text-lg text-muted-foreground">Implementation & Action Planning</p>
              </div>
              <div className="grid gap-6 max-w-4xl mx-auto">
                <RegularSession
                  time="8:00 – 9:00 AM"
                  title="Breakfast"
                  description="Final day breakfast and last-minute networking"
                  location="Formula Partner Room - Griffin ABC"
                />
                
                <RegularSession
                  time="9:00 AM"
                  title="General Session Begins"
                  description="Final day programming starts"
                  location="Formula Room - Griffin DE"
                />
                
                <SpeakerSession
                  time="9:10 – 9:40 AM"
                  speaker="Vlad Cherchenko & Rob McAfee"
                  title="How To Scale Every Producer to $40k a Month"
                />
                
                <SpeakerSession
                  time="9:45 – 10:25 AM"
                  speaker="Justin Harkelroad"
                  title="Scaling Your Capacity w/ AI"
                />
                
                <SpeakerSession
                  time="10:35 – 11:15 AM"
                  speaker="Yandi Eirea"
                  title="The Agent's Oath: Protecting Families Before Profit"
                />
                
                <SpeakerSession
                  time="11:35 AM – 12:05 PM"
                  speaker="David Williams"
                  title="The Five Pillars of a Thriving Life and Business"
                />
                
                <RegularSession
                  time="12:10 – 1:00 PM"
                  title="The Formula Playbook Session"
                  description="90-day implementation blueprint and printed Formula Playbook distribution"
                  location="Main Conference Hall"
                />
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="max-w-2xl mx-auto mb-8">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Ready to Transform Your Agency?</h3>
              <p className="text-lg text-muted-foreground">
                Join us for three days of actionable strategies, proven systems, and industry-leading expertise.
              </p>
            </div>
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <a href="/register">Register Now — Limited Seats Available</a>
            </Button>
          </div>
        </section>
      </main>
      <div className="h-20 md:h-0"></div>
    </div>
  );
};

export default Agenda;