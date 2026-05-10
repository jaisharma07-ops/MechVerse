"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

const QUESTIONS: Array<{ q: string; a: string }> = [
  {
    q: "How current is the data?",
    a: "MachineVerse grounds every answer in live web search. Wikipedia, manufacturer pages and motoring press are queried at request time — so anything published recently shows up immediately.",
  },
  {
    q: "Does it work for obscure vehicles?",
    a: "Yes. The same retrieval pipeline that handles the F1 grid handles forklifts, hovercraft, and Soviet bombers. If the web has it, the verse has it.",
  },
  {
    q: "Can I compare two vehicles?",
    a: "Open the Compare tool from the sidebar — or just ask in chat. Two vehicles are returned as a structured spec sheet with a verdict.",
  },
  {
    q: "Is voice input supported?",
    a: "Push-to-talk is built into the chat composer. Transcription runs server-side via Whisper-class quality.",
  },
  {
    q: "Is this free?",
    a: "Free during the public beta. Pricing for power features (deep research, daily digests) is on the roadmap.",
  },
];

export default function FAQ() {
  return (
    <section className="relative w-full px-6 md:px-10 lg:px-16 py-24 md:py-40 border-t border-white/5">
      <div className="max-w-[1100px] mx-auto">
        <div className="font-mono text-xs tracking-[0.4em] uppercase text-[var(--accent)]">
          05 — FAQ
        </div>
        <h2 className="mt-3 font-display font-semibold uppercase tracking-[0.02em] text-[clamp(2rem,5vw,4rem)] leading-[0.95] text-[var(--text-primary)]">
          Questions, answered.
        </h2>

        <div className="mt-12 md:mt-16 divide-y divide-white/5 border-y border-white/5">
          {QUESTIONS.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="group">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="
          w-full flex items-center justify-between gap-6
          py-6 md:py-7 text-left
          cursor-pointer
          focus:outline-none
        "
      >
        <span className="font-display uppercase tracking-[0.04em] text-lg md:text-2xl text-[var(--text-primary)]">
          <span className="text-[var(--accent)] mr-3 font-mono text-sm">
            {String(index + 1).padStart(2, "0")}
          </span>
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="shrink-0 inline-flex items-center justify-center size-9 rounded-full border border-white/15 text-[var(--text-primary)] group-hover:border-[var(--accent)]/60 group-hover:text-[var(--accent)] transition-colors"
        >
          <Plus className="size-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-7 max-w-[820px] text-[var(--text-secondary)] text-base md:text-lg leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
