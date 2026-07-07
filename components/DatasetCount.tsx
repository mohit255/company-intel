"use client";

import { useMeta } from "@/lib/useMeta";
import Spinner from "./Spinner";

export default function DatasetCount({
  kind,
}: {
  kind: "news" | "jobs" | "products";
}) {
  const meta = useMeta();

  if (!meta) {
    return (
      <span className="mt-1 flex h-[1.5em] items-center">
        <Spinner size={16} />
      </span>
    );
  }

  switch (kind) {
    case "news":
      return (
        <p className="mt-1 text-zinc-400">
          {meta.counts.news} articles from Google News, across{" "}
          {meta.fields.length} industries.
        </p>
      );
    case "jobs":
      return (
        <p className="mt-1 text-zinc-400">
          {meta.counts.jobs} openings in {meta.countries.length} countries —
          straight from company career APIs.
        </p>
      );
    case "products":
      return (
        <p className="mt-1 text-zinc-400">
          {meta.counts.products} product pages with extracted price points.
        </p>
      );
  }
}
