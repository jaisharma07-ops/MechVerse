"use client";

import { useState } from "react";

/* Try these paths in order — first one that loads wins. Drop your
   photo at any of them in /public and it'll pick it up. */
const SRC_CANDIDATES = [
  "/founder.jpeg",
  "/founder.jpg",
  "/founder.png",
  "/founder.webp",
];

/**
 * Founder portrait card. Renders the first photo it can find under
 * /public/founder.* with the drafting-table frame styling — corner
 * brackets, mono caption underneath. Falls back to a clean amber
 * "JS" monogram if no photo is present, so the page never breaks.
 */
export default function FounderPortrait() {
  const [srcIndex, setSrcIndex] = useState(0);
  const [errored, setErrored] = useState(false);

  const onError = () => {
    if (srcIndex < SRC_CANDIDATES.length - 1) {
      setSrcIndex(srcIndex + 1);
    } else {
      setErrored(true);
    }
  };

  return (
    <figure className="relative w-full max-w-[360px] mx-auto md:mx-0">
      {/* Corner brackets */}
      <span aria-hidden className="pointer-events-none absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[var(--accent)]/70" />
      <span aria-hidden className="pointer-events-none absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[var(--accent)]/70" />
      <span aria-hidden className="pointer-events-none absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[var(--accent)]/70" />
      <span aria-hidden className="pointer-events-none absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[var(--accent)]/70" />

      <div
        className="
          relative aspect-[3/4] w-full overflow-hidden
          bg-[#10131A] border border-white/10
          rounded-sm
        "
      >
        {!errored ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={SRC_CANDIDATES[srcIndex]}
            src={SRC_CANDIDATES[srcIndex]}
            alt="Jai Sharma — founder of MachineVerse"
            className="absolute inset-0 w-full h-full object-cover object-center"
            onError={onError}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div
                className="
                  flex items-center justify-center
                  size-32 rounded-full
                  bg-gradient-to-br from-[var(--accent)] to-[#b37400]
                  text-[#06080C] font-display font-black uppercase
                  text-5xl
                "
                style={{ fontFamily: "var(--font-barlow), sans-serif" }}
              >
                JS
              </div>
              <span className="font-mono text-[10px] tracking-[0.34em] uppercase text-white/40">
                portrait pending
              </span>
            </div>
          </div>
        )}

        {/* Bottom gradient + caption strip */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(6,8,12,0.85) 0%, transparent 100%)",
          }}
        />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[9px] md:text-[10px] tracking-[0.34em] uppercase text-white/70">
          <span>portrait · 001</span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[var(--accent)]" />
            live
          </span>
        </div>
      </div>

      <figcaption className="mt-3 flex items-center justify-between font-mono text-[10px] tracking-[0.32em] uppercase text-white/40">
        <span>jai sharma</span>
        <span>scale · 1:1</span>
      </figcaption>
    </figure>
  );
}
