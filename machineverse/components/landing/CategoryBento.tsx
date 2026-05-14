"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type SVGProps,
} from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import { type Category } from "@/lib/types";
import { useViewTransition } from "@/hooks/useViewTransition";
import { useScrambleText } from "@/lib/useScrambleText";
import CarGlyph from "./glyphs/CarGlyph";
import BikeGlyph from "./glyphs/BikeGlyph";
import PlaneGlyph from "./glyphs/PlaneGlyph";
import ShipGlyph from "./glyphs/ShipGlyph";
import TrainGlyph from "./glyphs/TrainGlyph";
import BusGlyph from "./glyphs/BusGlyph";
import RocketGlyph from "./glyphs/RocketGlyph";
import WorldGlyph from "./glyphs/WorldGlyph";

/**
 * CategoryBento — "The Assembly Floor"
 * ────────────────────────────────────
 * Asymmetric workshop-bay layout. Each card is built around a stylized
 * line-art vehicle silhouette that draws itself in on hover (the
 * stroke-dashoffset trick), a scrambled-then-resolved title in the
 * brand's Barlow Condensed, and a reveal row of three live counters
 * that slide up when the card is engaged.
 *
 * Layout (desktop ≥ md):
 *
 *     ┌────────────────┬───────┬───────┐
 *     │                │ Bikes │ Plane │
 *     │     CARS       ├───────┴───────┤
 *     │   (featured)   │     Ships     │
 *     │                ├───────┬───────┤
 *     │                │ Train │ Road  │
 *     ├────────────────┴───────┴───────┤
 *     │           Experimental         │
 *     ├────────────────────────────────┤
 *     │       All Vehicles → CTA       │
 *     └────────────────────────────────┘
 *
 * On mobile everything collapses to a single column in source order.
 */

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

interface CategoryDef {
  cat: Category;
  no: string;
  label: string;
  tagline: string;
  glyph: Glyph;
  /** Per-card accent color (overrides amber when hovered). */
  accent: string;
  accentSoft: string;
  stats: Array<{ k: string; v: string }>;
  /** Tailwind grid placement string. */
  gridArea: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    cat: "cars",
    no: "01",
    label: "CARS",
    tagline: "From the Type 35 to the Taycan — every chassis, every era.",
    glyph: CarGlyph,
    accent: "#F5A623",
    accentSoft: "rgba(245,166,35,0.12)",
    stats: [
      { k: "indexed", v: "4,820" },
      { k: "span", v: "1885–2026" },
      { k: "makers", v: "247" },
    ],
    gridArea: "md:col-span-2 md:row-span-2",
  },
  {
    cat: "bikes",
    no: "02",
    label: "BIKES",
    tagline: "Two wheels, one apex.",
    glyph: BikeGlyph,
    accent: "#FF5A4D",
    accentSoft: "rgba(255,90,77,0.12)",
    stats: [
      { k: "indexed", v: "1,840" },
      { k: "span", v: "1885–2026" },
      { k: "fastest", v: "440 km/h" },
    ],
    gridArea: "md:col-span-1",
  },
  {
    cat: "aircraft",
    no: "03",
    label: "AIRCRAFT",
    tagline: "Wide-bodies, wings, jet engines, wonders.",
    glyph: PlaneGlyph,
    accent: "#5BC8D9",
    accentSoft: "rgba(91,200,217,0.12)",
    stats: [
      { k: "indexed", v: "2,210" },
      { k: "span", v: "1903–2026" },
      { k: "ceiling", v: "Mach 6" },
    ],
    gridArea: "md:col-span-1",
  },
  {
    cat: "ships",
    no: "04",
    label: "SHIPS",
    tagline: "Hull, keel, displacement.",
    glyph: ShipGlyph,
    accent: "#7DD3A8",
    accentSoft: "rgba(125,211,168,0.12)",
    stats: [
      { k: "indexed", v: "1,490" },
      { k: "span", v: "1801–2026" },
      { k: "largest", v: "564 kt" },
    ],
    gridArea: "md:col-span-2",
  },
  {
    cat: "trains",
    no: "05",
    label: "TRAINS",
    tagline: "Steel rails, mag-lev, monorail dreams.",
    glyph: TrainGlyph,
    accent: "#C9A4FF",
    accentSoft: "rgba(201,164,255,0.12)",
    stats: [
      { k: "indexed", v: "980" },
      { k: "span", v: "1825–2026" },
      { k: "fastest", v: "603 km/h" },
    ],
    gridArea: "md:col-span-1",
  },
  {
    cat: "road",
    no: "06",
    label: "ROAD TRANSIT",
    tagline: "Buses, trams, rapid transit.",
    glyph: BusGlyph,
    accent: "#FFD27A",
    accentSoft: "rgba(255,210,122,0.12)",
    stats: [
      { k: "indexed", v: "720" },
      { k: "span", v: "1827–2026" },
      { k: "cities", v: "390+" },
    ],
    gridArea: "md:col-span-1",
  },
  {
    cat: "experimental",
    no: "07",
    label: "EXPERIMENTAL",
    tagline: "Rockets, prototypes, what-ifs that almost-were.",
    glyph: RocketGlyph,
    accent: "#FF8AB3",
    accentSoft: "rgba(255,138,179,0.12)",
    stats: [
      { k: "indexed", v: "640" },
      { k: "concept", v: "1480–2026" },
      { k: "first-stage", v: "reusable" },
    ],
    gridArea: "md:col-span-4",
  },
];

const FEATURED_BANNER: CategoryDef = {
  cat: "all",
  no: "00",
  label: "ALL VEHICLES",
  tagline: "Open the entire verse. Ask anything.",
  glyph: WorldGlyph,
  accent: "#F5A623",
  accentSoft: "rgba(245,166,35,0.18)",
  stats: [
    { k: "total", v: "12,700" },
    { k: "categories", v: "7" },
    { k: "sources", v: "live" },
  ],
  gridArea: "md:col-span-4",
};

export default function CategoryBento() {
  const setCategory = useStore((s) => s.setCategory);
  const clearChat = useStore((s) => s.clearChat);
  const { navigate, prefetch } = useViewTransition();

  const onPick = (c: Category) => {
    clearChat();
    setCategory(c);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mv_visited", "1");
    }
    navigate("/chat");
  };

  const sectionRef = useRef<HTMLElement>(null);
  const headerInView = useInView(sectionRef, { once: true, margin: "-15%" });

  return (
    <section
      ref={sectionRef}
      id="categories"
      className="relative w-full px-6 md:px-10 lg:px-16 py-28 md:py-40 overflow-hidden"
    >
      {/* Background grid + glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(245,166,35,0.06), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 60% 80% at 50% 50%, black 30%, transparent 80%)",
        }}
      />

      <div className="relative max-w-[1400px] mx-auto">
        <SectionHeader inView={headerInView} />

        <div className="mt-12 md:mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[220px] gap-3 md:gap-4">
          {CATEGORIES.map((c, i) => (
            <BentoCard
              key={c.cat}
              def={c}
              index={i}
              onPick={() => onPick(c.cat)}
              onPrefetch={() => prefetch("/chat")}
            />
          ))}

          <FeaturedBanner
            def={FEATURED_BANNER}
            onPick={() => onPick("all")}
            onPrefetch={() => prefetch("/chat")}
          />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Section Header ───────────────────────── */

function SectionHeader({ inView }: { inView: boolean }) {
  const title = useScrambleText("SELECT  YOUR  DOMAIN", inView, 900);
  const counter = useCountUp(0, 12700, 1600, inView);

  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-10">
      <div>
        {/* Numeric prefix + label */}
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-[var(--accent)]">
            02 / 06
          </span>
          <span className="block w-12 h-px bg-[var(--accent)]/40" />
          <span className="font-mono text-[11px] tracking-[0.4em] uppercase text-[var(--text-secondary)]">
            Categories
          </span>
        </div>
        <h2
          className="font-display font-semibold uppercase tracking-[0.02em] leading-[0.95] text-[clamp(2.25rem,5vw,4.25rem)] text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-barlow), sans-serif" }}
        >
          {title}
        </h2>
        <p className="mt-3 max-w-[520px] text-[var(--text-secondary)] text-base md:text-lg">
          Each card opens the verse on its category. Pick one, or hit
          ALL VEHICLES below for the whole atlas.
        </p>
      </div>

      {/* Live counter readout */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex items-end gap-6 md:gap-8 font-mono text-[var(--text-secondary)]"
      >
        <div>
          <div className="text-[10px] tracking-[0.32em] uppercase opacity-60">
            indexed
          </div>
          <div className="text-3xl md:text-4xl text-[var(--text-primary)] font-semibold tabular-nums">
            {counter.toLocaleString()}
          </div>
        </div>
        <div className="hidden sm:block w-px h-12 bg-white/10" />
        <div className="hidden sm:block">
          <div className="text-[10px] tracking-[0.32em] uppercase opacity-60">
            live
          </div>
          <div className="text-3xl md:text-4xl text-[var(--accent)] font-semibold flex items-center gap-2">
            <span className="size-2 rounded-full bg-[var(--accent)] animate-pulse" />
            ON
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ───────────────────────── Bento Card ───────────────────────── */

function BentoCard({
  def,
  index,
  onPick,
  onPrefetch,
}: {
  def: CategoryDef;
  index: number;
  onPick: () => void;
  onPrefetch: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const isFeatured = index === 0; // CARS — only one with span 2x2
  const Glyph = def.glyph;

  // Tilt on mouse position.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), {
    stiffness: 220,
    damping: 18,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), {
    stiffness: 220,
    damping: 18,
  });
  const glowX = useTransform(mx, [-0.5, 0.5], ["15%", "85%"]);
  const glowY = useTransform(my, [-0.5, 0.5], ["15%", "85%"]);
  const glow = useMotionTemplate`radial-gradient(420px circle at ${glowX} ${glowY}, ${def.accentSoft}, transparent 60%)`;

  // Hover state — used to gate the silhouette draw-in + stats reveal.
  const [hovered, setHovered] = useState(false);
  const title = useScrambleText(def.label, inView, 700);

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const handleLeave = () => {
    mx.set(0);
    my.set(0);
    setHovered(false);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onMouseMove={handleMove}
      onMouseEnter={() => {
        setHovered(true);
        onPrefetch();
      }}
      onFocus={() => {
        setHovered(true);
        onPrefetch();
      }}
      onBlur={() => setHovered(false)}
      onMouseLeave={handleLeave}
      onClick={onPick}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.06,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 1200,
        // expose accent as CSS var so child rules can use it
        ["--card-accent" as never]: def.accent,
      }}
      className={`
        group relative ${def.gridArea}
        rounded-2xl overflow-hidden text-left
        bg-[#10131A] border border-white/10
        transition-[border-color,background] duration-500
        cursor-pointer
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--card-accent)]
      `}
      aria-label={`Open ${def.label}`}
    >
      {/* Cursor-following glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-500"
        style={{ background: glow }}
      />

      {/* Faint internal grid */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Diagonal accent stripe that sweeps on hover */}
      <div
        aria-hidden
        className="absolute -inset-x-10 top-1/2 h-[2px] origin-left rotate-[-12deg] scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100 transition-transform duration-700 ease-out"
        style={{
          background: `linear-gradient(90deg, transparent, ${def.accent}, transparent)`,
        }}
      />

      {/* Background silhouette — draws itself in on hover */}
      <div
        className="
          absolute pointer-events-none
          transition-[opacity,transform,color] duration-700 ease-out
        "
        style={{
          color: hovered ? def.accent : "rgba(255,255,255,0.35)",
          opacity: hovered ? 0.55 : 0.18,
          transform: hovered ? "scale(1.04)" : "scale(1)",
          right: isFeatured ? "-6%" : "-12%",
          bottom: isFeatured ? "-12%" : "-18%",
          width: isFeatured ? "78%" : "92%",
          height: isFeatured ? "78%" : "92%",
          filter: hovered
            ? `drop-shadow(0 0 22px ${def.accentSoft})`
            : undefined,
        }}
      >
        <Glyph
          className="w-full h-full"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: hovered ? 0 : 1,
            transition: "stroke-dashoffset 1100ms cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>

      {/* Top row — number + corner ticks */}
      <span
        aria-hidden
        className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20 group-hover:border-[var(--card-accent)] transition-colors duration-500"
      />
      <span
        aria-hidden
        className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20 group-hover:border-[var(--card-accent)] transition-colors duration-500"
      />
      <span
        aria-hidden
        className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20 group-hover:border-[var(--card-accent)] transition-colors duration-500"
      />
      <span
        aria-hidden
        className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20 group-hover:border-[var(--card-accent)] transition-colors duration-500"
      />

      <span
        className="absolute top-4 right-4 font-mono text-[10px] tracking-[0.32em] uppercase text-[var(--text-secondary)]/70 group-hover:text-[var(--card-accent)] transition-colors duration-500"
        style={{ color: hovered ? def.accent : undefined }}
      >
        № {def.no}
      </span>

      {/* Content stack */}
      <div className="relative z-10 flex flex-col h-full p-5 md:p-6">
        <div className="font-mono text-[10px] tracking-[0.32em] uppercase text-[var(--text-secondary)]">
          BAY · {def.no}
        </div>

        <div className="mt-auto">
          <div
            className={`
              font-display uppercase font-semibold tracking-[0.04em]
              ${isFeatured ? "text-4xl md:text-6xl" : "text-2xl md:text-3xl"}
              text-[var(--text-primary)]
              leading-[0.95]
            `}
            style={{ fontFamily: "var(--font-barlow), sans-serif" }}
          >
            {title}
          </div>
          <p
            className={`
              mt-2 text-[var(--text-secondary)]
              ${isFeatured ? "text-base md:text-lg max-w-[420px]" : "text-sm"}
            `}
          >
            {def.tagline}
          </p>

          {/* Stat reveal row (always 3 stats per CategoryDef) */}
          <div
            className="
              mt-3 grid gap-3 grid-cols-3
              opacity-0 translate-y-2
              group-hover:opacity-100 group-hover:translate-y-0
              group-focus-visible:opacity-100 group-focus-visible:translate-y-0
              transition-all duration-500
            "
          >
            {def.stats.map((s) => (
              <div key={s.k}>
                <div className="font-mono text-[9px] tracking-[0.28em] uppercase opacity-50">
                  {s.k}
                </div>
                <div
                  className="font-display text-sm md:text-base font-semibold"
                  style={{ color: def.accent }}
                >
                  {s.v}
                </div>
              </div>
            ))}
          </div>

          {/* Click affordance */}
          <div
            className="
              mt-4 inline-flex items-center gap-1.5
              font-mono text-[10px] tracking-[0.32em] uppercase
              opacity-0 -translate-x-1
              group-hover:opacity-100 group-hover:translate-x-0
              group-focus-visible:opacity-100 group-focus-visible:translate-x-0
              transition-all duration-500
            "
            style={{ color: def.accent }}
          >
            Open <ArrowUpRight className="size-3" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ─────────────────── Featured Banner (All Vehicles) ─────────────────── */

function FeaturedBanner({
  def,
  onPick,
  onPrefetch,
}: {
  def: CategoryDef;
  onPick: () => void;
  onPrefetch: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const title = useScrambleText("ALL  VEHICLES", inView, 950);

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onPick}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: 0.5,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      className="
        group relative col-span-1 sm:col-span-2 md:col-span-4
        rounded-2xl overflow-hidden text-left
        bg-[#0E1116] border border-white/10
        hover:border-[var(--accent)]/60
        transition-colors duration-500
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
        cursor-pointer
      "
      style={{ minHeight: 260 }}
      aria-label="Open All Vehicles"
    >
      {/* Rotating WorldGlyph in the background */}
      <div
        aria-hidden
        className="absolute right-[-8%] top-1/2 -translate-y-1/2 w-[520px] h-[520px] text-[var(--accent)]/50 opacity-25 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none"
      >
        <motion.div
          className="w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        >
          <WorldGlyph
            className="w-full h-full"
            style={{
              strokeDasharray: 1,
              strokeDashoffset: 0,
              filter: "drop-shadow(0 0 32px rgba(245,166,35,0.25))",
            }}
          />
        </motion.div>
      </div>

      {/* Gradient overlay so the silhouette doesn't compete with text */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(13,15,20,0.95) 0%, rgba(13,15,20,0.6) 55%, transparent 100%)",
        }}
      />

      {/* Pulsing accent border */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(245,166,35,0.18)",
        }}
      />

      {/* Corner ticks */}
      <span
        aria-hidden
        className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[var(--accent)]/40"
      />
      <span
        aria-hidden
        className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[var(--accent)]/40"
      />
      <span
        aria-hidden
        className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[var(--accent)]/40"
      />
      <span
        aria-hidden
        className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[var(--accent)]/40"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 md:p-12 h-full min-h-[260px]">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--accent)]">
              № 00 · FULL ATLAS
            </span>
            <span className="block w-10 h-px bg-[var(--accent)]/50" />
            <span className="size-2 rounded-full bg-[var(--accent)] animate-pulse" />
          </div>
          <div
            className="font-display uppercase font-semibold tracking-[0.04em] leading-[0.95] text-[clamp(2.5rem,7vw,5.5rem)] text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-barlow), sans-serif" }}
          >
            <span>{title.split("  ")[0] ?? "ALL"}</span>{" "}
            <span className="text-[var(--accent)] [text-shadow:0_0_28px_rgba(245,166,35,0.45)]">
              {title.split("  ")[1] ?? "VEHICLES"}
            </span>
          </div>
          <p className="mt-3 text-[var(--text-secondary)] text-base md:text-lg max-w-[560px]">
            {def.tagline}
          </p>

          <div className="mt-6 flex flex-wrap gap-6 md:gap-10 font-mono text-xs">
            {def.stats.map((s) => (
              <div key={s.k}>
                <div className="text-[10px] tracking-[0.32em] uppercase text-[var(--text-secondary)] opacity-60">
                  {s.k}
                </div>
                <div className="text-xl md:text-2xl font-semibold text-[var(--accent)] tabular-nums">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA pill */}
        <div className="flex items-center gap-3 text-[var(--accent)] font-display uppercase tracking-[0.18em] text-sm md:text-base">
          <span className="hidden md:inline">Enter</span>
          <span
            aria-hidden
            className="
              inline-flex items-center justify-center
              size-14 md:size-16
              rounded-full
              border border-[var(--accent)] bg-[var(--accent)]/10
              group-hover:bg-[var(--accent)] group-hover:text-[#0D0F14]
              transition-all duration-500
            "
          >
            <ArrowUpRight className="size-6 md:size-7" />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

/* ────────────────────────── Helpers ────────────────────────── */

/** Easing-out count up for the section header live counter. */
function useCountUp(
  from: number,
  to: number,
  durationMs: number,
  start: boolean,
): number {
  const [value, setValue] = useState(from);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const begin = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - begin) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, durationMs, start]);
  return value;
}
