"use client";

import { useEffect, useRef, useState } from "react";

type Option = { value: string; label: string };

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  block = false,
}: {
  label: string;
  options: (string | Option)[];
  value: string;
  onChange: (value: string) => void;
  block?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const opts: Option[] = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o);
  const selected = opts.find((o) => o.value === value);
  const filtered = query
    ? opts.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : opts;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else setQuery("");
  }, [open]);

  function pick(v: string) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative ${block ? "w-full" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex h-9 items-center gap-1.5 rounded-lg border px-3
            text-[13px] transition focus:outline-none focus-visible:ring-2
            focus-visible:ring-amber-500/40 ${
          block ? "w-full" : ""} ${
          value
            ? "border-amber-500/60 bg-amber-500/10"
            : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
        }`}
      >
        <span className={value ? "text-amber-400/80" : "text-zinc-500"}>
          {label}
        </span>
        <span className={`truncate font-medium ${
            value ? "text-amber-300" : "text-zinc-300"}`}>
          {selected?.label ?? "All"}
        </span>
        <svg className={`ml-auto h-3.5 w-3.5 shrink-0 transition-transform ${
              open ? "rotate-180" : ""} ${
              value ? "text-amber-400/70" : "text-zinc-500"}`}
             viewBox="0 0 16 16" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className={`absolute left-0 top-full z-30 mt-1.5 ${
              block ? "w-full" : "w-64"}
            overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-900
            shadow-2xl shadow-black/60 ring-1 ring-black/40`}>
          <div className="relative border-b border-zinc-800">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5
                w-3.5 -translate-y-1/2 text-zinc-500" viewBox="0 0 16 16"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round">
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L14 14" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtered.length > 0)
                  pick(filtered[0].value);
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder={`Search ${label.toLowerCase()}…`}
              className="w-full bg-transparent py-2.5 pl-9 pr-3 text-[13px]
                  text-zinc-200 outline-none placeholder:text-zinc-500"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1 text-[13px]">
            <li>
              <button type="button" onClick={() => pick("")}
                  className="flex w-full items-center justify-between px-3.5
                      py-2 text-left text-zinc-400 hover:bg-zinc-800/80">
                All
                {!value && <Check />}
              </button>
            </li>
            {filtered.map((o) => (
              <li key={o.value}>
                <button type="button" onClick={() => pick(o.value)}
                    className={`flex w-full items-center justify-between
                        px-3.5 py-2 text-left transition
                        hover:bg-zinc-800/80 ${
                      o.value === value
                        ? "font-medium text-amber-300"
                        : "text-zinc-200"
                    }`}>
                  {o.label}
                  {o.value === value && <Check />}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3.5 py-3 text-center text-zinc-500">
                No matches
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function Check() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-amber-400" viewBox="0 0 16 16"
         fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5l3.5 3.5L13 5" />
    </svg>
  );
}
