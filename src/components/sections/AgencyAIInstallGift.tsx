import { ArrowUpRight, Check, FileText, Folder, ShieldCheck } from "lucide-react";
import { usePassDialog } from "@/contexts/PassDialogContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const includedOutcomes = [
  "A local MY BIZ BRAIN workspace you control",
  "Your voice, preferences, and approval rules",
  "Team, project, and durable-memory context",
  "Five reusable insurance-agency analysis skills",
  "Build guides, starter files, and secure portal access",
] as const;

const brainFiles = [
  "about-me.md",
  "brand-voice.md",
  "working-preferences.md",
  "team-members.md",
] as const;

const AgencyAIInstallGift = () => {
  const { open } = usePassDialog();
  const { ref, isVisible } = useScrollAnimation(0.08);

  return (
    <section
      id="agency-ai-install"
      ref={ref}
      className="bg-black px-5 py-20 text-white md:px-12 md:py-28"
    >
      <div className="container mx-auto max-w-7xl">
        <div
          className={`mb-6 inline-flex rounded-md bg-[hsl(var(--secondary))] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] reveal-up ${isVisible ? "is-visible" : ""}`}
        >
          Final-Day Attendee Gift
        </div>

        <h2
          className={`display-bold max-w-5xl text-[clamp(3.25rem,11vw,8rem)] leading-[0.86] reveal-up delay-1 ${isVisible ? "is-visible" : ""}`}
        >
          The clarity<br />
          does not stay<br />
          <span className="text-[hsl(var(--secondary))]">in Orlando.</span>
        </h2>

        <p
          className={`mt-8 max-w-2xl text-lg leading-relaxed text-white/72 md:text-xl reveal-up delay-2 ${isVisible ? "is-visible" : ""}`}
        >
          Purchase a Formula ticket and attend the final day to unlock the Agency AI Install Walkthrough, a guided build for Claude or Codex.
        </p>

        <div
          className={`mt-12 grid overflow-hidden rounded-2xl border border-white/14 bg-[hsl(0,0%,5%)] md:rounded-3xl lg:grid-cols-[1.15fr_0.85fr] reveal-up delay-2 ${isVisible ? "is-visible" : ""}`}
        >
          <div className="flex min-h-[430px] flex-col justify-end p-7 md:p-12 lg:min-h-[560px] lg:p-16">
            <div className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-[hsl(var(--secondary))]">
              Agency AI Install Walkthrough
            </div>
            <h3 className="max-w-2xl text-3xl font-black leading-tight md:text-5xl lg:text-6xl">
              Build the business context your AI can work from.
            </h3>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/72 md:text-lg">
              Give Claude or Codex organized, owner-controlled files for your voice, team, projects, priorities, memory, and operating rules.
            </p>
          </div>

          <div className="bg-[hsl(0,0%,96%)] p-7 text-black md:p-10 lg:p-12">
            <div className="flex items-center gap-3 border-b border-black/12 pb-5">
              <Folder className="h-6 w-6 text-[hsl(var(--secondary))]" strokeWidth={2} aria-hidden="true" />
              <span className="font-mono text-sm font-black tracking-tight md:text-base">MY BIZ BRAIN/</span>
            </div>

            <div className="py-4 pl-3 md:pl-5">
              {brainFiles.map((file) => (
                <div key={file} className="flex items-center gap-3 py-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-black/45" strokeWidth={1.75} aria-hidden="true" />
                  <span className="font-mono text-xs font-bold sm:text-sm">{file}</span>
                </div>
              ))}

              <div className="mt-3 flex items-center gap-3 py-2.5">
                <Folder className="h-4 w-4 shrink-0 text-[hsl(var(--secondary))]" strokeWidth={2} aria-hidden="true" />
                <span className="font-mono text-xs font-bold sm:text-sm">current-projects/</span>
              </div>
              <div className="flex items-center gap-3 py-2.5">
                <Folder className="h-4 w-4 shrink-0 text-[hsl(var(--secondary))]" strokeWidth={2} aria-hidden="true" />
                <span className="font-mono text-xs font-bold sm:text-sm">memory/</span>
              </div>
              <div className="flex items-center gap-3 py-2.5">
                <FileText className="h-4 w-4 shrink-0 text-black/45" strokeWidth={1.75} aria-hidden="true" />
                <span className="font-mono text-xs font-bold sm:text-sm">CLAUDE.md or AGENTS.md</span>
              </div>
            </div>

            <p className="border-t border-black/12 pt-5 text-sm font-semibold leading-relaxed text-black/60">
              The files stay on your computer and can keep improving as your business changes.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div
            className={`brand-block-blue flex min-h-full flex-col p-7 md:p-10 reveal-up delay-3 ${isVisible ? "is-visible" : ""}`}
          >
            <ShieldCheck className="mb-10 h-10 w-10" strokeWidth={1.75} aria-hidden="true" />
            <p className="max-w-md text-3xl font-black leading-tight md:text-4xl">
              The conversation is not the brain. The folder and the files are the brain.
            </p>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/82">
              You build it on your computer. You keep control of every file. Nothing is sent without your approval.
            </p>

            <div className="mt-auto pt-10">
              <button
                onClick={() => open("earlyBird")}
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 font-bold text-black transition-transform hover:-translate-y-0.5 active:translate-y-px"
              >
                BUY TICKET
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="mt-4 max-w-sm text-xs leading-relaxed text-white/68">
                Access is released after final-day attendance is confirmed.
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl bg-[hsl(0,0%,96%)] p-7 text-black md:rounded-3xl md:p-10 reveal-up delay-4 ${isVisible ? "is-visible" : ""}`}
          >
            <h3 className="text-3xl font-black leading-tight md:text-5xl">What leaves with you</h3>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-black/62 md:text-lg">
              Not another prompt bundle. A maintainable system for carrying Formula decisions into the week after the event.
            </p>

            <div className="mt-8">
              {includedOutcomes.map((outcome) => (
                <div key={outcome} className="flex gap-4 border-t border-black/12 py-5 last:pb-0">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  <span className="text-base font-bold leading-snug md:text-lg">{outcome}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgencyAIInstallGift;
