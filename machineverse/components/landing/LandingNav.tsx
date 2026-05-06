"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

const SECTIONS = [
  { id: "showcase", label: "01 · MILESTONES" },
  { id: "stats",    label: "02 · NUMBERS" },
  { id: "categories", label: "03 · LANES" },
  { id: "timeline", label: "04 · EVOLUTION" },
];

export default function LandingNav() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 120], [0, 1]);
  const y = useTransform(scrollY, [0, 120], [-20, 0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top scroll progress bar — always visible */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[60] bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-accent via-orange-400 to-accent shadow-[0_0_10px_rgba(245,166,35,0.7)] transition-[width] duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>

      <motion.nav
        style={{ opacity, y }}
        className="fixed top-2 left-0 right-0 z-50 px-4 md:px-8"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-[#0A0C12]/80 backdrop-blur-xl border border-white/10 rounded-full pl-5 pr-2 py-2">
          <a href="#top" className="flex items-center gap-3 group">
            <span className="relative flex w-8 h-8 items-center justify-center rounded-full bg-accent/15 border border-accent/40">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            </span>
            <span
              className="font-display font-bold tracking-[0.2em] uppercase text-sm md:text-base"
              style={{ fontFamily: "var(--font-barlow)" }}
            >
              MACHINE<span className="text-accent">VERSE</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="px-3 py-1.5 text-xs font-display tracking-widest uppercase text-text-secondary hover:text-accent transition-colors rounded-full hover:bg-accent/10"
                style={{ fontFamily: "var(--font-barlow)" }}
              >
                {s.label}
              </a>
            ))}
          </div>

          <a
            href="/chat"
            className="inline-flex items-center gap-2 bg-accent text-[#0D0F14] font-display tracking-widest text-xs md:text-sm uppercase px-4 md:px-5 py-2 md:py-2.5 rounded-full hover:shadow-[0_0_24px_rgba(245,166,35,0.6)] transition-shadow"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            LAUNCH <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </motion.nav>
    </>
  );
}
