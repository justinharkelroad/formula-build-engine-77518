import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

/**
 * THE WORKBOOK — the physical artifact of the build.
 *
 * The notebook is a transparent-PNG render (public/assets/agenda/workbook.*)
 * that lives on the page's own black, not on a white plate. It responds to the
 * pointer, can be dragged and flung, and settles back on its own.
 *
 * Motion model (all in a ref + rAF, never React state per frame):
 *   rot  — the live rotation, in degrees
 *   vel  — angular velocity, fed by drag and decayed on release
 *   aim  — where the book WANTS to be: the rest pose plus a pointer-follow offset
 *
 * Each frame: rot += vel (decaying), then rot eases toward aim. So a fling
 * spins, coasts, and self-recovers to following the cursor. No reset button
 * needed and no way to leave it stuck facing backwards.
 *
 * prefers-reduced-motion: no rAF loop at all, no pointer handlers, static pose.
 */

/** Resting pose — a three-quarter turn so the spine and page block both read. */
const REST_X = 4;
const REST_Y = -10;

/** How far the pointer alone can push it, in degrees, from the rest pose. */
const POINTER_X = 9;
const POINTER_Y = 16;

/** Hard stops so a hard fling can never bury the cover edge-on. */
const CLAMP_X = 26;
const CLAMP_Y = 52;

const DRAG_PER_PX_Y = 0.34;
const DRAG_PER_PX_X = 0.24;
const VEL_DECAY = 0.94;
const EASE_TO_AIM = 0.055;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const TheWorkbook = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.15);
  const v = isVisible ? "is-visible" : "";

  const stageRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  const [hasMoved, setHasMoved] = useState(false);
  const [reduced, setReduced] = useState(false);

  const rot = useRef({ x: REST_X, y: REST_Y });
  const vel = useRef({ x: 0, y: 0 });
  const aim = useRef({ x: REST_X, y: REST_Y });
  const drag = useRef<{ active: boolean; id: number | null; px: number; py: number }>({
    active: false,
    id: null,
    px: 0,
    py: 0,
  });
  const frame = useRef<number | null>(null);

  /* ── reduced-motion gate ── */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* ── the loop ── */
  useEffect(() => {
    if (reduced) return;

    const paint = () => {
      const r = rot.current;

      if (drag.current.active) {
        // While dragging, the pointer owns the book outright.
        vel.current.x *= 0.6;
        vel.current.y *= 0.6;
      } else {
        r.x += vel.current.x;
        r.y += vel.current.y;
        vel.current.x *= VEL_DECAY;
        vel.current.y *= VEL_DECAY;
        r.x += (aim.current.x - r.x) * EASE_TO_AIM;
        r.y += (aim.current.y - r.y) * EASE_TO_AIM;
      }

      r.x = clamp(r.x, -CLAMP_X, CLAMP_X);
      r.y = clamp(r.y, -CLAMP_Y, CLAMP_Y);

      if (bookRef.current) {
        bookRef.current.style.transform = `rotateX(${r.x.toFixed(2)}deg) rotateY(${r.y.toFixed(
          2
        )}deg) translateZ(0)`;
      }
      if (sheenRef.current) {
        // Specular sweep tracks the Y rotation across the exact silhouette.
        const pos = 50 - (r.y / CLAMP_Y) * 60;
        sheenRef.current.style.backgroundPosition = `${pos.toFixed(1)}% 50%`;
        sheenRef.current.style.opacity = String(0.16 + Math.abs(r.y) / CLAMP_Y * 0.3);
      }
      if (shadowRef.current) {
        // Contact shadow slides and stretches opposite the turn.
        const slide = (-r.y / CLAMP_Y) * 9;
        const squash = 1 - Math.abs(r.x) / (CLAMP_X * 3);
        shadowRef.current.style.transform = `translate(-50%, 0) translateX(${slide.toFixed(
          1
        )}%) scaleX(${(1 + Math.abs(r.y) / CLAMP_Y * 0.18).toFixed(3)}) scaleY(${squash.toFixed(3)})`;
      }

      frame.current = requestAnimationFrame(paint);
    };

    frame.current = requestAnimationFrame(paint);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [reduced]);

  /* ── pointer-follow (hover) ── */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reduced) return;

      if (drag.current.active && drag.current.id === e.pointerId) {
        const dx = e.clientX - drag.current.px;
        const dy = e.clientY - drag.current.py;
        drag.current.px = e.clientX;
        drag.current.py = e.clientY;

        rot.current.y = clamp(rot.current.y + dx * DRAG_PER_PX_Y, -CLAMP_Y, CLAMP_Y);
        rot.current.x = clamp(rot.current.x - dy * DRAG_PER_PX_X, -CLAMP_X, CLAMP_X);
        vel.current.y = dx * DRAG_PER_PX_Y;
        vel.current.x = -dy * DRAG_PER_PX_X;

        if (!hasMoved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) setHasMoved(true);
        return;
      }

      const stage = stageRef.current;
      if (!stage) return;
      const b = stage.getBoundingClientRect();
      const nx = clamp((e.clientX - b.left) / b.width - 0.5, -0.5, 0.5) * 2;
      const ny = clamp((e.clientY - b.top) / b.height - 0.5, -0.5, 0.5) * 2;
      aim.current.y = REST_Y + nx * POINTER_Y;
      aim.current.x = REST_X - ny * POINTER_X;
    },
    [hasMoved, reduced]
  );

  const handlePointerLeave = useCallback(() => {
    aim.current.x = REST_X;
    aim.current.y = REST_Y;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reduced) return;
      drag.current = { active: true, id: e.pointerId, px: e.clientX, py: e.clientY };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [reduced]
  );

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.id === e.pointerId) {
      drag.current = { active: false, id: null, px: 0, py: 0 };
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-black text-white border-t border-white/10 overflow-hidden px-5 md:px-12 py-20 md:py-28"
    >
      {/* brand light behind the book — the reason it no longer needs a white plate */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[12%] h-[38rem] w-[38rem] -translate-x-1/3 rounded-full bg-[hsl(var(--primary)/0.16)] blur-[120px]" />
        <div className="absolute left-[26%] bottom-[-10%] h-[28rem] w-[28rem] rounded-full bg-[hsl(var(--secondary)/0.14)] blur-[110px]" />
      </div>

      <div className="container relative mx-auto max-w-7xl">
        <div className="grid items-center gap-14 md:gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* ── the book ── */}
          <div
            ref={stageRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className={`relative mx-auto w-full max-w-[26rem] lg:max-w-[30rem] reveal-up ${v}`}
            style={{ perspective: "1400px", perspectiveOrigin: "50% 45%" }}
          >
            <div
              onPointerDown={handlePointerDown}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className={
                reduced ? "relative" : "relative cursor-grab select-none active:cursor-grabbing"
              }
              /* pan-y, never touch-none: on a phone the book fills most of the
                 screen, so swallowing vertical gestures would trap the scroll.
                 Horizontal drag turns it; vertical drag scrolls the page and
                 the browser fires pointercancel, which ends the drag cleanly. */
              style={reduced ? undefined : { touchAction: "pan-y" }}
            >
              {/* Float lives on its own wrapper: a CSS transform animation on the
                  same element would override the rAF-written transform outright. */}
              <div
                className="relative"
                style={{ animation: reduced ? undefined : "workbook-float 7s ease-in-out infinite" }}
              >
              <div
                ref={bookRef}
                className="relative will-change-transform"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateX(${REST_X}deg) rotateY(${REST_Y}deg)`,
                }}
              >
                <picture>
                  <source srcSet="/assets/agenda/workbook.webp" type="image/webp" />
                  <img
                    src="/assets/agenda/workbook.png"
                    alt="The Formula Forum 26 workbook — the book every attendee builds their 2027 in."
                    width={849}
                    height={1201}
                    loading="lazy"
                    draggable={false}
                    className="block w-full h-auto"
                    style={{
                      filter:
                        "drop-shadow(0 34px 46px rgba(0,0,0,0.85)) drop-shadow(0 6px 14px rgba(0,0,0,0.6))",
                    }}
                  />
                </picture>

                {/* specular sweep, masked to the notebook's exact silhouette */}
                <div
                  ref={sheenRef}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 mix-blend-screen"
                  style={{
                    opacity: 0.2,
                    background:
                      "linear-gradient(100deg, transparent 34%, rgba(255,255,255,0.55) 50%, transparent 66%)",
                    backgroundSize: "260% 100%",
                    backgroundPosition: "50% 50%",
                    WebkitMaskImage: "url(/assets/agenda/workbook.png)",
                    maskImage: "url(/assets/agenda/workbook.png)",
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                  }}
                />
              </div>
              </div>

              {/* contact shadow on the floor */}
              <div
                ref={shadowRef}
                aria-hidden
                className="pointer-events-none absolute left-1/2 -bottom-6 h-10 w-[76%] rounded-[50%] bg-black/70 blur-2xl"
                style={{ transform: "translate(-50%, 0)" }}
              />
            </div>

            {!reduced && (
              <div
                className={`pointer-events-none mt-10 text-center text-[0.7rem] uppercase tracking-[0.25em] text-white/35 transition-opacity duration-500 ${
                  hasMoved ? "opacity-0" : "opacity-100"
                }`}
              >
                Drag to turn it
              </div>
            )}
          </div>

          {/* ── the copy ── */}
          <div>
            <div className={`eyebrow mb-6 reveal-up ${v}`}>THE WORKBOOK</div>
            <h2
              className={`display-bold text-[clamp(2.25rem,9vw,5rem)] leading-[0.9] mb-6 reveal-up delay-1 ${v}`}
            >
              THE BOOK YOU
              <br />
              BUILD IN
            </h2>
            <p className={`max-w-xl text-lg md:text-2xl text-white/70 reveal-up delay-2 ${v}`}>
              Every seat comes with it. The eight sessions run straight through these pages — you
              write the truth of where the agency is on one page and where it goes next on the one
              after it.
            </p>
            <p className={`mt-5 max-w-xl text-base md:text-lg text-white/50 reveal-up delay-2 ${v}`}>
              Nothing in it gets filled in for you, and nothing gets filled in later. It happens in
              the room, and it leaves with you.
            </p>

            <div className={`mt-10 grid grid-cols-3 gap-4 md:gap-6 reveal-up delay-3 ${v}`}>
              {[
                { value: "11", label: "Target areas" },
                { value: "8", label: "Sessions inside it" },
                { value: "1", label: "Plan you leave with" },
              ].map((s) => (
                <div key={s.label} className="border-t border-white/15 pt-4">
                  <div className="display-bold text-3xl md:text-5xl text-[hsl(var(--secondary))]">
                    {s.value}
                  </div>
                  <div className="mt-2 text-[0.7rem] md:text-xs uppercase tracking-widest text-white/50">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TheWorkbook;
