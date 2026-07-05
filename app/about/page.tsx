import type { Metadata } from "next";
import Link from "next/link";
import { getMeta } from "@/lib/queries";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Company Intel — what it is, how the data is collected, and what you can do with it.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const meta = await getMeta();

  const stats = [
    { label: "News articles", value: meta.counts.news.toLocaleString() },
    { label: "Job openings", value: meta.counts.jobs.toLocaleString() },
    { label: "Products tracked", value: meta.counts.products.toLocaleString() },
    { label: "Companies", value: meta.companies.length.toLocaleString() },
    { label: "Industries", value: meta.fields.length.toLocaleString() },
    { label: "Countries", value: meta.countries.length.toLocaleString() },
  ];

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
    { icon: "🌍", title: "Global Coverage", desc: `Companies and job openings spanning ${meta.countries.length} countries across ${meta.fields.length} industries.` },
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
        <aside className="w-full shrink-0 space-y-5 lg:sticky
            lg:top-[var(--header-h)] lg:w-72">

          {/* Live stats */}
          <div className="rounded-2xl border border-zinc-800
              bg-zinc-900/60 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest
                text-zinc-500">
              Database snapshot
            </h3>
            <div className="divide-y divide-zinc-800">
              {stats.map((s) => (
                <div key={s.label}
                    className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-zinc-400">{s.label}</span>
                  <span className="font-serif text-lg font-bold
                      text-amber-400">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-2xl border border-zinc-800
              bg-zinc-900/60 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest
                text-zinc-500">
              Explore
            </h3>
            <nav className="space-y-1">
              {[
                { href: "/news", label: "Latest News", sub: `${meta.counts.news.toLocaleString()} articles` },
                { href: "/news?topic=stock", label: "Stock Updates", sub: "Market movements" },
                { href: "/news?topic=ipo", label: "IPO Coverage", sub: "New listings" },
                { href: "/news?topic=market", label: "Market Updates", sub: "Macro trends" },
                { href: "/jobs", label: "Job Openings", sub: `${meta.counts.jobs.toLocaleString()} roles` },
                { href: "/products", label: "Products & Pricing", sub: `${meta.counts.products.toLocaleString()} pages` },
              ].map((l) => (
                <Link key={l.href} href={l.href}
                    className="flex items-center justify-between rounded-lg
                        px-3 py-2 transition hover:bg-zinc-800/60
                        hover:text-amber-300 group">
                  <span className="text-sm text-zinc-300
                      group-hover:text-amber-300">
                    {l.label}
                  </span>
                  <span className="text-[11px] text-zinc-600">{l.sub}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Industries */}
          <div className="rounded-2xl border border-zinc-800
              bg-zinc-900/60 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest
                text-zinc-500">
              Industries covered
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {meta.fields.map((f) => (
                <Link key={f}
                    href={`/news?field=${encodeURIComponent(f)}`}
                    className="rounded-full border border-zinc-800
                        bg-zinc-900 px-3 py-1 text-[11px] text-zinc-400
                        transition hover:border-amber-500/50
                        hover:text-amber-300">
                  {f}
                </Link>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
