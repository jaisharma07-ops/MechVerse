import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import ToastContainer from "@/components/Toast";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MachineVerse — Explore Every Machine Ever Built",
  description:
    "An AI-powered, conversational encyclopedia for cars, bikes, aircraft, ships, trains, and the future of transport.",
};

export const viewport: Viewport = {
  themeColor: "#0D0F14",
};

const themeBootstrap = `
(function () {
  try {
    var raw = localStorage.getItem('machineverse-v1');
    var dark = true;
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.state && typeof parsed.state.darkMode === 'boolean') {
        dark = parsed.state.darkMode;
      }
    }
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (_) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body
        className={`${barlow.variable} ${dmSans.variable} min-h-screen bg-background text-text-primary overflow-x-hidden`}
      >
        <ThemeProvider />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
