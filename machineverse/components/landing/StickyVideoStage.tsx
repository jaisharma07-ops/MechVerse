"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ChapterOverlay, { type ChapterMeta } from "./ChapterOverlay";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Six chapter clips. Drop encoded mp4 + webm + poster jpg into /public/videos/:
 *   f1.mp4 / f1.webm / f1-poster.jpg
 *   ducati.mp4 / ducati.webm / ducati-poster.jpg
 *   b747.mp4 / b747.webm / b747-poster.jpg
 *   ship.mp4 / ship.webm / ship-poster.jpg
 *   rocket.mp4 / rocket.webm / rocket-poster.jpg
 *   mustang.mp4 / mustang.webm / mustang-poster.jpg
 *
 * Until you do, the stage falls back to the gradient + poster (and onError
 * hides the broken <video> elements). All scroll math + chapter overlays
 * still work end-to-end.
 */
const CHAPTERS: Array<ChapterMeta & { slug: string }> = [
  {
    no: "01",
    slug: "f1",
    kicker: "FORMULA",
    title: "Precision at 370 km/h",
    body: "Carbon monocoques, 1.6L hybrids, downforce that bends physics — the apex of motorsport engineering.",
  },
  {
    no: "02",
    slug: "ducati",
    kicker: "TWO WHEELS",
    title: "Lean. Throttle. Apex.",
    body: "From café racers to MotoGP — every superbike traces its lineage through angle, rubber and nerve.",
  },
  {
    no: "03",
    slug: "b747",
    kicker: "SKYWARD",
    title: "400 tons of grace",
    body: "Wide-bodies, narrow-bodies, the queens and the workhorses — half a century of taking the sky for granted.",
  },
  {
    no: "04",
    slug: "ship",
    kicker: "DEEP BLUE",
    title: "Steel cathedrals at sea",
    body: "Container giants, LNG carriers, naval power — the moving infrastructure of the global economy.",
  },
  {
    no: "05",
    slug: "rocket",
    kicker: "ESCAPE VELOCITY",
    title: "11.2 km/s and climbing",
    body: "Saturn V to Starship — every gram earned, every joule accounted for.",
  },
  {
    no: "06",
    slug: "mustang",
    kicker: "AMERICAN MUSCLE",
    title: "Rubber, smoke, soul",
    body: "Big blocks, small blocks, supercharged hellfire — the philosophy of overkill, refined.",
  },
];

/**
 * The pinned stage. Spans 600vh of scroll, pinned to viewport.
 * Each chapter occupies 100vh of scroll progress; their overlays cross-fade.
 */
export default function StickyVideoStage({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [chapterProgress, setChapterProgress] = useState(0);

  // Mobile collapses to 3 chapters per spec.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const chapters = useMemo(
    () => (isMobile ? [CHAPTERS[0], CHAPTERS[2], CHAPTERS[4]] : CHAPTERS),
    [isMobile],
  );
  const total = chapters.length;
  const stageHeight = `${total * 100}vh`;

  // GSAP: pin the stage and drive a single scroll value across the whole window.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reducedMotion) return;

    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        pin: stage,
        pinSpacing: false,
        scrub: 0.4,
        onUpdate: (self) => {
          const p = self.progress * total;
          const idx = Math.min(total - 1, Math.floor(p));
          const local = p - idx;
          setActiveIndex(idx);
          setChapterProgress(local);
        },
      });
    }, container);

    return () => ctx.revert();
  }, [reducedMotion, total]);

  // Pause every off-screen video to spare bandwidth.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === activeIndex) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [activeIndex]);

  return (
    <section
      ref={containerRef}
      aria-label="Vehicle chapters"
      className="relative w-full"
      style={{ height: stageHeight }}
    >
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden bg-[#0D0F14]"
      >
        {/* Stacked videos — opacity controlled by activeIndex */}
        <div className="absolute inset-0">
          {chapters.map((c, i) => {
            const distance = Math.abs(i - activeIndex);
            // Crossfade math: active = 1, neighbors = partial, others = 0.
            let opacity = 0;
            if (i === activeIndex) {
              opacity = 1;
            } else if (i === activeIndex - 1) {
              opacity = Math.max(0, 1 - chapterProgress * 4);
            } else if (i === activeIndex + 1) {
              opacity = Math.max(0, (chapterProgress - 0.75) * 4);
            }
            return (
              <video
                key={c.slug}
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                aria-hidden
                muted
                loop
                playsInline
                preload={i === 0 ? "metadata" : "none"}
                poster={`/videos/${c.slug}-poster.jpg`}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-out"
                style={{
                  opacity: reducedMotion ? (i === activeIndex ? 1 : 0) : opacity,
                  willChange: distance > 1 ? undefined : "opacity",
                }}
              >
                <source src={`/videos/${c.slug}.webm`} type="video/webm" />
                <source src={`/videos/${c.slug}.mp4`} type="video/mp4" />
              </video>
            );
          })}
        </div>

        {/* Vignette + dark gradient for legibility */}
        <div className="mv-stage-vignette" />

        {/* Subtle film grain */}
        {!reducedMotion && <div className="mv-grain" />}

        {/* Chapter index badge — bottom right */}
        <div className="absolute bottom-6 right-6 md:bottom-8 md:right-10 font-mono text-[11px] tracking-[0.32em] uppercase text-[var(--text-secondary)] z-20 pointer-events-none">
          <span className="text-[var(--accent)]">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <span className="opacity-50 mx-2">/</span>
          {String(total).padStart(2, "0")}
        </div>

        {/* Progress hairline */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10 z-20 pointer-events-none">
          <div
            className="h-full bg-[var(--accent)]"
            style={{
              width: `${((activeIndex + chapterProgress) / total) * 100}%`,
              transition: "width 80ms linear",
            }}
          />
        </div>

        {/* Chapter text overlays (stacked; one fades in per chapter) */}
        <div className="absolute inset-0 z-10">
          {chapters.map((c, i) => (
            <ChapterOverlay
              key={c.slug}
              chapter={c}
              progress={i === activeIndex ? chapterProgress : 0}
              active={i === activeIndex}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
