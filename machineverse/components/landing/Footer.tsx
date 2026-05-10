"use client";

import type { ComponentType, SVGProps } from "react";

type IconCmp = ComponentType<SVGProps<SVGSVGElement>>;

const Github: IconCmp = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.73-1.52-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.17a10.93 10.93 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.57.23 2.73.11 3.02.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
  </svg>
);

const Twitter: IconCmp = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.5 11.24h-6.658l-5.214-6.817-5.97 6.817H1.673l7.73-8.835L1.5 2.25H8.32l4.713 6.231 5.21-6.231Zm-1.16 17.52h1.833L7.014 4.126H5.045l12.04 15.644Z" />
  </svg>
);

const Linkedin: IconCmp = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.62-1.85 3.34-1.85 3.57 0 4.23 2.35 4.23 5.4v6.34ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.99 0 1.78-.77 1.78-1.73V1.72C24 .77 23.21 0 22.22 0Z" />
  </svg>
);

const COL_PRODUCT = ["Chat", "Compare", "Timeline", "Bookmarks"];
const COL_RESOURCES = ["Docs", "API", "Changelog", "Status"];
const COL_COMPANY = ["About", "Press", "Privacy", "Terms"];

export default function Footer() {
  return (
    <footer className="relative w-full border-t border-white/5 px-6 md:px-10 lg:px-16 pt-16 pb-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16">
          <div className="col-span-2 md:col-span-1">
            <div className="font-display uppercase font-semibold tracking-[0.04em] text-2xl text-[var(--text-primary)]">
              Machine
              <span className="text-[var(--accent)]">Verse</span>
            </div>
            <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-[280px]">
              Every machine. Engineered to be understood.
            </p>
          </div>
          <Col title="Product" items={COL_PRODUCT} />
          <Col title="Resources" items={COL_RESOURCES} />
          <Col title="Company" items={COL_COMPANY} />
        </div>

        <div className="mt-14 pt-6 border-t border-white/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[var(--text-secondary)]">
            © {new Date().getFullYear()} MachineVerse · Built for the curious
          </p>
          <div className="flex items-center gap-3 text-[var(--text-secondary)]">
            <Social Icon={Github} label="GitHub" />
            <Social Icon={Twitter} label="Twitter" />
            <Social Icon={Linkedin} label="LinkedIn" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-[var(--text-secondary)]">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5">
        {items.map((it) => (
          <li key={it}>
            <a
              href="#"
              className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors text-sm"
            >
              {it}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Social({
  Icon,
  label,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <a
      href="#"
      aria-label={label}
      className="inline-flex items-center justify-center size-9 rounded-full border border-white/10 hover:border-[var(--accent)]/60 hover:text-[var(--accent)] transition-colors"
    >
      <Icon className="size-4" />
    </a>
  );
}
