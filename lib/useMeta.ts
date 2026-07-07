"use client";

import { useEffect, useState } from "react";

// Client-safe mirror of lib/queries.ts's Meta type. Kept local (not
// imported from lib/queries.ts) so client components never pull in the
// pg driver via lib/db.ts. This is the single shared source of truth for
// the full Meta shape — components should import this instead of
// re-declaring their own local subset.
export type Meta = {
  counts: { news: number; jobs: number; products: number };
  fields: string[];
  companies: string[];
  sources: string[];
  topics: string[];
  countries: { country: string; jobs: number }[];
  citiesByCountry: Record<string, string[]>;
  allCities: string[];
};

// Module-level singleton cache + in-flight-promise dedup, mirroring the
// server-side cache pattern in lib/queries.ts's getMeta()/getTickerNews().
// This ensures that when multiple components on the same page call
// useMeta() around the same time, only one fetch("/api/meta") request
// actually fires — every caller shares the same promise/result.
let cache: { data: Meta; at: number } | null = null;
let inFlight: Promise<Meta> | null = null;
const TTL_MS = 60_000;

function loadMeta(): Promise<Meta> {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return Promise.resolve(cache.data);
  }
  if (!inFlight) {
    inFlight = fetch("/api/meta")
      .then((res) => res.json())
      .then((data: Meta) => {
        cache = { data, at: Date.now() };
        return data;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

export function useMeta(): Meta | null {
  // Lazy initializer reads the warm cache synchronously, so a component
  // mounting after the cache is already populated (e.g. after a
  // client-side navigation within the 60s TTL window) renders with real
  // data on its very first render — no spinner flash.
  const [meta, setMeta] = useState<Meta | null>(
    cache && Date.now() - cache.at < TTL_MS ? cache.data : null,
  );

  useEffect(() => {
    let cancelled = false;
    loadMeta()
      .then((data) => {
        if (!cancelled) setMeta(data);
      })
      .catch((err) => console.error("Failed to load metadata", err));
    return () => {
      cancelled = true;
    };
  }, []);

  return meta;
}
