import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  FileCheck2,
  Heart,
  Image as ImageIcon,
  Mail,
  MessageCircle,
  QrCode,
  Route,
  Smartphone,
  Sparkles,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import SEO from "@/components/SEO";
import f3Logo from "@/assets/f3-logo.png";
import { CONFIG } from "@/config/event";

const IOS_APP_URL = "https://apps.apple.com/us/app/formula-forum/id6759879318";
const ANDROID_APP_URL = "https://play.google.com/store/apps/details?id=com.triumphboxandryde.formulaforum";
const GUIDE_PATH = "/formula-app-guide";

const featureNav = [
  ["01", "Profile", "#profile"],
  ["02", "Plan", "#plan"],
  ["03", "Connect", "#connect"],
  ["04", "Partners", "#partners"],
  ["05", "Flows", "#flows"],
  ["06", "Build", "#build"],
];

type Screenshot = { src: string; alt: string };

type AppScreenshotProps = Screenshot & {
  onOpen: (image: Screenshot) => void;
  className?: string;
  label?: string;
};

const AppScreenshot = ({ src, alt, onOpen, className = "", label }: AppScreenshotProps) => (
  <button
    type="button"
    onClick={() => onOpen({ src, alt })}
    className={`group relative mx-auto block w-full max-w-[390px] border border-white/25 bg-black p-2 shadow-[16px_16px_0_hsl(var(--secondary))] transition-transform duration-300 hover:-translate-x-1 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black ${className}`}
    aria-label={`Enlarge: ${alt}`}
  >
    {label && (
      <span className="absolute left-4 top-4 z-10 bg-[hsl(var(--secondary))] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white">
        {label}
      </span>
    )}
    <div className="aspect-[1206/2512] overflow-hidden bg-black">
      <img src={src} alt={alt} className="h-auto w-full -translate-y-[4.15%]" loading="lazy" width="1206" height="2622" />
    </div>
    <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-black px-3 py-2 text-xs font-bold uppercase text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
      <ImageIcon className="h-3.5 w-3.5" />
      Enlarge
    </span>
  </button>
);

type AppDownloadButtonProps = {
  href: string;
  platform: "iPhone" | "Android";
  compact?: boolean;
  inverse?: boolean;
};

const AppDownloadButton = ({ href, platform, compact = false, inverse = false }: AppDownloadButtonProps) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center justify-center gap-2 rounded-full font-black uppercase transition-all hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 ${inverse ? "bg-black text-white hover:bg-white hover:text-black focus-visible:ring-black" : "bg-white text-black hover:bg-[hsl(var(--secondary))] hover:text-white focus-visible:ring-white"} ${compact ? "px-4 py-2.5 text-xs" : "w-full px-6 py-4 text-sm sm:w-auto"}`}
  >
    <Smartphone className="h-4 w-4" />
    {compact ? platform : `Download For ${platform}`}
    <ArrowUpRight className="h-4 w-4" />
  </a>
);

const AppDownloadButtons = ({ compact = false, inverse = false, className = "" }: { compact?: boolean; inverse?: boolean; className?: string }) => (
  <div className={`flex flex-wrap gap-3 ${className}`}>
    <AppDownloadButton href={IOS_APP_URL} platform="iPhone" compact={compact} inverse={inverse} />
    <AppDownloadButton href={ANDROID_APP_URL} platform="Android" compact={compact} inverse={inverse} />
  </div>
);

type SectionTitleProps = {
  number: string;
  eyebrow: string;
  title: string;
  copy: string;
  darkText?: boolean;
};

const SectionTitle = ({ number, eyebrow, title, copy, darkText = false }: SectionTitleProps) => (
  <div>
    <div className={`eyebrow mb-6 ${darkText ? "text-black" : "text-white"}`}>{number} — {eyebrow}</div>
    <h2 className={`display-bold text-[clamp(3rem,9vw,7rem)] ${darkText ? "text-black" : "text-white"}`}>{title}</h2>
    <p className={`mt-7 max-w-2xl text-base leading-relaxed md:text-lg ${darkText ? "text-black/65" : "text-white/65"}`}>{copy}</p>
  </div>
);

const FormulaAppGuide = () => {
  const [activeImage, setActiveImage] = useState<Screenshot | null>(null);

  useEffect(() => {
    if (!activeImage) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveImage(null);
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeImage]);

  const openImage = (image: Screenshot) => setActiveImage(image);

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <SEO
        title="Welcome to the Formula App | Complete Experience Guide"
        description="Set up your profile, build your agenda, connect by QR, discover partners, use Formula Flows, and turn event insights into action inside the Formula Forum app."
        path={GUIDE_PATH}
      />

      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/15 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 md:px-12">
          <Link to="/" className="inline-flex min-w-0 items-center gap-3 text-xs font-black uppercase tracking-wide text-white/70 transition hover:text-white">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20"><ArrowLeft className="h-4 w-4" /></span>
            <img src={f3Logo} alt="Formula Forum" className="h-8 w-8 shrink-0 object-contain" />
            <span className="hidden sm:inline">Formula Forum</span>
          </Link>
          <div className="hidden sm:block"><AppDownloadButtons compact /></div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-5 pb-24 pt-36 md:px-12 md:pb-32 md:pt-44">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="hero-orb hero-orb-secondary absolute -left-52 top-16 h-[40rem] w-[40rem] animate-flicker" />
            <div className="hero-orb hero-orb-primary absolute -bottom-56 -right-44 h-[40rem] w-[40rem] animate-flicker-slow opacity-30" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="eyebrow mb-8">Formula App Experience — 2026</div>
            <h1 className="display-bold max-w-7xl text-[clamp(3.7rem,14vw,10.5rem)]">
              YOUR EVENT.<br /><span className="display-outline">YOUR PEOPLE.</span><br />YOUR NEXT MOVE.
            </h1>
            <div className="mt-14 grid items-start gap-12 border-t border-white/20 pt-8 md:grid-cols-3 md:gap-12">
              <div className="flex flex-col items-start gap-5">
                <div className="flex flex-wrap gap-3">
                  <span className="meta-pill meta-pill-solid">BEFORE</span>
                  <span className="meta-pill">DURING</span>
                  <span className="meta-pill">AFTER</span>
                </div>
                <AppDownloadButtons />
                <a href="#profile" className="inline-flex items-center gap-2 text-sm font-black uppercase text-[hsl(var(--secondary))] transition hover:text-white">Start The Walkthrough <ArrowRight className="h-4 w-4" /></a>
              </div>
              <div>
                <h2 className="text-2xl font-bold leading-tight md:text-3xl">The full forum experience in one place—from the profile people meet to the actions you take home.</h2>
                <p className="mt-5 text-base leading-relaxed text-white/60">Owners and team members use the email assigned to their named attendee seat and complete email verification before a first ticket claim. Approved partner owners and staff use the email connected to their approved partner organization. Everyone creates their own account and never shares another attendee's password.</p>
              </div>
              <AppScreenshot src="/assets/formula-app-guide/today.png" alt="Formula App Today screen with a personalized event plan" onOpen={openImage} label="YOUR HOME BASE" />
            </div>
          </div>
        </section>

        <nav aria-label="Formula App guide sections" className="bg-[hsl(var(--secondary))] px-5 md:px-12">
          <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {featureNav.map(([number, label, href]) => (
              <a key={label} href={href} className="group flex min-h-20 items-center gap-3 border-b border-r border-white/35 px-4 py-4 transition hover:bg-black first:border-l sm:border-b-0">
                <span className="text-[10px] font-black text-white/60">{number}</span>
                <span className="text-sm font-black uppercase text-white">{label}</span>
              </a>
            ))}
          </div>
        </nav>

        <section id="profile" className="scroll-mt-20 bg-[hsl(0,0%,96%)] px-5 py-20 text-black md:px-12 md:py-28">
          <div className="mx-auto grid max-w-7xl items-start gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <SectionTitle number="01" eyebrow="Start With You" title="BUILD A PROFILE WORTH MEETING" copy="Create your account with the correct attendee or approved partner email. Owners and team members complete email verification before a first ticket claim. Then build the profile behind your posts, messages, QR connections, and follow-up." darkText />
            <div className="brand-block-blue p-6 md:p-8">
              <div className="flex items-start gap-5 border-b border-white/35 pb-7">
                <div className="relative inline-flex h-20 w-20 shrink-0 items-center justify-center bg-black text-white">
                  <UserRound className="h-9 w-9" />
                  <span className="absolute bottom-0 right-0 inline-flex h-7 w-7 items-center justify-center bg-white text-black"><Camera className="h-3.5 w-3.5" /></span>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">Profile Setup</p>
                  <h3 className="mt-2 text-2xl font-black uppercase">Make the first hello easier.</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">Open Profile, tap your cover image or Edit Profile, add your details, then tap Save.</p>
                </div>
              </div>
              <div className="mt-2 grid sm:grid-cols-2">
                {[
                  ["Photo + cover", "Be recognizable in the room."],
                  ["Name + job title", "Tell people who they met."],
                  ["Company + state", "Add useful business context."],
                  ["Bio + phone", "Make follow-up straightforward."],
                ].map(([label, copy]) => (
                  <div key={label} className="border-b border-white/30 py-4 sm:odd:pr-5 sm:even:border-l sm:even:pl-5">
                    <div className="flex items-center gap-2 font-black uppercase"><Check className="h-4 w-4" />{label}</div>
                    <p className="mt-2 text-sm text-white/70">{copy}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-2 border-white p-5">
                <div className="flex items-start gap-3">
                  <Heart className="mt-0.5 h-5 w-5 shrink-0" />
                  <div><p className="font-black uppercase">Add “My Why” if you want to go deeper.</p><p className="mt-1 text-sm leading-relaxed text-white/75">Upload a photo that represents the motivation behind what you are building.</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="plan" className="scroll-mt-20 px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-end gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
              <SectionTitle number="02" eyebrow="Own The Day" title="KNOW WHERE TO BE—AND WHY" copy="Today turns the event into a focused next-action list. Agenda lets you scan the full schedule, save the sessions that matter, and keep your personal plan close." />
              <div className="border-t border-white/20">
                {[
                  [CalendarDays, "Favorite Sessions", "Build My Schedule before doors open."],
                  [Sparkles, "Follow The Prompt", "Today surfaces the most useful next move."],
                ].map(([Icon, label, copy]) => {
                  const FeatureIcon = Icon as typeof CalendarDays;
                  return <div key={String(label)} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-white/20 py-5"><FeatureIcon className="h-5 w-5 text-[hsl(var(--secondary))]" /><div><p className="font-black uppercase">{String(label)}</p><p className="mt-1 text-sm text-white/55">{String(copy)}</p></div></div>;
                })}
              </div>
            </div>
            <div className="mt-16 grid items-start gap-10 md:grid-cols-2">
              <AppScreenshot src="/assets/formula-app-guide/today.png" alt="Personalized Today screen" onOpen={openImage} label="TODAY" />
              <AppScreenshot src="/assets/formula-app-guide/agenda.png" alt="Agenda with full schedule and saved sessions" onOpen={openImage} label="AGENDA" />
            </div>
          </div>
        </section>

        <section id="connect" className="scroll-mt-20 border-y border-white/15 px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionTitle number="03" eyebrow="Make The Room Smaller" title="TURN A GOOD CONVERSATION INTO A REAL CONNECTION" copy="Use QR networking when you meet, then keep the conversation moving through the feed, direct messages, and timely notifications." />
            <div className="mt-16 grid items-start gap-10 lg:grid-cols-3">
              <AppScreenshot src="/assets/formula-app-guide/networking.png" alt="QR networking and lead capture screen" onOpen={openImage} label="CONNECT" />
              <AppScreenshot src="/assets/formula-app-guide/messages.png" alt="Formula App direct messages screen" onOpen={openImage} label="MESSAGE" />
              <AppScreenshot src="/assets/formula-app-guide/notifications.png" alt="Formula App notifications screen" onOpen={openImage} label="STAY CURRENT" />
            </div>
            <div className="mt-16 grid border-l border-t border-white/20 md:grid-cols-3">
              {[
                [QrCode, "Scan Or Show Your QR", "Create a connection while the context is fresh."],
                [MessageCircle, "Continue One-To-One", "Use direct messages for the useful follow-up."],
                [Bell, "Catch What Changed", "Notifications keep event updates and activity visible."],
              ].map(([Icon, label, copy]) => {
                const FeatureIcon = Icon as typeof QrCode;
                return <div key={String(label)} className="border-b border-r border-white/20 p-6"><FeatureIcon className="h-6 w-6 text-[hsl(var(--secondary))]" /><h3 className="mt-5 text-lg font-black uppercase">{String(label)}</h3><p className="mt-2 text-sm leading-relaxed text-white/55">{String(copy)}</p></div>;
              })}
            </div>
            <p className="mt-7 max-w-3xl text-sm leading-relaxed text-white/45">The feed also brings together event announcements and attendee posts. Messaging and other event features appear as access opens.</p>
          </div>
        </section>

        <section id="partners" className="scroll-mt-20 bg-[hsl(var(--secondary))] px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <AppScreenshot src="/assets/formula-app-guide/partner-hub.png" alt="Configured Formula Forum Partner Hub" onOpen={openImage} label="PARTNER HUB" />
            <div>
              <SectionTitle number="04" eyebrow="Meet The Partners" title="FIND THE PEOPLE WHO CAN HELP WITH WHAT COMES NEXT" copy="Open Partners to discover participating companies, find booth details, view offers and handouts, watch product videos, and reach the right contact." />
              <div className="mt-8 border-t border-white/35">
                {[
                  "Browse company pages before and during the forum.",
                  "Use booth, website, email, video, and booking details in one place.",
                  "Partner accounts use Partner Hub to manage their own organization presence and leads.",
                ].map((item) => <div key={item} className="flex items-start gap-3 border-b border-white/35 py-4 text-sm leading-relaxed text-white/80"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{item}</div>)}
              </div>
              <Link to="/partners/partner-hub-guide" className="mt-7 inline-flex items-center gap-2 border-b border-white pb-1 text-sm font-black uppercase text-white transition hover:text-black">See The Complete Partner Hub Setup Guide <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>

        <section id="flows" className="scroll-mt-20 px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-end gap-12 lg:grid-cols-[1fr_0.72fr] lg:gap-20">
              <SectionTitle number="05" eyebrow="Work The Operator" title="USE THE SPACE BETWEEN SESSIONS" copy="Flows are short guided experiences that help you process what you heard, find clarity, and leave with something more useful than notes." />
              <div className="brand-block-blue p-6 md:p-8">
                <Route className="h-7 w-7" /><p className="mt-5 text-xl font-black uppercase">Resume where you left off.</p><p className="mt-2 text-sm leading-relaxed text-white/75">The hub keeps active and past Flows together so the work stays easy to return to.</p>
              </div>
            </div>
            <div className="mt-16 grid items-start gap-10 lg:grid-cols-2">
              <AppScreenshot src="/assets/formula-app-guide/flows.png" alt="Flows hub with Formula, Bible, and Prayer Flows" onOpen={openImage} label="CHOOSE A FLOW" />
              <AppScreenshot src="/assets/formula-app-guide/formula-flow.png" alt="Guided Formula Flow experience" onOpen={openImage} label="WORK IT THROUGH" />
            </div>
            <div className="mt-16 grid border-l border-t border-white/20 md:grid-cols-3">
              {[
                [Zap, "The Formula Flow", "Work the operator between sessions in about 5–8 minutes."],
                [BookOpen, "Bible Flow", "Read the Word and notice what God is showing you."],
                [Heart, "Prayer Flow", "Bring God in, lay it down, and walk out clearer."],
              ].map(([Icon, label, copy]) => {
                const FeatureIcon = Icon as typeof Zap;
                return <div key={String(label)} className="border-b border-r border-white/20 p-6"><FeatureIcon className="h-6 w-6 text-[hsl(var(--secondary))]" /><h3 className="mt-5 text-xl font-black uppercase">{String(label)}</h3><p className="mt-2 text-sm leading-relaxed text-white/55">{String(copy)}</p></div>;
              })}
            </div>
          </div>
        </section>

        <section id="build" className="scroll-mt-20 bg-[hsl(0,0%,96%)] px-5 py-20 text-black md:px-12 md:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionTitle number="06" eyebrow="Bring It Home" title="TURN THE BEST INSIGHT INTO AN INSTALLED ACTION" copy="Build and Action Packs help you capture the work, confirm what matters, and leave with a clear artifact your team can use after the event." darkText />
            <div className="mt-16 grid border-l border-t border-black/20 md:grid-cols-4">
              {[
                ["01", Camera, "Capture All Three", "For each session, photograph or upload the scores page, the reflection and discussion page, and the Domino through declaration page."],
                ["02", Sparkles, "Extract", "Let the app organize the important signal."],
                ["03", CheckCircle2, "Confirm", "Review and edit before anything is final."],
                ["04", FileCheck2, "Install", "Create a usable plan, scorecard, or next step."],
              ].map(([number, Icon, label, copy]) => {
                const FeatureIcon = Icon as typeof Camera;
                return <div key={String(label)} className="relative border-b border-r border-black/20 p-6"><span className="absolute right-5 top-5 text-[10px] font-black text-black/35">{String(number)}</span><FeatureIcon className="h-6 w-6 text-[hsl(var(--secondary))]" /><h3 className="mt-5 text-lg font-black uppercase">{String(label)}</h3><p className="mt-2 text-sm leading-relaxed text-black/55">{String(copy)}</p></div>;
              })}
            </div>
            <div className="mt-14 grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <AppScreenshot src="/assets/formula-app-guide/build.png" alt="Build action pack selection screen" onOpen={openImage} label="CHOOSE" />
              <AppScreenshot src="/assets/formula-app-guide/capture.png" alt="Capture all three completed Formula workbook session pages" onOpen={openImage} label="CAPTURE" />
              <AppScreenshot src="/assets/formula-app-guide/confirm.png" alt="Confirm extracted action details" onOpen={openImage} label="CONFIRM" />
              <AppScreenshot src="/assets/formula-app-guide/artifact.png" alt="Completed action artifact ready to use" onOpen={openImage} label="USE IT" />
            </div>
          </div>
        </section>

        <section className="px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div><div className="eyebrow mb-7">Your First Five Moves</div><h2 className="display-bold text-[clamp(3rem,9vw,7rem)]">ARRIVE READY TO USE THE ROOM</h2></div>
            <ol className="border-t border-white/20">
              {[
                "Download the Formula App, use your assigned attendee or approved partner email, and complete any required email verification.",
                "Complete your profile so every connection has context.",
                "Open Agenda and favorite the sessions that matter most.",
                "Use your QR when a conversation is worth continuing.",
                "After each session, upload all three completed workbook pages so the scores, written reflections, and final commitment stay together.",
              ].map((item, index) => <li key={item} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-white/20 py-5 text-sm leading-relaxed text-white/70"><span className="font-black text-[hsl(var(--secondary))]">{String(index + 1).padStart(2, "0")}</span><span>{item}</span></li>)}
            </ol>
          </div>
        </section>

        <section className="border-t border-white/15 px-5 pb-32 pt-20 md:px-12 md:pb-36 md:pt-28">
          <div className="mx-auto max-w-7xl">
            <div className="eyebrow mb-8">Welcome To Formula Forum</div>
            <h2 className="display-bold max-w-6xl text-[clamp(4rem,14vw,11rem)]">OPEN THE <span className="text-[hsl(var(--secondary))]">APP</span></h2>
            <div className="mt-12 grid gap-8 border-t border-white/20 pt-8 md:grid-cols-2 md:items-end">
              <p className="max-w-xl text-lg leading-relaxed text-white/65">Set up the app now. When the room opens, you can focus on the people, ideas, and actions that matter.</p>
              <div className="flex flex-col gap-3 md:items-end"><AppDownloadButtons className="md:justify-end" /><a href={`mailto:${CONFIG.ORGANIZER_EMAIL}`} className="inline-flex items-center gap-2 text-sm font-black uppercase text-white/65 transition hover:text-white"><Mail className="h-4 w-4" />Get App Help</a><p className="text-sm text-white/40">{CONFIG.ORGANIZER_EMAIL} · {CONFIG.ORGANIZER_PHONE}</p></div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-3 bottom-3 z-30 flex justify-center sm:hidden">
        <AppDownloadButtons compact className="w-full justify-center rounded-full border border-white/15 bg-black/90 p-2 shadow-xl backdrop-blur-xl" />
      </div>

      {activeImage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" aria-label={activeImage.alt} onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveImage(null); }}>
          <button type="button" onClick={() => setActiveImage(null)} className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black text-white transition hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Close enlarged screenshot" autoFocus><X className="h-5 w-5" /></button>
          <div className="aspect-[1206/2512] w-[min(92vw,430px)] overflow-hidden border border-white/25 bg-black shadow-[18px_18px_0_hsl(var(--secondary))]"><img src={activeImage.src} alt={activeImage.alt} className="h-auto w-full -translate-y-[4.15%]" /></div>
        </div>
      )}
    </div>
  );
};

export default FormulaAppGuide;
