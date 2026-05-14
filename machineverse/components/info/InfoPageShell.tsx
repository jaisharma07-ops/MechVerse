import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared shell for the static info pages (About / Terms / Privacy /
 * Contact). Keeps the drafting-table aesthetic of the landing hero —
 * dark base, faint dot grid masked at the edges, mono corner datum
 * markers, a slim top bar with a "back to home" link, and a slim
 * bottom datum strip.
 *
 *   • `eyebrow`      → small mono kicker above the title (e.g. "01 — TERMS")
 *   • `title`        → big Barlow display headline
 *   • `lede`         → one-line subhead under the title
 *   • `updated`      → ISO date shown in the bottom datum strip
 *   • `children`     → page body, rendered inside a constrained column
 */
export default function InfoPageShell({
  eyebrow,
  title,
  lede,
  updated,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen w-full bg-[#06080C] text-[var(--text-primary)] overflow-x-clip">
      {/* ─── background: drafting dot grid + soft amber wash up top ─── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          maskImage:
            "radial-gradient(ellipse 95% 70% at 50% 0%, black 25%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 95% 70% at 50% 0%, black 25%, transparent 85%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[60vh] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 0%, rgba(245,166,35,0.10), transparent 70%)",
        }}
      />

      {/* ─── top bar ─── */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 lg:px-16 pt-6 md:pt-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-3"
          aria-label="MachineVerse — home"
        >
          <span
            className="font-display font-bold uppercase tracking-[0.04em] text-lg md:text-xl"
            style={{ fontFamily: "var(--font-barlow), sans-serif" }}
          >
            <span className="text-white">Mech</span>
            <span className="text-[var(--accent)]">Verse</span>
          </span>
        </Link>
        <Link
          href="/"
          className="
            group inline-flex items-center gap-2
            font-mono text-[10px] md:text-[11px] tracking-[0.34em] uppercase
            text-white/55 hover:text-[var(--accent)]
            transition-colors
          "
        >
          <span aria-hidden className="block w-5 h-px bg-current group-hover:bg-[var(--accent)] transition-colors" />
          back to home
        </Link>
      </header>

      {/* ─── page title block ─── */}
      <section className="relative z-10 px-6 md:px-10 lg:px-16 pt-16 md:pt-24 pb-10 md:pb-16">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[10px] md:text-[11px] tracking-[0.42em] uppercase text-[var(--accent)]">
              {eyebrow}
            </span>
            <span aria-hidden className="block w-12 h-px bg-[var(--accent)]/55" />
            <span className="font-mono text-[10px] md:text-[11px] tracking-[0.42em] uppercase text-white/40">
              dwg · 002
            </span>
          </div>

          <h1
            className="
              font-display font-black uppercase
              tracking-[-0.018em] leading-[0.92]
              text-[clamp(2.75rem,7vw,5.75rem)]
              text-white
            "
            style={{ fontFamily: "var(--font-barlow), sans-serif" }}
          >
            {title}
          </h1>
          {lede ? (
            <p
              className="mt-6 max-w-[680px] text-[var(--text-secondary)] text-base md:text-lg leading-relaxed"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              {lede}
            </p>
          ) : null}
        </div>
      </section>

      {/* ─── body ─── */}
      <section className="relative z-10 px-6 md:px-10 lg:px-16 pb-24 md:pb-32">
        <div className="max-w-[1100px] mx-auto">{children}</div>
      </section>

      {/* ─── bottom datum strip ─── */}
      <footer className="relative z-10 border-t border-white/8 px-6 md:px-10 lg:px-16 py-7">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 font-mono text-[10px] md:text-[11px] tracking-[0.34em] uppercase text-white/40">
          <span>
            <span className="text-[var(--accent)]">mv</span> · foundry · dwg 002
          </span>
          <span>
            rev · {updated ?? "2026.01"}
          </span>
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[var(--accent)]" />
            engaged
          </span>
        </div>
      </footer>
    </main>
  );
}

/**
 * Numbered drafting-style section heading. Used inside info-page bodies
 * to chunk content into auditable, document-flavoured sections.
 */
export function InfoSection({
  no,
  title,
  children,
}: {
  no: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="relative py-8 md:py-10 border-t border-white/8 first:border-t-0 first:pt-0">
      <div className="grid md:grid-cols-[120px_1fr] gap-6 md:gap-10">
        <div className="font-mono text-[10px] tracking-[0.34em] uppercase text-[var(--accent)]">
          {no}
        </div>
        <div>
          <h2
            className="font-display font-semibold uppercase tracking-[0.02em] text-2xl md:text-3xl text-white leading-tight"
            style={{ fontFamily: "var(--font-barlow), sans-serif" }}
          >
            {title}
          </h2>
          <div
            className="
              mt-4 space-y-4 text-[var(--text-secondary)]
              text-[15px] md:text-base leading-[1.65]
              [&_strong]:text-white [&_strong]:font-semibold
              [&_a]:text-[var(--accent)] [&_a]:underline [&_a]:decoration-[var(--accent)]/40 [&_a]:underline-offset-4 hover:[&_a]:decoration-[var(--accent)]
            "
            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
