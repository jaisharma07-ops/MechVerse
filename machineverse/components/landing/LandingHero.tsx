"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, Gauge, Zap } from "lucide-react";

const TITLE = "MACHINEVERSE";
const ROTATING = ["CARS", "BIKES", "AIRCRAFT", "SHIPS", "TRAINS", "ROCKETS"];

export default function LandingHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [rotIdx, setRotIdx] = useState(0);

  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const sprX = useSpring(mvX, { stiffness: 60, damping: 18, mass: 0.6 });
  const sprY = useSpring(mvY, { stiffness: 60, damping: 18, mass: 0.6 });
  const tx1 = useTransform(sprX, [-1, 1], [-22, 22]);
  const ty1 = useTransform(sprY, [-1, 1], [-14, 14]);
  const tx2 = useTransform(sprX, [-1, 1], [-44, 44]);
  const ty2 = useTransform(sprY, [-1, 1], [-26, 26]);
  const tilt = useTransform(sprX, [-1, 1], [3, -3]);

  useEffect(() => {
    const t = setInterval(() => setRotIdx((i) => (i + 1) % ROTATING.length), 1800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mvX.set(((e.clientX - r.left) / r.width) * 2 - 1);
      mvY.set(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [mvX, mvY]);

  // Cinematic highway canvas: receding road, headlights & particle streaks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let dpr = 1;
    let w = 0, h = 0;
    let off = 0;

    type Particle = { x: number; y: number; z: number; speed: number; r: number };
    const particles: Particle[] = Array.from({ length: 90 }, () => ({
      x: (Math.random() * 2 - 1),
      y: (Math.random() * 2 - 1),
      z: Math.random(),
      speed: 0.004 + Math.random() * 0.012,
      r: 0.6 + Math.random() * 1.6,
    }));

    type Light = { lane: number; z: number; speed: number; color: string };
    const lights: Light[] = [];
    const spawn = () => {
      lights.push({
        lane: Math.floor(Math.random() * 5) - 2,
        z: 0.02,
        speed: 0.0035 + Math.random() * 0.004,
        color: Math.random() > 0.5 ? "#F5A623" : "#FF6B35",
      });
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let spawnTimer = 0;

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      const vpX = w / 2;
      const vpY = h * 0.42;
      const horizon = h * 1.05;

      // Sky gradient pull
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "rgba(13,15,20,0.0)");
      grad.addColorStop(0.45, "rgba(13,15,20,0.0)");
      grad.addColorStop(0.55, "rgba(245,166,35,0.04)");
      grad.addColorStop(1, "rgba(245,166,35,0.10)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Sun glow at vanishing point
      const r = ctx.createRadialGradient(vpX, vpY, 0, vpX, vpY, w * 0.55);
      r.addColorStop(0, "rgba(245,166,35,0.45)");
      r.addColorStop(0.25, "rgba(245,166,35,0.12)");
      r.addColorStop(1, "rgba(245,166,35,0)");
      ctx.fillStyle = r;
      ctx.fillRect(0, 0, w, h);

      // Receding road lanes
      ctx.strokeStyle = "rgba(245,166,35,0.42)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = -6; i <= 6; i++) {
        const x = vpX + i * (w * 0.085);
        ctx.moveTo(vpX, vpY);
        ctx.lineTo(x, horizon);
      }
      ctx.stroke();

      // Moving horizontal "distance" rings
      off = (off + 0.6) % 60;
      ctx.strokeStyle = "rgba(245,166,35,0.18)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 16; i++) {
        const t = ((i * 60 + off) / (16 * 60));
        const y = vpY + Math.pow(t, 2.4) * (horizon - vpY);
        if (y < vpY || y > horizon) continue;
        const span = (y - vpY) / (horizon - vpY);
        ctx.globalAlpha = Math.min(1, span * 1.4);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Headlight streaks
      spawnTimer++;
      if (spawnTimer > 24) { spawn(); spawnTimer = 0; }
      for (let i = lights.length - 1; i >= 0; i--) {
        const l = lights[i];
        l.z += l.speed;
        if (l.z > 1) { lights.splice(i, 1); continue; }
        const persp = Math.pow(l.z, 1.8);
        const sx = vpX + l.lane * (w * 0.085) * persp;
        const sy = vpY + persp * (horizon - vpY);
        const size = 1 + persp * 8;
        ctx.fillStyle = l.color;
        ctx.globalAlpha = Math.min(1, persp * 1.2);
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = Math.min(0.5, persp * 0.7);
        ctx.beginPath();
        ctx.arc(sx, sy, size * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Foreground particles (speed dust)
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (const p of particles) {
        p.z += p.speed;
        if (p.z > 1) { p.z = 0; p.x = Math.random() * 2 - 1; p.y = Math.random() * 2 - 1; }
        const persp = Math.pow(p.z, 2);
        const sx = vpX + p.x * w * 0.6 * persp;
        const sy = vpY + p.y * h * 0.55 * persp + (horizon - vpY) * persp * 0.4;
        ctx.globalAlpha = persp;
        ctx.beginPath();
        ctx.arc(sx, sy, p.r * persp * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };
    draw();

    const onVis = () => { running = !document.hidden; if (running) draw(); };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative h-[100svh] min-h-[720px] w-full overflow-hidden bg-[#0A0C12] text-white"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 mv-grid-bg opacity-30" />
      <div className="absolute inset-0 mv-radial-vignette" />
      <div className="absolute inset-0 mv-noise" />
      <div className="mv-scanline" />

      {/* Top HUD bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 md:px-10 py-5 flex items-center justify-between text-xs tracking-[0.3em] text-text-secondary uppercase">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgba(245,166,35,0.9)] animate-pulse" />
          <span className="font-display">SYS // ENGINE-ONLINE</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <span>LAT 28.6139°N</span>
          <span>LON 77.2090°E</span>
          <span className="text-accent">v4.07</span>
        </div>
      </div>

      {/* Side rails */}
      <div className="hidden md:block absolute left-6 top-1/2 -translate-y-1/2 z-20 text-[10px] tracking-[0.4em] text-text-secondary uppercase rotate-180" style={{ writingMode: "vertical-rl" }}>
        SCROLL · TO · IGNITE
      </div>
      <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-3 text-[10px] tracking-[0.4em] text-text-secondary uppercase">
        <Gauge className="w-4 h-4 text-accent" />
        <div className="h-32 w-px bg-gradient-to-b from-accent via-accent/40 to-transparent" />
        <span>0 — 1000 KM/H</span>
      </div>

      {/* Center stage */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 mv-perspective">
        <motion.div
          style={{ x: tx1, y: ty1, rotateY: tilt }}
          className="text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-display tracking-[0.5em] text-accent text-xs md:text-sm uppercase mb-6"
          >
            <span className="inline-block px-3 py-1 border border-accent/40 rounded-sm bg-accent/5 backdrop-blur">
              EST · 1885 — ∞ · WORLD'S MACHINE INDEX
            </span>
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, scale: 1, letterSpacing: "0.04em" }}
            transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
            className="font-display font-bold leading-[0.85] uppercase relative"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            <span className="block text-[18vw] md:text-[12vw] lg:text-[10rem] xl:text-[12rem] text-white drop-shadow-[0_0_40px_rgba(245,166,35,0.25)]">
              {TITLE.split("").map((c, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 80, opacity: 0, filter: "blur(8px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{ delay: 0.4 + i * 0.04, duration: 0.6, ease: "easeOut" }}
                  className="inline-block"
                >
                  {c === "V" ? <span className="text-accent mv-flicker">{c}</span> : c}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          {/* Rotating sub-line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 flex items-center justify-center gap-3 text-base md:text-2xl font-display tracking-widest uppercase"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            <span className="text-text-secondary">EVERY</span>
            <span className="relative inline-block min-w-[160px] md:min-w-[260px] text-left">
              {ROTATING.map((w, i) => (
                <motion.span
                  key={w}
                  className="absolute left-0 right-0 text-accent drop-shadow-[0_0_12px_rgba(245,166,35,0.6)]"
                  initial={{ y: 30, opacity: 0, rotateX: -90 }}
                  animate={
                    rotIdx === i
                      ? { y: 0, opacity: 1, rotateX: 0 }
                      : { y: -30, opacity: 0, rotateX: 90 }
                  }
                  transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {w}
                </motion.span>
              ))}
              <span className="invisible">{ROTATING[0]}</span>
            </span>
            <span className="text-text-secondary">EVER BUILT.</span>
          </motion.div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          style={{ x: tx2, y: ty2 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4"
        >
          <a
            href="/chat"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-accent text-[#0D0F14] font-display tracking-widest text-sm uppercase rounded-sm overflow-hidden shadow-[0_0_40px_rgba(245,166,35,0.4)] hover:shadow-[0_0_60px_rgba(245,166,35,0.7)] transition-shadow"
          >
            <span className="absolute inset-0 bg-white/30 mv-streak" />
            <Zap className="w-4 h-4" /> Enter the Verse
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#showcase"
            className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 hover:border-accent/60 text-white font-display tracking-widest text-sm uppercase rounded-sm backdrop-blur-sm bg-white/5 hover:bg-accent/10 transition-all"
          >
            Watch the Reel
            <span className="relative w-6 h-6 rounded-full border border-white/40 flex items-center justify-center group-hover:border-accent">
              <span className="block w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5 group-hover:border-l-accent" />
            </span>
          </a>
        </motion.div>

        {/* Rev meter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.7 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-1 h-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className={`w-[3px] origin-bottom rounded-full ${
                  i < 16 ? "bg-accent" : "bg-red-500"
                }`}
                style={{
                  height: `${10 + (i % 5) * 2}px`,
                  animation: `mv-rev-bar 1.6s ease-in-out ${i * 0.04}s infinite`,
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.4em] text-text-secondary uppercase">
            <ChevronDown className="w-3 h-3 mv-float text-accent" />
            <span>SCROLL</span>
            <ChevronDown className="w-3 h-3 mv-float text-accent" />
          </div>
        </motion.div>
      </div>

      {/* Bottom corner serial */}
      <div className="absolute bottom-6 left-6 z-20 text-[10px] tracking-[0.3em] font-display text-text-secondary uppercase">
        S/N · MV-{new Date().getFullYear()}-X1A
      </div>
      <div className="absolute bottom-6 right-6 z-20 text-[10px] tracking-[0.3em] font-display text-text-secondary uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        REC · LIVE FEED
      </div>
    </section>
  );
}
