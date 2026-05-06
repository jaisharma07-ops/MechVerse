import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import LandingShowcase from "@/components/landing/LandingShowcase";
import LandingStats from "@/components/landing/LandingStats";
import LandingCategories from "@/components/landing/LandingCategories";
import LandingTimeline from "@/components/landing/LandingTimeline";
import LandingCta from "@/components/landing/LandingCta";

export const metadata = {
  title: "MachineVerse — Every Machine Ever Built",
  description:
    "An AI-powered, conversational encyclopedia for every car, bike, aircraft, ship, train and rocket humans have ever engineered.",
};

export default function LandingPage() {
  return (
    <main id="top" className="bg-[#0A0C12] text-white">
      <LandingNav />
      <LandingHero />
      <div id="showcase">
        <LandingShowcase />
      </div>
      <div id="stats">
        <LandingStats />
      </div>
      <div id="categories">
        <LandingCategories />
      </div>
      <div id="timeline">
        <LandingTimeline />
      </div>
      <LandingCta />
    </main>
  );
}
