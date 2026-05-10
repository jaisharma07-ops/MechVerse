"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Car,
  Bike,
  Plane,
  Ship,
  Train,
  Bus,
  Rocket,
  Globe2,
  type LucideIcon,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { CATEGORY_LABELS, type Category } from "@/lib/types";
import { useViewTransition } from "@/hooks/useViewTransition";

interface BentoTile {
  cat: Category;
  Icon: LucideIcon;
  /** Bento span: each tile gets a column-span/row-span. */
  span: string;
  hint: string;
}

const TILES: BentoTile[] = [
  { cat: "cars", Icon: Car, span: "md:col-span-3 md:row-span-2", hint: "From Type 35 to Taycan" },
  { cat: "bikes", Icon: Bike, span: "md:col-span-3", hint: "Two wheels, one apex" },
  { cat: "aircraft", Icon: Plane, span: "md:col-span-2", hint: "Wide-bodies & wings" },
  { cat: "ships", Icon: Ship, span: "md:col-span-2", hint: "Hull, keel, displacement" },
  { cat: "trains", Icon: Train, span: "md:col-span-2", hint: "Steel rails, mag-lev" },
  { cat: "road", Icon: Bus, span: "md:col-span-3", hint: "Buses, trams, rapid transit" },
  { cat: "experimental", Icon: Rocket, span: "md:col-span-3", hint: "Rockets, prototypes, what-ifs" },
];

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

  return (
    <section
      id="categories"
      className="relative w-full px-6 md:px-10 lg:px-16 py-24 md:py-40"
    >
      <div className="max-w-[1400px] mx-auto">
        <Header />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
          className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-6 auto-rows-[180px] md:auto-rows-[200px] gap-3 md:gap-4"
        >
          {TILES.map((t) => (
            <BentoCard
              key={t.cat}
              tile={t}
              onPick={() => onPick(t.cat)}
              onPrefetch={() => prefetch("/chat")}
            />
          ))}
          {/* "All vehicles" CTA tile spans the rest */}
          <BentoCard
            tile={{
              cat: "all",
              Icon: Globe2,
              span: "col-span-2 md:col-span-3",
              hint: "Browse the full atlas",
            }}
            onPick={() => onPick("all")}
            onPrefetch={() => prefetch("/chat")}
            featured
          />
        </motion.div>
      </div>
    </section>
  );
}

function Header() {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <div className="font-mono text-xs tracking-[0.4em] uppercase text-[var(--accent)]">
          02 — Categories
        </div>
        <h2 className="mt-3 font-display font-semibold uppercase tracking-[0.02em] text-[clamp(2rem,5vw,4rem)] leading-[0.95] text-[var(--text-primary)]">
          Pick a chapter.
          <br />
          <span className="text-[var(--text-secondary)]">Ask anything.</span>
        </h2>
      </div>
      <p className="max-w-[420px] text-[var(--text-secondary)] text-base">
        Each card opens the verse on its category — the chat seeds itself with
        the right context and starts listening.
      </p>
    </div>
  );
}

function BentoCard({
  tile,
  onPick,
  onPrefetch,
  featured = false,
}: {
  tile: BentoTile;
  onPick: () => void;
  onPrefetch: () => void;
  featured?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const meta = CATEGORY_LABELS[tile.cat];
  const Icon = tile.Icon;

  // Tilt on mouse via Framer Motion useMotionValue.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), {
    stiffness: 220,
    damping: 18,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), {
    stiffness: 220,
    damping: 18,
  });
  const glowX = useTransform(mx, [-0.5, 0.5], ["10%", "90%"]);
  const glowY = useTransform(my, [-0.5, 0.5], ["10%", "90%"]);
  const glow = useMotionTemplate`radial-gradient(420px circle at ${glowX} ${glowY}, rgba(245,166,35,0.18), transparent 60%)`;

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
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      onClick={onPick}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className={`
        group relative ${tile.span}
        rounded-2xl overflow-hidden
        bg-[#161A24] border border-white/10
        text-left
        cursor-pointer
        transition-[border-color,background] duration-300
        hover:border-[var(--accent)]/60
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
      `}
      aria-label={`Open ${meta.label}`}
    >
      {/* Cursor-following glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: glow }}
      />

      <div className="relative z-10 flex flex-col h-full p-6 md:p-7">
        <div className="flex items-start justify-between">
          <div
            className={`
              inline-flex items-center justify-center size-12 md:size-14 rounded-xl
              border border-white/10 bg-white/5
              text-[var(--text-primary)]
              transition-colors duration-300
              group-hover:border-[var(--accent)]/60 group-hover:text-[var(--accent)]
            `}
          >
            <Icon className="size-6" />
          </div>
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--text-secondary)]">
            {featured ? "00" : `0${TILES.findIndex((x) => x.cat === tile.cat) + 1}`}
          </span>
        </div>

        <div className="mt-auto">
          <div className="font-display uppercase font-semibold tracking-[0.04em] text-[var(--text-primary)] text-2xl md:text-3xl">
            {meta.label}
          </div>
          <p className="mt-1.5 text-sm md:text-[15px] text-[var(--text-secondary)]">
            {tile.hint}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.3em] uppercase text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Open <span>→</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
