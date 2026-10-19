import { ArrowRight } from "lucide-react";
import { trackCTAClick } from "@/hooks/useAnalytics";
import { REUNION_CALL, getReunionCallPhase } from "@/config/postEvent";

/**
 * Slim band under the hero pointing at the reunion call. The full call block
 * lives in the Accountability chapter; this strip keeps it one scroll away
 * until the call is over, then disappears.
 */
const CallStrip = () => {
  if (getReunionCallPhase() === "past") return null;

  return (
    <a
      href="#reunion-call"
      onClick={() => trackCTAClick("call_strip")}
      className="group block bg-[hsl(var(--secondary))] px-5 py-4 text-white md:px-12"
    >
      <div className="container mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <span className="text-sm font-bold uppercase tracking-[0.16em] md:text-base">
          The Formula Reunion Call<span className="hidden sm:inline"> · </span>
          <span className="block sm:inline">{REUNION_CALL.dateLabel}</span>
        </span>
        <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em]">
          Register on Zoom
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </a>
  );
};

export default CallStrip;
