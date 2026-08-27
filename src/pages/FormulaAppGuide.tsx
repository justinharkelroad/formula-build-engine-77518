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
  Users,
  X,
  Zap,
} from "lucide-react";
import SEO from "@/components/SEO";
import f3Logo from "@/assets/f3-logo.png";
import { CONFIG } from "@/config/event";

const IOS_APP_URL = "https://apps.apple.com/us/app/formula-forum/id6759879318";
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
    className={`group relative mx-auto block w-full max-w-[390px] overflow-hidden rounded-[2.35rem] border border-white/15 bg-[#0a1115] p-2 shadow-[0_35px_100px_-45px_rgba(0,0,0,0.95)] transition duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4511e] focus-visible:ring-offset-4 focus-visible:ring-offset-[#050a0d] ${className}`}
    aria-label={`Enlarge: ${alt}`}
  >
    {label && (
      <span className="absolute left-5 top-5 z-10 rounded-full border border-white/15 bg-black/75 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur">
        {label}
      </span>
    )}
    <div className="aspect-[1206/2512] overflow-hidden rounded-[1.85rem] bg-[#0a1115]">
      <img
        src={src}
        alt={alt}
        className="h-auto w-full -translate-y-[4.15%]"
        loading="lazy"
        width="1206"
        height="2622"
      />
    </div>
    <span className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-black/80 px-3 py-2 text-xs font-bold text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
      <ImageIcon className="h-3.5 w-3.5" />
      Enlarge
    </span>
  </button>
);

const AppStoreButton = ({ compact = false }: { compact?: boolean }) => (
  <a
    href={IOS_APP_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#f4511e] font-black text-white transition hover:bg-[#ff6330] focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${compact ? "px-4 py-2.5 text-sm" : "w-full px-6 py-3.5 text-sm sm:w-auto sm:text-base"}`}
  >
    <Smartphone className="h-4 w-4" />
    Download for iPhone
    <ArrowUpRight className="h-4 w-4" />
  </a>
);

type SectionTitleProps = {
  number: string;
  eyebrow: string;
  title: string;
  copy: string;
};

const SectionTitle = ({ number, eyebrow, title, copy }: SectionTitleProps) => (
  <div>
    <div className="mb-5 flex items-center gap-3">
      <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-[#f4511e] px-3 text-xs font-black text-white">
        {number}
      </span>
      <span className="text-xs font-black uppercase tracking-[0.22em] text-[#ff7043]">{eyebrow}</span>
    </div>
    <h2 className="text-4xl font-black leading-[1.02] tracking-[-0.035em] text-white md:text-6xl">{title}</h2>
    <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">{copy}</p>
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
    <div className="min-h-screen overflow-x-hidden bg-[#050a0d] text-white">
      <SEO
        title="Welcome to the Formula App | Complete Experience Guide"
        description="Set up your profile, build your agenda, connect by QR, discover partners, use Formula Flows, and turn event insights into action inside the Formula Forum app."
        path={GUIDE_PATH}
      />

      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#050a0d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <Link to="/" className="inline-flex min-w-0 items-center gap-3 text-sm font-bold text-white/70 transition hover:text-white">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5">
              <ArrowLeft className="h-4 w-4" />
            </span>
            <img src={f3Logo} alt="Formula Forum" className="h-8 w-8 shrink-0 object-contain" />
            <span className="truncate">Formula Forum</span>
          </Link>
          <div className="hidden sm:block">
            <AppStoreButton compact />
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-32 md:px-8 md:pb-28 md:pt-44">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-48 top-0 h-[42rem] w-[42rem] rounded-full bg-[#f4511e]/20 blur-[140px]" />
            <div className="absolute -right-40 top-60 h-[34rem] w-[34rem] rounded-full bg-[#0797be]/15 blur-[135px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f4511e]/35 bg-[#f4511e]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#ff7043]">
                <Sparkles className="h-4 w-4" />
                Your Formula app welcome guide
              </div>
              <h1 className="max-w-4xl text-[clamp(3.2rem,12vw,7.25rem)] font-black leading-[0.88] tracking-[-0.06em]">
                Your event. <span className="text-[#ff5a22]">Your people.</span> Your next move.
              </h1>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg md:text-xl">
                The Formula App keeps the full forum experience in one place—from the profile people meet to the actions you take home.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <AppStoreButton />
                <a
                  href="#profile"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-white/[0.055] px-6 py-3.5 font-black transition hover:bg-white/10"
                >
                  Start the walkthrough
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-5 text-sm text-white/42">Sign in with the email connected to your Formula Forum registration.</p>
            </div>

            <div className="relative mx-auto w-full max-w-[500px]">
              <div className="absolute -inset-6 rounded-[3rem] bg-[conic-gradient(from_120deg,rgba(244,81,30,0.28),rgba(7,151,190,0.16),transparent_65%)] blur-2xl" />
              <div className="relative rotate-[2deg]">
                <AppScreenshot
                  src="/assets/formula-app-guide/today.png"
                  alt="Formula App Today screen with a personalized event plan"
                  onOpen={openImage}
                  label="Your home base"
                />
              </div>
              <div className="absolute -bottom-5 -left-2 rounded-2xl border border-white/15 bg-[#121a1f]/95 px-4 py-3 shadow-2xl backdrop-blur sm:-left-10">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff7043]">One app</p>
                <p className="mt-1 text-sm font-black">Before • During • After</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/8 bg-white/[0.025] px-4 py-6 md:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {featureNav.map(([number, label, href]) => (
              <a
                key={label}
                href={href}
                className="group flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3 transition hover:border-[#f4511e]/35 hover:bg-[#f4511e]/10"
              >
                <span className="text-[10px] font-black text-[#ff7043]">{number}</span>
                <span className="text-sm font-bold text-white/70 group-hover:text-white">{label}</span>
              </a>
            ))}
          </div>
        </section>

        <section id="profile" className="scroll-mt-24 px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <SectionTitle
              number="01"
              eyebrow="Start with you"
              title="Build a profile worth meeting."
              copy="Your profile is the identity behind your posts, messages, QR connections, and follow-up. Give people enough context to remember the conversation."
            />

            <div className="rounded-[2.25rem] border border-white/12 bg-[#11191e] p-6 shadow-2xl sm:p-8">
              <div className="flex items-start gap-5 border-b border-white/10 pb-7">
                <div className="relative inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#f4511e]/18 text-[#ff7043]">
                  <UserRound className="h-9 w-9" />
                  <span className="absolute bottom-0 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f4511e] text-white ring-4 ring-[#11191e]">
                    <Camera className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff7043]">Profile setup</p>
                  <h3 className="mt-2 text-2xl font-black">Make the first hello easier.</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">Open Profile, tap your cover image or Edit Profile, add your details, then tap Save.</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Photo + cover", "Be recognizable in the room."],
                  ["Name + job title", "Tell people who they met."],
                  ["Company + state", "Add useful business context."],
                  ["Bio + phone", "Make follow-up straightforward."],
                ].map(([label, copy]) => (
                  <div key={label} className="rounded-2xl border border-white/8 bg-black/25 p-4">
                    <div className="flex items-center gap-2 font-black">
                      <Check className="h-4 w-4 text-[#21b3d7]" />
                      {label}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white/50">{copy}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-[#0797be]/25 bg-[#0797be]/10 p-5">
                <div className="flex items-start gap-3">
                  <Heart className="mt-0.5 h-5 w-5 shrink-0 text-[#21b3d7]" />
                  <div>
                    <p className="font-black">Add “My Why” if you want to go deeper.</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/60">Upload a photo that represents the motivation behind what you are building.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="plan" className="scroll-mt-24 border-y border-white/8 bg-white/[0.025] px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.8fr]">
              <SectionTitle
                number="02"
                eyebrow="Own the day"
                title="Know where to be—and why."
                copy="Today turns the event into a focused next-action list. Agenda lets you scan the full schedule, save the sessions that matter, and keep your personal plan close."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  [CalendarDays, "Favorite sessions", "Build My Schedule before doors open."],
                  [Sparkles, "Follow the prompt", "Today surfaces the most useful next move."],
                ].map(([Icon, label, copy]) => {
                  const FeatureIcon = Icon as typeof CalendarDays;
                  return (
                    <div key={String(label)} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <FeatureIcon className="h-5 w-5 text-[#ff7043]" />
                      <p className="mt-3 font-black">{String(label)}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/50">{String(copy)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-14 grid items-start gap-8 md:grid-cols-2">
              <AppScreenshot src="/assets/formula-app-guide/today.png" alt="Personalized Today screen" onOpen={openImage} label="Today" />
              <AppScreenshot src="/assets/formula-app-guide/agenda.png" alt="Agenda with full schedule and saved sessions" onOpen={openImage} label="Agenda" />
            </div>
          </div>
        </section>

        <section id="connect" className="scroll-mt-24 px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
              <SectionTitle
                number="03"
                eyebrow="Make the room smaller"
                title="Turn a good conversation into a real connection."
                copy="Use QR networking when you meet, then keep the conversation moving through the feed, direct messages, and timely notifications."
              />
            </div>
            <div className="mt-14 grid items-start gap-8 lg:grid-cols-3">
              <AppScreenshot src="/assets/formula-app-guide/networking.png" alt="QR networking and lead capture screen" onOpen={openImage} label="Connect" />
              <AppScreenshot src="/assets/formula-app-guide/messages.png" alt="Formula App direct messages screen" onOpen={openImage} label="Message" />
              <AppScreenshot src="/assets/formula-app-guide/notifications.png" alt="Formula App notifications screen" onOpen={openImage} label="Stay current" />
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                [QrCode, "Scan or show your QR", "Create a connection while the context is fresh."],
                [MessageCircle, "Continue one-to-one", "Use direct messages for the useful follow-up."],
                [Bell, "Catch what changed", "Notifications keep event updates and activity visible."],
              ].map(([Icon, label, copy]) => {
                const FeatureIcon = Icon as typeof QrCode;
                return (
                  <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                    <FeatureIcon className="h-6 w-6 text-[#21b3d7]" />
                    <h3 className="mt-4 text-lg font-black">{String(label)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{String(copy)}</p>
                  </div>
                );
              })}
            </div>
            <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-relaxed text-white/45">
              The feed also brings together event announcements and attendee posts. Messaging and other event features appear as access opens.
            </p>
          </div>
        </section>

        <section id="partners" className="scroll-mt-24 border-y border-white/8 bg-white/[0.025] px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <AppScreenshot src="/assets/formula-app-guide/partner-hub.png" alt="Configured Formula Forum Partner Hub" onOpen={openImage} label="Partner Hub" />
            <div>
              <SectionTitle
                number="04"
                eyebrow="Meet the partners"
                title="Find the people who can help with what comes next."
                copy="Open Partners to discover participating companies, find booth details, view offers and handouts, watch product videos, and reach the right contact."
              />
              <div className="mt-8 space-y-3">
                {[
                  "Browse company pages before and during the forum.",
                  "Use booth, website, email, video, and booking details in one place.",
                  "Partner accounts use Partner Hub to manage their own organization presence and leads.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/9 bg-black/20 p-4 text-sm leading-relaxed text-white/65">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ff7043]" />
                    {item}
                  </div>
                ))}
              </div>
              <Link
                to="/partners/partner-hub-guide"
                className="mt-7 inline-flex items-center gap-2 font-black text-[#21b3d7] transition hover:text-white"
              >
                See the complete Partner Hub setup guide
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section id="flows" className="scroll-mt-24 px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-end gap-10 lg:grid-cols-[1fr_0.75fr]">
              <SectionTitle
                number="05"
                eyebrow="Work the operator"
                title="Use the space between sessions."
                copy="Flows are short guided experiences that help you process what you heard, find clarity, and leave with something more useful than notes."
              />
              <div className="rounded-[2rem] border border-[#f4511e]/25 bg-[#f4511e]/10 p-6">
                <Route className="h-7 w-7 text-[#ff7043]" />
                <p className="mt-4 text-xl font-black">Resume where you left off.</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">The hub keeps active and past Flows together so the work stays easy to return to.</p>
              </div>
            </div>

            <div className="mt-14 grid items-start gap-8 lg:grid-cols-2">
              <AppScreenshot src="/assets/formula-app-guide/flows.png" alt="Flows hub with Formula, Bible, and Prayer Flows" onOpen={openImage} label="Choose a Flow" />
              <AppScreenshot src="/assets/formula-app-guide/formula-flow.png" alt="Guided Formula Flow experience" onOpen={openImage} label="Work it through" />
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                [Zap, "The Formula Flow", "Work the operator between sessions in about 5–8 minutes."],
                [BookOpen, "Bible Flow", "Read the Word and notice what God is showing you."],
                [Heart, "Prayer Flow", "Bring God in, lay it down, and walk out clearer."],
              ].map(([Icon, label, copy]) => {
                const FeatureIcon = Icon as typeof Zap;
                return (
                  <div key={String(label)} className="rounded-2xl border border-white/10 bg-[#11191e] p-6">
                    <FeatureIcon className="h-6 w-6 text-[#ff7043]" />
                    <h3 className="mt-4 text-xl font-black">{String(label)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{String(copy)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="build" className="scroll-mt-24 border-y border-white/8 bg-white/[0.025] px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
              <SectionTitle
                number="06"
                eyebrow="Bring it home"
                title="Turn the best insight into an installed action."
                copy="Build and Action Packs help you capture the work, confirm what matters, and leave with a clear artifact your team can use after the event."
              />
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-4">
              {[
                ["01", Camera, "Capture", "Photograph a workbook page or add the input."],
                ["02", Sparkles, "Extract", "Let the app organize the important signal."],
                ["03", CheckCircle2, "Confirm", "Review and edit before anything is final."],
                ["04", FileCheck2, "Install", "Create a usable plan, scorecard, or next step."],
              ].map(([number, Icon, label, copy]) => {
                const FeatureIcon = Icon as typeof Camera;
                return (
                  <div key={String(label)} className="relative rounded-2xl border border-white/10 bg-black/20 p-6">
                    <span className="absolute right-5 top-5 text-[10px] font-black text-white/30">{String(number)}</span>
                    <FeatureIcon className="h-6 w-6 text-[#21b3d7]" />
                    <h3 className="mt-5 text-lg font-black">{String(label)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/50">{String(copy)}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 grid items-start gap-7 sm:grid-cols-2 lg:grid-cols-4">
              <AppScreenshot src="/assets/formula-app-guide/build.png" alt="Build action pack selection screen" onOpen={openImage} label="Choose" />
              <AppScreenshot src="/assets/formula-app-guide/capture.png" alt="Capture a completed Formula Forum workbook page" onOpen={openImage} label="Capture" />
              <AppScreenshot src="/assets/formula-app-guide/confirm.png" alt="Confirm extracted action details" onOpen={openImage} label="Confirm" />
              <AppScreenshot src="/assets/formula-app-guide/artifact.png" alt="Completed action artifact ready to use" onOpen={openImage} label="Use it" />
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/12 bg-[linear-gradient(135deg,rgba(244,81,30,0.2),rgba(7,151,190,0.11))] p-7 md:p-12">
            <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff7043]">Your first five moves</p>
                <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.035em] md:text-6xl">Arrive ready to use the room.</h2>
              </div>
              <ol className="space-y-3">
                {[
                  "Download the Formula App and sign in with your registered email.",
                  "Complete your profile so every connection has context.",
                  "Open Agenda and favorite the sessions that matter most.",
                  "Use your QR when a conversation is worth continuing.",
                  "Run one Flow, then turn the clearest insight into an action.",
                ].map((item, index) => (
                  <li key={item} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-white/70">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-black">{index + 1}</span>
                    <span className="pt-0.5">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="px-4 pb-32 pt-8 text-center md:px-8 md:pb-36 md:pt-16">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff7043]">Welcome to Formula Forum</p>
            <h2 className="mt-4 text-5xl font-black leading-[0.98] tracking-[-0.045em] md:text-7xl">The experience starts before you walk in.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">Set up the app now. When the room opens, you can focus on the people, ideas, and actions that matter.</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <AppStoreButton />
              <a
                href={`mailto:${CONFIG.ORGANIZER_EMAIL}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 font-black transition hover:bg-white/10"
              >
                <Mail className="h-4 w-4" />
                Get app help
              </a>
            </div>
            <p className="mt-6 text-sm text-white/42">Questions? Email {CONFIG.ORGANIZER_EMAIL} or call {CONFIG.ORGANIZER_PHONE}.</p>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-3 bottom-3 z-30 flex justify-center sm:hidden">
        <AppStoreButton />
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/92 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.alt}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveImage(null);
          }}
        >
          <button
            type="button"
            onClick={() => setActiveImage(null)}
            className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close enlarged screenshot"
            autoFocus
          >
            <X className="h-5 w-5" />
          </button>
          <div className="aspect-[1206/2512] w-[min(92vw,430px)] overflow-hidden rounded-[2rem] border border-white/15 bg-[#0a1115] shadow-2xl">
            <img src={activeImage.src} alt={activeImage.alt} className="h-auto w-full -translate-y-[4.15%]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default FormulaAppGuide;
