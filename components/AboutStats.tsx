"use client";

import Link from "next/link";
import { useMeta } from "@/lib/useMeta";
import Spinner from "@/components/Spinner";

export default function AboutStats() {
  const meta = useMeta();

  const stats = meta
    ? [
        { label: "News articles", value: meta.counts.news.toLocaleString() },
        { label: "Job openings", value: meta.counts.jobs.toLocaleString() },
        { label: "Products tracked", value: meta.counts.products.toLocaleString() },
        { label: "Companies", value: meta.companies.length.toLocaleString() },
        { label: "Industries", value: meta.fields.length.toLocaleString() },
        { label: "Countries", value: meta.countries.length.toLocaleString() },
      ]
    : [];

  return (
    <aside className="w-full shrink-0 space-y-5 lg:sticky
        lg:top-[var(--header-h)] lg:w-72">

      {/* Live stats */}
      <div className="rounded-2xl border border-zinc-800
          bg-zinc-900/60 p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest
            text-zinc-500">
          Database snapshot
        </h3>
        {meta === null ? (
          <div className="flex justify-center py-4">
            <Spinner size={20} />
          </div>
        ) : (
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
        )}
      </div>

      {/* Quick links */}
      <div className="rounded-2xl border border-zinc-800
          bg-zinc-900/60 p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest
            text-zinc-500">
          Explore
        </h3>
        {meta === null ? (
          <div className="flex justify-center py-4">
            <Spinner size={20} />
          </div>
        ) : (
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
        )}
      </div>

      {/* Industries */}
      <div className="rounded-2xl border border-zinc-800
          bg-zinc-900/60 p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest
            text-zinc-500">
          Industries covered
        </h3>
        {meta === null ? (
          <div className="flex justify-center py-4">
            <Spinner size={20} />
          </div>
        ) : (
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
        )}
      </div>

    </aside>
  );
}
