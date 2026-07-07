import type { Metadata } from "next";
import AboutStats from "@/components/AboutStats";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Company Intel — what it is, how the data is collected, and what you can do with it.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const sources = [
    { name: "Google News", desc: "Company news, IPO coverage, market updates" },
    { name: "Career APIs", desc: "Job listings scraped from company career pages" },
    { name: "Product pages", desc: "Pricing and product info from company websites" },
  ];

  const features = [
    { icon: "📰", title: "News Intelligence", desc: "Daily-scraped news across categories: company updates, stock movements, IPO announcements, and market analysis." },
    { icon: "💼", title: "Job Openings", desc: "Real-time job listings from company career portals, filterable by country, city, and industry." },
    { icon: "💰", title: "Product Pricing", desc: "Extracted price points and product pages from the world's top companies." },
    { icon: "🔍", title: "Full-text Search", desc: "Search across all news and job titles instantly with server-side filtering." },
    { icon: "🌍", title: "Global Coverage", desc: "Companies and job openings spanning dozens of countries across every major industry we track." },
    { icon: "📊", title: "Live Ticker", desc: "Real-time scrolling ticker in the header showing the latest stock and market updates." },
  ];

  return (
    <div className="space-y-8 pt-10">
      <header className="relative overflow-hidden rounded-2xl border
          border-zinc-800 bg-zinc-900/50 px-5 py-6 sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute -right-10 -top-10
            h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <h1 className="font-serif text-3xl font-bold text-zinc-50
            sm:text-4xl">About</h1>
        <p className="mt-1 text-zinc-400">
          What Company Intel is, how it works, and what&apos;s inside.
        </p>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

        {/* ── Main content ── */}
        <div className="min-w-0 flex-1 space-y-8">

          <section className="rounded-2xl border border-zinc-800
              bg-zinc-900/40 p-6 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-zinc-50">
              What is Company Intel?
            </h2>
            <p className="leading-relaxed text-zinc-400">
              Company Intel is an intelligence platform that aggregates publicly
              available data from the world&apos;s top companies — news,
              job openings, and product pricing — into a single, searchable,
              filterable interface.
            </p>
            <p className="leading-relaxed text-zinc-400">
              Data is scraped automatically by a worker-pool scraper and stored
              in PostgreSQL. Every page is server-rendered for fast load times,
              full-text search, and SEO-friendly URLs.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-800
              bg-zinc-900/40 p-6 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-zinc-50">
              Features
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title}
                    className="rounded-xl border border-zinc-800
                        bg-zinc-900/60 p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{f.icon}</span>
                    <h3 className="font-semibold text-zinc-100">{f.title}</h3>
                  </div>
                  <p className="text-[13px] leading-relaxed text-zinc-500">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800
              bg-zinc-900/40 p-6 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-zinc-50">
              Data Sources
            </h2>
            <div className="space-y-3">
              {sources.map((s) => (
                <div key={s.name}
                    className="flex items-start gap-3 rounded-xl border
                        border-zinc-800 bg-zinc-900/60 px-4 py-3">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full
                      bg-amber-400" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">
                      {s.name}
                    </p>
                    <p className="text-[13px] text-zinc-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── Right sidebar ── */}
        <AboutStats />
      </div>
    </div>
  );
}
