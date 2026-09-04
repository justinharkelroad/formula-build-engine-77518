import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePassDialog } from "@/contexts/PassDialogContext";
import { BUILD_GROUPS, SEATS, SEATS_NOTE, type AgendaSession, type Track } from "@/config/agenda";

const trackColor = (track: Track) =>
  track === "BUSINESS" ? "hsl(var(--secondary))" : "hsl(var(--primary))";

interface SessionModalProps {
  session: AgendaSession | null;
  onClose: () => void;
}

const SessionModal = ({ session, onClose }: SessionModalProps) => {
  const { open: openPassDialog } = usePassDialog();
  if (!session) return null;

  const color = trackColor(session.track);

  return (
    <Dialog open={!!session} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-2xl border-white/20 text-white p-0 max-h-[92vh] overflow-y-auto overscroll-contain"
        style={{ backgroundColor: "#000" }}
        aria-describedby={undefined}
      >
        {/* Track rail */}
        <div className="h-1 w-full" style={{ background: color }} />

        <div className="p-6 md:p-8">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className="text-[0.6rem] md:text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
              style={{ color, border: `1px solid ${color}` }}
            >
              {session.track}
            </span>
            <span className="text-xs text-white/40 uppercase tracking-widest">
              {session.minutes} min
            </span>
            <span className="text-xs text-white/40 uppercase tracking-widest">
              {BUILD_GROUPS.find((g) => g.id === session.build)?.label}
            </span>
          </div>

          {/* Title */}
          <h2 className="display-bold text-3xl md:text-5xl leading-[0.95] mb-6">{session.title}</h2>

          {/* The hook */}
          <div className="border-l-2 pl-5 md:pl-6 mb-6" style={{ borderColor: color }}>
            <div className="eyebrow mb-3">THE QUESTION</div>
            <p className="text-xl md:text-3xl font-semibold leading-snug">{session.question}</p>
          </div>

          {/* What happens */}
          <div className="mb-6">
            <div className="eyebrow mb-3">IN THE ROOM</div>
            <p className="text-base md:text-lg text-white/70 leading-relaxed">{session.inTheRoom}</p>
          </div>

          {/* Outcome */}
          <div className="border border-white/15 rounded-lg p-5 mb-5">
            <div className="text-[0.6rem] uppercase tracking-widest text-white/40 mb-2">
              You leave with
            </div>
            <p className="text-lg md:text-xl font-medium">{session.outcome}</p>
          </div>

          {/* Bring */}
          <div className="flex flex-wrap items-baseline gap-2 mb-5">
            <span className="text-[0.6rem] uppercase tracking-widest text-white/40">Bring</span>
            <span className="text-sm md:text-base text-white/75">{session.bring}</span>
          </div>

          {/* Three seats — the multi-seat argument, kept to two lines */}
          <div className="border-t border-white/10 pt-5 mb-5">
            <div className="eyebrow mb-3">THREE SEATS</div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-2">
              {SEATS.map((seat) => (
                <span key={seat.role} className="text-sm md:text-base text-white/70">
                  <span className="font-bold uppercase tracking-widest text-xs" style={{ color }}>
                    {seat.role}
                  </span>{" "}
                  {seat.short}
                </span>
              ))}
            </div>
            <p className="text-sm md:text-base font-medium text-white/90">{SEATS_NOTE}</p>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs tracking-widest uppercase text-white/35">
              ◆ Everything else happens in the room.
            </p>
            <button
              onClick={() => {
                onClose();
                openPassDialog("earlyBird");
              }}
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest text-white hover:opacity-90 transition-opacity"
              style={{ background: color }}
            >
              Claim your seat →
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionModal;
