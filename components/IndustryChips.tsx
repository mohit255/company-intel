"use client";

import Link from "next/link";
import { useMeta } from "@/lib/useMeta";
import { fieldColor } from "@/components/Cards";
import Spinner from "./Spinner";

export default function IndustryChips() {
  const meta = useMeta();

  if (!meta) {
    return (
      <div className="flex flex-wrap justify-center gap-2.5">
        <Spinner size={18} />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {meta.fields.map((f) => (
        <Link key={f} href={`/news?field=${encodeURIComponent(f)}`}
              className="inline-flex items-center gap-2 rounded-full
                  border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-sm
                  text-zinc-300 transition hover:border-amber-500/60
                  hover:text-amber-300">
          <span className="h-2 w-2 rounded-full"
                style={{ backgroundColor: fieldColor(f) }} />
          {f}
        </Link>
      ))}
    </div>
  );
}
