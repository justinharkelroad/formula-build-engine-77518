import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Download,
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

type GuideScreenshotProps = {
  src: string;
  alt: string;
  onOpen: (src: string, alt: string) => void;
  className?: string;
};

const GuideScreenshot = ({ src, alt, onOpen, className = "" }: GuideScreenshotProps) => (
  <button
    type="button"
    onClick={() => onOpen(src, alt)}
    className={`group relative mx-auto block w-full max-w-[430px] overflow-hidden rounded-[2rem] border border-white/15 bg-[#071015] p-2 shadow-[0_30px_90px_-35px_rgba(0,0,0,0.9)] transition-transform duration-300 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f24b16] focus-visible:ring-offset-4 focus-visible:ring-offset-black ${className}`}
    aria-label={`Enlarge: ${alt}`}
  >
    <img
      src={src}
      alt={alt}
      className="h-auto w-full rounded-[1.45rem]"
      loading="lazy"
      width="430"
      height="932"
    />
    <span className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-black/85 px-3 py-2 text-xs font-semibold text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
      <ImageIcon className="h-3.5 w-3.5" />
      Enlarge
    </span>
  </button>
);

type StepHeaderProps = {
  number: string;
  eyebrow: string;
  title: string;
};

const StepHeader = ({ number, eyebrow, title }: StepHeaderProps) => (
  <div className="mb-6">
    <div className="mb-4 flex items-center gap-3">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f24b16] font-black text-white">
        {number}
      </span>
      <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#ff6b35]">{eyebrow}</span>
    </div>
    <h2 className="text-3xl font-black leading-tight text-white md:text-5xl">{title}</h2>
  </div>
);

const AppButton = ({ compact = false }: { compact?: boolean }) => (
  <a
    href={IOS_APP_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#f24b16] font-bold text-white transition-colors hover:bg-[#ff6330] focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${compact ? "px-4 py-2.5 text-sm" : "w-full max-w-[22rem] px-4 py-3 text-sm sm:w-auto sm:max-w-none sm:px-6 sm:py-3.5 sm:text-base"}`}
  >
    <Smartphone className="h-4 w-4" />
    Open the Formula Forum App
    <ArrowUpRight className="h-4 w-4" />
  </a>
);

const PartnerHubGuide = () => {
  const [activeImage, setActiveImage] = useState<{ src: string; alt: string } | null>(null);

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

  const openImage = (src: string, alt: string) => setActiveImage({ src, alt });

  return (
    <div className="min-h-screen bg-[#050a0d] text-white">
      <SEO
        title="Create Your Formula Forum Partner Hub | Partner Walkthrough"
        description="Follow this step-by-step Formula Forum partner walkthrough to add your logo, banner, company details, video, booking link, and event offer."
        path={GUIDE_PATH}
      />

      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#050a0d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <Link
            to="/partners"
            className="inline-flex items-center gap-3 text-sm font-semibold text-white/75 transition-colors hover:text-white"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5">
              <ArrowLeft className="h-4 w-4" />
            </span>
            <img src={f3Logo} alt="Formula Forum" className="h-8 w-8 object-contain" />
            <span className="hidden sm:inline">Partner Program</span>
          </Link>
          <div className="hidden sm:block">
            <AppButton compact />
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-32 md:px-8 md:pb-28 md:pt-44">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-40 top-8 h-[36rem] w-[36rem] rounded-full bg-[#f24b16]/20 blur-[130px]" />
            <div className="absolute -right-48 top-56 h-[34rem] w-[34rem] rounded-full bg-[#0797be]/15 blur-[140px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
          </div>

          <div className="relative mx-auto w-full min-w-0 max-w-5xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f24b16]/35 bg-[#f24b16]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ff6b35]">
              <CheckCircle2 className="h-4 w-4" />
              Partner setup guide
            </div>
            <h1 className="break-words text-[clamp(2.5rem,11.5vw,5rem)] font-black leading-[0.98] tracking-[-0.045em] sm:text-6xl md:text-8xl">
              Build a Partner Hub attendees remember.
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-base leading-relaxed text-white/68 sm:text-lg md:text-xl">
              Add your logo, booth details, product video, event offer, and booking link in one focused setup. Most partners finish in 10–15 minutes when their assets are ready.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <AppButton />
              <a
                href="#before-you-start"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 font-bold text-white transition-colors hover:bg-white/10"
              >
                See what you need
                <Download className="h-4 w-4" />
              </a>
            </div>
            <div className="mx-auto mt-10 flex w-full max-w-2xl flex-col items-center justify-center gap-2 px-2 text-sm text-white/55 sm:flex-row sm:gap-5 sm:px-0">
              <span className="inline-flex max-w-full items-start justify-center gap-2 text-center">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6b35]" />
                Complete before the event begins October 14, 2026
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
              <span>Sign in with your invited email</span>
            </div>
          </div>
        </section>

        <section id="before-you-start" className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="rounded-[2rem] border border-[#f24b16]/25 bg-[#f24b16]/10 p-7 md:p-9">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f24b16]">
                <Users className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-black">Already have a company page?</h2>
              <p className="mt-4 leading-relaxed text-white/70">
                Do not create a duplicate. Ask the teammate who created it to add the email connected to your Formula Forum account from the <strong className="text-white">Team</strong> section.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/12 bg-white/[0.045] p-7 md:p-9">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ff6b35]">Before you start</p>
                  <h2 className="mt-2 text-3xl font-black">Have these items ready</h2>
                </div>
                <span className="hidden rounded-full border border-white/10 px-3 py-1 text-xs text-white/45 sm:block">10–15 min setup</span>
              </div>
              <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                {checklistItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm leading-relaxed text-white/70">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0797be]/18 text-[#21b3d7]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <StepHeader number="1" eyebrow="Open Partner Hub" title="Start inside the Formula Forum app" />
              <p className="text-lg leading-relaxed text-white/68">
                After signing in, tap <strong className="text-white">Partner Hub</strong> in the bottom navigation. If your organization does not have a page yet, tap <strong className="text-white">Create partner page</strong>.
              </p>
              <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-relaxed text-white/60">
                Use the same email address that received your Formula Forum partner invitation.
              </div>
            </div>
            <GuideScreenshot
              src="/assets/partner-hub-guide/01-partner-start.png"
              alt="Partner Hub starting screen"
              onOpen={openImage}
            />
          </div>
        </section>

        <section className="border-y border-white/8 bg-white/[0.025] px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <GuideScreenshot
              src="/assets/partner-hub-guide/02-create-partner-page.png"
              alt="Create Partner Page screen"
              onOpen={openImage}
              className="lg:order-1"
            />
            <div className="lg:order-2">
              <StepHeader number="2" eyebrow="Create your page" title="Name your company page" />
              <p className="text-lg leading-relaxed text-white/68">
                Enter your company’s official business name, then tap <strong className="text-white">Create Partner Page</strong>. The app opens the page editor so you can add the rest of your information.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="lg:sticky lg:top-28">
              <StepHeader number="3" eyebrow="Images and message" title="Make your page recognizable" />
              <ol className="space-y-4 text-white/68">
                {[
                  "Tap Change Banner and choose a wide image from your photo library.",
                  "Tap the camera icon on the round logo and add your square company logo.",
                  "Add a clear slogan that communicates the result your company creates.",
                  "Write a short description explaining who you help, what you provide, and why attendees should visit your booth.",
                  "Add your booth number so attendees can find you.",
                ].map((item, index) => (
                  <li key={item} className="flex gap-4 leading-relaxed">
                    <span className="mt-0.5 font-black text-[#ff6b35]">{String(index + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 rounded-2xl border border-[#0797be]/25 bg-[#0797be]/10 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#21b3d7]">Write a stronger message</p>
                <p className="mt-4 font-bold text-white">Reduce agency admin work and spend more time selling.</p>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  Lead with the result attendees gain. Then explain who you help and offer a specific reason to visit your booth.
                </p>
              </div>
            </div>
            <GuideScreenshot
              src="/assets/partner-hub-guide/03-edit-images-details.png"
              alt="Edit Partner Page image and company fields"
              onOpen={openImage}
            />
          </div>
        </section>

        <section className="border-y border-white/8 bg-white/[0.025] px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-2 lg:gap-20">
            <GuideScreenshot
              src="/assets/partner-hub-guide/04-edit-links-handouts.png"
              alt="Partner links, video, booking, and handout fields"
              onOpen={openImage}
            />
            <div className="lg:sticky lg:top-28">
              <StepHeader number="4" eyebrow="Links and offer" title="Give attendees a clear next step" />
              <div className="space-y-3">
                {setupFields.map(([label, copy]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                    <p className="font-bold text-white">{label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/60">{copy}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-[#f24b16]/25 bg-[#f24b16]/10 p-6">
                <div className="flex items-center gap-3 font-bold">
                  <FileText className="h-5 w-5 text-[#ff6b35]" />
                  Build a stronger event offer
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  Use a one-page PDF that says what the attendee receives, who it is for, what to do next, and whether an event-only deadline applies.
                </p>
              </div>
              <p className="mt-6 text-sm font-semibold text-white/80">When everything is complete, return to the top and tap Save.</p>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <StepHeader number="5" eyebrow="Review the experience" title="See what attendees will see" />
              <p className="text-lg leading-relaxed text-white/68">
                Return to Partner Hub and open your public company page. Check every detail and tap every action before you share it.
              </p>
            </div>
            <div className="mt-12 grid items-start gap-8 lg:grid-cols-2">
              <GuideScreenshot
                src="/assets/partner-hub-guide/05-public-partner-page.png"
                alt="Attendee-facing public partner page"
                onOpen={openImage}
              />
              <GuideScreenshot
                src="/assets/partner-hub-guide/06-public-video-offer.png"
                alt="Attendee-facing video, handout, and booking actions"
                onOpen={openImage}
              />
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Logo and banner display correctly",
                "Company message and booth number are easy to find",
                "Website, email, and phone links work",
                "Product video opens",
                "Both PDF handouts download",
                "Booking link opens the right calendar",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-white/70">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#21b3d7]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(242,75,22,0.18),rgba(7,151,190,0.10))] p-7 md:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ff6b35]">Stay visible</p>
                <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">Make your page useful after setup.</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
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
                    <div key={String(copy)} className="flex items-start gap-3 rounded-2xl bg-black/25 p-5 text-sm leading-relaxed text-white/70">
                      <ItemIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#ff6b35]" />
                      <span>{String(copy)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-28 pt-10 text-center md:px-8 md:pb-32 md:pt-16">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ff6b35]">Ready to build?</p>
            <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Make your company easier to discover.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/65">
              Complete your Partner Hub before October 14 so attendees can learn about your company, find your booth, and connect with your team.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <AppButton />
              <a
                href={`mailto:${CONFIG.ORGANIZER_EMAIL}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 font-bold transition-colors hover:bg-white/10"
              >
                <Mail className="h-4 w-4" />
                Get help
              </a>
            </div>
            <p className="mt-6 text-sm text-white/45">
              Questions? Email {CONFIG.ORGANIZER_EMAIL} or call {CONFIG.ORGANIZER_PHONE}.
            </p>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-3 bottom-3 z-30 flex justify-center sm:hidden">
        <AppButton />
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
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
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close enlarged screenshot"
            autoFocus
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={activeImage.src}
            alt={activeImage.alt}
            className="max-h-[90vh] max-w-full rounded-2xl border border-white/15 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default PartnerHubGuide;
