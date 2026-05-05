"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Flame, Lightbulb, Scale, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import type { Category } from "@/lib/types";

const TRENDING: { topic: string; cat: Category }[] = [
  { topic: "Tesla Model S Plaid", cat: "cars" },
  { topic: "Concorde's last flight", cat: "aircraft" },
  { topic: "How submarines work", cat: "ships" },
  { topic: "Maglev vs HSR", cat: "trains" },
  { topic: "Formula 1 aerodynamics", cat: "cars" },
];

const CATEGORY_QUESTIONS: Record<Category, string[]> = {
  all: [
    "Most beautiful machine ever?",
    "Fastest vehicles on earth?",
    "Future of transport in 2050?",
  ],
  cars: [
    "How EVs really work",
    "Inside the Ford Mustang lineage",
    "Fastest production car today",
  ],
  bikes: [
    "How motorcycles balance",
    "Harley vs Ducati",
    "Top superbikes of 2025",
  ],
  aircraft: [
    "How jet engines work",
    "Largest aircraft ever",
    "Future of supersonic travel",
  ],
  ships: [
    "Inside a nuclear submarine",
    "Largest cruise ship operating",
    "Why the Titanic sank",
  ],
  trains: [
    "How maglev levitates",
    "Fastest bullet trains today",
    "From steam to electric",
  ],
  road: [
    "Future of electric trucking",
    "How modern trams work",
    "BRT vs metro tradeoffs",
  ],
  experimental: [
    "Are flying cars real yet?",
    "Hyperloop status in 2026",
    "How eVTOLs lift off",
  ],
};

export default function Sidebar({
  onTopicClick,
  onOpenTimeline,
  onOpenCompare,
}: {
  onTopicClick: (q: string) => void;
  onOpenTimeline: () => void;
  onOpenCompare: () => void;
}) {
  const activeCategory = useStore((s) => s.activeCategory);
  const [mobileOpen, setMobileOpen] = useState(false);

  const questions = CATEGORY_QUESTIONS[activeCategory] ?? CATEGORY_QUESTIONS.all;

  const Inner = ({ closeAfter }: { closeAfter?: () => void }) => (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-7">
        <section>
          <h3
            className="flex items-center gap-2 text-accent font-bold text-base mb-3 tracking-wide uppercase"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            <Flame className="w-4 h-4" /> Trending now
          </h3>
          <div className="flex flex-wrap gap-2">
            {TRENDING.map((t) => (
              <button
                key={t.topic}
                onClick={() => {
                  onTopicClick(t.topic);
                  closeAfter?.();
                }}
                className="bg-background border border-border text-text-primary text-xs px-3 py-1.5 rounded-full hover:border-accent hover:text-accent transition-colors"
              >
                {t.topic}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3
            className="flex items-center gap-2 text-accent font-bold text-base mb-3 tracking-wide uppercase"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            <Lightbulb className="w-4 h-4" /> Start exploring
          </h3>
          <div className="flex flex-col gap-2">
            {questions.map((q) => (
              <button
                key={q}
                onClick={() => {
                  onTopicClick(q);
                  closeAfter?.();
                }}
                className="bg-background border border-border text-text-secondary text-sm px-3 py-2 rounded-lg hover:border-accent hover:text-text-primary transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-border grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            onOpenTimeline();
            closeAfter?.();
          }}
          className="flex flex-col items-center justify-center gap-1.5 p-3 bg-background border border-border rounded-xl hover:border-accent hover:text-accent transition-all group"
        >
          <CalendarDays className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" />
          <span
            className="text-xs font-bold text-text-secondary group-hover:text-accent transition-colors uppercase tracking-wide"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            Timeline
          </span>
        </button>
        <button
          onClick={() => {
            onOpenCompare();
            closeAfter?.();
          }}
          className="flex flex-col items-center justify-center gap-1.5 p-3 bg-background border border-border rounded-xl hover:border-accent hover:text-accent transition-all group"
        >
          <Scale className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" />
          <span
            className="text-xs font-bold text-text-secondary group-hover:text-accent transition-colors uppercase tracking-wide"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            Compare
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex flex-col w-[230px] lg:w-[270px] flex-shrink-0 border-r border-border h-full">
        <Inner />
      </aside>

      <button
        className="md:hidden fixed bottom-[80px] left-3 z-30 bg-surface border border-border rounded-full p-3 shadow-lg text-text-secondary hover:text-accent"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <Flame className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="md:hidden fixed bottom-0 left-0 right-0 h-[420px] bg-surface rounded-t-3xl border-t border-border z-50 flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center p-3 px-4">
                <span
                  className="text-xs font-bold uppercase tracking-wider text-text-secondary"
                  style={{ fontFamily: "var(--font-barlow)" }}
                >
                  Explore
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close"
                  className="text-text-secondary hover:text-accent p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <Inner closeAfter={() => setMobileOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
