"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TOPIC_LABELS } from "@/lib/constants";
import { useMeta, type Meta } from "@/lib/useMeta";
import { fieldColor } from "./Cards";
import SearchableSelect from "./SearchableSelect";
import Spinner from "./Spinner";

type Select = {
  key: string;
  label: string;
  options: string[] | { value: string; label: string }[];
};

type Kind = "news" | "jobs" | "products";

// Per-kind select configuration, built from live `meta` state instead of
// server props. Mirrors the shapes each page used to build inline.
function selectsFor(kind: Kind, meta: Meta): Select[] {
  switch (kind) {
    case "news":
      return [
        {
          key: "topic",
          label: "Topic",
          options: meta.topics.map((t) => ({
            value: t,
            label: TOPIC_LABELS[t] ?? t,
          })),
        },
        { key: "company", label: "Company", options: meta.companies },
        { key: "source", label: "Source", options: meta.sources },
      ];
    case "jobs":
      return [
        { key: "company", label: "Company", options: meta.companies },
        {
          key: "country",
          label: "Country",
          options: meta.countries.map((c) => ({
            value: c.country,
            label: `${c.country} (${c.jobs})`,
          })),
        },
        { key: "city", label: "City", options: meta.allCities },
      ];
    case "products":
      return [{ key: "company", label: "Company", options: meta.companies }];
  }
}

// Placeholder labels shown while meta is loading, keyed the same as the
// `selectsFor` keys above so the loading skeleton lines up with the real
// selects once they appear.
const PLACEHOLDER_SELECTS: Record<Kind, { key: string; label: string }[]> = {
  news: [
    { key: "topic", label: "Topic" },
    { key: "company", label: "Company" },
    { key: "source", label: "Source" },
  ],
  jobs: [
    { key: "company", label: "Company" },
    { key: "country", label: "Country" },
    { key: "city", label: "City" },
  ],
  products: [{ key: "company", label: "Company" }],
};

export default function FilterBar({
  kind,
  current,
  resultCount,
  header,
  children,
}: {
  kind: Kind;
  current: Record<string, string>;
  resultCount: number;
  header?: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(current.q ?? "");
  const meta = useMeta();
  // starts open (matching the server's render, so hydration never
  // mismatches); a client-only effect below corrects it to closed if the
  // user previously collapsed it, at the cost of a brief flash for that
  // case — the alternative (branching on typeof window in the initializer)
  // caused a hydration mismatch error on every page load for any user who'd
  // ever closed the sidebar.
  const [open, setOpen] = useState(true);
  const [catOpen, setCatOpen] = useState(true);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchable = kind !== "products";

  useEffect(() => setQ(current.q ?? ""), [current.q]);
  useEffect(() => {
    if (localStorage.getItem("filters-open") === "0") setOpen(false);
  }, []);

  function toggle(next: boolean) {
    setOpen(next);
    localStorage.setItem("filters-open", next ? "1" : "0");
  }

  function push(next: Record<string, string>) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...current, ...next })) {
      if (v) params.set(k, v);
    }
    // picking a country resets the city unless the city belongs to it
    if (next.country !== undefined && meta?.citiesByCountry) {
      const cities = meta.citiesByCountry[next.country] ?? [];
      if (!cities.includes(params.get("city") ?? "")) params.delete("city");
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function onSearch(value: string) {
    setQ(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => push({ q: value }), 400);
  }

  const activeCount = Object.values(current).filter(Boolean).length;
  const fields = meta?.fields ?? [];
  const selects = meta ? selectsFor(kind, meta) : null;

  return (
    <div className={`flex items-start gap-5 ${open ? "flex-col md:flex-row" : "flex-col"}`}>
      {open ? (
        <aside className="w-full shrink-0 rounded-2xl border border-zinc-800
            bg-zinc-950/90 p-4 shadow-lg shadow-black/30
            md:sticky md:top-[var(--header-h)]
            md:max-h-[calc(100vh-var(--header-h)-8px)] md:w-64 md:overflow-y-auto">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold
                text-zinc-200">
              <FunnelIcon />
              Filters
              {activeCount > 0 && (
                <span className="rounded-full bg-amber-500/15 px-2
                    text-[11px] font-semibold text-amber-300">
                  {activeCount}
                </span>
              )}
            </span>
            <button onClick={() => toggle(false)} title="Hide filters"
                aria-label="Hide filters"
                className="rounded-md border border-zinc-800 p-1.5
                    text-zinc-500 transition hover:border-zinc-600
                    hover:text-zinc-200">
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round">
                <path d="M9 3L4 8l5 5M13 3L8 8l5 5" />
              </svg>
            </button>
          </div>

          {searchable && (
            <div className="relative mb-3">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4
                  w-4 -translate-y-1/2 text-zinc-500" viewBox="0 0 16 16"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round">
                <circle cx="7" cy="7" r="4.5" />
                <path d="M10.5 10.5L14 14" />
              </svg>
              <input
                type="search"
                value={q}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search titles…"
                className="h-9 w-full rounded-lg border border-zinc-800
                    bg-zinc-900 pl-9 pr-3 text-[13px] text-zinc-200
                    outline-none transition placeholder:text-zinc-500
                    focus:border-amber-500/60 focus:ring-2
                    focus:ring-amber-500/20"
              />
            </div>
          )}

          <div className="space-y-2">
            {selects
              ? selects.map((s) => {
                  const opts =
                    s.key === "city" && meta?.citiesByCountry && current.country
                      ? (meta.citiesByCountry[current.country] ?? [])
                      : s.options;
                  return (
                    <SearchableSelect
                      key={s.key}
                      label={s.label}
                      options={opts}
                      value={current[s.key] ?? ""}
                      onChange={(v) => push({ [s.key]: v })}
                      block
                    />
                  );
                })
              : PLACEHOLDER_SELECTS[kind].map((s) => (
                  <SelectPlaceholder key={s.key} label={s.label} />
                ))}
          </div>

          <div className="my-3.5 h-px bg-zinc-800/80" />

          <button onClick={() => setCatOpen(!catOpen)}
              className="flex w-full items-center justify-between text-[11px]
                  font-semibold uppercase tracking-wider text-zinc-500
                  transition hover:text-zinc-300">
            Category
            <svg className={`h-3.5 w-3.5 transition-transform ${
                  catOpen ? "" : "-rotate-90"}`}
                viewBox="0 0 16 16" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
          {catOpen && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Chip active={!current.field}
                    onClick={() => push({ field: "" })}>
                All
              </Chip>
              {fields.map((f) => (
                <Chip key={f} active={current.field === f}
                      onClick={() => push({ field: f })}>
                  <span className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: fieldColor(f) }} />
                  {f}
                </Chip>
              ))}
            </div>
          )}

          {activeCount > 0 && (
            <button
              onClick={() => router.push(pathname, { scroll: false })}
              className="mt-4 flex h-9 w-full items-center justify-center
                  gap-1.5 rounded-lg border border-zinc-800 text-[13px]
                  text-zinc-400 transition hover:border-red-500/40
                  hover:text-red-400"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
              Reset all filters
            </button>
          )}
        </aside>
      ) : null}

      <div className={`min-w-0 ${open ? "flex-1" : "w-full"}`}>
        {!open && (
          <button onClick={() => toggle(true)} title="Show filters"
              className="mb-4 flex items-center gap-2 rounded-xl border
                  border-zinc-800 bg-zinc-950/90 px-3.5 py-2 text-[13px]
                  font-medium text-zinc-300 transition
                  hover:border-amber-500/50 hover:text-amber-300">
            <FunnelIcon />
            Filters
            {activeCount > 0 && (
              <span className="rounded-full bg-amber-500/15 px-2 text-[11px]
                  font-semibold text-amber-300">
                {activeCount}
              </span>
            )}
            <svg className="h-3.5 w-3.5 text-zinc-500" viewBox="0 0 16 16"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3l5 5-5 5M7 3l5 5-5 5" />
            </svg>
          </button>
        )}

        {header && <div className="mb-6">{header}</div>}
        <div className="mb-4 text-[13px] text-zinc-500">
          <span className="font-semibold text-zinc-300">
            {resultCount.toLocaleString()}
          </span>{" "}
          result{resultCount === 1 ? "" : "s"}
        </div>
        {children}
      </div>
    </div>
  );
}

// Non-interactive stand-in for SearchableSelect while meta is still
// loading. Matches its collapsed-button visual footprint so there's no
// layout jump once the real select mounts.
function SelectPlaceholder({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      className="flex h-9 w-full items-center gap-1.5 rounded-lg border
          border-zinc-800 bg-zinc-900 px-3 text-[13px] opacity-60"
    >
      <Spinner size={14} />
      <span className="truncate font-medium text-zinc-500">{label}</span>
    </button>
  );
}

function FunnelIcon() {
  return (
    <svg className="h-4 w-4 text-amber-400" viewBox="0 0 16 16" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
        strokeLinejoin="round">
      <path d="M2 3h12l-4.5 5.5V13l-3 1.5V8.5L2 3z" />
    </svg>
  );
}

function Chip({
  active, onClick, children,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-2.5
          py-1 text-xs transition focus:outline-none focus-visible:ring-2
          focus-visible:ring-amber-500/40 ${
        active
          ? "border-amber-500 bg-amber-500 font-semibold text-zinc-950"
          : `border-zinc-800 bg-zinc-900 text-zinc-400
             hover:border-zinc-600 hover:text-zinc-200`
      }`}
    >
      {children}
    </button>
  );
}
