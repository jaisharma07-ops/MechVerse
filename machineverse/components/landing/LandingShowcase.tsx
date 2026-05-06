"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Slide {
  id: string;
  era: string;
  name: string;
  spec: string;
  blurb: string;
  emoji: string;
  hue: string;
  bg: string;
}

const SLIDES: Slide[] = [
  {
    id: "01",
    era: "1885",
    name: "BENZ PATENT-MOTORWAGEN",
    spec: "0.75 HP · 16 KM/H · 100 KG",
    blurb: "The first automobile. A three-wheeled spark that ignited a century of speed.",
    emoji: "🛞",
    hue: "from-amber-500/40 to-amber-900/0",
    bg: "#1a120a",
  },
  {
    id: "02",
    era: "1947",
    name: "BELL X-1",
    spec: "MACH 1.06 · 13,000 M · ROCKET",
    blurb: "The day humans broke the sound barrier and the sky stopped being a ceiling.",
    emoji: "✈",
    hue: "from-orange-500/40 to-red-900/0",
    bg: "#150a08",
  },
  {
    id: "03",
    era: "1964",
    name: "SHINKANSEN 0-SERIES",
    spec: "210 KM/H · ELECTRIC · TOKAIDŌ",
    blurb: "The bullet that turned trains into time machines for a hurried civilization.",
    emoji: "🚄",
    hue: "from-rose-500/40 to-rose-900/0",
    bg: "#160a10",
  },
  {
    id: "04",
    era: "1969",
    name: "SATURN V",
    spec: "3,400 t · 50 MN · MOON-BOUND",
    blurb: "The loudest engine ever lit. It carried twelve souls beyond the cradle.",
    emoji: "🚀",
    hue: "from-yellow-300/40 to-amber-900/0",
    bg: "#1a1408",
  },
  {
    id: "05",
    era: "2008",
    name: "TESLA ROADSTER",
    spec: "248 HP · 0-100 IN 3.9 S · LITHIUM",
    blurb: "The car that proved electrons could outrun gasoline. The pivot is here.",
    emoji: "⚡",
    hue: "from-cyan-400/40 to-blue-900/0",
    bg: "#08121a",
  },
  {
    id: "06",
    era: "20XX",
    name: "WHAT'S NEXT?",
    spec: "HYPER · QUANTUM · NEURAL",
    blurb: "Hover-rails. Fusion drives. Sentient wheels. The verse is still writing itself.",
    emoji: "◈",
    hue: "from-fuchsia-500/40 to-violet-900/0",
    bg: "#150a18",
  },
];

export default function LandingShowcase() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  // Translate horizontally as the user scrolls vertically
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-86%"]);

  // Header sliding off
  const headerY = useTransform(scrollYProgress, [0, 0.15], [0, -40]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // Progress indicator
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="showcase"
      ref={targetRef}
      className="relative bg-[#0A0C12] text-white"
      style={{ height: `${SLIDES.length * 110}vh` }}
    >
      <div className="sticky top-0 h-[100svh] flex flex-col overflow-hidden">
        <motion.div
          style={{ y: headerY, opacity: headerOpacity }}
          className="px-6 md:px-14 pt-10 md:pt-14 flex items-end justify-between"
        >
          <div>
            <p className="text-xs tracking-[0.5em] text-accent font-display uppercase mb-3">
              CHAPTER · 01
            </p>
            <h2
              className="font-display font-bold uppercase text-5xl md:text-7xl leading-[0.9]"
              style={{ fontFamily: "var(--font-barlow)" }}
            >
              MILESTONES <span className="mv-text-stroke">OF SPEED</span>
            </h2>
          </div>
          <div className="hidden md:block max-w-xs text-right text-sm text-text-secondary">
            Six machines. Six revolutions. Scroll horizontally through the moments
            where engineering rewrote what was possible.
          </div>
        </motion.div>

        {/* Horizontal track */}
        <div className="flex-1 flex items-center mv-perspective">
          <motion.div
            style={{ x }}
            className="flex gap-8 md:gap-12 pl-6 md:pl-14 will-change-transform"
          >
            {SLIDES.map((s, i) => (
              <SlideCard key={s.id} slide={s} index={i} />
            ))}
            <div className="w-[20vw] shrink-0" />
          </motion.div>
        </div>

        {/* Bottom progress rail */}
        <div className="px-6 md:px-14 pb-8 flex items-center gap-4">
          <span className="text-xs font-display tracking-widest text-text-secondary uppercase">
            01 / {String(SLIDES.length).padStart(2, "0")}
          </span>
          <div className="flex-1 h-px bg-white/10 relative overflow-hidden">
            <motion.div
              style={{ width: progress }}
              className="absolute inset-y-0 left-0 bg-accent shadow-[0_0_12px_rgba(245,166,35,0.7)]"
            />
          </div>
          <span className="text-xs font-display tracking-widest text-accent uppercase">
            SCROLL →
          </span>
        </div>
      </div>
    </section>
  );
}

function SlideCard({ slide, index }: { slide: Slide; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const inner = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -60]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.92]);
  const tilt = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -8]);

  return (
    <motion.article
      ref={ref}
      style={{ scale }}
      className="shrink-0 w-[80vw] md:w-[60vw] lg:w-[44vw] aspect-[4/5] md:aspect-[5/6] relative rounded-3xl overflow-hidden border border-white/10 mv-card-3d"
    >
      <motion.div
        style={{ rotateY: tilt, background: slide.bg }}
        className="absolute inset-0"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${slide.hue}`} />
        <div className="absolute inset-0 mv-grid-bg opacity-20" />
        <div className="absolute inset-0 mv-noise" />

        {/* Era number watermark */}
        <div
          className="absolute -top-12 -right-8 font-display font-bold text-[28vw] md:text-[20vw] leading-none text-white/[0.04] select-none"
          style={{ fontFamily: "var(--font-barlow)" }}
        >
          {slide.id}
        </div>

        {/* Big emoji icon as visual anchor */}
        <motion.div
          style={{ y: inner }}
          className="absolute inset-0 flex items-center justify-center text-[18rem] md:text-[22rem] leading-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] mv-tilt"
        >
          {slide.emoji}
        </motion.div>

        {/* Top label */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-xs font-display tracking-[0.3em] text-white/70 uppercase">
          <span>{slide.id} / 06</span>
          <span className="px-2 py-1 border border-accent/50 rounded-sm bg-accent/10 text-accent">
            {slide.era}
          </span>
        </div>

        {/* Bottom info */}
        <motion.div
          style={{ y: inner }}
          className="absolute bottom-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-t from-black/85 via-black/50 to-transparent"
        >
          <h3
            className="font-display font-bold uppercase text-2xl md:text-4xl leading-tight mb-2"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            {slide.name}
          </h3>
          <p className="text-xs md:text-sm tracking-[0.25em] text-accent font-display uppercase mb-3">
            {slide.spec}
          </p>
          <p className="text-sm md:text-base text-text-secondary max-w-md">
            {slide.blurb}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/15" />
            <span className="text-[10px] tracking-[0.4em] font-display text-white/50 uppercase">
              ENTRY · {String(index + 1).padStart(3, "0")}
            </span>
          </div>
        </motion.div>

        {/* corner crosshair */}
        <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-accent/60" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-accent/60" />
      </motion.div>
    </motion.article>
  );
}
