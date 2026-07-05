import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import MarketTicker from "@/components/MarketTicker";
import NavLinks from "@/components/NavLinks";
import Tracker from "@/components/Tracker";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default:
      "Company Intel — news, jobs & pricing from the world's top companies",
    template: "%s · Company Intel",
  },
  description:
    "Daily-scraped news, job openings and product pricing from the world's " +
    "top companies — filterable by industry, company, country and city.",
  openGraph: {
    title: "Company Intel",
    description:
      "News, jobs & pricing intelligence on the world's top companies.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-zinc-950 font-sans text-zinc-200
          antialiased">
        <Suspense fallback={null}>
          <Tracker />
        </Suspense>
        <header className="sticky top-0 z-40 border-b border-zinc-800
            bg-zinc-950 will-change-transform relative">
          <div className="mx-auto flex max-w-[1440px] items-center gap-4
              px-4 py-3 sm:gap-8 sm:px-6 sm:py-4">
            <Link href="/" className="font-serif text-2xl font-bold
                tracking-tight text-zinc-50">
              Company <span className="text-amber-400">Intel</span>
            </Link>
            <NavLinks />
          </div>
          <Suspense fallback={null}>
            <MarketTicker />
          </Suspense>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 pb-24 sm:px-6">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
