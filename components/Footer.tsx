import Link from "next/link";
import { TOPIC_LABELS } from "@/lib/constants";
import { getNews } from "@/lib/queries";

const topicStyle: Record<string, string> = {
  general: "border-zinc-700 text-zinc-400 hover:border-amber-500/50 hover:text-amber-300",
  stock:   "border-emerald-800/60 text-emerald-500 hover:border-emerald-500/60 hover:text-emerald-300",
  market:  "border-blue-800/60 text-blue-500 hover:border-blue-500/60 hover:text-blue-300",
  ipo:     "border-violet-800/60 text-violet-500 hover:border-violet-500/60 hover:text-violet-300",
};

export default async function Footer() {
  const [{ items: topNews }, { items: trending }] = await Promise.all([
    getNews({ topic: "general", limit: 5 }),
    getNews({ limit: 5 }),
  ]);

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      {/* ── Top section: 4 columns ── */}
      <div className="mx-auto max-w-[1440px] px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="font-serif text-xl font-bold
                tracking-tight text-zinc-50">
              Company <span className="text-amber-400">Intel</span>
            </Link>
            <p className="text-[13px] leading-relaxed text-zinc-500">
              Daily intelligence on the world&apos;s top companies — news,
              jobs, and pricing in one place.
            </p>
            <div className="flex gap-3">
              {Object.entries(TOPIC_LABELS).map(([key, label]) => (
                <Link key={key}
                    href={`/news?topic=${key}`}
                    className={`rounded-full border px-2.5 py-1 text-[10px]
                        font-semibold uppercase tracking-wider transition
                        ${topicStyle[key] ?? topicStyle.general}`}>
                  {key === "general" ? "News" : label.split(" ")[0]}
                </Link>
              ))}
            </div>
          </div>

          {/* Top news */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest
                text-zinc-500">
              Top News
            </h4>
            <ul className="space-y-3">
              {topNews.map((item) => (
                <li key={item.link}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                      className="group block space-y-0.5">
                    <p className="text-[13px] font-medium leading-snug
                        text-zinc-300 transition group-hover:text-amber-300
                        line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-zinc-600">
                      {item.company} · {item.published ?? item.added}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Trending */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest
                text-zinc-500">
              Trending Articles
            </h4>
            <ul className="space-y-3">
              {trending.map((item, i) => (
                <li key={item.link} className="flex gap-3">
                  <span className="font-serif text-2xl font-bold
                      leading-none text-zinc-800 select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                      className="group block space-y-0.5">
                    <p className="text-[13px] font-medium leading-snug
                        text-zinc-300 transition group-hover:text-amber-300
                        line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-zinc-600">{item.company}</p>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest
                text-zinc-500">
              Explore
            </h4>
            <nav className="space-y-1.5">
              {[
                { href: "/news",              label: "All News" },
                { href: "/news?topic=stock",  label: "Stock Updates" },
                { href: "/news?topic=market", label: "Market Updates" },
                { href: "/news?topic=ipo",    label: "IPO Coverage" },
                { href: "/jobs",              label: "Job Openings" },
                { href: "/products",          label: "Products & Pricing" },
                { href: "/about",             label: "About" },
              ].map((l) => (
                <Link key={l.href} href={l.href}
                    className="flex items-center gap-2 text-[13px]
                        text-zinc-500 transition hover:text-zinc-200">
                  <span className="h-px w-3 bg-zinc-700" />
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-zinc-800/60">
        <div className="mx-auto flex max-w-[1440px] items-center
            justify-between px-6 py-4">
          <p className="text-[12px] text-zinc-600">
            © {new Date().getFullYear()} Company Intel. All rights reserved.
          </p>
          <p className="text-[12px] text-zinc-700">
            Data refreshed daily from public sources.
          </p>
        </div>
      </div>
    </footer>
  );
}
