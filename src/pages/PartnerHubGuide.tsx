import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  PlayCircle,
  Smartphone,
  Users,
  X,
} from "lucide-react";
import SEO from "@/components/SEO";
import f3Logo from "@/assets/f3-logo.png";
import { CONFIG } from "@/config/event";

const IOS_APP_URL = "https://apps.apple.com/us/app/formula-forum/id6759879318";
const GUIDE_PATH = "/partners/partner-hub-guide";

const checklistItems = [
  "Official business name",
  "Short, benefit-focused slogan",
  "Short company description",
  "Square logo — 512 × 512 PNG or JPG recommended",
  "Wide banner — 1280 × 720 PNG or JPG recommended",
  "Booth number",
  "Website, company email, and phone number",
  "Public product-video link, such as YouTube or Vimeo",
  "Direct booking link, such as Calendly",
  "Up to two PDF handouts",
];

const setupFields = [
  ["Website", "Use the complete link beginning with https://."],
  ["Email and phone", "Use the contact information attendees should use after the event."],
  ["Product Video URL", "Paste a public YouTube, Vimeo, or other watchable link."],
  ["Booking Link", "Paste the direct scheduling page you want attendees to use."],
  ["Handouts", "Upload up to two PDFs: an offer, one-sheet, case study, checklist, or brochure."],
];

type Screenshot = { src: string; alt: string };

type GuideScreenshotProps = Screenshot & {
  onOpen: (image: Screenshot) => void;
  className?: string;
  label?: string;
};

const GuideScreenshot = ({ src, alt, onOpen, className = "", label }: GuideScreenshotProps) => (
  <button
    type="button"
    onClick={() => onOpen({ src, alt })}
    className={`group relative mx-auto block w-full max-w-[430px] border border-white/25 bg-black p-2 shadow-[18px_18px_0_hsl(var(--secondary))] transition-transform duration-300 hover:-translate-x-1 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black ${className}`}
    aria-label={`Enlarge: ${alt}`}
  >
    {label && (
      <span className="absolute left-4 top-4 z-10 bg-[hsl(var(--secondary))] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white">
        {label}
      </span>
    )}
    <img src={src} alt={alt} className="h-auto w-full" loading="lazy" width="430" height="932" />
    <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-black px-3 py-2 text-xs font-bold uppercase text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
      <ImageIcon className="h-3.5 w-3.5" />
      Enlarge
    </span>
  </button>
);

type StepHeaderProps = {
  number: string;
  eyebrow: string;
  title: string;
  darkText?: boolean;
};

const StepHeader = ({ number, eyebrow, title, darkText = false }: StepHeaderProps) => (
  <div className="mb-8">
    <div className={`eyebrow mb-5 ${darkText ? "text-black" : "text-white"}`}>
      {number} — {eyebrow}
    </div>
    <h2 className={`display-bold text-[clamp(2.8rem,9vw,6.5rem)] leading-[0.88] ${darkText ? "text-black" : "text-white"}`}>
      {title}
    </h2>
  </div>
);

const AppButton = ({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) => (
  <a
    href={IOS_APP_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center justify-center gap-2 rounded-full font-black uppercase transition-all hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 ${inverse ? "bg-black text-white hover:bg-white hover:text-black focus-visible:ring-black" : "bg-white text-black hover:bg-[hsl(var(--secondary))] hover:text-white focus-visible:ring-white"} ${compact ? "px-4 py-2.5 text-xs" : "w-full max-w-[24rem] px-6 py-4 text-sm sm:w-auto sm:max-w-none"}`}
  >
    <Smartphone className="h-4 w-4" />
    Open the Formula App
    <ArrowUpRight className="h-4 w-4" />
  </a>
);

const PartnerHubGuide = () => {
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
        title="Create Your Formula Forum Partner Hub | Partner Walkthrough"
        description="Follow this step-by-step Formula Forum partner walkthrough to add your logo, banner, company details, video, booking link, and event offer."
        path={GUIDE_PATH}
      />

      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/15 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 md:px-12">
          <Link to="/partners" className="inline-flex min-w-0 items-center gap-3 text-xs font-black uppercase tracking-wide text-white/70 transition hover:text-white">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20">
              <ArrowLeft className="h-4 w-4" />
            </span>
            <img src={f3Logo} alt="Formula Forum" className="h-8 w-8 shrink-0 object-contain" />
            <span className="hidden sm:inline">Partner Program</span>
          </Link>
          <div className="hidden sm:block"><AppButton compact /></div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-5 pb-24 pt-36 md:px-12 md:pb-32 md:pt-44">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="hero-orb hero-orb-secondary absolute -left-52 top-20 h-[36rem] w-[36rem] animate-flicker" />
            <div className="hero-orb hero-orb-primary absolute -bottom-56 -right-36 h-[38rem] w-[38rem] animate-flicker-slow opacity-30" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="eyebrow mb-8">Partner Setup Guide — 2026</div>
            <h1 className="display-bold max-w-6xl text-[clamp(4rem,15vw,11rem)]">
              BUILD A<br />PARTNER <span className="display-outline">HUB</span>
            </h1>
            <div className="mt-14 grid gap-10 border-t border-white/20 pt-8 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
              <div className="flex flex-col items-start gap-5">
                <div className="flex flex-wrap gap-3">
                  <span className="meta-pill meta-pill-solid">10–15 MIN SETUP</span>
                  <span className="meta-pill">10 ASSETS</span>
                </div>
                <AppButton />
              </div>
              <div>
                <h2 className="text-2xl font-bold leading-tight md:text-4xl">Give attendees one clear place to understand your company and take the next step.</h2>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">Add your logo, booth details, product video, event offer, and booking link before the event begins October 14, 2026.</p>
                <a href="#before-you-start" className="mt-7 inline-flex items-center gap-2 text-sm font-black uppercase text-[hsl(var(--secondary))] transition hover:text-white">
                  See what you need <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="before-you-start" className="scroll-mt-20 bg-[hsl(0,0%,96%)] px-5 py-20 text-black md:px-12 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="eyebrow mb-8 text-black">Before You Start</div>
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div>
                <h2 className="display-bold text-[clamp(3rem,9vw,7rem)]">HAVE THESE ITEMS READY</h2>
                <div className="brand-block-blue mt-10 p-6 md:p-8">
                  <Users className="h-7 w-7" />
                  <h3 className="mt-5 text-2xl font-black uppercase">Already have a company page?</h3>
                  <p className="mt-4 leading-relaxed text-white/80">Do not create a duplicate. Ask the teammate who created it to add the email connected to your Formula Forum account from the <strong className="text-white">Team</strong> section.</p>
                </div>
              </div>
              <div className="border-t border-black/20">
                {checklistItems.map((item, index) => (
                  <div key={item} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-black/15 py-4 text-sm leading-relaxed md:text-base">
                    <span className="font-black tabular-nums text-[hsl(var(--secondary))]">{String(index + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <StepHeader number="01" eyebrow="Open Partner Hub" title="START INSIDE THE FORMULA APP" />
              <p className="max-w-xl text-lg leading-relaxed text-white/65">After signing in, tap <strong className="text-white">Partner Hub</strong> in the bottom navigation. If your organization does not have a page yet, tap <strong className="text-white">Create partner page</strong>.</p>
              <p className="mt-8 border-t border-white/20 pt-5 text-sm text-white/50">Use the same email address that received your Formula Forum partner invitation.</p>
            </div>
            <GuideScreenshot src="/assets/partner-hub-guide/01-partner-start.png" alt="Partner Hub starting screen" onOpen={openImage} label="START" />
          </div>
        </section>

        <section className="border-y border-white/15 px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <GuideScreenshot src="/assets/partner-hub-guide/02-create-partner-page.png" alt="Create Partner Page screen" onOpen={openImage} label="CREATE" />
            <div>
              <StepHeader number="02" eyebrow="Create Your Page" title="NAME YOUR COMPANY PAGE" />
              <p className="max-w-xl text-lg leading-relaxed text-white/65">Enter your company’s official business name, then tap <strong className="text-white">Create Partner Page</strong>. The app opens the editor so you can add the rest of your information.</p>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto grid max-w-7xl items-start gap-16 lg:grid-cols-2 lg:gap-24">
            <div className="lg:sticky lg:top-28">
              <StepHeader number="03" eyebrow="Images And Message" title="MAKE YOUR PAGE RECOGNIZABLE" />
              <ol className="border-t border-white/20">
                {[
                  "Tap Change Banner and choose a wide image from your photo library.",
                  "Tap the camera icon on the round logo and add your square company logo.",
                  "Add a clear slogan that communicates the result your company creates.",
                  "Write a short description explaining who you help, what you provide, and why attendees should visit your booth.",
                  "Add your booth number so attendees can find you.",
                ].map((item, index) => (
                  <li key={item} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-white/15 py-4 text-sm leading-relaxed text-white/65">
                    <span className="font-black text-[hsl(var(--secondary))]">{String(index + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
              <div className="brand-block-blue mt-8 p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">Write A Stronger Message</p>
                <p className="mt-4 text-xl font-black uppercase">Reduce agency admin work and spend more time selling.</p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">Lead with the result attendees gain. Then explain who you help and offer a specific reason to visit your booth.</p>
              </div>
            </div>
            <GuideScreenshot src="/assets/partner-hub-guide/03-edit-images-details.png" alt="Edit Partner Page image and company fields" onOpen={openImage} label="EDIT" />
          </div>
        </section>

        <section className="bg-[hsl(var(--secondary))] px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto grid max-w-7xl items-start gap-16 lg:grid-cols-2 lg:gap-24">
            <GuideScreenshot src="/assets/partner-hub-guide/04-edit-links-handouts.png" alt="Partner links, video, booking, and handout fields" onOpen={openImage} label="OFFER" />
            <div className="lg:sticky lg:top-28">
              <StepHeader number="04" eyebrow="Links And Offer" title="GIVE ATTENDEES A CLEAR NEXT STEP" />
              <div className="border-t border-white/35">
                {setupFields.map(([label, copy]) => (
                  <div key={label} className="border-b border-white/35 py-4">
                    <p className="font-black uppercase text-white">{label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/75">{copy}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 border-2 border-white p-6">
                <div className="flex items-center gap-3 font-black uppercase"><FileText className="h-5 w-5" /> Build A Stronger Event Offer</div>
                <p className="mt-3 text-sm leading-relaxed text-white/80">Use a one-page PDF that says what the attendee receives, who it is for, what to do next, and whether an event-only deadline applies.</p>
              </div>
              <p className="mt-6 text-sm font-bold">When everything is complete, return to the top and tap Save.</p>
            </div>
          </div>
        </section>

        <section className="bg-[hsl(0,0%,96%)] px-5 py-20 text-black md:px-12 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <StepHeader number="05" eyebrow="Review The Experience" title="SEE WHAT ATTENDEES WILL SEE" darkText />
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-black/65">Return to Partner Hub and open your public company page. Check every detail and tap every action before you share it.</p>
            </div>
            <div className="mt-10 grid items-start gap-10 lg:grid-cols-2">
              <GuideScreenshot src="/assets/partner-hub-guide/05-public-partner-page.png" alt="Attendee-facing public partner page" onOpen={openImage} label="PUBLIC PAGE" />
              <GuideScreenshot src="/assets/partner-hub-guide/06-public-video-offer.png" alt="Attendee-facing video, handout, and booking actions" onOpen={openImage} label="PUBLIC OFFER" />
            </div>
            <div className="mt-16 grid border-l border-t border-black/20 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Logo and banner display correctly",
                "Company message and booth number are easy to find",
                "Website, email, and phone links work",
                "Product video opens",
                "Both PDF handouts download",
                "Booking link opens the right calendar",
              ].map((item) => (
                <div key={item} className="flex min-h-24 items-start gap-3 border-b border-r border-black/20 p-5 text-sm font-semibold">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--secondary))]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="eyebrow mb-8">Stay Visible</div>
            <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
              <h2 className="display-bold text-[clamp(3rem,9vw,7rem)]">MAKE YOUR PAGE USEFUL AFTER SETUP</h2>
              <div className="border-t border-white/20 sm:grid sm:grid-cols-2">
                {[
                  [MapPin, "Lead with the result you create, not just a service list."],
                  [FileText, "Make your event offer specific and easy to understand."],
                  [CalendarDays, "Use a direct booking link instead of a general homepage."],
                  [Users, "Add teammates so your organization can respond quickly."],
                  [PlayCircle, "Keep your product video and page details current."],
                  [ExternalLink, "When event posting opens, share useful updates from Create Post."],
                ].map(([Icon, copy]) => {
                  const ItemIcon = Icon as typeof MapPin;
                  return (
                    <div key={String(copy)} className="flex items-start gap-3 border-b border-white/20 p-5 text-sm leading-relaxed text-white/65 sm:odd:border-r">
                      <ItemIcon className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--secondary))]" />
                      <span>{String(copy)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[hsl(var(--secondary))] px-5 py-20 md:px-12 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="eyebrow mb-7 text-white">Ready To Build?</div>
              <h2 className="display-bold text-[clamp(3.5rem,11vw,8rem)]">MAKE YOUR COMPANY EASIER TO DISCOVER</h2>
            </div>
            <div>
              <p className="max-w-xl text-lg leading-relaxed text-white/80">Complete your Partner Hub before October 14 so attendees can learn about your company, find your booth, and connect with your team.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <AppButton inverse />
                <a href={`mailto:${CONFIG.ORGANIZER_EMAIL}`} className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white px-6 py-4 text-sm font-black uppercase transition hover:bg-white hover:text-black">
                  <Mail className="h-4 w-4" /> Get Help
                </a>
              </div>
              <p className="mt-6 text-sm text-white/65">Questions? Email {CONFIG.ORGANIZER_EMAIL} or call {CONFIG.ORGANIZER_PHONE}.</p>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-3 bottom-3 z-30 flex justify-center sm:hidden"><AppButton /></div>

      {activeImage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" aria-label={activeImage.alt} onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveImage(null); }}>
          <button type="button" onClick={() => setActiveImage(null)} className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black text-white transition hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Close enlarged screenshot" autoFocus>
            <X className="h-5 w-5" />
          </button>
          <img src={activeImage.src} alt={activeImage.alt} className="max-h-[90vh] max-w-full border border-white/25 shadow-[18px_18px_0_hsl(var(--secondary))]" />
        </div>
      )}
    </div>
  );
};

export default PartnerHubGuide;
