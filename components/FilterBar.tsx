"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { fieldColor } from "./Cards";
import SearchableSelect from "./SearchableSelect";

type Select = {
  key: string;
  label: string;
  options: string[] | { value: string; label: string }[];
};

export default function FilterBar({
  fields,
  selects,
  current,
  citiesByCountry,
  searchable = true,
  resultCount,
  children,
}: {
  fields: string[];
  selects: Select[];
  current: Record<string, string>;
  citiesByCountry?: Record<string, string[]>;
  searchable?: boolean;
  resultCount: number;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(current.q ?? "");
  // lazy initializer reads localStorage synchronously on the client so the
  // sidebar doesn't render open and then snap closed after hydration
  const [open, setOpen] = useState(() =>
    typeof window === "undefined"
      ? true
      : localStorage.getItem("filters-open") !== "0");
  const [catOpen, setCatOpen] = useState(true);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setQ(current.q ?? ""), [current.q]);

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
    if (next.country !== undefined && citiesByCountry) {
      const cities = citiesByCountry[next.country] ?? [];
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

  return (
    <div className="flex flex-col items-start gap-5 md:flex-row">
      {open ? (
        <aside className="w-full shrink-0 rounded-2xl border border-zinc-800
            bg-zinc-950/90 p-4 shadow-lg shadow-black/30 will-change-transform
            md:sticky md:top-[81px] md:max-h-[calc(100vh-105px)] md:w-64
            md:overflow-y-auto">
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
            {selects.map((s) => {
              const opts =
                s.key === "city" && citiesByCountry && current.country
                  ? (citiesByCountry[current.country] ?? [])
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
            })}
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
      ) : (
        <button onClick={() => toggle(true)} title="Show filters"
            className="flex shrink-0 items-center gap-2 rounded-xl border
                border-zinc-800 bg-zinc-950/90 px-3.5 py-2.5 text-[13px]
                font-medium text-zinc-300 shadow-lg shadow-black/30
                transition will-change-transform hover:border-amber-500/50
                hover:text-amber-300 md:sticky md:top-[81px]">
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

      <div className="min-w-0 flex-1">
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
