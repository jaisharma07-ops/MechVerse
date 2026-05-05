"use client";

import { motion } from "framer-motion";

export default function SuggestionChips({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (s: string) => void;
}) {
  if (!suggestions?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {suggestions.map((s, i) => (
        <motion.button
          key={`${i}-${s}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i }}
          onClick={() => onSelect(s)}
          className="text-xs md:text-sm px-3 py-1.5 rounded-full border border-accent/40 text-accent hover:bg-accent hover:text-user-bubble-text transition-colors"
        >
          {s}
        </motion.button>
      ))}
    </div>
  );
}
