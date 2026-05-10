"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { Globe, GitCompareArrows, Mic } from "lucide-react";

const FEATURES = [
  {
    Icon: Globe,
    title: "Real-time web search",
    body: "Every answer is sourced from the live web — Wikipedia, OEM specs, motoring press — and citations come back with the response.",
  },
  {
    Icon: GitCompareArrows,
    title: "Compare any two vehicles",
    body: "Side-by-side specs, lineage, and verdicts — across categories. Concorde vs. Tu-144. F-150 vs. Cybertruck. Anything.",
  },
  {
    Icon: Mic,
    title: "Voice input",
    body: "Push-to-talk in the chat. Whisper-quality transcription, hands-free for the garage or the cockpit.",
  },
];

export default function FeatureTriplet() {
  return (
    <section className="relative w-full px-6 md:px-10 lg:px-16 py-24 md:py-40">
      <div className="max-w-[1400px] mx-auto">
        <div className="font-mono text-xs tracking-[0.4em] uppercase text-[var(--accent)]">
          03 — Features
        </div>
        <h2 className="mt-3 max-w-[760px] font-display font-semibold uppercase tracking-[0.02em] text-[clamp(2rem,5vw,4rem)] leading-[0.95] text-[var(--text-primary)]">
          A research suite,
          <br />
          <span className="text-[var(--text-secondary)]">disguised as a chat.</span>
        </h2>

        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const Icon = feature.Icon;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const pathRef = useRef<SVGPathElement>(null);

  // Draw-in the underline path when the card hits view.
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = inView ? "0" : `${len}`;
    path.style.transition = "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)";
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.2, 0.8, 0.2, 1] }}
      className="
        relative rounded-2xl border border-white/10 bg-[#161A24]
        p-7 md:p-8
        transition-colors duration-300
        hover:border-[var(--accent)]/40
      "
    >
      <div className="inline-flex items-center justify-center size-12 rounded-xl border border-white/10 bg-white/5 text-[var(--accent)]">
        <Icon className="size-6" />
      </div>
      <h3 className="mt-6 font-display uppercase font-semibold tracking-[0.04em] text-2xl text-[var(--text-primary)]">
        {feature.title}
      </h3>
      <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">
        {feature.body}
      </p>

      {/* SVG underline that draws on scroll-in */}
      <svg
        viewBox="0 0 280 12"
        className="mt-8 w-full h-3 text-[var(--accent)]"
        aria-hidden
      >
        <path
          ref={pathRef}
          d="M2 6 Q 70 1, 140 6 T 278 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}
