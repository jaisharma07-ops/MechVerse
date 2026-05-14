"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Drafting-compass cursor that follows the mouse with spring damping.
 *
 *   ●  Outer ring (amber, 14 px radius, 60 % opacity)
 *   ●  Inner ring (amber, 6 px radius, 80 % opacity)
 *   ●  Four crosshair lines protruding from the rings
 *   ●  Centre dot
 *
 * On hover of an interactive element (anchor, button, [data-cursor=interactive]),
 * the entire reticle scales to 1.5× with a brief amber wash, signaling "click".
 * Hidden entirely on touch devices and when prefers-reduced-motion is set
 * (no system cursor replacement = no orphan crosshair).
 *
 * Mounted once at the root of any view that wants it. Calls
 * `document.body.style.cursor = "none"` while active and restores on unmount.
 */
export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 });
  /* Canonical "client-only mount" gate.
     SSR renders nothing → client renders nothing on first paint (hydration
     matches) → useEffect runs once → enable cursor only if (hover && !reduced).
     Without this gate, `typeof window` inside a useState initializer
     returns different values on the server vs the client and crashes
     hydration. */
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const hover = window.matchMedia("(hover: hover)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(!reduced && hover);
  }, []);
  const [interactive, setInteractive] = useState(false);
  const [pressed, setPressed] = useState(false);

  /* Mouse tracking + spring follow loop. Runs ONCE per enable, not
     once per hover — the lerp speed is read from a closure flag so we
     don't tear the effect down every time `interactive` flips. */
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let currentInteractive = false;

    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    // Hide the system cursor while we're active.
    const prev = document.body.style.cursor;
    document.body.style.cursor = "none";

    const tick = () => {
      // Spring follow — slight latency feels expensive, instant feels cheap.
      const lerp = currentInteractive ? 0.28 : 0.18;
      pos.current.x += (target.current.x - pos.current.x) * lerp;
      pos.current.y += (target.current.y - pos.current.y) * lerp;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Detect hover over interactive elements via event delegation.
    const isInteractive = (t: EventTarget | null): boolean => {
      if (!(t instanceof Element)) return false;
      return !!t.closest(
        "a, button, input, textarea, select, label, [role='button'], [data-cursor='interactive']",
      );
    };
    const onOver = (e: MouseEvent) => {
      const next = isInteractive(e.target);
      if (next !== currentInteractive) {
        currentInteractive = next;
        // Mirror to state so the SVG can re-render at the new scale.
        setInteractive(next);
      }
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("blur", onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("blur", onUp);
      document.body.style.cursor = prev;
    };
  }, [enabled]);

  if (!enabled) return null;

  const scale = interactive ? 1.55 : 1;
  const pressedScale = pressed ? 0.85 : 1;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[200] mix-blend-screen"
      style={{
        transform: "translate3d(-100px, -100px, 0)",
        willChange: "transform",
      }}
    >
      <div
        style={{
          transform: `translate(-50%, -50%) scale(${scale * pressedScale})`,
          transition:
            "transform 240ms cubic-bezier(.2,.8,.2,1), opacity 200ms ease",
          opacity: interactive ? 1 : 0.85,
        }}
      >
        <svg
          width="44"
          height="44"
          viewBox="-22 -22 44 44"
          fill="none"
          stroke="#F5A623"
          strokeLinecap="round"
        >
          {/* Outer ring */}
          <circle
            cx="0"
            cy="0"
            r="15"
            strokeWidth="1"
            opacity={interactive ? 0.95 : 0.55}
          />
          {/* Inner ring */}
          <circle cx="0" cy="0" r="6" strokeWidth="0.8" opacity="0.8" />
          {/* Crosshair lines */}
          <line x1="-19" y1="0" x2="-10" y2="0" strokeWidth="0.8" />
          <line x1="10" y1="0" x2="19" y2="0" strokeWidth="0.8" />
          <line x1="0" y1="-19" x2="0" y2="-10" strokeWidth="0.8" />
          <line x1="0" y1="10" x2="0" y2="19" strokeWidth="0.8" />
          {/* Centre dot */}
          <circle cx="0" cy="0" r="1.4" fill="#F5A623" stroke="none" />
          {/* Interactive highlight ring */}
          {interactive && (
            <circle
              cx="0"
              cy="0"
              r="20"
              strokeWidth="0.6"
              opacity="0.5"
              strokeDasharray="2 3"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
