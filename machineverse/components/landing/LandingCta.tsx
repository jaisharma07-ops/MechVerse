"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const PROMPTS = [
  "What was the fastest production car of 1972?",
  "Compare the SR-71 Blackbird to the U-2.",
  "Tell me how maglev trains levitate.",
  "Show me every Le Mans winner.",
  "Which rockets are reusable in 2026?",
];

const FOOTER_ITEMS = [
  "EXPLORE EVERY MACHINE EVER BUILT",
  "MACHINEVERSE",
  "POWERED BY GEMINI",
  "EST · ∞",
];

export default function LandingCta() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const titleScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 1.05]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  // Typewriter prompt rotator
  const [promptIdx, setPromptIdx] = useState(0);
  const [typed, setTyped] = useState("");
  useEffect(() => {
    const target = PROMPTS[promptIdx];
    if (typed === target) {
      const t = setTimeout(() => {
        setTyped("");
        setPromptIdx((i) => (i + 1) % PROMPTS.length);
      }, 1800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTyped(target.slice(0, typed.length + 1)), 32);
    return () => clearTimeout(t);
  }, [typed, promptIdx]);

  return (
    <section
      ref={ref}
      className="relative bg-[#0A0C12] text-white py-32 md:py-44 px-6 md:px-14 overflow-hidden border-t border-white/5"
    >
      {/* Atmospheric layers */}
      <motion.div
        style={{ opacity: glowOpacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1100px] max-h-[1100px] rounded-full bg-accent/[0.18] blur-[120px]" />
      </motion.div>
      <div className="absolute inset-0 mv-grid-bg opacity-15 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      <div className="relative max-w-6xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-[0.5em] text-accent font-display uppercase mb-6 inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          IGNITION SEQUENCE
        </motion.p>

        <motion.h2
          style={{ y: titleY, scale: titleScale, fontFamily: "var(--font-barlow)" }}
          className="font-display font-bold uppercase leading-[0.85] mb-10"
        >
          <span
            className="block text-[14vw] md:text-[10vw] lg:text-[9rem]"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            <span className="block">START THE</span>
            <span className="block text-accent drop-shadow-[0_0_40px_rgba(245,166,35,0.6)]">
              ENGINE.
            </span>
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-base md:text-xl text-text-secondary max-w-2xl mx-auto mb-12"
        >
          Ask anything. Compare anything. From the Patent-Motorwagen to the next
          fusion drive — the entire mechanical universe in one conversation.
        </motion.p>

        {/* Faux chat prompt */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative max-w-2xl mx-auto mb-10"
        >
          <a
            href="/chat"
            className="block relative bg-surface/40 backdrop-blur border border-white/15 rounded-2xl p-5 md:p-6 text-left hover:border-accent/50 transition-colors overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-3 right-3 flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500/60" />
              <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
              <span className="w-2 h-2 rounded-full bg-green-500/60" />
            </div>
            <div className="text-[10px] tracking-[0.4em] font-display text-accent uppercase mb-3">
              MACHINEVERSE // PROMPT
            </div>
            <div className="font-display text-xl md:text-2xl text-white" style={{ fontFamily: "var(--font-barlow)" }}>
              {typed}
              <span className="inline-block w-[2px] h-6 md:h-7 align-middle bg-accent ml-1 mv-blink" />
            </div>
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-text-secondary">PRESS ENTER TO BEGIN</span>
              <span className="inline-flex items-center gap-2 text-accent text-sm font-display tracking-widest uppercase">
                ASK <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="/chat"
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-accent text-[#0D0F14] font-display tracking-widest text-base uppercase rounded-sm overflow-hidden shadow-[0_0_60px_rgba(245,166,35,0.5)] hover:shadow-[0_0_80px_rgba(245,166,35,0.8)] transition-shadow"
          >
            <span className="absolute inset-0 bg-white/30 mv-streak" />
            ENTER MACHINEVERSE
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#showcase"
            className="px-8 py-5 text-text-secondary hover:text-accent transition-colors font-display tracking-widest text-sm uppercase"
          >
            ↑ Back to Top
          </a>
        </motion.div>
      </div>

      {/* Massive ghost text behind */}
      <div
        className="pointer-events-none absolute -bottom-6 left-0 right-0 text-center font-display font-bold uppercase text-[24vw] leading-[0.8] text-white/[0.03] select-none"
        style={{ fontFamily: "var(--font-barlow)" }}
      >
        VERSE
      </div>

      {/* Footer marquee */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-accent/20 bg-accent/5 mv-ticker-mask">
        <div
          className="flex whitespace-nowrap py-4 mv-marquee font-display tracking-[0.4em] uppercase text-accent text-sm"
          style={{ fontFamily: "var(--font-barlow)" }}
        >
          {[...FOOTER_ITEMS, ...FOOTER_ITEMS, ...FOOTER_ITEMS].map((item, i) => (
            <span key={i} className="px-8 flex items-center gap-8 shrink-0">
              {item}
              <span className="text-accent/40">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
