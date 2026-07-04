import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";
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
        <header className="sticky top-0 z-40 border-b border-zinc-800
            bg-zinc-950/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-8 px-5 py-4">
            <Link href="/" className="font-serif text-2xl font-bold
                tracking-tight text-zinc-50">
              Company <span className="text-amber-400">Intel</span>
            </Link>
            <NavLinks />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-5 pb-24">{children}</main>

        <footer className="border-t border-zinc-800 py-12">
          <div className="mx-auto flex max-w-6xl flex-col items-center
              gap-4 px-5 text-sm text-zinc-500">
            <div className="flex gap-6">
              <Link href="/news"
                    className="transition hover:text-zinc-300">News</Link>
              <Link href="/jobs"
                    className="transition hover:text-zinc-300">Jobs</Link>
              <Link href="/products"
                    className="transition hover:text-zinc-300">Products</Link>
            </div>
            <p>
              Company Intel — data scraped from public sources by the
              worker-pool scraper, stored in PostgreSQL.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
