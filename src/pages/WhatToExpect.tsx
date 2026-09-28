import { useCallback, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Lock } from "lucide-react";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import CustomCursor from "@/components/CustomCursor";
import BoldHeader from "@/components/BoldHeader";
import PassDialogHost from "@/components/PassDialogHost";
import { PassDialogProvider } from "@/contexts/PassDialogContext";
import GiantTicketFooter from "@/components/sections/GiantTicketFooter";
import { WalkthroughCard, WalkthroughPlayer } from "@/components/walkthroughs/Walkthroughs";
import { walkthroughs, type Walkthrough } from "@/config/walkthroughs";
import { FORMULA_PARTNER_HUB_WEB_URL } from "@/config/appLinks";
import { ATTENDEE, PARTNER, SESSIONS, type Block } from "@/config/whatToExpect";

const WHAT_TO_EXPECT_PATH = "/what-to-expect";

type View = "attendee" | "partner";

/* ---------- small building blocks ---------- */

const Eyebrow = ({ children, dark = false }: { children: string; dark?: boolean }) => (
  <div className={`mb-4 text-xs font-bold uppercase tracking-[0.18em] ${dark ? "text-[hsl(var(--secondary))]" : "text-[hsl(var(--primary))]"}`}>{children}</div>
);

const SectionHeading = ({ children, dark = false }: { children: string; dark?: boolean }) => (
  <h2 className={`display-bold text-[clamp(2.25rem,6vw,4.75rem)] ${dark ? "text-black" : "text-white"}`}>{children}</h2>
);

const Prose = ({ children, dark = false }: { children: string; dark?: boolean }) => (
  <p className={`max-w-3xl text-base leading-relaxed md:text-lg ${dark ? "text-black/70" : "text-white/70"}`}>{children}</p>
);

const BlockList = ({ blocks, dark = false }: { blocks: readonly Block[]; dark?: boolean }) => (
  <div className={`grid border-l border-t md:grid-cols-3 ${dark ? "border-black/15" : "border-white/15"}`}>
    {blocks.map((block) => (
      <div key={block.eyebrow} className={`border-b border-r p-6 md:p-8 ${dark ? "border-black/15" : "border-white/15"}`}>
        <Eyebrow dark={dark}>{block.eyebrow}</Eyebrow>
        <p className={`text-sm leading-relaxed md:text-base ${dark ? "text-black/70" : "text-white/70"}`}>{block.body}</p>
      </div>
    ))}
  </div>
);

const PullQuote = ({ children, dark = false }: { children: string; dark?: boolean }) => (
  <blockquote className={`max-w-3xl border-l-4 border-[hsl(var(--primary))] pl-6 text-xl font-black leading-snug md:text-2xl ${dark ? "text-black" : "text-white"}`}>{children}</blockquote>
);

const Callout = ({ eyebrow, children }: { eyebrow: string; children: string }) => (
  <div className="brand-block-blue rounded-2xl p-7 md:rounded-3xl md:p-10">
    <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-white/70">{eyebrow}</div>
    <p className="max-w-3xl text-xl font-black leading-snug text-white md:text-3xl">{children}</p>
  </div>
);

const SessionColumns = ({ dark = false }: { dark?: boolean }) => (
  <div className="grid gap-10 md:grid-cols-2">
    {([
      ["About the agency", SESSIONS.business, "text-[hsl(var(--secondary))]"],
      ["About you", SESSIONS.personal, "text-[hsl(var(--primary))]"],
    ] as const).map(([label, titles, tone]) => (
      <div key={label}>
        <div className={`mb-3 text-xs font-bold uppercase tracking-[0.18em] ${tone}`}>{label}</div>
        {/* Deliberately a <ul> with no index: session order is never published (agenda rule). */}
        <ul className={`border-t ${dark ? "border-black/15" : "border-white/15"}`}>
          {titles.map((title) => (
            <li key={title} className={`border-b py-4 text-lg font-black ${dark ? "border-black/15 text-black" : "border-white/15 text-white"}`}>{title}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const VideoRow = ({ ids, onPlay }: { ids: Walkthrough["id"][]; onPlay: (walkthrough: Walkthrough) => void }) => (
  <section className="px-5 py-16 md:px-12 md:py-24">
    <div className="mx-auto max-w-7xl">
      <Eyebrow>See the app first</Eyebrow>
      <SectionHeading>WATCH THE WALKTHROUGH</SectionHeading>
      <div className="mt-4"><Prose>Short tours of the app exactly as you will use it, recorded with sample data.</Prose></div>
      <div className="mt-12 grid max-w-4xl gap-10 sm:grid-cols-2">
        {walkthroughs.filter((walkthrough) => ids.includes(walkthrough.id)).map((walkthrough) => (
          <WalkthroughCard key={walkthrough.id} walkthrough={walkthrough} onPlay={onPlay} />
        ))}
      </div>
      <Link to="/formula-app-guide" className="mt-12 inline-flex items-center gap-2 border-b border-white pb-1 text-sm font-black uppercase text-white transition hover:text-[hsl(var(--secondary))]">
        The complete app guide <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </section>
);

/* ---------- the two views ---------- */

const AttendeeView = ({ onPlay }: { onPlay: (walkthrough: Walkthrough) => void }) => (
  <>
    <section className="bg-[hsl(0,0%,96%)] px-5 py-16 text-black md:px-12 md:py-24">
      <div className="mx-auto max-w-7xl">
        <Eyebrow dark>{ATTENDEE.beforeYouLand.eyebrow}</Eyebrow>
        <Prose dark>{ATTENDEE.beforeYouLand.body}</Prose>
      </div>
    </section>

    <section className="px-5 py-16 md:px-12 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <SectionHeading>{ATTENDEE.inTheRoom.title}</SectionHeading>
        <Prose>{ATTENDEE.inTheRoom.lead}</Prose>
        <SessionColumns />
        <div className="flex flex-col gap-4">
          <Prose>{ATTENDEE.inTheRoom.howItWorks}</Prose>
          <Prose>{ATTENDEE.inTheRoom.yours}</Prose>
        </div>
        <Callout eyebrow="One session, one Domino">{ATTENDEE.inTheRoom.domino}</Callout>
      </div>
    </section>

    <section className="bg-[hsl(0,0%,96%)] px-5 py-16 text-black md:px-12 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <SectionHeading dark>{ATTENDEE.team.title}</SectionHeading>
        <Prose dark>{ATTENDEE.team.lead}</Prose>
        <div className="grid gap-6 md:grid-cols-2">
          {[ATTENDEE.team.owner, ATTENDEE.team.member].map((seat, index) => (
            <div key={seat.eyebrow} className="rounded-2xl border border-black/10 bg-white p-7 md:p-8">
              <div className={`mb-3 text-xs font-bold uppercase tracking-[0.18em] ${index === 0 ? "text-[hsl(var(--secondary))]" : "text-[hsl(var(--primary))]"}`}>{seat.eyebrow}</div>
              <h3 className="text-2xl font-black uppercase leading-tight">{seat.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-black/70 md:text-base">{seat.body}</p>
            </div>
          ))}
        </div>
        <div>
          <Eyebrow dark>Why that matters</Eyebrow>
          <Prose dark>{ATTENDEE.team.whyItMatters}</Prose>
        </div>
        <div>
          <Eyebrow dark>After Formula, this carries into Progress</Eyebrow>
          <Prose dark>{ATTENDEE.team.progress}</Prose>
        </div>
      </div>
    </section>

    <section className="px-5 py-16 md:px-12 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <SectionHeading>{ATTENDEE.map.title}</SectionHeading>
        <Prose>{ATTENDEE.map.body}</Prose>
        <PullQuote>{ATTENDEE.map.kicker}</PullQuote>
      </div>
    </section>

    <section className="border-t border-white/15 px-5 py-16 md:px-12 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <SectionHeading>{ATTENDEE.progress.title}</SectionHeading>
        <Prose>{ATTENDEE.progress.lead}</Prose>

        <div>
          <Eyebrow>{ATTENDEE.progress.runway.eyebrow}</Eyebrow>
          <div className="mb-6 grid max-w-3xl grid-cols-3 gap-3 md:gap-5">
            {["30", "60", "90"].map((days) => (
              <div key={days} className="rounded-2xl border border-white/15 p-5 md:p-6">
                <div className="display-bold text-4xl text-[hsl(var(--secondary))] md:text-6xl">{days}</div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50 md:text-xs">Day review</div>
              </div>
            ))}
          </div>
          <Prose>{ATTENDEE.progress.runway.body}</Prose>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/50">{ATTENDEE.progress.runway.note}</p>
        </div>

        <BlockList blocks={ATTENDEE.progress.blocks} />
        <p className="max-w-3xl text-sm leading-relaxed text-white/50">{ATTENDEE.progress.offline}</p>
        <PullQuote>{ATTENDEE.progress.pullQuote}</PullQuote>
        <BlockList blocks={ATTENDEE.progress.more} />
      </div>
    </section>

    <VideoRow ids={["attendees", "team"]} onPlay={onPlay} />

    <section className="px-5 pb-20 md:px-12 md:pb-28">
      <div className="mx-auto max-w-7xl rounded-2xl border border-white/15 bg-[hsl(0,0%,5%)] p-8 md:rounded-3xl md:p-14">
        <Eyebrow>{ATTENDEE.closer.eyebrow}</Eyebrow>
        <h2 className="display-bold max-w-4xl text-[clamp(2.25rem,6vw,4.75rem)]">{ATTENDEE.closer.title}</h2>
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/70 md:text-lg">{ATTENDEE.closer.body}</p>
      </div>
    </section>
  </>
);

const PartnerView = ({ onPlay }: { onPlay: (walkthrough: Walkthrough) => void }) => (
  <>
    <section className="bg-[hsl(0,0%,96%)] px-5 py-16 text-black md:px-12 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <SectionHeading dark>{PARTNER.workingRoom.title}</SectionHeading>
        <Prose dark>{PARTNER.workingRoom.lead}</Prose>
        <SessionColumns dark />
        <div className="flex flex-col gap-4">
          {PARTNER.workingRoom.body.map((paragraph) => <Prose key={paragraph} dark>{paragraph}</Prose>)}
        </div>
      </div>
    </section>

    <section className="px-5 py-16 md:px-12 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <SectionHeading>{PARTNER.yourPeople.title}</SectionHeading>
        <Prose>{PARTNER.yourPeople.body}</Prose>
        <Callout eyebrow="The one difference">{PARTNER.yourPeople.callout}</Callout>
      </div>
    </section>

    <section className="bg-[hsl(0,0%,96%)] px-5 py-16 text-black md:px-12 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <SectionHeading dark>{PARTNER.track.title}</SectionHeading>
        <Prose dark>{PARTNER.track.lead}</Prose>
        <div className="grid gap-5 md:grid-cols-3">
          {PARTNER.track.parts.map((part, index) => (
            <div key={part.title} className="rounded-2xl border border-black/10 bg-white p-7">
              <div className={`mb-3 text-xs font-bold uppercase tracking-[0.18em] ${index === 2 ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--secondary))]"}`}>Part {index + 1}</div>
              <h3 className="text-xl font-black uppercase">{part.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-black/70">{part.body}</p>
            </div>
          ))}
        </div>
        <Prose dark>{PARTNER.track.after}</Prose>
        <p className="max-w-3xl text-sm leading-relaxed text-black/50">{PARTNER.track.personal}</p>
      </div>
    </section>

    <section className="px-5 py-16 md:px-12 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <SectionHeading>{PARTNER.mapAndProgress.title}</SectionHeading>
        <Prose>{PARTNER.mapAndProgress.body}</Prose>
        <PullQuote>{PARTNER.mapAndProgress.pullQuote}</PullQuote>
      </div>
    </section>

    <section className="border-t border-white/15 px-5 py-16 md:px-12 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <SectionHeading>{PARTNER.directory.title}</SectionHeading>
        <Prose>{PARTNER.directory.lead}</Prose>
        <ul className="grid max-w-4xl border-t border-white/15 sm:grid-cols-2 sm:gap-x-10">
          {PARTNER.directory.fields.map((field) => (
            <li key={field} className="border-b border-white/15 py-4 font-bold text-white">{field}</li>
          ))}
        </ul>
        <Prose>{PARTNER.directory.manage}</Prose>
        <div className="flex flex-wrap gap-4">
          <a href={FORMULA_PARTNER_HUB_WEB_URL} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black uppercase text-black transition hover:bg-[hsl(var(--secondary))] hover:text-white">
            Open the Partner Hub <ArrowUpRight className="h-4 w-4" />
          </a>
          <Link to="/partners/partner-hub-guide" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-black uppercase text-white transition hover:bg-white hover:text-black">
            Partner Hub setup guide <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>

    <section className="bg-[hsl(0,0%,96%)] px-5 py-16 text-black md:px-12 md:py-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Lock className="h-7 w-7 text-[hsl(var(--secondary))]" aria-hidden="true" />
        <SectionHeading dark>{PARTNER.privacy.title}</SectionHeading>
        <Prose dark>{PARTNER.privacy.body}</Prose>
        <p className="max-w-3xl text-lg font-black">{PARTNER.privacy.kicker}</p>
      </div>
    </section>

    <VideoRow ids={["partners"]} onPlay={onPlay} />

    <section className="px-5 pb-20 md:px-12 md:pb-28">
      <div className="mx-auto max-w-7xl rounded-2xl border border-white/15 bg-[hsl(0,0%,5%)] p-8 md:rounded-3xl md:p-14">
        <Eyebrow>{PARTNER.beforeOct14.eyebrow}</Eyebrow>
        <h2 className="display-bold text-[clamp(2.25rem,6vw,4.75rem)]">{PARTNER.beforeOct14.title}</h2>
        <ol className="mt-8 border-t border-white/15">
          {PARTNER.beforeOct14.steps.map((step, index) => (
            <li key={step} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-white/15 py-5 text-base leading-relaxed text-white/75">
              <span className="font-black text-[hsl(var(--secondary))]">{String(index + 1).padStart(2, "0")}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  </>
);

/* ---------- page ---------- */

const WhatToExpect = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const view: View = searchParams.get("for") === "partner" ? "partner" : "attendee";
  const [activeVideo, setActiveVideo] = useState<Walkthrough | null>(null);
  const closeVideo = useCallback(() => setActiveVideo(null), []);

  const selectView = (next: View) => {
    const params = new URLSearchParams(searchParams);
    if (next === "partner") params.set("for", "partner");
    else params.delete("for");
    setSearchParams(params, { replace: true });
  };

  const hero = view === "partner" ? PARTNER : ATTENDEE;

  return (
    <PassDialogProvider>
      <div className="min-h-screen overflow-x-hidden bg-black text-white">
        <SEO
          title="What to Expect at Formula Forum 2026 | Sessions, Your 2027 Map, and Progress"
          description="Eight working sessions, one Domino each, your 2027 Map, and 90 days of follow-through in the Formula app. What agency owners, their teams, and partners experience in Orlando and after."
          path={WHAT_TO_EXPECT_PATH}
        />
        <StructuredData page="general" />
        <CustomCursor />
        <BoldHeader />
        <PassDialogHost />

        <section className="relative overflow-hidden px-5 pb-16 pt-28 md:px-12 md:pb-20 md:pt-40">
          <div className="pointer-events-none absolute inset-0">
            <div className="hero-orb hero-orb-secondary absolute -left-32 top-1/4 h-[500px] w-[500px]" />
            <div className="hero-orb hero-orb-primary absolute bottom-0 right-0 h-[400px] w-[400px] opacity-40" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="eyebrow mb-6">What to expect · Orlando 2026</div>

            <div role="tablist" aria-label="Choose your seat" className="mb-10 inline-flex rounded-full border border-white/25 p-1">
              {([
                ["attendee", "Owners & teams"],
                ["partner", "Partners"],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={view === id}
                  onClick={() => selectView(id)}
                  className={`rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wide transition md:px-7 md:text-sm ${view === id ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <h1 className="display-bold max-w-6xl text-[clamp(2.5rem,8vw,6.5rem)]">{hero.heroTitle}</h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-white/70 md:text-2xl">{hero.heroLead}</p>
          </div>
        </section>

        <main>
          {view === "partner" ? <PartnerView onPlay={setActiveVideo} /> : <AttendeeView onPlay={setActiveVideo} />}
        </main>

        <GiantTicketFooter />
        <WalkthroughPlayer walkthrough={activeVideo} onClose={closeVideo} />
      </div>
    </PassDialogProvider>
  );
};

export default WhatToExpect;
