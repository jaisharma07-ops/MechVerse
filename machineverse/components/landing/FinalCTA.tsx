"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { useViewTransition } from "@/hooks/useViewTransition";

export default function FinalCTA() {
  const { navigate, prefetch } = useViewTransition();

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative px-6 md:px-10 lg:px-16 py-32 md:py-56 text-center">
        {/* Backdrop wash */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(245,166,35,0.10), transparent 70%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative z-10 max-w-[1100px] mx-auto"
        >
          <div className="font-mono text-xs tracking-[0.4em] uppercase text-[var(--accent)]">
            06 — Ready
          </div>
          <h2 className="mt-4 font-display font-semibold uppercase tracking-[0.02em] leading-[0.92] text-[clamp(2.5rem,8.5vw,8.5rem)] text-[var(--text-primary)]">
            Ready to know
            <br />
            <span className="text-[var(--accent)] [text-shadow:0_0_36px_rgba(245,166,35,0.45)]">
              everything?
            </span>
          </h2>

          <div className="mt-10 md:mt-14 flex justify-center">
            <MagneticButton
              variant="primary"
              strength={20}
              onClick={() => navigate("/chat")}
              onMouseEnter={() => prefetch("/chat")}
              onFocus={() => prefetch("/chat")}
            >
              Open the Verse
              <ArrowRight className="size-5" />
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
