"use client";

import { useMemo } from "react";

interface MarqueeProps {
  items: string[];
  /** Seconds for one full loop. Lower = faster. */
  speed?: number;
  reverse?: boolean;
  className?: string;
}

/**
 * Pure-CSS marquee. Doubles the item list inline and uses `mv-marquee`
 * (already defined in globals.css) to translate -50% → seamless loop.
 */
export default function Marquee({
  items,
  speed = 32,
  reverse = false,
  className,
}: MarqueeProps) {
  const list = useMemo(() => [...items, ...items], [items]);

  return (
    <div
      className={`
        relative w-full overflow-hidden
        [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]
        ${className ?? ""}
      `}
    >
      <div
        className="mv-marquee inline-flex whitespace-nowrap"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {list.map((item, i) => (
          <span key={i} className="inline-flex items-center px-6 md:px-10">
            <span className="font-mono text-xs md:text-sm tracking-[0.35em] uppercase text-[var(--text-primary)]">
              {item}
            </span>
            <span className="ml-6 md:ml-10 size-1 rounded-full bg-[var(--accent)]" />
          </span>
        ))}
      </div>
    </div>
  );
}
