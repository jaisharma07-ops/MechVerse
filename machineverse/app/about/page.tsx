import type { Metadata } from "next";
import Link from "next/link";
import InfoPageShell, { InfoSection } from "@/components/info/InfoPageShell";
import FounderPortrait from "@/components/info/FounderPortrait";

export const metadata: Metadata = {
  title: "About — MachineVerse",
  description:
    "One engineer, one laptop, and a stubborn refusal to open 14 browser tabs every time. About MachineVerse and its founder, Jai Sharma.",
};

export default function AboutPage() {
  return (
    <InfoPageShell
      eyebrow="01 — ABOUT"
      title={
        <>
          <span>Built by an </span>
          <span className="text-[var(--accent)]">engineer</span>
          <span>,</span>
          <br />
          <span>for the </span>
          <span className="text-[var(--accent)]">curious</span>
          <span>.</span>
        </>
      }
      lede="Every machine, in one conversation. From the first wheel to escape velocity — and every chassis, wing, and hull in between."
      updated="2026.01"
    >
      {/* ── Founder card ── */}
      <section className="relative grid md:grid-cols-[300px_1fr] lg:grid-cols-[360px_1fr] gap-8 md:gap-14 items-start pb-12 md:pb-16 border-b border-white/8">
        <FounderPortrait />

        <div>
          <div className="font-mono text-[10px] tracking-[0.34em] uppercase text-[var(--accent)] mb-3">
            № 00 · founder
          </div>
          <h2
            className="font-display font-bold uppercase tracking-[0.02em] text-3xl md:text-4xl text-white leading-tight"
            style={{ fontFamily: "var(--font-barlow), sans-serif" }}
          >
            Jai Sharma
          </h2>
          <p
            className="mt-1 font-mono text-[11px] tracking-[0.34em] uppercase text-white/45"
          >
            Engineer · Designer · Founder
          </p>

          <div
            className="mt-6 space-y-4 text-[var(--text-secondary)] text-[15px] md:text-base leading-[1.7]"
            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            <p>Hi — I&apos;m Jai.</p>
            <p>
              I built MachineVerse because I was tired of opening fourteen
              browser tabs every time I wanted to know how a thing actually{" "}
              <em>works</em> — the gearbox, the wing, the burn rate, the hull.
            </p>
            <p>
              So this is the answer: an AI that talks back, with sources.
              Ask anything about any machine ever built. It cites its work.
              No SEO blogspam, no ads, no rabbit-hole. Just the spec sheet,
              in plain English.
            </p>
            <p>
              One engineer. One laptop. A lot of coffee. Every pixel and every
              line of code in here is hand-built — chassis-up.
            </p>
          </div>

          {/* Quick contact strip */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="
                inline-flex items-center gap-2
                font-mono text-[11px] tracking-[0.32em] uppercase
                px-4 py-2.5 rounded-[3px]
                bg-[var(--accent)] text-[#06080C]
                hover:scale-[1.03] hover:shadow-[0_0_28px_rgba(245,166,35,0.45)]
                transition-[transform,box-shadow] duration-300
              "
            >
              Say hi
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="https://github.com/Jaicoder-1"
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-2
                font-mono text-[11px] tracking-[0.32em] uppercase
                px-4 py-2.5 rounded-[3px]
                border border-white/15 text-white/75
                hover:border-[var(--accent)]/60 hover:text-[var(--accent)]
                transition-colors
              "
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/jai-sharma-aa43b9373/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-2
                font-mono text-[11px] tracking-[0.32em] uppercase
                px-4 py-2.5 rounded-[3px]
                border border-white/15 text-white/75
                hover:border-[var(--accent)]/60 hover:text-[var(--accent)]
                transition-colors
              "
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* ── Why + How + What's next ── */}
      <div className="mt-12 md:mt-16">
        <InfoSection no="01 / Why" title="Surface every machine.">
          <p>
            We&apos;ve been engineering vehicles for{" "}
            <strong>roughly a quarter of a million years</strong>. That
            knowledge is scattered across forums, half-broken manuals, and
            PDFs nobody&apos;s opened since 2009.
          </p>
          <p>
            The mission is simple: pull all of it onto one workbench. Ask a
            question. Get a grounded answer with sources. Move on.
          </p>
        </InfoSection>

        <InfoSection no="02 / How" title="The four bolts.">
          <ul className="list-none space-y-2 pl-0">
            <li>
              <strong>Sourced, not invented.</strong> Every answer points
              back to where it came from.
            </li>
            <li>
              <strong>Designed, not generated.</strong> No infinite scroll.
              No dark patterns. The product gets out of the way.
            </li>
            <li>
              <strong>One author.</strong> Every detail is on purpose. Every
              pixel can be defended.
            </li>
            <li>
              <strong>Built for depth.</strong> We assume you want the spec
              sheet, not the summary.
            </li>
          </ul>
        </InfoSection>

        <InfoSection no="03 / Roadmap" title="What's bolted on next.">
          <p>
            Side-by-side comparisons. Better coverage of the weird stuff —
            steam locomotives, dirigibles, kit aircraft, hand-built yachts.
            And eventually: point your camera at a machine, ask anything
            about it.
          </p>
          <p>
            Got a category that&apos;s missing, a source we should index, or
            a feature we should build? <Link href="/contact">Tell me</Link>.
          </p>
        </InfoSection>
      </div>
    </InfoPageShell>
  );
}
