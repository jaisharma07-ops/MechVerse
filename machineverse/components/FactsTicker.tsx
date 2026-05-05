"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import type { FactsApiResponse } from "@/lib/types";

const FALLBACK_FACTS = [
  "The first cars in the late 1800s often had a top speed slower than horses on long roads.",
  "The Boeing 747's wing area is larger than a basketball court.",
  "Container ships can be longer than four football fields end-to-end.",
  "The Shinkansen has averaged a delay of less than a minute per trip for decades.",
  "Concorde could fly faster than the Earth's rotation at sunset, watching the sun rise again.",
];

export default function FactsTicker({
  onFactClick,
}: {
  onFactClick: (fact: string) => void;
}) {
  const activeCategory = useStore((s) => s.activeCategory);
  const visible = useStore((s) => s.factsTickerVisible);
  const toggleVisible = useStore((s) => s.toggleFactsTicker);
  const [facts, setFacts] = useState<string[]>(FALLBACK_FACTS);

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const res = await fetch("/api/facts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: activeCategory }),
        });
        const data = (await res.json()) as FactsApiResponse;
        if (!abort && data?.facts && data.facts.length > 0) {
          setFacts(data.facts);
        }
      } catch {
        // keep fallback
      }
    })();
    return () => {
      abort = true;
    };
  }, [activeCategory]);

  if (!visible) return null;

  // Duplicate for seamless marquee
  const loop = [...facts, ...facts];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 36, opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-surface border-b border-border overflow-hidden flex items-center"
      >
        <div className="flex items-center gap-2 px-3 text-accent flex-shrink-0 border-r border-border h-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span
            className="text-[11px] uppercase font-bold tracking-wider"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            Did you know
          </span>
        </div>

        <div className="flex-1 overflow-hidden whitespace-nowrap relative">
          <div className="mv-marquee inline-flex gap-10 px-6">
            {loop.map((f, i) => (
              <button
                key={`${i}-${f.slice(0, 20)}`}
                onClick={() => onFactClick(f)}
                className="text-xs text-text-secondary hover:text-accent transition-colors"
                title="Ask about this"
              >
                · {f}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={toggleVisible}
          className="px-3 text-text-secondary hover:text-accent flex-shrink-0"
          aria-label="Hide ticker"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
