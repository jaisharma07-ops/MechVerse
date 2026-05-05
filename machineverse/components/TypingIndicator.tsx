"use client";

import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start mb-4"
    >
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-1 shadow shadow-accent/20">
          <span
            className="font-display font-bold text-user-bubble-text text-sm"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            M
          </span>
        </div>
        <div className="bg-surface rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 border border-border">
          {[0, 0.15, 0.3].map((d, i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 bg-accent rounded-full"
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 0.7, delay: d }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
