"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * Page-scroll-driven speedometer. Needle sweeps from 0 → MACH 1 across the
 * entire page scroll. Pure SVG, no canvas/three.
 */
export default function Speedometer() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 22,
    mass: 0.5,
  });

  // Needle sweep: -120deg → 120deg (full 240° arc).
  const angle = useTransform(smooth, [0, 1], [-120, 120]);
  // Numeric readout 0 → 1235 km/h (Mach 1).
  const reading = useTransform(smooth, [0, 1], [0, 1235]);

  // Tick marks along the dial.
  const ticks = Array.from({ length: 25 }, (_, i) => i);

  return (
    <div className="relative w-[260px] h-[260px] select-none">
      {/* Outer ring */}
      <svg
        viewBox="0 0 260 260"
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        <defs>
          <radialGradient id="dial-bg" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#15171C" />
            <stop offset="100%" stopColor="#0A0C11" />
          </radialGradient>
          <linearGradient id="needle-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5A623" />
            <stop offset="100%" stopColor="#FFD27A" />
          </linearGradient>
        </defs>

        <circle cx="130" cy="130" r="124" fill="url(#dial-bg)" />
        <circle
          cx="130"
          cy="130"
          r="124"
          fill="none"
          stroke="rgba(245,166,35,0.25)"
          strokeWidth="1"
        />
        <circle
          cx="130"
          cy="130"
          r="106"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />

        {/* Tick marks across 240° arc */}
        {ticks.map((i) => {
          const t = i / (ticks.length - 1);
          const a = (-120 + t * 240) * (Math.PI / 180);
          const r1 = 100;
          const r2 = i % 5 === 0 ? 86 : 92;
          const x1 = 130 + Math.cos(a) * r1;
          const y1 = 130 + Math.sin(a) * r1;
          const x2 = 130 + Math.cos(a) * r2;
          const y2 = 130 + Math.sin(a) * r2;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 5 === 0 ? "rgba(245,166,35,0.7)" : "rgba(255,255,255,0.25)"}
              strokeWidth={i % 5 === 0 ? 1.5 : 1}
            />
          );
        })}

        {/* Pivot */}
        <circle cx="130" cy="130" r="6" fill="#0D0F14" stroke="rgba(245,166,35,0.6)" />
        <circle cx="130" cy="130" r="2" fill="#F5A623" />
      </svg>

      {/* Animated needle */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ rotate: angle }}
      >
        <svg
          viewBox="0 0 260 260"
          className="w-full h-full"
          aria-hidden
          style={{ transformOrigin: "130px 130px" }}
        >
          <line
            x1="130"
            y1="130"
            x2="130"
            y2="34"
            stroke="url(#needle-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="drop-shadow(0 0 10px rgba(245,166,35,0.55))"
          />
          <circle cx="130" cy="34" r="2.5" fill="#F5A623" />
        </svg>
      </motion.div>

      {/* Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-9 pointer-events-none">
        <motion.div className="font-mono tabular-nums text-3xl text-[var(--text-primary)] tracking-tight">
          <Readout value={reading} />
        </motion.div>
        <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--text-secondary)] mt-1">
          KM/H · MACH 1
        </div>
      </div>
    </div>
  );
}

function Readout({ value }: { value: MotionValue<number> }) {
  const display = useTransform(value, (v) =>
    Math.round(v).toString().padStart(4, "0"),
  );
  return <motion.span>{display}</motion.span>;
}
