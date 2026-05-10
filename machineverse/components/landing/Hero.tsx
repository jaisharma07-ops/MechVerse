"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import MagneticButton from "./MagneticButton";
import Speedometer from "./Speedometer";
import { useViewTransition } from "@/hooks/useViewTransition";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Hero({ onWatchReel }: { onWatchReel: () => void }) {
  const { navigate, prefetch } = useViewTransition();

  return (
    <section className="relative z-30 min-h-screen w-full flex items-center px-6 md:px-10 lg:px-16">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-10 lg:gap-16 max-w-[1400px] mx-auto w-full"
      >
        <div className="max-w-[920px]">
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm font-mono text-[10px] md:text-xs tracking-[0.32em] uppercase text-[var(--text-secondary)]"
          >
            <span className="size-1.5 rounded-full bg-[var(--accent)] [box-shadow:0_0_8px_rgba(245,166,35,0.7)]" />
            AI-POWERED · Transport Intelligence
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="
              mt-6 md:mt-8
              font-display font-semibold uppercase
              tracking-[0.02em] leading-[0.92]
              text-[clamp(3.5rem,12vw,12rem)]
              text-[var(--text-primary)]
            "
          >
            Every Machine.
            <br />
            <span className="text-[var(--accent)] [text-shadow:0_0_28px_rgba(245,166,35,0.45)]">
              One Verse.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-6 md:mt-8 max-w-[640px] text-base md:text-xl leading-relaxed text-[var(--text-secondary)]"
          >
            Ask anything about every vehicle ever built. From Concorde to
            Cybertruck — sources cited, specs surfaced, history traced.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-8 md:mt-12 flex flex-wrap items-center gap-3 md:gap-5"
          >
            <MagneticButton
              variant="primary"
              onClick={() => navigate("/chat")}
              onMouseEnter={() => prefetch("/chat")}
              onFocus={() => prefetch("/chat")}
            >
              Start Exploring
              <ArrowRight className="size-4 md:size-5" />
            </MagneticButton>
            <MagneticButton variant="ghost" onClick={onWatchReel}>
              <Play className="size-4" />
              Watch the reel
            </MagneticButton>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-10 md:mt-16 flex items-center gap-6 md:gap-10 text-[var(--text-secondary)] font-mono text-xs tracking-[0.2em] uppercase"
          >
            <Stat n="12,400+" l="Vehicles indexed" />
            <Divider />
            <Stat n="47" l="Categories" />
            <Divider />
            <Stat n="Daily" l="Web-grounded" />
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="hidden lg:flex justify-center items-center"
        >
          <Speedometer />
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--text-secondary)]">
          Scroll
        </span>
        <span className="block w-px h-10 bg-gradient-to-b from-[var(--accent)] to-transparent" />
      </div>
    </section>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-2xl md:text-3xl text-[var(--text-primary)] tracking-[0.04em]">
        {n}
      </div>
      <div className="mt-1 text-[10px] md:text-xs">{l}</div>
    </div>
  );
}

function Divider() {
  return <span className="hidden sm:block w-px h-8 bg-white/10" />;
}
