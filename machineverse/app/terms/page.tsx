import type { Metadata } from "next";
import Link from "next/link";
import InfoPageShell, { InfoSection } from "@/components/info/InfoPageShell";

export const metadata: Metadata = {
  title: "Terms & Conditions — MachineVerse",
  description:
    "Terms and conditions governing your use of MachineVerse. All content, code, design, and intellectual property are owned by Jai Sharma. Unauthorized use is strictly prohibited.",
};

export default function TermsPage() {
  return (
    <InfoPageShell
      eyebrow="02 — TERMS & CONDITIONS"
      title={
        <>
          <span>Terms of </span>
          <span className="text-[var(--accent)]">use</span>
          <span>.</span>
        </>
      }
      lede="These terms govern access to and use of MachineVerse. By using the service you agree to be bound by them. Read carefully — they include important protections for the intellectual property that powers this site."
      updated="2026.01"
    >
      {/* ── Headline copyright banner ── */}
      <div
        className="
          relative mb-12 md:mb-16 p-6 md:p-8
          rounded-sm border border-[var(--accent)]/40
          bg-[var(--accent)]/[0.06]
          overflow-hidden
        "
      >
        <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--accent)]" />
        <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--accent)]" />
        <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--accent)]" />
        <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--accent)]" />

        <div className="font-mono text-[10px] md:text-[11px] tracking-[0.42em] uppercase text-[var(--accent)] mb-3">
          © {new Date().getFullYear()} · Jai Sharma · All rights reserved
        </div>
        <p
          className="text-white text-base md:text-lg leading-relaxed max-w-[820px]"
          style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          <strong>
            All content, source code, design, branding, written copy, data
            pipelines, and visual assets on MachineVerse are the exclusive
            intellectual property of Jai Sharma.
          </strong>{" "}
          Unauthorized copying, scraping, redistribution, derivative use,
          training of machine-learning models, or commercial exploitation is{" "}
          <strong>strictly prohibited</strong> and will be enforced under
          applicable copyright, trademark, and computer-misuse law.
        </p>
      </div>

      {/* ── Sections ── */}
      <InfoSection no="01 / Ownership" title="Copyright & intellectual property.">
        <p>
          MachineVerse — including but not limited to its source code, user
          interface, visual design, typography choices, brand marks, written
          content, data structures, prompt engineering, model orchestration
          logic, and the &quot;MechVerse&quot; / &quot;MachineVerse&quot;
          wordmarks — is the original creative and engineering work of{" "}
          <strong>Jai Sharma</strong> and is protected by copyright, trademark,
          and database rights under the laws of India, the European Union, the
          United Kingdom, the United States, and all jurisdictions party to
          the Berne Convention.
        </p>
        <p>
          <strong>No licence is granted</strong> by access to this site. You
          obtain no rights of reproduction, adaptation, distribution, public
          performance, or sub-licensing, whether express or implied, except
          where explicitly stated in a signed written agreement with the
          rights-holder.
        </p>
      </InfoSection>

      <InfoSection no="02 / Prohibited use" title="What you may not do.">
        <p>
          Without prior written permission from Jai Sharma, you may{" "}
          <strong>not</strong>:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            copy, clone, mirror, screenshot at scale, or otherwise reproduce
            any part of MachineVerse&apos;s code, design, or visual assets;
          </li>
          <li>
            scrape, harvest, or systematically extract data, answers, or
            citations from the service via automated tooling, headless
            browsers, or undisclosed API access;
          </li>
          <li>
            use any output of MachineVerse — including model responses,
            assembled answers, source citations, or rendered UI — to train,
            fine-tune, evaluate, or distil any machine-learning model;
          </li>
          <li>
            redistribute, resell, sub-licence, or repackage the service or
            any portion of it, in original or modified form, including as
            part of a competing product, course, or content channel;
          </li>
          <li>
            remove, obscure, or misrepresent any copyright, attribution, or
            ownership notice;
          </li>
          <li>
            use the name MachineVerse, MechVerse, the wordmark, the amber
            colourway, the drafting-table visual system, or any confusingly
            similar branding for any commercial or promotional purpose;
          </li>
          <li>
            attempt to reverse-engineer, decompile, or otherwise derive the
            underlying source code, prompts, or model orchestration of the
            service;
          </li>
          <li>
            use the service for any unlawful purpose, in violation of
            export-control law, or in any manner that could damage,
            disable, or impair the service or its users.
          </li>
        </ul>
      </InfoSection>

      <InfoSection no="03 / Permitted use" title="What you may do.">
        <p>You may, free of charge, and without further permission:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            access MachineVerse for personal, non-commercial, curious-reader
            use;
          </li>
          <li>
            quote brief, attributed excerpts of MachineVerse-generated
            answers in academic, journalistic, or personal-blog contexts,{" "}
            <strong>
              provided the quote is plainly attributed to MachineVerse with a
              live link
            </strong>{" "}
            back to the source page;
          </li>
          <li>
            share links to MachineVerse pages on social media, in chat
            threads, in newsletters, and in conversation.
          </li>
        </ul>
        <p>
          All other uses require a written licence. Requests can be sent to{" "}
          <a href="mailto:mechverse.support@gmail.com">
            mechverse.support@gmail.com
          </a>
          .
        </p>
      </InfoSection>

      <InfoSection no="04 / Trademark" title="Names & brand marks.">
        <p>
          <strong>MachineVerse</strong>, <strong>MechVerse</strong>, the{" "}
          <em>Mech</em> / <em>Verse</em> bi-tone wordmark, the drafting-table
          visual identity, and all related design elements are unregistered
          trademarks of Jai Sharma. Use of these marks in connection with any
          product, service, content channel, or promotional material — in
          whole or in part, in any language — without prior written
          authorisation constitutes trademark infringement and unfair
          competition.
        </p>
      </InfoSection>

      <InfoSection no="05 / User content" title="What you submit.">
        <p>
          When you submit questions, feedback, or any other content to
          MachineVerse, you grant Jai Sharma a worldwide, royalty-free,
          non-exclusive licence to use that submission for the purposes of
          operating, improving, and promoting the service. You retain
          ownership of the underlying content.
        </p>
        <p>
          You warrant that any content you submit is yours to submit and
          does not infringe the rights of any third party. You agree not to
          submit content that is unlawful, defamatory, obscene, or
          discriminatory.
        </p>
      </InfoSection>

      <InfoSection no="06 / Third-party content" title="Sources we cite.">
        <p>
          MachineVerse answers are grounded in third-party sources —
          encyclopaedias, academic papers, manufacturer documentation, and
          historical archives. Citations are provided for transparency and
          attribution. Each cited work remains the property of its
          respective rights-holder and is reproduced under fair dealing /
          fair use for the purposes of comment, criticism, and education.
        </p>
        <p>
          If you are a rights-holder and believe content has been used in
          excess of fair dealing, contact{" "}
          <a href="mailto:mechverse.support@gmail.com">
            mechverse.support@gmail.com
          </a>{" "}
          and we will respond within a reasonable period.
        </p>
      </InfoSection>

      <InfoSection no="07 / Accuracy & disclaimer" title="No warranty.">
        <p>
          MachineVerse uses large language models to assemble answers from
          cited sources. While we work hard to ground every response,{" "}
          <strong>
            no part of the service is offered with any warranty of
            accuracy, completeness, fitness for purpose, or
            non-infringement
          </strong>
          . You should not rely on MachineVerse for safety-critical,
          medical, legal, financial, or engineering decisions without
          independent verification.
        </p>
      </InfoSection>

      <InfoSection no="08 / Limitation of liability" title="Damages cap.">
        <p>
          To the maximum extent permitted by applicable law, in no event
          shall Jai Sharma be liable for any indirect, incidental, special,
          consequential, or punitive damages — including loss of profits,
          data, goodwill, or other intangible losses — arising out of or in
          connection with your use of or inability to use the service.
        </p>
      </InfoSection>

      <InfoSection no="09 / Enforcement" title="What happens if you breach.">
        <p>
          Breach of these terms — particularly the IP, scraping, or
          model-training prohibitions in §02 — may result in any
          combination of: immediate termination of access, IP-level and
          fingerprint-level blocking, DMCA take-down notices, statutory
          damages claims, and proceedings before the courts of competent
          jurisdiction. Jai Sharma reserves the right to seek injunctive
          relief without first seeking damages.
        </p>
      </InfoSection>

      <InfoSection no="10 / Changes" title="Amendments to these terms.">
        <p>
          These terms may be updated from time to time. Material changes
          will be flagged by an updated &quot;rev&quot; tag in the page
          footer. Continued use of the service after a revision constitutes
          acceptance of the revised terms.
        </p>
      </InfoSection>

      <InfoSection no="11 / Governing law" title="Jurisdiction.">
        <p>
          These terms are governed by the laws of India. Any dispute
          arising from these terms or from use of MachineVerse shall be
          subject to the exclusive jurisdiction of the competent courts of
          India.
        </p>
      </InfoSection>

      <InfoSection no="12 / Contact" title="Reach the rights-holder.">
        <p>
          Permission requests, take-down notices, licensing enquiries, and
          legal correspondence should be directed to:
        </p>
        <p>
          <strong>Jai Sharma</strong>
          <br />
          <a href="mailto:mechverse.support@gmail.com">
            mechverse.support@gmail.com
          </a>
          <br />
          See also the <Link href="/contact">contact page</Link>.
        </p>
      </InfoSection>
    </InfoPageShell>
  );
}
