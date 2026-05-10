"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export interface ChapterMeta {
  no: string;
  kicker: string;
  title: string;
  body?: string;
}

interface ChapterOverlayProps {
  chapter: ChapterMeta;
  /** 0-1 scroll progress within this chapter's window. */
  progress: number;
  /** When false, render but pin opacity to 0 (off-stage chapters). */
  active: boolean;
  reducedMotion: boolean;
}

/**
 * One chapter's overlay text. The parent stage drives `progress` (0→1 across
 * its 100vh window) and `active`; this component animates a per-letter
 * y-stagger on enter and fades out in the chapter's last 30%.
 */
export default function ChapterOverlay({
  chapter,
  progress,
  active,
  reducedMotion,
}: ChapterOverlayProps) {
  const titleRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef(false);

  // Per-letter intro animation, replayed each time the chapter becomes active.
  useEffect(() => {
    if (!active || lastActiveRef.current) {
      lastActiveRef.current = active;
      return;
    }
    lastActiveRef.current = true;

    const titleEl = titleRef.current;
    if (!titleEl || reducedMotion) return;

    const chars = titleEl.querySelectorAll<HTMLSpanElement>("[data-char]");
    gsap.fromTo(
      chars,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.02,
        ease: "power3.out",
      },
    );
  }, [active, reducedMotion]);

  // Drive container opacity from progress: fade in 0-15%, hold to 70%, fade out 70-100%.
  let opacity = 0;
  if (active) {
    if (progress < 0.15) opacity = progress / 0.15;
    else if (progress > 0.7) opacity = Math.max(0, 1 - (progress - 0.7) / 0.3);
    else opacity = 1;
  }

  return (
    <div
      ref={wrapRef}
      aria-hidden={!active}
      className="absolute inset-0 flex items-center justify-center px-6 md:px-12 pointer-events-none"
      style={{
        opacity,
        transition: reducedMotion ? "opacity 0.2s linear" : undefined,
      }}
    >
      <div className="max-w-[1100px] w-full">
        <div className="font-mono text-[11px] md:text-xs tracking-[0.4em] uppercase text-[var(--accent)] mb-4 md:mb-6">
          Chapter {chapter.no}
          <span className="opacity-50 mx-3">/</span>
          <span className="text-[var(--text-primary)]/80">{chapter.kicker}</span>
        </div>
        <div
          ref={titleRef}
          className="font-display font-semibold uppercase tracking-[0.02em] text-[var(--text-primary)] leading-[0.95] text-[clamp(2.5rem,7.5vw,7.5rem)]"
        >
          <SplitText text={chapter.title} />
        </div>
        {chapter.body && (
          <p className="mt-6 md:mt-8 max-w-[640px] text-[var(--text-secondary)] text-base md:text-lg leading-relaxed">
            {chapter.body}
          </p>
        )}
      </div>
    </div>
  );
}

function SplitText({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <span aria-label={text}>
      {words.map((word, wi) => (
        <span
          key={`w-${wi}`}
          className="inline-block whitespace-nowrap mr-[0.25em]"
        >
          {Array.from(word).map((ch, ci) => (
            <span
              key={`c-${wi}-${ci}`}
              data-char
              className="inline-block"
              style={{ willChange: "transform,opacity" }}
            >
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
