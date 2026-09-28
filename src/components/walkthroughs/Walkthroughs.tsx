import { useEffect } from "react";
import { ArrowRight, Play, X } from "lucide-react";
import { WALKTHROUGH_PATH, type Walkthrough } from "@/config/walkthroughs";

/** Poster card and portrait player for the walkthrough videos in src/config/walkthroughs.ts. */
export const WalkthroughCard = ({ walkthrough, onPlay }: { walkthrough: Walkthrough; onPlay: (walkthrough: Walkthrough) => void }) => (
  <button
    type="button"
    onClick={() => onPlay(walkthrough)}
    className="group flex h-full flex-col border border-white/25 bg-black p-2 text-left shadow-[12px_12px_0_hsl(var(--secondary))] transition-transform duration-300 hover:-translate-x-1 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black"
    aria-label={`Play video: ${walkthrough.title}, ${walkthrough.length}`}
  >
    <div className="relative aspect-[9/16] overflow-hidden bg-black">
      <img src={`${WALKTHROUGH_PATH}/${walkthrough.file}-poster.jpg`} alt="" className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" loading="lazy" width="540" height="960" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-white transition-transform group-hover:scale-110"><Play className="ml-1 h-8 w-8 fill-current" /></span>
      </span>
      <span className="absolute left-3 top-3 bg-[hsl(var(--secondary))] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white">{walkthrough.label}</span>
      <span className="absolute bottom-3 right-3 bg-black px-3 py-2 text-xs font-bold text-white">{walkthrough.length}</span>
    </div>
    <div className="flex flex-1 flex-col gap-3 px-3 pb-3 pt-5">
      <span className="text-xl font-black uppercase leading-tight text-white">{walkthrough.title}</span>
      <span className="text-sm leading-relaxed text-white/60">{walkthrough.copy}</span>
      <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-black uppercase text-[hsl(var(--secondary))] group-hover:text-white">Watch Now <ArrowRight className="h-4 w-4" /></span>
    </div>
  </button>
);

/** Full-screen portrait player. Escape, the close button, or a backdrop click closes it. */
export const WalkthroughPlayer = ({ walkthrough, onClose }: { walkthrough: Walkthrough | null; onClose: () => void }) => {
  useEffect(() => {
    if (!walkthrough) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [walkthrough, onClose]);

  if (!walkthrough) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" aria-label={walkthrough.title} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black text-white transition hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Close video" autoFocus><X className="h-5 w-5" /></button>
      <div className="flex w-[min(92vw,calc((100dvh-7rem)*9/16),480px)] flex-col gap-3">
        <div className="aspect-[9/16] overflow-hidden border border-white/25 bg-black shadow-[18px_18px_0_hsl(var(--secondary))]">
          <video key={walkthrough.id} className="h-full w-full" controls autoPlay playsInline preload="metadata" poster={`${WALKTHROUGH_PATH}/${walkthrough.file}-poster.jpg`}>
            <source src={`${WALKTHROUGH_PATH}/${walkthrough.file}.mp4`} type="video/mp4" />
            <track kind="captions" src={`${WALKTHROUGH_PATH}/${walkthrough.file}.vtt`} srcLang="en" label="English" />
          </video>
        </div>
        <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-white/60">{walkthrough.title} · {walkthrough.length}</p>
      </div>
    </div>
  );
};
