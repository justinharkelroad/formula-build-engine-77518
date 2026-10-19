import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FORMULA_ATTENDEE_WORKSPACE_URL } from "@/config/appLinks";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Camera,
  CheckCircle2,
  Download,
  FileCheck2,
  Heart,
  Image as ImageIcon,
  Mail,
  Play,
  Route,
  Smartphone,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import SEO from "@/components/SEO";
import f3Logo from "@/assets/f3-logo.png";
import { CONFIG } from "@/config/event";
import { FORMULA_IOS_APP_URL as IOS_APP_URL, FORMULA_ANDROID_APP_URL as ANDROID_APP_URL } from "@/config/appLinks";
import { ACCESS_ENDS } from "@/config/whatToExpect";
import { REUNION_CALL, getReunionCallPhase } from "@/config/postEvent";
import { WalkthroughCard, WalkthroughPlayer } from "@/components/walkthroughs/Walkthroughs";
import { walkthroughs, type Walkthrough } from "@/config/walkthroughs";

// Post-event app page: what a Formula seat keeps doing after Orlando. Every
// feature claim here mirrors src/config/whatToExpect.ts, which was checked
// against the shipped app; change both together.

const GUIDE_PATH = "/formula-app-guide";

const featureNav = [
  ["01", "Analyze", "#build"],
  ["02", "Map", "#map"],
  ["03", "Progress", "#progress"],
  ["04", "Accountability", "#accountability"],
  ["05", "Partners", "#partners"],
  ["06", "Flows", "#flows"],
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
    className={`group relative mx-auto block w-full max-w-[390px] rounded-[2.75rem] border border-white/15 bg-[hsl(0,0%,8%)] p-2.5 shadow-[0_30px_80px_-25px_hsl(var(--secondary)/0.55)] transition-transform duration-300 hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black ${className}`}
    aria-label={`Enlarge: ${alt}`}
  >
    {label && (
      <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--secondary))] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-lg">
        {label}
      </span>
    )}
    <div className="aspect-[1206/2512] overflow-hidden rounded-[2.25rem] bg-black">
      <img src={src} alt={alt} className="h-auto w-full -translate-y-[4.15%]" loading="lazy" width="1206" height="2622" />
    </div>
    <span className="absolute bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-black/80 px-3 py-2 text-xs font-bold uppercase text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
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
  <div className="min-w-0">
    <div className={`eyebrow mb-6 ${darkText ? "text-black" : "text-white"}`}>{number} — {eyebrow}</div>
    <h2 className={`display-bold break-words text-[clamp(2.25rem,9vw,7rem)] ${darkText ? "text-black" : "text-white"}`}>{title}</h2>
    <p className={`mt-7 max-w-2xl text-base leading-relaxed md:text-lg ${darkText ? "text-black/65" : "text-white/65"}`}>{copy}</p>
  </div>
);

type FeatureRow = [typeof Zap, string, string];

const FeatureGrid = ({ items, dark = true, cols = "md:grid-cols-3" }: { items: FeatureRow[]; dark?: boolean; cols?: string }) => (
  <div className={`mt-16 grid border-l border-t ${dark ? "border-white/20" : "border-black/20"} ${cols}`}>
    {items.map(([FeatureIcon, label, copy]) => (
      <div key={label} className={`border-b border-r p-6 ${dark ? "border-white/20" : "border-black/20"}`}>
        <FeatureIcon className="h-6 w-6 text-[hsl(var(--secondary))]" />
        <h3 className="mt-5 text-lg font-black uppercase">{label}</h3>
        <p className={`mt-2 text-sm leading-relaxed ${dark ? "text-white/55" : "text-black/55"}`}>{copy}</p>
      </div>
    ))}
  </div>
);

// The 30/60/90 runway, drawn rather than screenshotted: there is no shared
// Progress screenshot, and this shows the structure without faking app UI.
const RUNWAY = [
  { day: "Day 30", label: "First milestone review" },
  { day: "Day 60", label: "Second milestone review" },
  { day: "Day 90", label: "Final review: did it fall?" },
];

const FormulaAppGuide = () => {
  const [activeImage, setActiveImage] = useState<Screenshot | null>(null);
  const callIsOver = getReunionCallPhase() === "past";

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

  const [activeVideo, setActiveVideo] = useState<Walkthrough | null>(null);
  const closeVideo = useCallback(() => setActiveVideo(null), []);

  // Allow direct links such as /formula-app-guide?video=partners for email.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("video");
    const match = walkthroughs.find((walkthrough) => walkthrough.id === requested);
    if (match) setActiveVideo(match);
  }, []);

  const nextMoves = [
    ...(callIsOver
      ? []
      : [`Register for the Formula Reunion Call, ${REUNION_CALL.dateSentence}. We set the plan together and hand out the AI install link.`]),
    "Missed a capture in the room? Photograph the three workbook pages now, or type them into the attendee workspace in a browser. The app builds that session's plan the same way.",
    "Open My 2027 Map and name your Main priority: the Domino the others serve.",
    "Start Progress. Pick a 30, 60 or 90-day runway and a start date. A full 90-day push needs to start by early January.",
    "Share your Business Dominos with an accountability partner and turn on the weekly nudge.",
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <SEO
        title="The Formula App | Built in the Room, Run Through Q1 2027"
        description="After Formula Forum, the app turns your workbook pages into AI-built session plans, assembles your 2027 Map, and runs a 30, 60 or 90-day Progress plan with weekly check-ins and an accountability partner."
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
            <div className="eyebrow mb-8">The Formula App — After Orlando</div>
            <h1 className="display-bold max-w-7xl text-[clamp(3.4rem,13vw,10rem)]">
              BUILT IN THE ROOM.<br /><span className="display-outline">RUN IN THE APP.</span>
            </h1>
            <div className="mt-14 grid items-start gap-12 border-t border-white/20 pt-8 md:grid-cols-3 md:gap-12">
              <div className="flex flex-col items-start gap-5">
                <div className="flex flex-wrap gap-3">
                  <span className="meta-pill meta-pill-solid">AFTER ORLANDO</span>
                  <span className="meta-pill">Q1 2027</span>
                  <span className="meta-pill meta-pill-dot">ACCESS THROUGH {ACCESS_ENDS.toUpperCase()}</span>
                </div>
                <AppDownloadButtons />
                <a href={FORMULA_ATTENDEE_WORKSPACE_URL} className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-3 text-sm font-bold transition hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
                  Open the attendee workspace <ArrowUpRight className="h-4 w-4" />
                </a>
                <a href="#videos" className="inline-flex items-center gap-2 text-sm font-black uppercase text-[hsl(var(--secondary))] transition hover:text-white"><Play className="h-4 w-4" />Watch The Videos</a>
                <a href="#build" className="inline-flex items-center gap-2 text-sm font-black uppercase text-[hsl(var(--secondary))] transition hover:text-white">See How It Works <ArrowRight className="h-4 w-4" /></a>
              </div>
              <div>
                <h2 className="text-2xl font-bold leading-tight md:text-3xl">Most conferences end when the room empties. Formula moves into your phone.</h2>
                <p className="mt-5 text-base leading-relaxed text-white/60">Every seat leaves Orlando with eight session plans built from its own workbook pages, one 2027 Map, and a Progress plan to run through the first quarter of 2027.</p>
                <p className="mt-4 text-base leading-relaxed text-white/60">Sign in with the email on your seat and the password you created, on your phone or at the attendee workspace in a browser. Everything you built lives in that one account, and your access runs through {ACCESS_ENDS}.</p>
              </div>
              <AppScreenshot src="/assets/formula-app-guide/artifact.png" alt="A session plan the app built from workbook pages" onOpen={openImage} label="YOUR PLAN" />
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

        <section id="build" className="scroll-mt-20 bg-[hsl(0,0%,96%)] px-5 py-20 text-black md:px-12 md:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionTitle number="01" eyebrow="Your Pages, Analyzed" title="AI READS YOUR WORKBOOK. YOU GET A PLAN." copy="Photograph the three pages from any session, or type them in a browser. AI reads your scores, your reflection and your Domino, then builds that session's plan: who owns it, how you'll measure it, and how often you'll check it. You review every word before it's final." darkText />
            <FeatureGrid
              dark={false}
              cols="md:grid-cols-4"
              items={[
                [Camera, "Capture", "Photograph all three pages, upload photos later, or type them in the attendee workspace. No camera needed."],
                [Sparkles, "Analyze", "AI pulls out your scores, your reflection and the Domino you declared."],
                [CheckCircle2, "Confirm", "Review and edit what it read. Nothing is final until you say so."],
                [FileCheck2, "Install", "Get the session plan your agency can run, with an owner, a measure and a cadence."],
              ]}
            />
            <a href={FORMULA_ATTENDEE_WORKSPACE_URL} className="mt-8 inline-flex items-center gap-2 border-b border-black pb-1 text-sm font-black uppercase">Capture a session in your browser <ArrowUpRight className="h-4 w-4" /></a>
            <div className="mt-14 grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <AppScreenshot src="/assets/formula-app-guide/build.png" alt="Choosing which session to build" onOpen={openImage} label="CHOOSE" />
              <AppScreenshot src="/assets/formula-app-guide/capture.png" alt="Capturing all three completed Formula workbook pages" onOpen={openImage} label="CAPTURE" />
              <AppScreenshot src="/assets/formula-app-guide/confirm.png" alt="Confirming what AI read from the pages" onOpen={openImage} label="CONFIRM" />
              <AppScreenshot src="/assets/formula-app-guide/artifact.png" alt="The finished session plan, ready to use" onOpen={openImage} label="USE IT" />
            </div>
          </div>
        </section>

        <section id="map" className="scroll-mt-20 px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto grid max-w-7xl items-start gap-14 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
            <SectionTitle number="02" eyebrow="Eight Decisions, One Page" title="YOUR 2027 MAP" copy="Each session ends with one Domino: the single decision that knocks over everything behind it. Your Map puts all eight on one page, with your first commitment, your first action, the date it happens by, and the witness who signed it with you." />
            <div className="brand-block-blue p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">On your Map</p>
              <ul className="mt-5 divide-y divide-white/30 border-y border-white/30">
                {["Five Business Dominos", "Three Personal Dominos, private to you", "Your first commitment and first action", "The date, and the witness who signed it"].map((item) => (
                  <li key={item} className="flex items-start gap-3 py-4 text-sm font-bold"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{item}</li>
                ))}
              </ul>
              <p className="mt-5 text-sm leading-relaxed text-white/80">The Map is the contract you took home. Everything after Formula is built from it.</p>
            </div>
          </div>
        </section>

        <section id="progress" className="scroll-mt-20 border-y border-white/15 px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionTitle number="03" eyebrow="Q1 2027" title="PROGRESS: RUN IT, WEEK BY WEEK" copy={`Progress turns your Map into a plan you actually run. Pick a 30, 60 or 90-day runway and a start date. Your Dominos come across from the Map, and the plan lays out week by week. Every plan finishes by ${ACCESS_ENDS}, so a full 90-day push starts by early January and carries you through the first quarter of 2027.`} />

            <div className="mt-14 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-white/15 bg-[hsl(0,0%,5%)] p-6 md:rounded-3xl md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">The 90-day runway</p>
                <ol className="mt-8 grid gap-4 sm:grid-cols-3">
                  {RUNWAY.map((step) => (
                    <li key={step.day} className="border-t-4 border-[hsl(var(--secondary))] pt-4">
                      <div className="text-3xl font-black md:text-4xl">{step.day}</div>
                      <div className="mt-2 text-sm text-white/60">{step.label}</div>
                    </li>
                  ))}
                </ol>
                <p className="mt-8 text-sm leading-relaxed text-white/60">At each milestone you review every Domino: did it fall, is it standing, do you push on or change the play.</p>
              </div>
              <div className="rounded-2xl bg-white p-6 text-black md:rounded-3xl md:p-10">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-black/50">Every week, for every Domino</p>
                <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-black uppercase">
                  <span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-3 text-white">On track</span>
                  <span className="rounded-full border border-black/20 px-2 py-3">Behind</span>
                  <span className="rounded-full border border-black/20 px-2 py-3">Blocked</span>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-black/65">One question per Domino. Add your actual number and a private note if you want. A few minutes a week keeps you honest with the version of you that sat in the room.</p>
              </div>
            </div>

            <FeatureGrid
              items={[
                [CheckCircle2, "Actions, Not Intentions", "Keep a running list of actions under each Domino. Check-ins record what you actually finished that week."],
                [Bell, "A Weekly Nudge", "Turn on a reminder for the day and time you choose. It respects quiet hours and never shows your plan."],
                [Download, "Your Export", "Export the whole plan for your files, or a business-only version to hand your team."],
              ]}
            />
            <div className="mt-20 grid items-start gap-12 sm:grid-cols-2">
              <AppScreenshot src="/assets/formula-app-guide/progress-dashboard.png" alt="My Progress: a 90-day plan from Jan 1 to Apr 1, 2027 with the week's action and check-in" onOpen={openImage} label="MY PROGRESS" />
              <AppScreenshot src="/assets/formula-app-guide/progress-review.png" alt="A day-30 milestone review for The Sales Sequence" onOpen={openImage} label="DAY 30 REVIEW" />
            </div>
            <p className="mt-7 max-w-3xl text-sm leading-relaxed text-white/45">A 30-day review with two Dominos behind is not failure. It is information the old you never had.</p>
          </div>
        </section>

        <section id="accountability" className="scroll-mt-20 bg-[hsl(0,0%,96%)] px-5 py-20 text-black md:px-12 md:py-28">
          <div className="mx-auto grid max-w-7xl items-start gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
            <div className="min-w-0">
              <SectionTitle number="04" eyebrow="Someone Watching The Dominos" title="ACCOUNTABILITY, BUILT IN" copy="It's not that you won't do it. It's that when you begin, you stop. So pick an accountability partner: any Formula attendee with the app. Share the Business Dominos you choose and they see the commitment, the status, the milestones and that week's actions." darkText />
              <FeatureGrid
                dark={false}
                cols="md:grid-cols-2"
                items={[
                  [Users, "Owners See The Team", "A team member can share their Business Dominos with you. Five people sharing is five follow-through plans you can see before the Monday meeting."],
                  [Heart, "Personal Stays Personal", "Partners never see your Personal Dominos, your private notes, or anything you did not share. Reduce or revoke a share at any time."],
                ]}
              />
            </div>
            <div className="lg:pt-6">
              <AppScreenshot src="/assets/formula-app-guide/progress-share.png" alt="Choosing which Business Dominos to share with an accountability partner, with a preview of exactly what they will see" onOpen={openImage} label="YOU CHOOSE WHAT THEY SEE" />
            </div>
          </div>
        </section>

        <section id="partners" className="scroll-mt-20 bg-[hsl(var(--secondary))] px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <AppScreenshot src="/assets/formula-app-guide/partner-hub.png" alt="Formula Forum partner directory" onOpen={openImage} label="PARTNERS" />
            <div>
              <SectionTitle number="05" eyebrow="Help For What Comes Next" title="THE PARTNERS STAY IN YOUR POCKET" copy="Your Dominos will need tools, people and systems. The Partners directory keeps every company from the room one tap away: what they do, their handouts and product videos, and a booking link to the right contact." />
              <div className="mt-8 border-t border-white/35">
                {[
                  "Match a Domino to the partner built for it.",
                  "Website, email, video, handouts and booking in one place.",
                  "Partner teams run their own Formula plans too, from the same room.",
                ].map((item) => <div key={item} className="flex items-start gap-3 border-b border-white/35 py-4 text-sm leading-relaxed text-white/80"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{item}</div>)}
              </div>
            </div>
          </div>
        </section>

        <section id="flows" className="scroll-mt-20 px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-end gap-12 lg:grid-cols-[1fr_0.72fr] lg:gap-20">
              <SectionTitle number="06" eyebrow="Between Check-Ins" title="FLOWS FOR THE HARD WEEKS" copy="Flows are short guided experiences that help you process what is in front of you, find clarity, and get back to the work. Use them when a Domino stalls, not just when a session ends." />
              <div className="brand-block-blue p-6 md:p-8">
                <Route className="h-7 w-7" /><p className="mt-5 text-xl font-black uppercase">Resume where you left off.</p><p className="mt-2 text-sm leading-relaxed text-white/75">The hub keeps active and past Flows together so the work stays easy to return to.</p>
              </div>
            </div>
            <div className="mt-16">
              <AppScreenshot src="/assets/formula-app-guide/flows.png" alt="Flows hub with the Formula, Bible and Prayer Flows" onOpen={openImage} label="CHOOSE A FLOW" />
            </div>
            <FeatureGrid
              items={[
                [Zap, "The Formula Flow", "Work the operator in about 5–8 minutes."],
                [BookOpen, "Bible Flow", "Read the Word and notice what God is showing you."],
                [Heart, "Prayer Flow", "Bring God in, lay it down, and walk out clearer."],
              ]}
            />
          </div>
        </section>

        <section id="videos" className="scroll-mt-20 border-t border-white/15 px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="eyebrow mb-6">Watch The Walkthrough</div>
            <h2 className="display-bold text-[clamp(3rem,9vw,7rem)]">SEE THE APP IN ACTION</h2>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">Recorded before Orlando with sample data. The capture, confirm and plan steps work the same way today.</p>
            <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {walkthroughs.map((walkthrough) => <WalkthroughCard key={walkthrough.id} walkthrough={walkthrough} onPlay={setActiveVideo} />)}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div><div className="eyebrow mb-7">Attendees: Your Next Moves</div><h2 className="display-bold text-[clamp(3rem,9vw,7rem)]">PUT THE MAP IN MOTION</h2></div>
            <ol className="border-t border-white/20">
              {nextMoves.map((item, index) => <li key={item} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-white/20 py-5 text-sm leading-relaxed text-white/70"><span className="font-black text-[hsl(var(--secondary))]">{String(index + 1).padStart(2, "0")}</span><span>{item}</span></li>)}
            </ol>
          </div>
        </section>

        <section className="border-t border-white/15 px-5 pb-32 pt-20 md:px-12 md:pb-36 md:pt-28">
          <div className="mx-auto max-w-7xl">
            <div className="eyebrow mb-8">This Is What A Formula Seat Buys</div>
            <h2 className="display-bold max-w-6xl text-[clamp(3.2rem,11vw,9rem)]">THREE DAYS IN THE ROOM. <span className="text-[hsl(var(--secondary))]">A QUARTER IN MOTION.</span></h2>
            <div className="mt-12 grid gap-8 border-t border-white/20 pt-8 md:grid-cols-2 md:items-end">
              <div>
                <p className="max-w-xl text-lg leading-relaxed text-white/65">Next year&apos;s room gets the same thing: eight sessions, a plan built from your own pages, and the app to run it after you fly home.</p>
                <Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm font-black uppercase text-[hsl(var(--secondary))] transition hover:text-white">Watch the Formula Opener <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="flex flex-col gap-3 md:items-end"><AppDownloadButtons className="md:justify-end" /><a href={`mailto:${CONFIG.ORGANIZER_EMAIL}`} className="inline-flex items-center gap-2 text-sm font-black uppercase text-white/65 transition hover:text-white"><Mail className="h-4 w-4" />Get App Help</a><p className="text-sm text-white/40">{CONFIG.ORGANIZER_EMAIL} · {CONFIG.ORGANIZER_PHONE}</p></div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-3 bottom-3 z-30 flex justify-center sm:hidden">
        <AppDownloadButtons compact className="w-full justify-center rounded-full border border-white/15 bg-black/90 p-2 shadow-xl backdrop-blur-xl" />
      </div>

      <WalkthroughPlayer walkthrough={activeVideo} onClose={closeVideo} />

      {activeImage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" aria-label={activeImage.alt} onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveImage(null); }}>
          <button type="button" onClick={() => setActiveImage(null)} className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black text-white transition hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Close enlarged screenshot" autoFocus><X className="h-5 w-5" /></button>
          <div className="aspect-[1206/2512] w-[min(92vw,430px)] overflow-hidden rounded-[2.5rem] border border-white/15 bg-black shadow-[0_40px_100px_-30px_hsl(var(--secondary)/0.6)]"><img src={activeImage.src} alt={activeImage.alt} className="h-auto w-full -translate-y-[4.15%]" /></div>
        </div>
      )}
    </div>
  );
};

export default FormulaAppGuide;
