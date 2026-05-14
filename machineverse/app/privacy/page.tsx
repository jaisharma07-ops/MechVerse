import type { Metadata } from "next";
import Link from "next/link";
import InfoPageShell, { InfoSection } from "@/components/info/InfoPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy — MachineVerse",
  description:
    "How MachineVerse collects, uses, stores, and protects information about the people who use the service.",
};

export default function PrivacyPage() {
  return (
    <InfoPageShell
      eyebrow="03 — PRIVACY"
      title={
        <>
          <span>Your data, </span>
          <br />
          <span>handled with </span>
          <span className="text-[var(--accent)]">care</span>
          <span>.</span>
        </>
      }
      lede="What we collect, why we collect it, who can see it, and how to make us forget it. Plain language. No dark patterns."
      updated="2026.01"
    >
      <InfoSection no="01 / Summary" title="The short version.">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            We collect only what we need to run MachineVerse and answer your
            questions.
          </li>
          <li>
            We do not sell your data, ever, to anyone, for any price.
          </li>
          <li>
            Your conversations are stored so you can return to them — and
            you can delete them.
          </li>
          <li>
            We use a small number of trustworthy third parties (auth, large
            language models, hosting). They are listed below.
          </li>
        </ul>
      </InfoSection>

      <InfoSection no="02 / What we collect" title="The data points.">
        <p>
          <strong>Account data.</strong> If you sign in, we receive your
          name, email address, and (where applicable) profile picture from
          your authentication provider (Google). We never see your password.
        </p>
        <p>
          <strong>Conversation data.</strong> Questions you ask, answers we
          return, categories you pick, and bookmarks you save. This is
          stored so you can resume conversations and revisit your history.
        </p>
        <p>
          <strong>Technical data.</strong> Basic request metadata —
          timestamp, anonymised IP, user-agent — captured by our hosting
          provider for security and rate-limiting.
        </p>
        <p>
          <strong>Preferences.</strong> Theme choice (dark/light), most
          recent category, and a tiny <code>mv_visited</code> flag, all
          stored in your browser&apos;s <code>localStorage</code>.
        </p>
      </InfoSection>

      <InfoSection no="03 / Why we collect it" title="Purpose limitation.">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Service delivery</strong> — to answer your questions,
            return citations, and let you resume past conversations.
          </li>
          <li>
            <strong>Quality &amp; safety</strong> — to detect abuse,
            rate-limit aggressive scraping, and improve the accuracy of
            future answers in aggregate (never tied to a specific user).
          </li>
          <li>
            <strong>Communication</strong> — only if you opt-in by
            contacting us first. We do not send marketing email.
          </li>
        </ul>
      </InfoSection>

      <InfoSection no="04 / Cookies & local storage" title="What lives in your browser.">
        <p>
          MachineVerse uses <strong>strictly necessary</strong>{" "}
          <code>localStorage</code> keys for theme preference, last-seen
          category, and an authentication session cookie. We do not use
          third-party advertising cookies and we do not embed third-party
          trackers for behavioural advertising.
        </p>
      </InfoSection>

      <InfoSection no="05 / Third parties" title="The processors we trust.">
        <p>
          A small set of carefully chosen processors helps run the
          service. Each has its own privacy policy:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Authentication</strong> — Google (sign-in only).
          </li>
          <li>
            <strong>Large language models</strong> — model providers
            receive your question text to assemble an answer. They do not
            receive your account identifiers. Prompts may be retained by
            providers under their own policies.
          </li>
          <li>
            <strong>Database &amp; hosting</strong> — Vercel and Upstash
            (Redis-compatible key-value store).
          </li>
          <li>
            <strong>Reference sources</strong> — Wikipedia, manufacturer
            documentation, and other public archives are queried at
            request time. These calls are anonymised.
          </li>
        </ul>
      </InfoSection>

      <InfoSection no="06 / Retention" title="How long we keep things.">
        <p>
          Chat history is retained while your account is active. Anonymous
          technical logs are retained for up to 30 days for security
          purposes, then rotated. You can delete your account and all
          associated chat history at any time by writing to{" "}
          <a href="mailto:mechverse.support@gmail.com">
            mechverse.support@gmail.com
          </a>
          .
        </p>
      </InfoSection>

      <InfoSection no="07 / Your rights" title="What you can ask us to do.">
        <p>
          Subject to applicable law, you can ask us to:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>confirm what data we hold about you;</li>
          <li>send you a copy of that data;</li>
          <li>correct any data that is wrong;</li>
          <li>delete your data and account;</li>
          <li>
            restrict or object to certain types of processing;
          </li>
          <li>complain to your local data-protection authority.</li>
        </ul>
        <p>
          To exercise any of these rights, write to{" "}
          <a href="mailto:mechverse.support@gmail.com">
            mechverse.support@gmail.com
          </a>
          . We respond within 30 days.
        </p>
      </InfoSection>

      <InfoSection no="08 / Children" title="Age restriction.">
        <p>
          MachineVerse is not directed at children under 13 and we do not
          knowingly collect data from them. If you believe a child has
          submitted personal data, contact us and we will delete it.
        </p>
      </InfoSection>

      <InfoSection no="09 / Security" title="How we protect data.">
        <p>
          Data is encrypted in transit (HTTPS / TLS) and at rest in our
          managed database. Access is limited to Jai Sharma using
          multi-factor authentication. No transmission over the internet
          is 100% secure, but we work hard to make the attack surface as
          small as possible.
        </p>
      </InfoSection>

      <InfoSection no="10 / Changes" title="When this policy is updated.">
        <p>
          Material changes will be flagged by an updated <em>rev</em> tag
          in the page footer. We will not narrow your rights retroactively
          without notice.
        </p>
      </InfoSection>

      <InfoSection no="11 / Contact" title="Reach the controller.">
        <p>
          For any privacy question, request, or complaint:
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
