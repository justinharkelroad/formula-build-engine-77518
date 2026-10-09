import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownToLine, ArrowRight, Check, FileText, Folder, Loader2, LogOut, PlayCircle } from "lucide-react";
import SEO from "@/components/SEO";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import {
  PLATFORM_DETAIL,
  PLATFORM_LABEL,
  PORTAL_SKILLS,
  SUPPORT_EMAIL,
  type PortalPlatform,
  type PortalStatus,
  denialMessage,
  downloadUrl,
  isEmail,
  isPortalStatus,
  loadStatus,
  parseVimeoMessage,
  progressStep,
  requestAccess,
  requestCode,
  savePlatform,
  saveProgress,
  verifyCode,
} from "@/lib/aiPortal";

/**
 * Private post-event library for Formula 2026 attendees.
 *
 * Linked from nowhere and noindexed; the URL is shown on the closing Zoom
 * call. Hiding the URL is not the protection: sign-in is an emailed one-time
 * code for roster, purchaser, partner or manually approved emails, and every
 * replay, file and progress write is re-checked server-side.
 */

const SEO_PROPS = {
  title: "Formula AI Toolkit | Formula Forum 2026",
  description: "Private replays, guides, and starter files for Formula 2026 attendees.",
  path: "/ai-portal",
  noindex: true,
} as const;

type Phase =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "denied"; reason: string; email: string | null }
  | { kind: "ready"; status: PortalStatus };

const shell = "min-h-screen bg-black text-white";
const panel = "rounded-2xl bg-[hsl(0,0%,96%)] p-6 text-black md:rounded-3xl md:p-10";
const eyebrow = "text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--secondary))]";
const field =
  "w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base text-black outline-none focus:border-black focus:ring-2 focus:ring-[hsl(var(--secondary))]";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";
const linkButton = "font-semibold underline underline-offset-4 hover:text-black/70";

const AIPortal = () => {
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setPhase({ kind: "signed-out" });
      return;
    }
    try {
      const status = await loadStatus();
      setPhase(
        isPortalStatus(status)
          ? { kind: "ready", status }
          : { kind: "denied", reason: status.reason, email: data.session.user.email ?? null },
      );
    } catch {
      setPhase({ kind: "denied", reason: "unavailable", email: data.session.user.email ?? null });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setPhase({ kind: "signed-out" });
  };

  return (
    <div className={shell}>
      <SEO {...SEO_PROPS} />
      <header className="border-b border-white/10 px-5 py-4 md:px-12">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="text-sm font-black tracking-[0.2em]">
            FORMULA <span className="text-white/45">· AI TOOLKIT</span>
          </div>
          {phase.kind === "ready" || phase.kind === "denied" ? (
            <button onClick={signOut} className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
              <span className="hidden max-w-[16rem] truncate sm:inline">
                {phase.kind === "ready" ? phase.status.member.email : phase.email}
              </span>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          ) : (
            <span className="text-sm text-white/45">Private access</span>
          )}
        </div>
      </header>

      {phase.kind === "loading" && (
        <div className="flex min-h-[60vh] items-center justify-center gap-3 text-white/70">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          Opening your toolkit…
        </div>
      )}
      {phase.kind === "signed-out" && <SignIn onSignedIn={refresh} />}
      {phase.kind === "denied" && <Denied reason={phase.reason} email={phase.email} onSignOut={signOut} />}
      {phase.kind === "ready" && <Toolkit status={phase.status} />}

      <footer className="px-5 py-10 text-center text-xs text-white/40 md:px-12">
        Private material for Formula 2026 attendees and approved guests. Questions:{" "}
        <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </footer>
    </div>
  );
};

/* ------------------------------------------------------------------ sign-in */

const SignIn = ({ onSignedIn }: { onSignedIn: () => Promise<void> }) => {
  const [step, setStep] = useState<"email" | "code" | "request" | "requested">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (step !== "code") return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  const sendCode = async () => {
    if (!isEmail(email)) {
      setMessage("Enter the email address you registered with.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const state = await requestCode(email.trim());
      if (state === "closed") {
        setMessage("The toolkit opens on the Formula closing call. Come back to this page then.");
      } else if (state === "rate_limited") {
        setMessage("Too many code requests for this email. Wait 15 minutes, then try again.");
      } else {
        setCode("");
        setStep("code");
        setResendAt(Date.now() + 30_000);
      }
    } catch {
      setMessage("Something went wrong on our side. Try again in a minute.");
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (value: string) => {
    if (value.length !== 6) return;
    setBusy(true);
    setMessage(null);
    const ok = await verifyCode(email, value);
    if (ok) {
      await onSignedIn();
    } else {
      setMessage("That code did not work. Check the newest email, or send a new code.");
      setCode("");
    }
    setBusy(false);
  };

  return (
    <main className="px-5 py-12 md:px-12 md:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className={eyebrow}>Formula 2026 · Private toolkit</div>
          <h1 className="display-bold mt-5 text-[clamp(2.75rem,9vw,6.5rem)] leading-[0.9]">
            Your Formula<br />AI toolkit.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            The Agency AI Install replays, build guides, Claude and Codex starter packs, and ten agency skills. Sign in
            with the email you registered with.
          </p>
        </div>

        <div className={panel}>
          {step === "email" && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void sendCode();
              }}
            >
              <h2 className="text-2xl font-black">Sign in</h2>
              <p className="mt-2 text-sm text-black/60">We'll email you a 6-digit code. No password needed.</p>
              <label htmlFor="portal-email" className="mt-6 block text-sm font-bold">
                Registration email
              </label>
              <input
                id="portal-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`${field} mt-2`}
                placeholder="you@agency.com"
              />
              {message && <p role="status" className="mt-3 text-sm font-semibold text-black/75">{message}</p>}
              <button type="submit" disabled={busy} className={`${primaryButton} mt-6 w-full`}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Email me a code
              </button>
              <p className="mt-5 text-sm text-black/60">
                Registered under another email, or attended as a guest?{" "}
                <button type="button" className={linkButton} onClick={() => { setMessage(null); setStep("request"); }}>
                  Request access
                </button>
              </p>
            </form>
          )}

          {step === "code" && (
            <div>
              <h2 className="text-2xl font-black">Check your email</h2>
              <p className="mt-2 text-sm leading-relaxed text-black/60">
                If <strong className="text-black">{email.trim()}</strong> is on the Formula 2026 list, a 6-digit code is
                on its way from tickets@theformulaforum.com. It can take a minute; check spam too.
              </p>
              <div className="mt-6">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={(value) => {
                    const digits = value.replace(/\D/g, "");
                    setCode(digits);
                    if (digits.length === 6) void submitCode(digits);
                  }}
                  disabled={busy}
                  autoFocus
                  inputMode="numeric"
                  aria-label="6-digit code"
                >
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot key={index} index={index} className="h-14 w-11 border-black/20 bg-white text-xl font-bold sm:w-12" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {message && <p role="status" className="mt-3 text-sm font-semibold text-black/75">{message}</p>}
              {busy && (
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-black/60">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Checking…
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-black/60">
                <button
                  type="button"
                  className={linkButton}
                  disabled={busy || now < resendAt}
                  onClick={() => void sendCode()}
                >
                  {now < resendAt ? `Send a new code in ${Math.ceil((resendAt - now) / 1000)}s` : "Send a new code"}
                </button>
                <button type="button" className={linkButton} onClick={() => { setMessage(null); setStep("email"); }}>
                  Use a different email
                </button>
                <button type="button" className={linkButton} onClick={() => { setMessage(null); setStep("request"); }}>
                  No code? Request access
                </button>
              </div>
            </div>
          )}

          {step === "request" && <RequestAccess initialEmail={email} onDone={() => setStep("requested")} onBack={() => setStep("email")} />}

          {step === "requested" && (
            <div>
              <h2 className="text-2xl font-black">Request received</h2>
              <p className="mt-3 text-sm leading-relaxed text-black/65">
                Our team will review it. Once approved, come back here and sign in with the email you entered. You will
                not get a separate email about the approval.
              </p>
              <button type="button" className={`${primaryButton} mt-6`} onClick={() => setStep("email")}>
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

const RequestAccess = ({ initialEmail, onDone, onBack }: { initialEmail: string; onDone: () => void; onBack: () => void }) => {
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim() || !isEmail(email)) {
      setMessage("Enter your name and the email you want to use.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await requestAccess({ email: email.trim(), name: name.trim(), note: note.trim() || undefined });
      onDone();
    } catch {
      setMessage("Something went wrong on our side. Try again in a minute.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h2 className="text-2xl font-black">Request access</h2>
      <p className="mt-2 text-sm text-black/60">
        For attendees registered under a different email, and guests of Formula 2026.
      </p>
      <label htmlFor="request-name" className="mt-6 block text-sm font-bold">Your name</label>
      <input id="request-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" className={`${field} mt-2`} />
      <label htmlFor="request-email" className="mt-4 block text-sm font-bold">Email to sign in with</label>
      <input id="request-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={`${field} mt-2`} />
      <label htmlFor="request-note" className="mt-4 block text-sm font-bold">
        Anything that helps us match you <span className="font-normal text-black/50">(optional)</span>
      </label>
      <textarea
        id="request-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Agency name, or the email you registered with"
        className={`${field} mt-2`}
      />
      {message && <p role="status" className="mt-3 text-sm font-semibold text-black/75">{message}</p>}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Send request
        </button>
        <button type="button" className={`${linkButton} text-sm text-black/60`} onClick={onBack}>
          Back to sign in
        </button>
      </div>
    </form>
  );
};

const Denied = ({ reason, email, onSignOut }: { reason: string; email: string | null; onSignOut: () => void }) => (
  <main className="px-5 py-16 md:px-12">
    <div className={`${panel} mx-auto max-w-xl`}>
      <h1 className="text-3xl font-black">No toolkit access</h1>
      <p className="mt-3 leading-relaxed text-black/65">
        {reason === "unavailable" ? "We could not load the toolkit. Refresh the page in a minute." : denialMessage(reason)}
        {email ? <> Signed in as <strong className="text-black">{email}</strong>.</> : null}
      </p>
      <p className="mt-3 text-sm text-black/60">
        Think this is a mistake? Sign out and use “Request access”, or email{" "}
        <a className={linkButton} href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
      <button type="button" onClick={onSignOut} className={`${primaryButton} mt-6`}>
        Sign out
      </button>
    </div>
  </main>
);

/* ------------------------------------------------------------------ toolkit */

const DownloadButton = ({ assetId, label, detail }: { assetId: string; label: string; detail: string }) => {
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const start = async () => {
    setState("busy");
    try {
      window.location.assign(await downloadUrl(assetId));
      setState("idle");
    } catch {
      setState("error");
    }
  };
  return (
    <button
      type="button"
      onClick={() => void start()}
      disabled={state === "busy"}
      className="group flex w-full items-start gap-4 border-t border-black/12 py-4 text-left first:border-t-0 disabled:opacity-60"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white">
        {state === "busy" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />}
      </span>
      <span>
        <span className="block font-bold group-hover:underline">{label}</span>
        <span className="block text-sm text-black/60">
          {state === "error" ? "Download unavailable right now. Refresh and try again." : detail}
        </span>
      </span>
    </button>
  );
};

const Replay = ({
  contentId,
  embedUrl,
  title,
  initialPercent,
}: {
  contentId: string;
  embedUrl: string;
  title: string;
  initialPercent: number;
}) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const saved = useRef(progressStep(initialPercent));
  const [furthest, setFurthest] = useState(initialPercent);

  useEffect(() => {
    const record = (percent: number) => {
      const step = progressStep(percent);
      if (step <= saved.current) return;
      saved.current = step;
      setFurthest((current) => Math.max(current, step));
      void saveProgress(contentId, step).catch(() => undefined);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      const message = parseVimeoMessage(event.origin, event.data);
      if (!message) return;
      if (message.event === "ready") {
        for (const value of ["timeupdate", "ended"]) {
          frame.current?.contentWindow?.postMessage({ method: "addEventListener", value }, "https://player.vimeo.com");
        }
      } else if (message.event === "timeupdate") {
        record(message.percent);
      } else {
        record(100);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [contentId]);

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-white/5">
        <iframe
          ref={frame}
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/55">
        <PlayCircle className="h-4 w-4" aria-hidden="true" />
        {furthest > 0 ? `Furthest reached: ${furthest}%` : "Not started"}
      </p>
    </div>
  );
};

const Section = ({ number, eyebrowText, title, children }: { number: string; eyebrowText: string; title: string; children: React.ReactNode }) => (
  <section className="border-t border-white/10 py-14 md:py-20">
    <div className="grid gap-8 lg:grid-cols-[0.32fr_0.68fr]">
      <div>
        <div className="font-mono text-sm text-white/40">{number}</div>
        <div className={`${eyebrow} mt-2`}>{eyebrowText}</div>
        <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  </section>
);

const Toolkit = ({ status }: { status: PortalStatus }) => {
  const [platform, setPlatform] = useState<PortalPlatform>(status.member.platform ?? "claude");
  const detail = PLATFORM_DETAIL[platform];
  const video = (id: string) => status.videos.find((v) => v.id === id);
  const firstName = status.member.displayName?.split(" ")[0];
  const accessEnds = new Date(status.accessUntil).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });

  const choose = (next: PortalPlatform) => {
    setPlatform(next);
    void savePlatform(next).catch(() => undefined);
  };

  const day1 = video("day-1");
  const day2 = video("day-2");

  return (
    <main className="px-5 md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="py-12 md:py-20">
          <div className={eyebrow}>Formula 2026 · Agency AI Install</div>
          {firstName ? <p className="mt-5 text-xl font-bold text-white/80 md:text-2xl">Welcome, {firstName}.</p> : null}
          <h1 className="display-bold mt-3 text-[clamp(2.75rem,9vw,6.5rem)] leading-[0.9]">
            Build it.<br />Train it.<br />Use it.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            Set up your folder, watch the two build sessions in order, then put the skills to work. Every file sits next
            to the step that uses it. Your access runs through {accessEnds}.
          </p>

          <div className="mt-10" role="radiogroup" aria-label="Which AI app do you use?">
            <div className="mb-3 text-sm font-bold text-white/60">Which app are you building in?</div>
            <div className="inline-flex rounded-full bg-white/10 p-1">
              {(["claude", "codex"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={platform === option}
                  onClick={() => choose(option)}
                  className={`rounded-full px-6 py-2.5 text-sm font-bold transition ${
                    platform === option ? "bg-white text-black" : "text-white/70 hover:text-white"
                  }`}
                >
                  {PLATFORM_LABEL[option]}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-white/45">
              Both versions stay available. This only changes which files are shown.
            </p>
          </div>
        </div>

        <Section number="00" eyebrowText="Start here" title="Set up your brain folder">
          <ol className="space-y-4 text-white/80">
            {[
              <>Install {detail.app}, sign in, and make sure it's up to date.</>,
              <>Create a folder named <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm">MY BIZ BRAIN</code> in Documents.</>,
              <>Download the {PLATFORM_LABEL[platform]} starter pack below and unzip it <em>into</em> that folder, keeping its folders as they are.</>,
              <>
                Open <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm">MY BIZ BRAIN</code> in{" "}
                {PLATFORM_LABEL[platform]} and send: <span className="font-semibold text-white">“Read INSTALL-STANDARD-SKILLS.md and complete the installation for {PLATFORM_LABEL[platform]}.”</span>{" "}
                You're ready when <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm">SKILLS-INSTALLED.md</code> says 10/10 skills passed.
              </>,
            ].map((step, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-black">{index + 1}</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>

          <div className={`${panel} mt-8`}>
            <DownloadButton
              assetId={`${platform}-starter-pack`}
              label={`${PLATFORM_LABEL[platform]} starter pack`}
              detail={`${detail.starterFile}, the ten skills, installer, glossary and project template · ZIP`}
            />
          </div>

          <div className="mt-8 rounded-2xl border border-white/12 p-6">
            <div className="flex items-center gap-3 font-bold">
              <Folder className="h-5 w-5 text-[hsl(var(--secondary))]" aria-hidden="true" /> Gather before Day 1
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-white/70">
              <li>5–10 real things you've written: emails, posts, texts to your team.</li>
              <li>Your team roster with roles, tenure, licensing, and anything worth knowing.</li>
              <li>Your active projects, each with one number that tells you it's working.</li>
              <li>Agency basics and a simple list of the tools you pay for.</li>
              <li>Keep report exports outside the folder. Never put passwords or account keys in it.</li>
            </ul>
          </div>
        </Section>

        <Section number="01" eyebrowText="Day 1 replay" title="Build the brain">
          {day1 && <Replay contentId="day-1" embedUrl={day1.embedUrl} title="Agency AI Install, Day 1" initialPercent={status.progress["day-1"] ?? 0} />}
          <p className="mt-6 leading-relaxed text-white/70">
            About you, your voice, working rules, content, and team, built as files the AI reads every time.
            This is the original Agency AI Install recording.
          </p>
          <div className={`${panel} mt-6`}>
            <DownloadButton assetId="day-1-guide" label="Day 1 build guide" detail="Original session edition · 20-page PDF to follow along" />
          </div>
        </Section>

        <Section number="02" eyebrowText="Day 2 replay" title="Make it run">
          {day2 && <Replay contentId="day-2" embedUrl={day2.embedUrl} title="Agency AI Install, Day 2" initialPercent={status.progress["day-2"] ?? 0} />}
          <p className="mt-6 leading-relaxed text-white/70">
            Active projects, the memory system, your {detail.masterFile} master file, and installing skills. The recording and
            this guide cover the first five skills; your starter pack now includes all ten.
          </p>
          <div className={`${panel} mt-6`}>
            <DownloadButton assetId="day-2-guide" label="Day 2 build guide" detail="Original session edition (five skills) · 27-page PDF" />
          </div>
        </Section>

        <Section number="03" eyebrowText="Skills library" title="Ten skills for running the agency">
          <p className="leading-relaxed text-white/70">
            Installed into <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm">{detail.skillsFolder}</code> by the
            starter pack. Each one stays on your computer, and none of them sends anything or changes another system without your OK.
            The full guide, with copy-paste requests for every skill, is <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm">STANDARD-AGENCY-INTELLIGENCE-GUIDE.md</code> in your pack.
          </p>
          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2">
            {PORTAL_SKILLS.map((skill) => (
              <div key={skill.name} className="bg-black p-5">
                <div className="flex items-center gap-2 font-bold">
                  <Check className="h-4 w-4 text-[hsl(var(--secondary))]" aria-hidden="true" /> {skill.name}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{skill.detail}</p>
              </div>
            ))}
          </div>
          <div className={`${panel} mt-8`}>
            <DownloadButton
              assetId={`${platform}-skills-library`}
              label="Skills add-on for an existing brain"
              detail="Already have a MY BIZ BRAIN? Adds or updates all ten skills without touching your files · ZIP"
            />
            <DownloadButton
              assetId={`${platform}-lead-vendor-roi`}
              label="Lead-Vendor ROI only"
              detail="Adds just this one skill to an existing brain · ZIP"
            />
            <DownloadButton
              assetId="original-skills-guide"
              label="Original skills playbook"
              detail="The workshop handout for the first five report skills (v1.2) · PDF"
            />
          </div>
        </Section>

        <Section number="04" eyebrowText="Help" title="Stuck?">
          <div className="space-y-4 leading-relaxed text-white/70">
            <p className="flex gap-3">
              <FileText className="mt-1 h-4 w-4 shrink-0 text-white/40" aria-hidden="true" />
              Start a fresh conversation in the same folder for each job, and save the result as a file before moving on.
            </p>
            <p className="flex gap-3">
              <FileText className="mt-1 h-4 w-4 shrink-0 text-white/40" aria-hidden="true" />
              If the installer stops, don't copy skills by hand. Send the install message again and read what it reports.
            </p>
            <p>
              Still stuck? Email <a className="font-semibold text-white underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>{" "}
              with what you tried and a screenshot. <ArrowRight className="inline h-4 w-4" aria-hidden="true" />
            </p>
          </div>
        </Section>
      </div>
    </main>
  );
};

export default AIPortal;
