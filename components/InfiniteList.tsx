"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PAGE_SIZE } from "@/lib/constants";
import type { JobItem, NewsItem, ProductItem } from "@/lib/queries";
import { JobCard, NewsCard, ProductCard } from "./Cards";
import Spinner from "./Spinner";

type Kind = "news" | "jobs" | "products";
type Item = NewsItem & JobItem & ProductItem;

const keyOf: Record<Kind, (i: Item) => string> = {
  news: (i) => i.link,
  jobs: (i) => i.url,
  products: (i) => i.url,
};

export default function InfiniteList({
  kind,
  initialItems,
  total,
  filters,
  pageSize = PAGE_SIZE,
}: {
  kind: Kind;
  initialItems: unknown[];
  total: number;
  filters: Record<string, string>;
  pageSize?: number;
}) {
  const [items, setItems] = useState(initialItems as Item[]);
  const [loading, setLoading] = useState(false);
  // refs keep the scroll handler free of stale-closure bugs
  const stateRef = useRef({
    count: initialItems.length,
    loading: false,
    done: initialItems.length >= total,
  });

  const loadMore = useCallback(async () => {
    const s = stateRef.current;
    if (s.loading || s.done) return;
    s.loading = true;
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.entries(filters).filter(([, v]) => v));
      params.set("offset", String(s.count));
      params.set("limit", String(pageSize));
      const res = await fetch(`/api/${kind}?${params}`);
      const data: { items: Item[]; total: number } = await res.json();
      s.count += data.items.length;
      s.done = data.items.length === 0 || s.count >= (data.total || total);
      // drop items already in the list — offsets can shift between requests
      // when new articles arrive, and duplicate keys make React re-mount
      // (flicker) cards
      setItems((prev) => {
        const seen = new Set(prev.map(keyOf[kind]));
        return [...prev, ...data.items.filter((i) => !seen.has(keyOf[kind](i)))];
      });
    } finally {
      s.loading = false;
      setLoading(false);
    }
  }, [kind, filters, pageSize, total]);

  useEffect(() => {
    function check() {
      const nearBottom = window.innerHeight + window.scrollY >=
        document.body.scrollHeight - 600;
      if (nearBottom) loadMore();
    }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check(); // first page may not fill a tall viewport
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [loadMore]);

  const done = items.length >= total;
  const Card = { news: NewsCard, jobs: JobCard, products: ProductCard }[kind];

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={keyOf[kind](item)} item={item} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2.5 py-8 text-sm
          text-zinc-500">
        {loading ? (
          <>
            <Spinner />
            Loading more…
          </>
        ) : done ? (
          `Showing all ${total} result${total === 1 ? "" : "s"}`
        ) : (
          `Showing ${items.length} of ${total} — scroll for more`
        )}
      </div>
    </>
  );
}
