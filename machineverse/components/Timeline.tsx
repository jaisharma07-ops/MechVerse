"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import {
  CATEGORY_LABELS,
  type TimelineApiResponse,
  type TimelineMilestone,
} from "@/lib/types";

export default function Timeline({
  isOpen,
  onClose,
  onAsk,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAsk: (q: string) => void;
}) {
  const activeCategory = useStore((s) => s.activeCategory);
  const [milestones, setMilestones] = useState<TimelineMilestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let abort = false;
    (async () => {
      setMilestones([]);
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("/api/timeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: activeCategory }),
        });
        const data = (await res.json()) as TimelineApiResponse;
        if (abort) return;
        if (!res.ok || data.error) {
          setError(data.error ?? "Failed to load timeline");
        } else {
          setMilestones(data.milestones ?? []);
        }
      } catch (e) {
        if (!abort) setError(e instanceof Error ? e.message : "Network error");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, [isOpen, activeCategory]);

  const cat = CATEGORY_LABELS[activeCategory];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="fixed inset-4 md:inset-10 z-50 bg-background border border-border rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 h-[60px] border-b border-border bg-surface">
              <h2
                className="font-bold tracking-wider uppercase text-lg flex items-center gap-2"
                style={{ fontFamily: "var(--font-barlow)" }}
              >
                <span>{cat.emoji}</span>
                <span>History of {cat.label}</span>
              </h2>
              <button
                onClick={onClose}
                aria-label="Close timeline"
                className="text-text-secondary hover:text-accent p-2 rounded-full hover:bg-surface-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading && (
                <div className="flex flex-col items-center justify-center h-full text-text-secondary gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  <p className="text-sm">Charting the timeline…</p>
                </div>
              )}
              {error && !loading && (
                <p className="text-sm text-red-400 text-center mt-10">{error}</p>
              )}
              {!loading && !error && milestones.length > 0 && (
                <div className="relative max-w-4xl mx-auto">
                  <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-accent/40" />
                  <div className="flex flex-col gap-6">
                    {milestones.map((m, i) => {
                      const left = i % 2 === 0;
                      return (
                        <motion.div
                          key={`${m.year}-${m.title}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`relative grid md:grid-cols-2 gap-4 items-start ${
                            left ? "md:[&>div:first-child]:order-2" : ""
                          }`}
                        >
                          <div
                            className={`hidden md:block ${
                              left ? "md:text-left md:pl-8" : "md:text-right md:pr-8"
                            }`}
                          >
                            <span
                              className={`text-3xl font-bold tracking-wide ${
                                m.significance === "high"
                                  ? "text-accent drop-shadow-[0_0_12px_rgba(245,166,35,0.45)]"
                                  : "text-text-primary"
                              }`}
                              style={{ fontFamily: "var(--font-barlow)" }}
                            >
                              {m.year}
                            </span>
                          </div>
                          <div
                            className={`bg-surface border rounded-xl p-4 ml-10 md:ml-0 ${
                              m.significance === "high"
                                ? "border-accent shadow-[0_0_24px_rgba(245,166,35,0.18)]"
                                : "border-border"
                            }`}
                          >
                            <span
                              className="md:hidden block text-xs text-accent font-bold tracking-wider mb-1"
                              style={{ fontFamily: "var(--font-barlow)" }}
                            >
                              {m.year}
                            </span>
                            <h3
                              className="font-bold text-base mb-1 text-text-primary"
                              style={{ fontFamily: "var(--font-barlow)" }}
                            >
                              {m.title}
                            </h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                              {m.description}
                            </p>
                            <button
                              onClick={() => {
                                onAsk(`Tell me more about: ${m.title} (${m.year})`);
                                onClose();
                              }}
                              className="mt-3 text-xs text-accent hover:underline"
                            >
                              Learn more →
                            </button>
                          </div>
                          <span className="absolute left-4 md:left-1/2 top-3 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_0_4px_var(--bg)]" />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
              {!loading && !error && milestones.length === 0 && (
                <p className="text-sm text-text-secondary text-center mt-10">
                  No milestones found.
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
