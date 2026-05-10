"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Boots Lenis smooth scroll and wires its scroll callback to ScrollTrigger.update.
 * Disabled when the user prefers reduced motion (browser-native scrolling instead).
 */
export function useLenis() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      lerp: 0.1,
    });

    function raf(time: number) {
      lenis.raf(time);
    }
    const tickFn = (time: number) => raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tickFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickFn);
      lenis.destroy();
    };
  }, []);
}
