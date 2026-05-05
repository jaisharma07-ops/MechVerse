"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { CATEGORY_LABELS, CATEGORY_LIST, type Category } from "@/lib/types";

const TAGLINE = "Explore Every Machine Ever Built";

export default function Splash() {
  const router = useRouter();
  const setCategory = useStore((s) => s.setCategory);
  const hydrated = useStore((s) => s.hydrated);
  const [show, setShow] = useState(false);
  const [exiting, setExiting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    const visited = localStorage.getItem("mv_visited");
    if (visited) {
      router.replace("/chat");
    } else {
      setShow(true);
    }
  }, [hydrated, router]);

  useEffect(() => {
    if (!show || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let offset = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // Perspective grid: vanishing point near center-top
      const vpX = w / 2;
      const vpY = h * 0.32;
      const horizon = h;

      ctx.strokeStyle = "rgba(245, 166, 35, 0.18)";
      ctx.lineWidth = 1;

      // radial lines
      ctx.beginPath();
      for (let i = -16; i <= 16; i++) {
        const xBottom = vpX + i * (w / 12);
        ctx.moveTo(vpX, vpY);
        ctx.lineTo(xBottom, horizon);
      }
      ctx.stroke();

      // moving horizontal bars receding into distance
      offset = (offset + 0.6) % 60;
      ctx.beginPath();
      for (let i = 0; i < 14; i++) {
        const t = ((i * 60 + offset) / (14 * 60));
        const y = vpY + Math.pow(t, 2.2) * (horizon - vpY);
        if (y > horizon || y < vpY) continue;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [show]);

  const pickCategory = (cat: Category) => {
    setCategory(cat);
    localStorage.setItem("mv_visited", "1");
    setExiting(true);
    setTimeout(() => router.push("/chat"), 480);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 bg-background text-text-primary flex flex-col items-center justify-center overflow-hidden"
          exit={{ opacity: 0, scale: 1.04, filter: "brightness(1.4)" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 opacity-50 pointer-events-none"
          />
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--bg)_75%)]" />

          <div className="relative z-10 flex flex-col items-center w-full max-w-5xl px-6">
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mb-3 text-center"
            >
              <h1
                className="font-display tracking-[0.04em] uppercase font-bold text-6xl md:text-8xl"
                style={{ fontFamily: "var(--font-barlow)" }}
              >
                <span>Machine</span>
                <span className="text-accent drop-shadow-[0_0_18px_rgba(245,166,35,0.45)]">
                  Verse
                </span>
              </h1>
            </motion.div>

            <motion.h2
              className="text-base md:text-xl text-text-secondary mb-12 text-center min-h-7"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.025, delayChildren: 0.4 } },
              }}
            >
              {TAGLINE.split("").map((char, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 w-full">
              {CATEGORY_LIST.filter((c) => c !== "all").map((id, i) => {
                const cat = CATEGORY_LABELS[id];
                return (
                  <motion.button
                    key={id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 + i * 0.06, duration: 0.4 }}
                    whileHover={{
                      y: -4,
                      borderColor: "rgba(245,166,35,0.55)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => pickCategory(id)}
                    className="relative bg-surface/85 backdrop-blur border border-border rounded-xl p-4 md:p-5 flex flex-col items-center gap-2 transition-colors group overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-br from-accent/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">
                      {cat.emoji}
                    </span>
                    <span
                      className="font-display tracking-wider text-base md:text-lg text-text-primary uppercase"
                      style={{ fontFamily: "var(--font-barlow)" }}
                    >
                      {cat.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              onClick={() => pickCategory("all")}
              className="mt-10 text-text-secondary hover:text-accent transition-colors text-sm tracking-wide"
            >
              <span className="border-b border-dashed border-text-secondary/50 hover:border-accent pb-0.5">
                Explore all vehicles →
              </span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
