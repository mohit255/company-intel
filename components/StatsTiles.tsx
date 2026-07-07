"use client";

import { useMeta } from "@/lib/useMeta";
import Spinner from "./Spinner";

export default function StatsTiles() {
  const meta = useMeta();

  if (!meta) {
    return (
      <div className="flex flex-wrap justify-center gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}
              className="flex h-[72px] w-36 items-center justify-center
                  rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <Spinner size={20} />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    { n: meta.counts.news, label: "news articles" },
    { n: meta.counts.jobs, label: "job openings" },
    { n: meta.companies.length, label: "companies" },
    { n: meta.countries.length, label: "countries" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {stats.map((s) => (
        <div key={s.label}
            className="rounded-2xl border border-zinc-800
                bg-zinc-900/60 px-6 py-4">
          <div className="font-serif text-4xl font-bold text-amber-400">
            {s.n}
          </div>
          <div className="text-sm text-zinc-500">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
