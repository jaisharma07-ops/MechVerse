"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Event {
  year: string;
  title: string;
  era: string;
  body: string;
  stat: string;
  icon: string;
}

const EVENTS: Event[] = [
  { year: "1769", title: "STEAM AWAKENS",   era: "First Self-Propelled Vehicle", body: "Cugnot's fardier à vapeur creaks forward at walking pace. The future just sneezed.", stat: "4 KM/H", icon: "♨" },
  { year: "1885", title: "INTERNAL COMBUSTION", era: "Patent-Motorwagen", body: "Karl Benz patents the first true automobile. A new species of machine is born.",       stat: "16 KM/H", icon: "⚙" },
  { year: "1903", title: "FLIGHT",           era: "Wright Flyer",                  body: "12 seconds. 36 meters. Humanity unsticks itself from the ground forever.",          stat: "ALT 3 M",  icon: "✈" },
  { year: "1947", title: "THE BARRIER FALLS", era: "Bell X-1",                     body: "Yeager punches through Mach 1 over the Mojave. The sky learns to bow.",              stat: "MACH 1.06", icon: "💥" },
  { year: "1969", title: "THE MOON",         era: "Apollo 11 / Saturn V",          body: "240,000 miles on a tank of liquid hydrogen, kerosene, and audacity.",               stat: "ESC 11.2 KM/S", icon: "🌙" },
  { year: "1997", title: "FASTER THAN SOUND, ON ROAD", era: "Thrust SSC",          body: "A jet-engined car eats the desert at supersonic speed. A record still standing.",   stat: "1,228 KM/H", icon: "🔥" },
  { year: "2008", title: "THE PIVOT",        era: "Tesla Roadster",                body: "Lithium-ion meets sports car. Petrol's monopoly officially ends.",                    stat: "0-100 / 3.9S", icon: "⚡" },
  { year: "20XX", title: "WHAT'S NEXT?",     era: "Quantum · Neural · Hyper",     body: "Hyperloops. Autonomous fleets. Fusion drives. The verse keeps writing itself.",      stat: "TBD",      icon: "◈" },
];

export default function LandingTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 60%", "end 40%"],
  });
  const railHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={ref}
      className="relative bg-[#0A0C12] text-white py-24 md:py-36 px-6 md:px-14 overflow-hidden border-t border-white/5"
    >
      <div className="absolute inset-0 mv-grid-bg opacity-10 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-20 md:mb-28">
          <p className="text-xs tracking-[0.5em] text-accent font-display uppercase mb-4">
            CHAPTER · 04 — THE EVOLUTION
          </p>
          <h2
            className="font-display font-bold uppercase text-5xl md:text-7xl leading-[0.9] mb-6"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            FROM <span className="mv-text-stroke">STEAM</span>
            <br />
            TO <span className="text-accent drop-shadow-[0_0_20px_rgba(245,166,35,0.5)]">SINGULARITY</span>
          </h2>
          <p className="text-text-secondary text-base md:text-lg max-w-2xl mx-auto">
            Two and a half centuries of mechanical ambition, condensed into the
            moments that bent the curve of history.
          </p>
        </div>

        {/* Timeline rail container */}
        <div className="relative">
          {/* Center rail */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-px md:-translate-x-1/2" />
          <motion.div
            style={{ height: railHeight }}
            className="absolute left-8 md:left-1/2 top-0 w-px bg-gradient-to-b from-accent via-accent to-accent/0 -translate-x-px md:-translate-x-1/2 shadow-[0_0_12px_rgba(245,166,35,0.7)] origin-top"
          />

          <div className="space-y-20 md:space-y-32">
            {EVENTS.map((e, i) => (
              <TimelineItem key={e.year} event={e} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ event, index }: { event: Event; index: number }) {
  const cardOnLeft = index % 2 === 0;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0.25, 1, 0.7]);
  const cardX = useTransform(
    scrollYProgress,
    [0, 0.5],
    cardOnLeft ? [-60, 0] : [60, 0]
  );
  const decorX = useTransform(
    scrollYProgress,
    [0, 0.5],
    cardOnLeft ? [40, 0] : [-40, 0]
  );
  const dotScale = useTransform(scrollYProgress, [0, 0.3, 0.5], [0.5, 1.4, 1]);

  return (
    <div ref={ref} className="relative grid md:grid-cols-2 gap-6 md:gap-16 items-center">
      {/* Dot */}
      <motion.div
        style={{ scale: dotScale }}
        className="absolute left-8 md:left-1/2 top-6 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10"
      >
        <div className="relative w-5 h-5">
          <div className="absolute inset-0 rounded-full bg-accent shadow-[0_0_24px_rgba(245,166,35,0.9)]" />
          <div className="mv-pulse-ring" />
          <div className="absolute inset-1 rounded-full bg-[#0A0C12]" />
          <div className="absolute inset-2 rounded-full bg-accent" />
        </div>
      </motion.div>

      {/* CARD side */}
      <motion.div
        style={{ opacity, x: cardX }}
        className={`pl-16 md:pl-0 ${
          cardOnLeft ? "md:pr-16 md:flex md:justify-end" : "md:order-2 md:pl-16 md:flex md:justify-start"
        }`}
      >
        <Card event={event} />
      </motion.div>

      {/* DECOR readout side (desktop only) */}
      <motion.div
        style={{ opacity, x: decorX }}
        className={`hidden md:block ${cardOnLeft ? "md:pl-16" : "md:order-1 md:pr-16 md:text-right"}`}
      >
        <DecorReadout event={event} align={cardOnLeft ? "left" : "right"} />
      </motion.div>
    </div>
  );
}

function Card({ event }: { event: Event }) {
  return (
    <div className="relative inline-block max-w-md w-full p-6 md:p-7 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-sm overflow-hidden group hover:border-accent/40 transition-colors">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-accent/0 via-accent/0 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex items-start justify-between mb-4">
        <span
          className="font-display font-bold text-4xl md:text-5xl text-accent drop-shadow-[0_0_18px_rgba(245,166,35,0.5)]"
          style={{ fontFamily: "var(--font-barlow)" }}
        >
          {event.year}
        </span>
        <span className="text-3xl md:text-4xl mv-tilt">{event.icon}</span>
      </div>

      <h3
        className="font-display font-bold uppercase text-2xl md:text-3xl mb-1 leading-tight"
        style={{ fontFamily: "var(--font-barlow)" }}
      >
        {event.title}
      </h3>
      <p className="text-xs tracking-[0.3em] font-display text-accent uppercase mb-4">
        {event.era}
      </p>
      <p className="text-sm md:text-base text-text-secondary leading-relaxed mb-5">
        {event.body}
      </p>

      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
        <span className="text-[10px] tracking-[0.4em] font-display text-text-secondary uppercase">
          PEAK
        </span>
        <span
          className="font-display font-bold text-base text-accent"
          style={{ fontFamily: "var(--font-barlow)" }}
        >
          {event.stat}
        </span>
      </div>
    </div>
  );
}

function DecorReadout({ event, align }: { event: Event; align: "left" | "right" }) {
  return (
    <div className={`flex flex-col gap-1.5 text-xs tracking-[0.2em] font-display ${align === "right" ? "items-end" : "items-start"}`}>
      <span className="text-accent">// LOG ENTRY</span>
      <span className="font-mono text-text-secondary">YEAR = {event.year}</span>
      <span className="font-mono text-text-secondary">EVENT = {event.era}</span>
      <span className="font-mono text-text-secondary">PEAK = {event.stat}</span>
      <span className="font-mono text-accent/70">STATUS = ARCHIVED</span>
      <div className="mt-2 flex items-center gap-2 text-text-secondary/70">
        <span className="w-8 h-px bg-accent/40" />
        <span>SIG VERIFIED</span>
      </div>
    </div>
  );
}
