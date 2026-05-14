"use client";

import { useEffect, useRef } from "react";

/**
 * MagneticField
 * ─────────────
 * Canvas-based dot grid that responds to the cursor like iron filings to
 * a magnet. Every dot within `INFLUENCE` px of the cursor stretches into
 * a tapered amber line pointing toward it; intensity falls off with
 * distance (quadratic). Beyond the radius, dots are static, dim white,
 * <1 px circles.
 *
 * Pure canvas + requestAnimationFrame. No React state changes per frame.
 * Resolves on a 38 px grid (~600–1500 dots on a 1080p screen) and runs
 * each tick in <0.4 ms on a modern laptop — well inside the 16 ms budget.
 *
 *   intensityRef: exposed parent ref so a scroll-driven container can
 *   crank the amber saturation upward as the user approaches the
 *   wordmark reveal at the bottom of the sequence.
 */
export interface MagneticFieldHandle {
  setIntensity: (v: number) => void;
}

export default function MagneticField({
  intensityRef,
}: {
  intensityRef?: React.RefObject<MagneticFieldHandle | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (typeof window === "undefined") return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(hover: hover)").matches
    ) {
      return; // No animated field for reduced motion / touch devices.
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let dots: { x: number; y: number }[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    let intensity = 0; // 0..1, scaled by scroll progress

    const SPACING = 38;
    const INFLUENCE = 200;
    const MAX_STRETCH = 26;

    const buildGrid = () => {
      dots = [];
      const offX = (width % SPACING) / 2;
      const offY = (height % SPACING) / 2;
      for (let x = SPACING / 2 + offX; x < width; x += SPACING) {
        for (let y = SPACING / 2 + offY; y < height; y += SPACING) {
          dots.push({ x, y });
        }
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    };

    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    // Expose intensity setter to parent (scroll-driven climax).
    if (intensityRef) {
      intensityRef.current = {
        setIntensity: (v: number) => {
          intensity = Math.max(0, Math.min(1, v));
        },
      };
    }

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouse.x;
      const my = mouse.y;
      const r2 = INFLUENCE * INFLUENCE;

      // Color ramps with `intensity`: cool-white → warm amber climax.
      const ambientAlpha = 0.07 + intensity * 0.06;
      const ambientR = 245;
      const ambientG = 245 - 60 * intensity;
      const ambientB = 245 - 200 * intensity;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const dx = mx - d.x;
        const dy = my - d.y;
        const distSq = dx * dx + dy * dy;

        if (mouse.active && distSq < r2 && distSq > 4) {
          // Falloff: quadratic, so the field has a soft edge.
          const dist = Math.sqrt(distSq);
          const t = 1 - dist / INFLUENCE;
          const stretch = MAX_STRETCH * t * t;
          const inv = 1 / dist;
          const nx = dx * inv;
          const ny = dy * inv;
          const tx = d.x + nx * stretch;
          const ty = d.y + ny * stretch;

          // Line — color shifts more amber close to cursor + with scroll intensity.
          const alpha = 0.25 + t * 0.55;
          const warm = Math.min(1, t + intensity * 0.4);
          const r = 245;
          const g = 166 + 40 * (1 - warm);
          const b = 35 + 80 * (1 - warm);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.lineWidth = 0.8 + t * 1.4;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();

          // Tip mark
          ctx.beginPath();
          ctx.arc(tx, ty, 1.1 + t * 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.5 + t * 0.5})`;
          ctx.fill();
        } else {
          // Idle dot — extremely dim.
          ctx.beginPath();
          ctx.arc(d.x, d.y, 0.7 + intensity * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${ambientR}, ${ambientG}, ${ambientB}, ${ambientAlpha})`;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      if (intensityRef) intensityRef.current = null;
    };
  }, [intensityRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
