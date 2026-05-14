"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * Dual-dial instrument cluster — tachometer (RPM) on the left, speedometer
 * (KM/H) on the right, both driven by page scroll progress. The tach has
 * a tighter spring than the speedo so RPM "blips" up first like a real
 * engine; speed builds more slowly. Each dial is pure SVG: radial-gradient
 * dial face, beveled outer ring, glass-reflection arc, red zone arc,
 * numbered major ticks + un-numbered minor ticks, and a needle with
 * tip-glow. No canvas, no three.js.
 */

interface GaugeConfig {
  /** Width/height of the gauge in px. */
  size: number;
  /** Minimum value at the start of the arc. */
  min: number;
  /** Maximum value at the end of the arc. */
  max: number;
  /** Major tick interval in dial units. */
  majorStep: number;
  /** Number of minor ticks BETWEEN each pair of majors. */
  minorPerMajor: number;
  /** Sweep start angle in degrees from 12 o'clock, clockwise positive. */
  startAngle: number;
  /** Sweep end angle in degrees from 12 o'clock, clockwise positive. */
  endAngle: number;
  /** Value at which the red zone begins (omit for no red zone). */
  redZoneStart?: number;
  /** Big label inside the dial (e.g. "KM/H", "× 1000 RPM"). */
  bigLabel: string;
  /** Small label below (e.g. "MAX 360", "REDLINE 7"). */
  smallLabel: string;
  /** Needle color. */
  needleColor: string;
  /** Optional digital readout (e.g. just for speedo). */
  digital?: boolean;
  /** Format function for number labels on the dial. */
  formatTick?: (v: number) => string;
}

const SPEEDO: GaugeConfig = {
  size: 240,
  min: 0,
  max: 360,
  majorStep: 60,
  minorPerMajor: 6,
  startAngle: -135,
  endAngle: 135,
  redZoneStart: 300,
  bigLabel: "KM/H",
  smallLabel: "MAX 360",
  needleColor: "#F5A623",
  digital: true,
  formatTick: (v) => String(v),
};

const TACHO: GaugeConfig = {
  size: 200,
  min: 0,
  max: 9,
  majorStep: 1,
  minorPerMajor: 5,
  startAngle: -135,
  endAngle: 135,
  redZoneStart: 7,
  bigLabel: "× 1000  RPM",
  smallLabel: "REDLINE 7",
  needleColor: "#FF5247",
  formatTick: (v) => String(v),
};

export default function Speedometer() {
  const { scrollYProgress } = useScroll();
  // Tachometer responds faster and snappier — like RPM blipping with throttle.
  const tachP = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 18,
    mass: 0.3,
  });
  // Speedometer is heavier — speed builds with inertia.
  const speedP = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 22,
    mass: 0.6,
  });

  return (
    <div
      className="relative flex items-center select-none"
      style={{ height: 260 }}
    >
      <div style={{ marginRight: -18 }}>
        <Gauge config={TACHO} progress={tachP} idPrefix="tach" />
      </div>
      <Gauge config={SPEEDO} progress={speedP} idPrefix="speed" />
    </div>
  );
}

/* ────────────────────────────── Gauge ────────────────────────────── */

function Gauge({
  config,
  progress,
  idPrefix,
}: {
  config: GaugeConfig;
  progress: MotionValue<number>;
  idPrefix: string;
}) {
  const sweep = config.endAngle - config.startAngle;

  // Angle of the needle, derived from 0..1 progress.
  const needleAngle = useTransform(
    progress,
    [0, 1],
    [config.startAngle, config.endAngle],
  );
  // Current dial value (for the digital readout, if enabled).
  const dialValue = useTransform(
    progress,
    [0, 1],
    [config.min, config.max],
  );

  // Build the major + minor tick array.
  const ticks: Array<{
    angle: number;
    value: number;
    major: boolean;
    inRedZone: boolean;
  }> = [];
  const majorCount = (config.max - config.min) / config.majorStep;
  const totalSteps = majorCount * config.minorPerMajor;
  for (let i = 0; i <= totalSteps; i++) {
    const t = i / totalSteps;
    const value = config.min + t * (config.max - config.min);
    const angle = config.startAngle + t * sweep;
    ticks.push({
      angle,
      value,
      major: i % config.minorPerMajor === 0,
      inRedZone:
        config.redZoneStart !== undefined && value >= config.redZoneStart,
    });
  }

  // Geometry — everything in a -100..+100 viewBox.
  const R_OUTER = 96;
  const R_BEZEL = 92;
  const R_FACE = 86;
  const R_TICK_OUTER = 82;
  const R_TICK_MAJOR_INNER = 66;
  const R_TICK_MINOR_INNER = 74;
  const R_LABEL = 56;
  const R_NEEDLE_TIP = 76;
  const R_REDZONE_INNER = 78;
  const R_REDZONE_OUTER = 84;

  // Polar → cartesian helper. angleDeg is from 12 o'clock, clockwise.
  const polar = (r: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: r * Math.sin(rad), y: -r * Math.cos(rad) };
  };

  // Red-zone arc path (SVG arc command).
  const redZonePath = (() => {
    if (config.redZoneStart === undefined) return null;
    const t =
      (config.redZoneStart - config.min) / (config.max - config.min);
    const startDeg = config.startAngle + t * sweep;
    const endDeg = config.endAngle;
    const a = polar(R_REDZONE_OUTER, startDeg);
    const b = polar(R_REDZONE_OUTER, endDeg);
    const c = polar(R_REDZONE_INNER, endDeg);
    const d = polar(R_REDZONE_INNER, startDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return [
      `M ${a.x} ${a.y}`,
      `A ${R_REDZONE_OUTER} ${R_REDZONE_OUTER} 0 ${largeArc} 1 ${b.x} ${b.y}`,
      `L ${c.x} ${c.y}`,
      `A ${R_REDZONE_INNER} ${R_REDZONE_INNER} 0 ${largeArc} 0 ${d.x} ${d.y}`,
      "Z",
    ].join(" ");
  })();

  return (
    <div
      className="relative"
      style={{ width: config.size, height: config.size }}
    >
      <svg
        viewBox="-100 -100 200 200"
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        <defs>
          <radialGradient id={`${idPrefix}-face`} cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#181C26" />
            <stop offset="60%" stopColor="#0C0F16" />
            <stop offset="100%" stopColor="#06080C" />
          </radialGradient>
          <radialGradient id={`${idPrefix}-bezel`} cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#3A4252" />
            <stop offset="40%" stopColor="#1B2030" />
            <stop offset="100%" stopColor="#080A10" />
          </radialGradient>
          <linearGradient
            id={`${idPrefix}-needle`}
            x1="0"
            y1="100%"
            x2="0"
            y2="0%"
          >
            <stop offset="0%" stopColor={config.needleColor} stopOpacity="0.05" />
            <stop offset="55%" stopColor={config.needleColor} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFE9B8" />
          </linearGradient>
          <linearGradient id={`${idPrefix}-glass`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <filter id={`${idPrefix}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        {/* Outer metallic bezel */}
        <circle cx="0" cy="0" r={R_OUTER} fill={`url(#${idPrefix}-bezel)`} />
        <circle
          cx="0"
          cy="0"
          r={R_BEZEL}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />

        {/* Dial face */}
        <circle cx="0" cy="0" r={R_FACE} fill={`url(#${idPrefix}-face)`} />

        {/* Inner ring shadow for depth */}
        <circle
          cx="0"
          cy="0"
          r={R_FACE - 1}
          fill="none"
          stroke="rgba(0,0,0,0.6)"
          strokeWidth="1.5"
        />

        {/* Red zone arc */}
        {redZonePath && (
          <path
            d={redZonePath}
            fill="#E0392A"
            opacity="0.85"
          />
        )}

        {/* Ticks */}
        {ticks.map((t, i) => {
          const outer = polar(R_TICK_OUTER, t.angle);
          const inner = polar(
            t.major ? R_TICK_MAJOR_INNER : R_TICK_MINOR_INNER,
            t.angle,
          );
          return (
            <line
              key={`t-${i}`}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              stroke={
                t.inRedZone
                  ? t.major
                    ? "#FFD6CF"
                    : "#FF8B7B"
                  : t.major
                    ? "rgba(255,255,255,0.85)"
                    : "rgba(255,255,255,0.25)"
              }
              strokeWidth={t.major ? 1.4 : 0.7}
              strokeLinecap="round"
            />
          );
        })}

        {/* Tick number labels (major only) */}
        {ticks
          .filter((t) => t.major)
          .map((t, i) => {
            const p = polar(R_LABEL, t.angle);
            return (
              <text
                key={`n-${i}`}
                x={p.x}
                y={p.y}
                dy="3.2"
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fontFamily="var(--font-barlow), sans-serif"
                fill={t.inRedZone ? "#FF8B7B" : "rgba(255,255,255,0.88)"}
                style={{ letterSpacing: "0.5px" }}
              >
                {config.formatTick ? config.formatTick(t.value) : t.value}
              </text>
            );
          })}

        {/* Big inner label (e.g. KM/H) */}
        <text
          x="0"
          y={config.digital ? "32" : "22"}
          textAnchor="middle"
          fontSize="6.5"
          letterSpacing="1.6"
          fontFamily="var(--font-barlow), sans-serif"
          fill="rgba(255,255,255,0.55)"
        >
          {config.bigLabel}
        </text>

        {/* Small label below (e.g. MAX 360) */}
        <text
          x="0"
          y={config.digital ? "40" : "30"}
          textAnchor="middle"
          fontSize="4.5"
          letterSpacing="1.2"
          fontFamily="ui-monospace, SFMono-Regular, monospace"
          fill={config.redZoneStart !== undefined ? "#FF8B7B" : "rgba(245,166,35,0.7)"}
        >
          {config.smallLabel}
        </text>

        {/* Glass reflection arc */}
        <path
          d={`M ${-R_FACE * 0.78} ${-R_FACE * 0.35} Q 0 ${-R_FACE * 1.05} ${R_FACE * 0.78} ${-R_FACE * 0.35}`}
          fill="none"
          stroke={`url(#${idPrefix}-glass)`}
          strokeWidth="22"
          strokeLinecap="round"
        />

        {/* Needle — rotated dynamically */}
        <motion.g style={{ rotate: needleAngle, transformOrigin: "0px 0px" }}>
          {/* Glow behind tip */}
          <circle
            cx="0"
            cy={-R_NEEDLE_TIP}
            r="4"
            fill={config.needleColor}
            filter={`url(#${idPrefix}-glow)`}
            opacity="0.7"
          />
          {/* Tapered needle */}
          <polygon
            points={`-2,8 2,8 1,-${R_NEEDLE_TIP} -1,-${R_NEEDLE_TIP}`}
            fill={`url(#${idPrefix}-needle)`}
          />
          {/* Counterweight stub */}
          <rect x="-3" y="6" width="6" height="14" rx="2" fill="#0A0C12" />
        </motion.g>

        {/* Pivot cap (above needle) */}
        <circle cx="0" cy="0" r="6.5" fill="#0A0C12" stroke="rgba(245,166,35,0.55)" strokeWidth="1" />
        <circle cx="0" cy="0" r="2.5" fill={config.needleColor} />
      </svg>

      {/* Digital readout (speedo only) — overlaid because SVG <text>
          doesn't take MotionValue-derived strings cleanly. */}
      {config.digital && (
        <div
          className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center"
          style={{ paddingTop: `${config.size * 0.18}px` }}
        >
          <DigitalReadout value={dialValue} />
        </div>
      )}
    </div>
  );
}

function DigitalReadout({ value }: { value: MotionValue<number> }) {
  const display = useTransform(value, (v) =>
    Math.round(v).toString().padStart(3, "0"),
  );
  return (
    <motion.span
      className="font-mono tabular-nums text-2xl text-[var(--text-primary)] tracking-tight"
      style={{ textShadow: "0 0 12px rgba(245,166,35,0.35)" }}
    >
      {display}
    </motion.span>
  );
}
