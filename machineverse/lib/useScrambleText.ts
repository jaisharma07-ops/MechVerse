"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Transformers-style letter scramble. Each character of `target` is
 * replaced with a random glyph from `POOL`, then resolves left-to-right
 * over `duration` ms. The scramble runs once whenever `start` flips
 * from false → true, so callers can defer the effect to an
 * IntersectionObserver hit or a hover handler.
 *
 * Returns the current display string. Spaces and punctuation pass
 * through unscrambled to keep the silhouette of the final word readable
 * even mid-animation.
 *
 *   const text = useScrambleText("AIRCRAFT", inView);
 *   <span>{text}</span>
 *
 * Respects prefers-reduced-motion — if set, returns `target` immediately
 * without any scrambling.
 */

const POOL = "!<>-_/\\[]{}=+*^?#$%&@012345789ABCDEFGHIJKMNPQRSTUVWXYZ".split(
  "",
);

function pick() {
  return POOL[Math.floor(Math.random() * POOL.length)];
}

export function useScrambleText(
  target: string,
  start: boolean,
  durationMs = 750,
): string {
  const [display, setDisplay] = useState<string>(start ? "" : target);
  const reducedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      reducedRef.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    }
  }, []);

  useEffect(() => {
    if (!start) return;
    if (reducedRef.current) {
      setDisplay(target);
      return;
    }

    const tickMs = 32;
    const totalTicks = Math.max(1, Math.round(durationMs / tickMs));
    let tick = 0;
    let raf = 0;
    let timer: number | null = null;

    const step = () => {
      tick += 1;
      const progress = tick / totalTicks;
      // Per-character resolve threshold: characters near the start resolve
      // first, characters at the end resolve last. The 0.65 multiplier
      // leaves room for the tail to still settle within `duration`.
      const out = target
        .split("")
        .map((c, i) => {
          if (c === " " || c === "·") return c;
          const resolveAt = (i / Math.max(1, target.length - 1)) * 0.65;
          if (progress >= resolveAt + 0.18) return c;
          return pick();
        })
        .join("");
      setDisplay(out);
      if (tick >= totalTicks) {
        setDisplay(target);
        return;
      }
      timer = window.setTimeout(() => {
        raf = window.requestAnimationFrame(step);
      }, tickMs);
    };

    raf = window.requestAnimationFrame(step);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      if (timer) window.clearTimeout(timer);
    };
  }, [target, start, durationMs]);

  return display;
}
