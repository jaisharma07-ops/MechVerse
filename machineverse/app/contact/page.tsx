import type { Metadata } from "next";
import type { ReactNode } from "react";
import InfoPageShell from "@/components/info/InfoPageShell";

export const metadata: Metadata = {
  title: "Contact — MachineVerse",
  description:
    "Get in touch with the team behind MachineVerse. Email, GitHub, and LinkedIn — all answered personally.",
};

const CHANNELS: Array<{
  kicker: string;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  icon: ReactNode;
}> = [
  {
    kicker: "01 · email",
    label: "Direct line",
    value: "mechverse.support@gmail.com",
    href: "mailto:mechverse.support@gmail.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
  },
  {
    kicker: "02 · github",
    label: "Open source",
    value: "github.com/Jaicoder-1",
    href: "https://github.com/Jaicoder-1",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.73-1.52-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.17a10.93 10.93 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.57.23 2.73.11 3.02.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
      </svg>
    ),
  },
  {
    kicker: "03 · linkedin",
    label: "Professional",
    value: "linkedin.com/in/jai-sharma",
    href: "https://www.linkedin.com/in/jai-sharma-aa43b9373/",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.62-1.85 3.34-1.85 3.57 0 4.23 2.35 4.23 5.4v6.34ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.99 0 1.78-.77 1.78-1.73V1.72C24 .77 23.21 0 22.22 0Z" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <InfoPageShell
      eyebrow="04 — CONTACT"
      title={
        <>
          <span>Open a </span>
          <span className="text-[var(--accent)]">channel</span>
          <span>.</span>
        </>
      }
      lede="Bug report, feature request, licensing enquiry, press, or just hello — every channel below reaches Jai directly. No support tier, no triage queue."
      updated="2026.01"
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {CHANNELS.map((c) => (
          <a
            key={c.kicker}
            href={c.href}
            target={c.external ? "_blank" : undefined}
            rel={c.external ? "noopener noreferrer" : undefined}
            className="
              group relative block
              rounded-sm border border-white/10
              bg-[#10131A]
              p-6 md:p-7
              transition-[border-color,transform,box-shadow] duration-300
              hover:border-[var(--accent)]/55
              hover:-translate-y-0.5
              hover:shadow-[0_0_38px_rgba(245,166,35,0.18)]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
            "
          >
            {/* Corner brackets */}
            <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20 group-hover:border-[var(--accent)] transition-colors" />
            <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20 group-hover:border-[var(--accent)] transition-colors" />
            <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20 group-hover:border-[var(--accent)] transition-colors" />
            <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20 group-hover:border-[var(--accent)] transition-colors" />

            <div className="flex items-start justify-between mb-7">
              <span className="font-mono text-[10px] tracking-[0.34em] uppercase text-[var(--accent)]">
                {c.kicker}
              </span>
              <span
                className="
                  inline-flex items-center justify-center
                  size-9 rounded-full
                  border border-white/15
                  text-white/65
                  group-hover:border-[var(--accent)]/60
                  group-hover:text-[var(--accent)]
                  transition-colors
                "
              >
                <span className="block size-4">{c.icon}</span>
              </span>
            </div>

            <div
              className="
                font-display font-semibold uppercase
                tracking-[0.02em] text-2xl md:text-[1.65rem]
                text-white leading-[1.05]
              "
              style={{ fontFamily: "var(--font-barlow), sans-serif" }}
            >
              {c.label}
            </div>
            <div className="mt-2 font-mono text-[12px] md:text-[13px] tracking-[0.05em] text-white/55 break-words">
              {c.value}
            </div>

            <div className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.34em] uppercase text-[var(--accent)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              open
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </div>
          </a>
        ))}
      </div>

      {/* Office hours / response time strip */}
      <div className="mt-14 md:mt-20 grid md:grid-cols-2 gap-4 md:gap-5">
        <div className="relative rounded-sm border border-white/10 bg-[#10131A] p-6">
          <div className="font-mono text-[10px] tracking-[0.34em] uppercase text-[var(--accent)] mb-3">
            response time
          </div>
          <p
            className="text-[var(--text-secondary)] text-base leading-relaxed"
            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            Most messages get a personal reply within{" "}
            <strong className="text-white">48 hours</strong>. Licensing and
            press enquiries are prioritised.
          </p>
        </div>
        <div className="relative rounded-sm border border-white/10 bg-[#10131A] p-6">
          <div className="font-mono text-[10px] tracking-[0.34em] uppercase text-[var(--accent)] mb-3">
            languages
          </div>
          <p
            className="text-[var(--text-secondary)] text-base leading-relaxed"
            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            English, Hindi. Use whichever feels right — Jai reads both.
          </p>
        </div>
      </div>
    </InfoPageShell>
  );
}
