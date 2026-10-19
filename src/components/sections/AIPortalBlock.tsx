import { Link } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { trackCTAClick } from "@/hooks/useAnalytics";
import { AI_PORTAL_PATH, REUNION_CALL, getReunionCallPhase } from "@/config/postEvent";

const portalContents = [
  "The Agency AI Install Walkthrough, a guided build for Claude or Codex",
  "A local MY BIZ BRAIN workspace you control",
  "Your voice, preferences, and approval rules",
  "Ten reusable agency skills: six report analyzers, four operating workflows",
  "Build guides and starter files",
] as const;

/**
 * Acceleration chapter content: the Agency AI Install attendees earned in
 * Orlando. Attendees get the AI portal link on the Nov 2 reunion call, so until
 * that call ends this block sends people to register; after it, it opens the
 * portal.
 */
const AIPortalBlock = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const v = isVisible ? "is-visible" : "";
  const callIsOver = getReunionCallPhase() === "past";
  const buttonClass =
    "inline-flex items-center gap-2 rounded-radius-pill bg-white px-7 py-4 font-bold text-black transition-colors hover:bg-black hover:text-white";

  return (
    <section ref={ref} className="bg-black px-5 pb-20 text-white md:px-12 md:pb-28">
      <div className="container mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className={`brand-block-blue flex flex-col p-7 md:p-10 reveal-up ${v}`}>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Attendees</div>
          {callIsOver ? (
            <>
              <h3 className="mt-4 text-4xl font-black leading-[0.95] md:text-6xl">
                Your build<br />is ready.
              </h3>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/85 md:text-lg">
                What took a month now takes a week. Sign in with the email you registered with and start the install.
              </p>
            </>
          ) : (
            <>
              <h3 className="mt-4 text-4xl font-black leading-[0.95] md:text-6xl">
                Your build<br />unlocks Nov 2.
              </h3>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/85 md:text-lg">
                Every attendee gets the AI install link live on the Formula Reunion Call, {REUNION_CALL.dateSentence}. Register so you&apos;re in the room when it drops.
              </p>
            </>
          )}
          <div className="mt-auto pt-10">
            {callIsOver ? (
              <Link
                to={AI_PORTAL_PATH}
                onClick={() => trackCTAClick("acceleration_ai_portal")}
                className={buttonClass}
              >
                OPEN THE AI PORTAL
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : (
              <a
                href={REUNION_CALL.registerUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCTAClick("acceleration_register_call")}
                className={buttonClass}
              >
                REGISTER FOR THE NOV 2 CALL
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        <div className={`rounded-2xl bg-[hsl(0,0%,96%)] p-7 text-black md:rounded-3xl md:p-10 reveal-up delay-1 ${v}`}>
          <h3 className="text-2xl font-black leading-tight md:text-4xl">
            {callIsOver ? "Inside the portal" : "What you get on the call"}
          </h3>
          <ul className="mt-6 space-y-4">
            {portalContents.map((item) => (
              <li key={item} className="flex gap-3 text-base leading-relaxed md:text-lg">
                <Check className="mt-1 h-5 w-5 shrink-0 text-[hsl(var(--secondary))]" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-black/12 pt-5 text-sm font-semibold leading-relaxed text-black/60">
            The files stay on your computer and keep improving as your agency changes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AIPortalBlock;
