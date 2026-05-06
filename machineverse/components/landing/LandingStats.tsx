"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Cpu, Globe2, Rocket, Users, Wrench, Wind } from "lucide-react";

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  Icon: typeof Cpu;
  caption: string;
}

const STATS: Stat[] = [
  { label: "MACHINES INDEXED", value: 142000, suffix: "+", Icon: Wrench, caption: "from 1769 to today" },
  { label: "AVG ANSWER TIME", value: 1.7, suffix: "s", decimals: 1, Icon: Cpu, caption: "Gemini-fueled engine" },
  { label: "CATEGORIES", value: 7, Icon: Globe2, caption: "land · sea · sky · space" },
  { label: "TOP RECORDED SPEED", value: 1227, suffix: " km/h", Icon: Wind, caption: "Thrust SSC, 1997" },
  { label: "ROCKETS LOGGED", value: 836, Icon: Rocket, caption: "orbital + sub-orbital" },
  { label: "ENTHUSIASTS", value: 24500, suffix: "+", Icon: Users, caption: "and climbing fast" },
];

const MARQUEE_ITEMS = [
  "BUGATTI CHIRON SUPER SPORT 300+",
  "SR-71 BLACKBIRD",
  "USS ZUMWALT",
  "MAGLEV SHANGHAI",
  "TESLA SEMI",
  "FALCON HEAVY",
  "ISS · LEO 408 KM",
  "MV AGUSTA F4",
  "CONCORDE",
  "LAMBORGHINI COUNTACH",
  "GOLDEN ARROW",
  "BLOODHOUND LSR",
];

export default function LandingStats() {
  return (
    <section className="relative bg-[#0A0C12] text-white overflow-hidden border-t border-white/5">
      {/* Marquee Strip */}
      <div className="relative overflow-hidden border-y border-accent/20 bg-accent/5 mv-ticker-mask">
        <div
          className="flex whitespace-nowrap py-5 mv-marquee font-display tracking-[0.4em] uppercase text-accent"
          style={{ fontFamily: "var(--font-barlow)" }}
        >
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="px-8 text-lg md:text-2xl flex items-center gap-8 shrink-0">
              {item}
              <span className="text-accent/40">◆</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative px-6 md:px-14 py-24 md:py-36">
        <div className="absolute inset-0 mv-grid-bg opacity-10 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid md:grid-cols-12 gap-10 items-end mb-16">
            <div className="md:col-span-7">
              <p className="text-xs tracking-[0.5em] text-accent font-display uppercase mb-4">
                CHAPTER · 02 — BY THE NUMBERS
              </p>
              <h2
                className="font-display font-bold uppercase text-5xl md:text-7xl leading-[0.9]"
                style={{ fontFamily: "var(--font-barlow)" }}
              >
                AN <span className="text-accent">OBSESSION</span>
                <br />
                <span className="mv-text-stroke">QUANTIFIED.</span>
              </h2>
            </div>
            <div className="md:col-span-5 text-text-secondary text-base md:text-lg leading-relaxed">
              Every horsepower. Every record. Every blueprint. We've catalogued
              the mechanical fingerprints of human ambition — and we're just
              warming up the engine.
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {STATS.map((s, i) => (
              <StatTile key={s.label} stat={s} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatTile({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(stat.value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, stat.value]);

  const formatted = stat.decimals
    ? val.toFixed(stat.decimals)
    : Math.floor(val).toLocaleString("en-US");

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative group p-6 md:p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-sm overflow-hidden hover:border-accent/40 transition-all duration-500"
    >
      <div className="absolute -top-px -left-px w-12 h-12 border-t-2 border-l-2 border-accent/0 group-hover:border-accent transition-all duration-500" />
      <div className="absolute -bottom-px -right-px w-12 h-12 border-b-2 border-r-2 border-accent/0 group-hover:border-accent transition-all duration-500" />

      <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <stat.Icon className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
          <span className="text-[10px] tracking-[0.4em] font-display text-text-secondary uppercase">
            #{String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div
          className="font-display font-bold text-4xl md:text-6xl leading-none mb-3 tabular-nums"
          style={{ fontFamily: "var(--font-barlow)" }}
        >
          {stat.prefix}
          <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            {formatted}
          </span>
          <span className="text-accent">{stat.suffix}</span>
        </div>

        <div className="text-xs tracking-[0.3em] font-display text-accent uppercase mb-2">
          {stat.label}
        </div>
        <div className="text-sm text-text-secondary">{stat.caption}</div>
      </div>
    </motion.div>
  );
}
