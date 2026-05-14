"use client";

import {
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { gsap } from "gsap";
import CustomCursor from "./CustomCursor";
import MagneticField, { type MagneticFieldHandle } from "./MagneticField";
import { useViewTransition } from "@/hooks/useViewTransition";

/**
 * Hero — the drafting-table opening.
 * ────────────────────────────────────
 * A 260vh sticky-scrolled stage that reads like an engineering drawing
 * coming to life on a dark table:
 *
 *   • a slow-rotating drafting wheel (concentric rings, datum crosshair,
 *     graduation ticks) anchors the centre at all times,
 *   • three brand phrases reveal from distinct quadrants so the eye
 *     learns to traverse the stage instead of pulsing in one spot,
 *   • a trajectory arc draws itself across phrase two, mirroring
 *     "escape velocity",
 *   • the magnetic-filings field (kept) climaxes to amber under the
 *     wordmark crystallisation,
 *   • the MECHVERSE wordmark settles on a horizon line that draws in,
 *     above a refined drafting block — no sci-fi HUD tropes.
 *
 * The whole stage receives a 12-pixel mouse parallax so resting on the
 * page feels alive without committing to a heavy 3D rig.
 */

const PHRASES = [
  {
    text: "From the first wheel.",
    a: 0.02,
    enter: 0.09,
    exit: 0.22,
    b: 0.30,
    align: "left" as const,
  },
  {
    text: "To escape velocity.",
    a: 0.27,
    enter: 0.34,
    exit: 0.46,
    b: 0.54,
    align: "right" as const,
  },
  {
    text: "Every machine in between.",
    a: 0.50,
    enter: 0.58,
    exit: 0.70,
    b: 0.78,
    align: "center" as const,
  },
];

export default function Hero({ onWatchReel }: { onWatchReel: () => void }) {
  const containerRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef as RefObject<HTMLElement>,
    offset: ["start start", "end end"],
  });
  const fieldHandle = useRef<MagneticFieldHandle | null>(null);

  /* Magnetic-filings intensity climbs slowly through Acts 1–2, then
     ramps hard through the finale so the field tips fully amber under
     the wordmark. */
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      const eased = v < 0.7 ? v * 0.45 : 0.315 + (v - 0.7) * 2.3;
      fieldHandle.current?.setIntensity(Math.min(1, Math.max(0, eased)));
    });
    return unsub;
  }, [scrollYProgress]);

  /* Mouse parallax — a single, slow spring that translates the central
     composition (wheel + datum lines) up to ±12 px. */
  const rawMx = useMotionValue(0);
  const rawMy = useMotionValue(0);
  const px = useSpring(useTransform(rawMx, [-0.5, 0.5], [-12, 12]), {
    stiffness: 60,
    damping: 22,
  });
  const py = useSpring(useTransform(rawMy, [-0.5, 0.5], [-8, 8]), {
    stiffness: 60,
    damping: 22,
  });
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    rawMx.set((e.clientX - r.left) / r.width - 0.5);
    rawMy.set((e.clientY - r.top) / r.height - 0.5);
  };

  /* Background drafting grid drift + finale wash. */
  const gridShiftY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const gridShiftPos = useMotionTemplate`0px ${gridShiftY}px`;
  const washOpacity = useTransform(
    scrollYProgress,
    [0.62, 0.92],
    [0, 0.55],
  );

  /* Initial scroll cue — disappears after the user has moved past 2%. */
  const cueOpacity = useTransform(scrollYProgress, [0, 0.04, 0.08], [1, 0.4, 0]);

  return (
    <section
      ref={containerRef}
      onMouseMove={onMove}
      className="relative w-full"
      style={{
        position: "relative",
        height: "260vh",
        backgroundColor: "#06080C",
      }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* ─────────── Layer 0 — drafting dot grid drift ─────────── */}
        <motion.div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            backgroundPosition: gridShiftPos,
            maskImage:
              "radial-gradient(ellipse 95% 70% at 50% 52%, black 30%, transparent 92%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 95% 70% at 50% 52%, black 30%, transparent 92%)",
          }}
        />

        {/* ─────────── Layer 1 — magnetic field (canvas) ─────────── */}
        <div className="absolute inset-0 z-0 mix-blend-screen opacity-80">
          <MagneticField intensityRef={fieldHandle} />
        </div>

        {/* ─────────── Layer 2 — central drafting composition ─────────── */}
        <motion.div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ x: px, y: py }}
        >
          <DraftingWheel scrollYProgress={scrollYProgress} />
          <TrajectoryArc scrollYProgress={scrollYProgress} />
        </motion.div>

        {/* ─────────── Layer 3 — finale amber wash ─────────── */}
        <motion.div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            opacity: washOpacity,
            background:
              "radial-gradient(ellipse 65% 55% at 50% 55%, rgba(245,166,35,0.28), transparent 70%)",
          }}
        />

        {/* ─────────── Layer 4 — stage vignette ─────────── */}
        <div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 55%, rgba(6,8,12,0.0) 0%, rgba(6,8,12,0.86) 78%, rgba(6,8,12,0.98) 100%)",
          }}
        />

        {/* ─────────── Drafting HUD (corners + revision block) ─────────── */}
        <DraftingHUD scrollYProgress={scrollYProgress} />

        {/* ─────────── Initial MECHVERSE letter reveal ─────────── */}
        <InitialReveal scrollYProgress={scrollYProgress} />

        {/* ─────────── Phrase acts + finale ─────────── */}
        <div className="absolute inset-0 z-10 px-6 md:px-10 lg:px-16">
          {PHRASES.map((p, i) => (
            <PhraseAct
              key={i}
              index={i}
              text={p.text}
              span={[p.a, p.enter, p.exit, p.b]}
              align={p.align}
              scrollYProgress={scrollYProgress}
            />
          ))}

          <Finale scrollYProgress={scrollYProgress} onWatchReel={onWatchReel} />
        </div>

        {/* ─────────── Bottom hairline progress + scroll cue ─────────── */}
        <motion.div
          style={{ opacity: cueOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-white/40">
            scroll
          </span>
          <span className="block w-px h-8 bg-gradient-to-b from-[var(--accent)] to-transparent" />
        </motion.div>

        <ScrollHairline scrollYProgress={scrollYProgress} />
      </div>

      <CustomCursor />
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Central drafting wheel — concentric rings, datum crosshair, ticks.
   Scroll fades it gently up as the finale arrives so it doesn't fight
   the wordmark.
   ════════════════════════════════════════════════════════════════════ */

function DraftingWheel({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const opacity = useTransform(
    scrollYProgress,
    [0.0, 0.08, 0.62, 1.0],
    [0.0, 0.35, 0.5, 0.32],
  );
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1.06]);
  const ticks = Array.from({ length: 36 });

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ opacity, scale }}
    >
      <motion.svg
        viewBox="-200 -200 400 400"
        fill="none"
        stroke="#F5A623"
        strokeWidth="0.6"
        animate={{ rotate: 360 }}
        transition={{ duration: 220, repeat: Infinity, ease: "linear" }}
        style={{
          width: "min(86vmin, 820px)",
          height: "min(86vmin, 820px)",
          filter: "drop-shadow(0 0 36px rgba(245,166,35,0.18))",
        }}
      >
        {/* Concentric rings */}
        <circle cx="0" cy="0" r="192" strokeOpacity="0.22" />
        <circle
          cx="0"
          cy="0"
          r="170"
          strokeOpacity="0.55"
          strokeDasharray="2 7"
        />
        <circle cx="0" cy="0" r="128" strokeOpacity="0.32" />
        <circle cx="0" cy="0" r="78" strokeOpacity="0.7" />
        <circle cx="0" cy="0" r="30" strokeOpacity="0.92" />
        <circle cx="0" cy="0" r="3.2" fill="#F5A623" stroke="none" />
        {/* Datum crosshair */}
        <line
          x1="-188"
          y1="0"
          x2="188"
          y2="0"
          strokeOpacity="0.4"
          strokeDasharray="1 5"
        />
        <line
          x1="0"
          y1="-188"
          x2="0"
          y2="188"
          strokeOpacity="0.4"
          strokeDasharray="1 5"
        />
        {/* Graduation ticks every 10°, longer every 30° */}
        {ticks.map((_, i) => {
          const a = (i * 10 * Math.PI) / 180;
          const major = i % 3 === 0;
          const r1 = 170;
          const r2 = major ? 192 : 180;
          const x1 = Math.cos(a) * r1;
          const y1 = Math.sin(a) * r1;
          const x2 = Math.cos(a) * r2;
          const y2 = Math.sin(a) * r2;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeOpacity={major ? 0.8 : 0.45}
              strokeWidth={major ? 0.8 : 0.6}
            />
          );
        })}
        {/* Inner spokes */}
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const a = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={Math.cos(a) * 30}
              y1={Math.sin(a) * 30}
              x2={Math.cos(a) * 78}
              y2={Math.sin(a) * 78}
              strokeOpacity="0.45"
            />
          );
        })}
      </motion.svg>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Trajectory arc — sweeps across the stage during Act 2 to mirror
   "escape velocity". Draws in via stroke-dashoffset over a window of
   scroll progress, then fades.
   ════════════════════════════════════════════════════════════════════ */

function TrajectoryArc({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  // 0 → fully drawn at dashoffset 0; 1 → invisible at dashoffset 1.
  const dashoffset = useTransform(scrollYProgress, [0.26, 0.46], [1, 0]);
  const opacity = useTransform(
    scrollYProgress,
    [0.24, 0.32, 0.58, 0.68],
    [0, 0.85, 0.7, 0],
  );

  return (
    <motion.svg
      aria-hidden
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="none"
      fill="none"
      stroke="#F5A623"
      strokeWidth="1.1"
      strokeLinecap="round"
      style={{ opacity, mixBlendMode: "screen" }}
    >
      <motion.path
        d="M -40 720 Q 380 690 720 520 T 1640 100"
        pathLength={1}
        strokeDasharray="1"
        style={{ strokeDashoffset: dashoffset }}
        strokeOpacity="0.85"
      />
      {/* Tick marks along the arc – pure decorative datums */}
      {[
        { x: 320, y: 680, len: 10 },
        { x: 600, y: 565, len: 10 },
        { x: 920, y: 410, len: 12 },
        { x: 1240, y: 245, len: 12 },
      ].map((p, i) => (
        <motion.line
          key={i}
          x1={p.x}
          y1={p.y - p.len}
          x2={p.x}
          y2={p.y + p.len}
          strokeOpacity="0.6"
          initial={false}
        />
      ))}
    </motion.svg>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Phrase reveal — one act per phrase, each in a distinct quadrant.
   ════════════════════════════════════════════════════════════════════ */

function PhraseAct({
  index,
  text,
  span,
  align,
  scrollYProgress,
}: {
  index: number;
  text: string;
  span: [number, number, number, number];
  align: "left" | "right" | "center";
  scrollYProgress: MotionValue<number>;
}) {
  const [a, enter, exit, b] = span;
  const opacity = useTransform(
    scrollYProgress,
    [a, enter, exit, b],
    [0, 1, 1, 0],
  );
  // Enter from below, exit upward — but offset modestly by quadrant.
  const y = useTransform(
    scrollYProgress,
    [a, enter, exit, b],
    align === "right" ? [50, 0, 0, -40] : [40, 0, 0, -40],
  );
  const x = useTransform(
    scrollYProgress,
    [a, enter, exit, b],
    align === "left" ? [-30, 0, 0, 20] : align === "right" ? [30, 0, 0, -20] : [0, 0, 0, 0],
  );
  const scale = useTransform(
    scrollYProgress,
    [a, enter, exit, b],
    [0.94, 1, 1.02, 1.08],
  );

  // Subtle per-letter stagger driven by scroll position within the act.
  const letterProgress = useTransform(scrollYProgress, [a, enter], [0, 1]);

  const positionClass =
    align === "left"
      ? "items-start justify-center text-left md:pl-[6vw] pt-[28vh]"
      : align === "right"
        ? "items-end justify-center text-right md:pr-[6vw] pt-[18vh]"
        : "items-center justify-center text-center";

  const words = text.split(" ");

  return (
    <motion.div
      style={{ opacity, y, x, scale, willChange: "transform, opacity" }}
      className={`absolute inset-0 flex flex-col ${positionClass}`}
    >
      <div
        className={`flex items-center gap-3 mb-4 font-mono text-[10px] md:text-[11px] tracking-[0.4em] uppercase text-[var(--accent)] ${
          align === "right" ? "flex-row-reverse" : ""
        }`}
      >
        <span className="opacity-90">
          ACT · {String(index + 1).padStart(2, "0")}
        </span>
        <span className="block w-10 h-px bg-[var(--accent)]/55" />
        <span className="opacity-60">
          {align === "left" ? "ORIGIN" : align === "right" ? "VECTOR" : "EVERY"}
        </span>
      </div>

      <h2
        className={`
          font-display font-semibold
          tracking-[-0.005em] leading-[1.02]
          text-[clamp(2rem,5.5vw,4.75rem)]
          max-w-[820px]
          ${align === "center" ? "mx-auto" : ""}
        `}
        style={{ fontFamily: "var(--font-barlow), sans-serif" }}
      >
        {words.map((w, i) => (
          <PhraseWord
            key={i}
            word={w}
            wordIndex={i}
            wordCount={words.length}
            progress={letterProgress}
            highlight={i === words.length - 1}
          />
        ))}
      </h2>
    </motion.div>
  );
}

/** Per-word reveal: each word fades+lifts on a slice of the act-progress
 *  scroll. Final word renders in amber for emphasis. */
function PhraseWord({
  word,
  wordIndex,
  wordCount,
  progress,
  highlight,
}: {
  word: string;
  wordIndex: number;
  wordCount: number;
  progress: MotionValue<number>;
  highlight: boolean;
}) {
  const start = (wordIndex / wordCount) * 0.6;
  const end = start + 0.35;
  const op = useTransform(progress, [start, end], [0, 1]);
  const yy = useTransform(progress, [start, end], [18, 0]);

  return (
    <motion.span
      style={{ opacity: op, y: yy, display: "inline-block" }}
      className={`mr-[0.28em] last:mr-0 ${
        highlight
          ? "text-[var(--accent)] [text-shadow:0_0_22px_rgba(245,166,35,0.45)]"
          : "text-white/95"
      }`}
    >
      {word}
    </motion.span>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Finale — horizon line draws, MECHVERSE crystallises, CTAs spring in.
   ════════════════════════════════════════════════════════════════════ */

function Finale({
  scrollYProgress,
  onWatchReel,
}: {
  scrollYProgress: MotionValue<number>;
  onWatchReel: () => void;
}) {
  const { navigate, prefetch } = useViewTransition();
  const [ctaHover, setCtaHover] = useState(false);

  /* Stage opacity / scale / lift — pushed back so the Transformers-style
     "MechVerse" assemble can hold beat the centre stage first. */
  const opacity = useTransform(
    scrollYProgress,
    [0.82, 0.90, 1.0],
    [0, 1, 1],
  );
  const scale = useTransform(scrollYProgress, [0.82, 0.96], [0.94, 1]);
  const y = useTransform(scrollYProgress, [0.82, 0.90], [36, 0]);

  /* Horizon line — draws across as we enter the finale. */
  const lineScale = useTransform(
    scrollYProgress,
    [0.82, 0.94],
    ["0%", "100%"],
  );

  /* Sub-content (tagline + CTAs) — settles slightly later. */
  const subOpacity = useTransform(scrollYProgress, [0.92, 0.99], [0, 1]);
  const subY = useTransform(scrollYProgress, [0.92, 0.99], [18, 0]);

  return (
    <motion.div
      style={{ opacity, scale, y, willChange: "transform, opacity" }}
      className="absolute inset-0 flex flex-col items-center justify-center"
    >
      {/* Drafting datum row above the wordmark */}
      <motion.div
        style={{ opacity }}
        className="mb-8 md:mb-10 flex items-center gap-4 font-mono text-[10px] md:text-[11px] tracking-[0.42em] uppercase text-[var(--accent)]"
      >
        <span className="opacity-90">DWG · 001</span>
        <span className="block w-8 h-px bg-[var(--accent)]/55" />
        <span className="opacity-90">REV · 2026</span>
        <span className="block w-8 h-px bg-[var(--accent)]/55" />
        <span className="opacity-90 flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          ENGAGED
        </span>
      </motion.div>

      {/* Wordmark sitting on a draw-in horizon line */}
      <div className="relative">
        <h1
          className="
            font-display font-black uppercase
            tracking-[-0.025em] leading-[0.86]
            text-center
            text-[clamp(3.75rem,14vw,12.5rem)]
            relative
          "
          style={{ fontFamily: "var(--font-barlow), sans-serif" }}
          aria-label="MechVerse"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/55">
            MECH
          </span>
          <span
            className="text-transparent bg-clip-text bg-gradient-to-b from-[var(--accent)] via-[#f7b14a] to-[#b37400]"
            style={{
              filter: "drop-shadow(0 0 44px rgba(245,166,35,0.42))",
            }}
          >
            VERSE
          </span>
        </h1>

        {/* The horizon line — sweeps from centre outward */}
        <div className="absolute -bottom-2 left-0 right-0 flex justify-center pointer-events-none">
          <motion.span
            aria-hidden
            className="block h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
            style={{ width: lineScale }}
          />
        </div>
      </div>

      {/* Tagline + CTAs (settle later) */}
      <motion.div
        style={{ opacity: subOpacity, y: subY }}
        className="mt-10 md:mt-14 flex flex-col items-center gap-9 md:gap-10"
      >
        <p
          className="
            max-w-[640px] text-center
            text-base md:text-lg leading-relaxed
            text-white/72
            px-2
          "
          style={{ fontFamily: "var(--font-dm-sans), serif" }}
        >
          Every machine ever engineered, surfaced as a single conversation.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-7 md:gap-9">
          <a
            href="/chat"
            onClick={(e) => {
              e.preventDefault();
              navigate("/chat");
            }}
            onMouseEnter={() => {
              setCtaHover(true);
              prefetch("/chat");
            }}
            onMouseLeave={() => setCtaHover(false)}
            onFocus={() => {
              setCtaHover(true);
              prefetch("/chat");
            }}
            onBlur={() => setCtaHover(false)}
            className="
              group relative inline-flex items-center justify-center gap-4
              font-display uppercase font-bold tracking-[0.22em]
              text-[13px] md:text-sm text-[#06080C]
              px-9 py-3.5 md:px-10 md:py-4
              bg-[var(--accent)]
              rounded-[3px]
              overflow-hidden
              transition-[transform,box-shadow,filter] duration-300
              hover:scale-[1.03]
              hover:shadow-[0_0_42px_rgba(245,166,35,0.55)]
            "
            style={{ fontFamily: "var(--font-barlow), sans-serif" }}
          >
            {/* Top + bottom amber accent edges */}
            <span
              aria-hidden
              className="absolute top-0 left-2 right-2 h-px bg-white/40"
            />
            <span
              aria-hidden
              className="absolute bottom-0 left-2 right-2 h-px bg-black/30"
            />

            <span className="relative z-10">Start the engine</span>
            <motion.span
              aria-hidden
              animate={{ x: ctaHover ? 6 : 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative z-10 inline-flex"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.span>

            {/* Specular scanline on hover */}
            <motion.span
              aria-hidden
              className="absolute inset-0 -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/55 to-transparent"
              initial={{ x: "-160%" }}
              animate={ctaHover ? { x: "160%" } : { x: "-160%" }}
              transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            />
          </a>

          <button
            type="button"
            onClick={onWatchReel}
            className="
              group flex items-center gap-3
              font-mono uppercase font-medium tracking-[0.32em]
              text-[11px] md:text-xs text-white/55 hover:text-white
              transition-colors duration-300
            "
          >
            <span
              className="
                inline-flex items-center justify-center
                size-9 rounded-full
                border border-white/20
                group-hover:border-[var(--accent)]/60
                group-hover:bg-[var(--accent)]/10
                transition-[border-color,background] duration-300
              "
            >
              <span className="block w-0 h-0 border-y-[5px] border-y-transparent border-l-[7px] border-l-white/60 group-hover:border-l-[var(--accent)] ml-0.5 transition-colors" />
            </span>
            <span>Watch reel</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Drafting HUD — drafting language, not sci-fi. Four corners + a tiny
   progress chip in the top-right that ticks through the four acts.
   ════════════════════════════════════════════════════════════════════ */

function DraftingHUD({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const stageIndex = useTransform(scrollYProgress, (v) =>
    String(Math.min(4, Math.max(1, Math.floor(v * 4) + 1))).padStart(2, "0"),
  );
  const stageNum = useTransform(scrollYProgress, (v) =>
    Math.min(3, Math.max(0, Math.floor(v * 4))),
  );

  return (
    <>
      {/* Top-left — project block */}
      <div className="absolute top-6 left-6 md:top-9 md:left-10 z-20 font-mono text-[10px] md:text-[11px] tracking-[0.32em] uppercase text-white/45 flex flex-col gap-1.5">
        <span className="text-[var(--accent)] font-semibold drop-shadow-[0_0_6px_rgba(245,166,35,0.35)]">
          MV · FOUNDRY
        </span>
        <span>dwg.no — 001.A</span>
        <span>scale — 1 : 1</span>
      </div>

      {/* Top-right — act progress */}
      <div className="absolute top-6 right-6 md:top-9 md:right-10 z-20 font-mono text-[10px] md:text-[11px] tracking-[0.32em] uppercase text-white/45 flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          <span>act</span>
          <motion.span className="text-white font-semibold text-sm tabular-nums">
            {stageIndex}
          </motion.span>
          <span className="opacity-60">/ 04</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <ActPip key={i} index={i} active={stageNum} />
          ))}
        </div>
      </div>

      {/* Bottom-left — datum coordinate */}
      <div className="hidden md:flex absolute bottom-10 left-10 z-20 font-mono text-[10px] tracking-[0.32em] uppercase text-white/35 items-center gap-3">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-[var(--accent)] animate-[spin_6s_linear_infinite]"
        >
          <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="3" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="21" />
          <line x1="3" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="21" y2="12" />
        </svg>
        <div className="flex flex-col gap-0.5">
          <span>datum — N 34.05 · W 118.24</span>
          <span>tol. ± 0.001 mm</span>
        </div>
      </div>

      {/* Bottom-right — projection note */}
      <div className="hidden md:flex absolute bottom-10 right-10 z-20 font-mono text-[10px] tracking-[0.32em] uppercase text-white/35 items-center gap-3">
        <div className="flex flex-col items-end gap-0.5">
          <span>third-angle projection</span>
          <span>units — mm · iso</span>
        </div>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-[var(--accent)]"
        >
          <circle cx="9" cy="12" r="5" />
          <line x1="14" y1="12" x2="20" y2="12" />
          <line x1="14" y1="12" x2="17" y2="9" />
          <line x1="14" y1="12" x2="17" y2="15" />
        </svg>
      </div>
    </>
  );
}

function ActPip({
  index,
  active,
}: {
  index: number;
  active: MotionValue<number>;
}) {
  const op = useTransform(active, (v) => (v >= index ? 1 : 0.18));
  const bg = useTransform(active, (v) =>
    v >= index ? "var(--accent)" : "rgba(255,255,255,0.25)",
  );
  return (
    <motion.span
      style={{ opacity: op, background: bg }}
      className="block w-2.5 h-1 rounded-[1px]"
    />
  );
}

/* ════════════════════════════════════════════════════════════════════
   Bottom hairline scroll progress.
   ════════════════════════════════════════════════════════════════════ */

function ScrollHairline({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <div
      aria-hidden
      className="absolute bottom-0 left-0 right-0 h-px bg-white/8 z-30 pointer-events-none"
    >
      <motion.div
        style={{ width, willChange: "width" }}
        className="h-full bg-[var(--accent)] relative"
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_14px_rgba(245,166,35,0.9)]" />
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   InitialReveal — the first thing visitors see.
   ────────────────────────────────────────────────────────────────────
   "MECHVERSE" animates in letter-by-letter with a GSAP y+opacity
   stagger (matching the ChapterOverlay SplitText style), then fades
   out as the user scrolls into the phrase acts.
   ════════════════════════════════════════════════════════════════════ */

function InitialReveal({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const titleRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  /* Letter-by-letter stagger on mount — same approach as ChapterOverlay. */
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    const titleEl = titleRef.current;
    const subEl = subRef.current;
    if (!titleEl) return;

    const chars = titleEl.querySelectorAll<HTMLSpanElement>("[data-char]");
    gsap.set(chars, { y: 60, opacity: 0 });
    gsap.to(chars, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.04,
      ease: "power3.out",
      delay: 0.3,
    });

    if (subEl) {
      gsap.fromTo(
        subEl,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.9 },
      );
    }
  }, []);

  /* Fade out quickly as user begins scrolling — must be gone before
     Phrase Act 1 enters at progress ~0.09. The hero container is
     260vh so ~1312px scrollable; we need opacity=0 well before 0.09. */
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.01, 0.04, 0.065],
    [1, 1, 0.2, 0],
  );
  const scale = useTransform(scrollYProgress, [0, 0.065], [1, 0.92]);
  const y = useTransform(scrollYProgress, [0, 0.065], [0, -50]);
  /* Hide entirely once faded so it can't ghost behind phrase text */
  const vis = useTransform(scrollYProgress, (v) =>
    v > 0.07 ? "hidden" as const : "visible" as const,
  );

  const MECH = "MECH";
  const VERSE = "VERSE";

  return (
    <motion.div
      style={{ opacity, scale, y, visibility: vis, willChange: "transform, opacity" }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
    >
      <div
        ref={titleRef}
        className="font-display font-black uppercase tracking-[-0.02em] leading-[0.88] text-center text-[clamp(3.5rem,14vw,12rem)]"
        style={{ fontFamily: "var(--font-barlow), sans-serif" }}
        aria-label="MechVerse"
      >
        <span className="inline-block" aria-hidden>
          {Array.from(MECH).map((ch, i) => (
            <span
              key={`m-${i}`}
              data-char
              className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/55"
              style={{ willChange: "transform, opacity" }}
            >
              {ch}
            </span>
          ))}
        </span>
        <span className="inline-block" aria-hidden>
          {Array.from(VERSE).map((ch, i) => (
            <span
              key={`v-${i}`}
              data-char
              className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-[var(--accent)] via-[#f7b14a] to-[#b37400]"
              style={{
                willChange: "transform, opacity",
                filter: "drop-shadow(0 0 30px rgba(245,166,35,0.35))",
              }}
            >
              {ch}
            </span>
          ))}
        </span>
      </div>

      <div
        ref={subRef}
        className="mt-6 md:mt-8 flex flex-col items-center gap-4"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center gap-4 font-mono text-[10px] md:text-[11px] tracking-[0.4em] uppercase text-[var(--accent)]">
          <span className="block w-10 h-px bg-[var(--accent)]/50" />
          <span>EVERY MACHINE EVER BUILT</span>
          <span className="block w-10 h-px bg-[var(--accent)]/50" />
        </div>
        <p
          className="max-w-[520px] text-center text-sm md:text-base leading-relaxed text-white/50"
          style={{ fontFamily: "var(--font-dm-sans), serif" }}
        >
          The AI-powered encyclopedia of vehicles, aircraft, ships & spacecraft.
        </p>
      </div>
    </motion.div>
  );
}

