"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Hero from "@/components/landing/Hero";
import StickyVideoStage from "@/components/landing/StickyVideoStage";
import Marquee from "@/components/landing/Marquee";
import CategoryBento from "@/components/landing/CategoryBento";
import FeatureTriplet from "@/components/landing/FeatureTriplet";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import { useLenis } from "@/hooks/useLenis";

const TICKER = [
  "12,400 vehicles indexed",
  "47 categories",
  "Updated daily",
  "AI-grounded answers",
  "Web-cited sources",
  "Voice + image input",
  "Compare any two builds",
];

const PROOF = [
  '"Wikipedia for the engineering-curious." — Beta tester',
  '"Finally, a vehicle search that gets the question." — Reviewer',
  "As featured in: Driveline · Aviation Week · Nautilus",
  '"Source citations on every answer." — Power user',
  '"It compared a Concorde to a Tu-144 in three seconds." — Aerospace lurker',
];

export default function Page() {
  useLenis();

  const [reducedMotion, setReducedMotion] = useState(false);
  const [reelOpen, setReelOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Lock background scroll while reel is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.overflow = reelOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [reelOpen]);

  return (
    <main className="relative bg-[#0D0F14] text-[var(--text-primary)] overflow-x-clip">
      {/* Hero sits ON TOP of the stage; share viewport with chapter 01 */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 z-0 h-screen pointer-events-none">
          {/* Subtle gradient base behind hero before the stage takes over */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(245,166,35,0.08), transparent 70%)",
            }}
          />
        </div>

        <Hero onWatchReel={() => setReelOpen(true)} />
      </div>

      {/* Live ticker — thin amber strip */}
      <div className="relative z-30 border-y border-[var(--accent)]/30 bg-[var(--accent)]/[0.06] py-3">
        <Marquee items={TICKER} speed={36} />
      </div>

      {/* The pinned video stage — 600vh of scroll */}
      <StickyVideoStage reducedMotion={reducedMotion} />

      {/* Categories */}
      <CategoryBento />

      {/* Feature triplet */}
      <FeatureTriplet />

      {/* Social proof marquee */}
      <section className="relative w-full py-16 md:py-24 border-y border-white/5">
        <div className="mb-6 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
          <div className="font-mono text-xs tracking-[0.4em] uppercase text-[var(--accent)]">
            04 — Trusted by the curious
          </div>
        </div>
        <Marquee items={PROOF} speed={48} />
        <div className="mt-3">
          <Marquee items={PROOF} speed={56} reverse />
        </div>
      </section>

      <FAQ />
      <FinalCTA />
      <Footer />

      <AnimatePresence>
        {reelOpen && (
          <ReelModal onClose={() => setReelOpen(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}

function ReelModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-12"
      role="dialog"
      aria-modal="true"
      aria-label="Reel"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative w-full max-w-[1200px] aspect-video rounded-2xl overflow-hidden border border-white/10 bg-[#0a0c11]"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/reel-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        >
          <source src="/videos/reel.webm" type="video/webm" />
          <source src="/videos/reel.mp4" type="video/mp4" />
        </video>
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(13,15,20,0.6), transparent 30%)",
          }}
        />
        <div className="absolute bottom-5 left-6 font-mono text-xs tracking-[0.32em] uppercase text-[var(--text-secondary)]">
          MachineVerse · 30s reel
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reel"
          className="absolute top-4 right-4 inline-flex items-center justify-center size-10 rounded-full border border-white/15 bg-black/40 backdrop-blur-sm text-[var(--text-primary)] hover:border-[var(--accent)]/60 hover:text-[var(--accent)] transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>
      </motion.div>
    </motion.div>
  );
}
