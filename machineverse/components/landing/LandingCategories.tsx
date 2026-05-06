"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { CATEGORY_LABELS } from "@/lib/types";

interface Cat {
  id: string;
  emoji: string;
  label: string;
  count: string;
  blurb: string;
  big: string;
  bg: string;
  accent: string;
}

const CATS: Cat[] = [
  { id: "cars",         emoji: "🚗",  label: "CARS",         count: "48,200", blurb: "From the Patent-Motorwagen to the Rimac Nevera.",  big: "240+ MPH",  bg: "linear-gradient(135deg, #2a1a08 0%, #0a0c12 60%)", accent: "#F5A623" },
  { id: "bikes",        emoji: "🏍️",  label: "BIKES",        count: "12,840", blurb: "Two-wheel rebellion from Indian to Kawasaki H2R.",   big: "MACH .25",  bg: "linear-gradient(135deg, #2a0808 0%, #0a0c12 60%)", accent: "#FF6B35" },
  { id: "aircraft",     emoji: "✈️",  label: "AIRCRAFT",     count: "21,007", blurb: "Wright Flyer to SR-71 to the eVTOL future.",          big: "MACH 6.7",  bg: "linear-gradient(135deg, #08182a 0%, #0a0c12 60%)", accent: "#5BC5FF" },
  { id: "ships",        emoji: "🚢",  label: "SHIPS",        count: "9,322",  blurb: "Tall ships, supercarriers, autonomous freighters.",   big: "400 KT",    bg: "linear-gradient(135deg, #08221c 0%, #0a0c12 60%)", accent: "#3FE0B0" },
  { id: "trains",       emoji: "🚄",  label: "TRAINS",       count: "6,540",  blurb: "Steam beasts to maglev. Iron rails to tunnels of air.", big: "603 KM/H", bg: "linear-gradient(135deg, #221a08 0%, #0a0c12 60%)", accent: "#E0C13F" },
  { id: "road",         emoji: "🚌",  label: "ROAD TRANSIT", count: "4,118",  blurb: "Buses, monorails and last-mile movers.",              big: "EVERY CITY", bg: "linear-gradient(135deg, #1a0a22 0%, #0a0c12 60%)", accent: "#B888FF" },
  { id: "experimental", emoji: "🚀",  label: "EXPERIMENTAL", count: "2,961",  blurb: "Concepts, prototypes, and rocket-powered dreams.",     big: "∞",         bg: "linear-gradient(135deg, #220822 0%, #0a0c12 60%)", accent: "#FF5BD7" },
  { id: "all",          emoji: "🌐",  label: "EVERYTHING",   count: "142K+",  blurb: "Open the firehose. Every machine ever built.",         big: "ALL OF IT", bg: "linear-gradient(135deg, #08221a 0%, #0a0c12 60%)", accent: "#F5A623" },
];

export default function LandingCategories() {
  return (
    <section className="relative bg-[#0A0C12] text-white py-24 md:py-36 px-6 md:px-14 overflow-hidden">
      <div className="absolute inset-0 mv-grid-bg opacity-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-accent/[0.06] blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-16">
          <div className="md:col-span-7">
            <p className="text-xs tracking-[0.5em] text-accent font-display uppercase mb-4">
              CHAPTER · 03 — CHOOSE YOUR LANE
            </p>
            <h2
              className="font-display font-bold uppercase text-5xl md:text-7xl leading-[0.9]"
              style={{ fontFamily: "var(--font-barlow)" }}
            >
              SEVEN <span className="text-accent">DOMAINS</span>
              <br />
              ONE <span className="mv-text-stroke">VERSE</span>.
            </h2>
          </div>
          <div className="md:col-span-5 text-text-secondary text-base md:text-lg leading-relaxed">
            Pick a discipline and dive in. Each category opens a curated
            conversation with our AI archivist — ask anything, compare
            anything, learn everything.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mv-perspective">
          {CATS.map((c, i) => (
            <CatCard key={c.id} cat={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CatCard({ cat, index }: { cat: Cat; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 180, damping: 20 });
  const sy = useSpring(my, { stiffness: 180, damping: 20 });
  const rotateY = useTransform(sx, [-1, 1], [-12, 12]);
  const rotateX = useTransform(sy, [-1, 1], [10, -10]);
  const lxPct = useTransform(sx, [-1, 1], [20, 80]);
  const lyPct = useTransform(sy, [-1, 1], [20, 80]);
  const spotlight = useMotionTemplate`radial-gradient(circle at ${lxPct}% ${lyPct}%, ${cat.accent}33, transparent 60%)`;

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  const isAll = cat.id === "all";
  // Validate category exists in CATEGORY_LABELS
  const labelEntry = CATEGORY_LABELS[cat.id as keyof typeof CATEGORY_LABELS];

  return (
    <motion.a
      ref={ref}
      href={`/chat?cat=${cat.id}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
        background: cat.bg,
      }}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 hover:border-white/30 transition-colors p-6 md:p-7 aspect-[5/6] flex flex-col justify-between will-change-transform ${
        isAll ? "lg:col-span-2 aspect-[10/6]" : ""
      }`}
    >
      {/* Spotlight cursor follow */}
      <motion.div
        style={{ background: spotlight }}
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      />

      <div className="absolute inset-0 mv-grid-bg opacity-20 pointer-events-none" />

      {/* Top */}
      <div className="relative flex items-start justify-between" style={{ transform: "translateZ(40px)" }}>
        <span className="text-5xl md:text-6xl drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]">{cat.emoji}</span>
        <div className="text-right">
          <div className="text-[10px] tracking-[0.3em] text-text-secondary font-display uppercase">
            INDEXED
          </div>
          <div
            className="font-display font-bold text-xl tabular-nums"
            style={{ fontFamily: "var(--font-barlow)", color: cat.accent }}
          >
            {cat.count}
          </div>
        </div>
      </div>

      {/* Middle big text */}
      <div
        className="relative font-display font-bold text-3xl md:text-5xl leading-[0.9] uppercase opacity-30 group-hover:opacity-60 transition-opacity"
        style={{
          fontFamily: "var(--font-barlow)",
          color: cat.accent,
          transform: "translateZ(20px)",
        }}
      >
        {cat.big}
      </div>

      {/* Bottom */}
      <div className="relative" style={{ transform: "translateZ(60px)" }}>
        <h3
          className="font-display font-bold uppercase text-2xl md:text-3xl mb-2"
          style={{ fontFamily: "var(--font-barlow)" }}
        >
          {cat.label}
        </h3>
        <p className="text-sm text-text-secondary leading-snug mb-4">{cat.blurb}</p>

        <div className="flex items-center gap-2 text-xs font-display tracking-widest uppercase text-white/70 group-hover:text-white transition-colors">
          <span>EXPLORE {labelEntry?.label ?? cat.label}</span>
          <span
            className="inline-block w-8 h-px transition-all group-hover:w-14"
            style={{ background: cat.accent }}
          />
          <span style={{ color: cat.accent }}>→</span>
        </div>
      </div>

      {/* Corner ticks */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l" style={{ borderColor: `${cat.accent}80` }} />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r" style={{ borderColor: `${cat.accent}80` }} />
    </motion.a>
  );
}
