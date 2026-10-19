import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { X, ArrowRight } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useNavigate } from "react-router-dom";
import { usePassDialog } from "@/contexts/PassDialogContext";
import { trackCTAClick } from "@/hooks/useAnalytics";
import { AI_PORTAL_PATH, REUNION_CALL, getReunionCallPhase } from "@/config/postEvent";

// Formula Forum 2026 is over and ticket sales are closed. Every former
// "buy ticket" / "claim your seat" button still calls usePassDialog().open(),
// so this dialog is the single place that routes them to the post-event steps
// instead of Stripe checkout.
const PassDialogHost = () => {
  const { isOpen, close } = usePassDialog();
  const navigate = useNavigate();
  const callIsOver = getReunionCallPhase() === "past";

  const handleRegister = () => {
    trackCTAClick("post_event_dialog_reunion_call");
    window.open(REUNION_CALL.registerUrl, "_blank", "noopener,noreferrer");
    close();
  };

  const handlePortal = () => {
    trackCTAClick("post_event_dialog_ai_portal");
    close();
    navigate(AI_PORTAL_PATH);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && close()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/85 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
            w-[92vw] max-w-xl
            bg-black border border-white/15 text-white
            rounded-3xl p-8 md:p-10
            shadow-[0_40px_120px_-20px_rgba(74,144,226,0.45)]
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <DialogPrimitive.Close
            className="absolute top-5 right-5 w-10 h-10 rounded-full border border-white/20
              flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </DialogPrimitive.Close>

          <div className="eyebrow mb-3">THAT'S A WRAP</div>
          <DialogPrimitive.Title className="display-bold text-4xl md:text-5xl mb-2 leading-none">
            FORMULA<br />FORUM 26
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-white/60 text-sm mb-8">
            Orlando is in the books and 2026 tickets are closed. Here's what happens next.
          </DialogPrimitive.Description>

          {!callIsOver && (
            <button
              onClick={handleRegister}
              className="group w-full text-left bg-white text-black rounded-2xl p-6 mb-3
                hover:bg-[hsl(var(--primary))] hover:text-white transition-colors"
            >
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <span className="font-bold text-lg">Register for the reunion call</span>
                <span className="text-xs font-bold tracking-widest uppercase opacity-60 text-right">
                  {REUNION_CALL.dateLabel}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm opacity-70 group-hover:opacity-100">
                <span>Set up your plan and get your AI install link on Zoom</span>
                <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          )}

          <button
            onClick={handlePortal}
            className="group w-full text-left brand-block-blue p-6 mb-6 hover:brightness-110 transition-all"
          >
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-bold text-lg">Attendees: open the AI portal</span>
            </div>
            <div className="flex items-center justify-between text-sm opacity-90">
              <span>Sign in with your email to reach your Agency AI Install build</span>
              <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default PassDialogHost;
