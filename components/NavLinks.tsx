"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/news", label: "News", match: (p: string, s: URLSearchParams) =>
      p.startsWith("/news") && !s.get("topic") },
  { href: "/jobs", label: "Jobs", match: (p: string) => p.startsWith("/jobs") },
  { href: "/products", label: "Products", match: (p: string) =>
      p.startsWith("/products") },
];

const TOPIC_LINKS = [
  { href: "/news?topic=stock", label: "Stocks", topic: "stock",
    style: "text-emerald-400 hover:text-emerald-300",
    activeStyle: "bg-emerald-500/15 font-semibold text-emerald-300" },
  { href: "/news?topic=market", label: "Markets", topic: "market",
    style: "text-blue-400 hover:text-blue-300",
    activeStyle: "bg-blue-500/15 font-semibold text-blue-300" },
  { href: "/news?topic=ipo", label: "IPO", topic: "ipo",
    style: "text-violet-400 hover:text-violet-300",
    activeStyle: "bg-violet-500/15 font-semibold text-violet-300" },
];

export default function NavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const aboutActive = pathname.startsWith("/about");

  // close on navigation
  useEffect(() => { setOpen(false); }, [pathname, searchParams]);

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Desktop nav ── */}
      <nav className="hidden flex-1 items-center gap-1 text-sm md:flex">
        {LINKS.map((l) => {
          const active = l.match(pathname, searchParams);
          return (
            <Link key={l.href} href={l.href}
                className={`rounded-full px-3.5 py-1.5 transition ${
                  active
                    ? "bg-amber-500/15 font-semibold text-amber-300"
                    : "text-zinc-400 hover:text-amber-300"
                }`}>
              {l.label}
            </Link>
          );
        })}

        <span className="mx-1 h-4 w-px bg-zinc-700" />

        {TOPIC_LINKS.map((l) => {
          const active = pathname.startsWith("/news") &&
            searchParams.get("topic") === l.topic;
          return (
            <Link key={l.href} href={l.href}
                className={`rounded-full px-3.5 py-1.5 transition ${
                  active ? l.activeStyle : l.style
                }`}>
              {l.label}
            </Link>
          );
        })}

        <Link href="/about" className={`ml-auto rounded-full px-3.5 py-1.5
            transition ${aboutActive
              ? "bg-amber-500/15 font-semibold text-amber-300"
              : "text-zinc-400 hover:text-amber-300"}`}>
          About
        </Link>
      </nav>

      {/* ── Mobile hamburger button ── */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        className="ml-auto flex h-9 w-9 items-center justify-center
            rounded-lg border border-zinc-800 text-zinc-400
            transition hover:border-zinc-600 hover:text-zinc-200 md:hidden"
      >
        {open ? (
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
        )}
      </button>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-b
            border-zinc-800 bg-zinc-950 px-4 pb-6 pt-4 md:hidden">

          <div className="space-y-1">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase
                tracking-widest text-zinc-600">
              Browse
            </p>
            {LINKS.map((l) => {
              const active = l.match(pathname, searchParams);
              return (
                <Link key={l.href} href={l.href}
                    className={`block rounded-xl px-3 py-2.5 text-sm
                        font-medium transition ${
                      active
                        ? "bg-amber-500/15 text-amber-300"
                        : "text-zinc-300 hover:bg-zinc-900 hover:text-amber-300"
                    }`}>
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div className="my-4 h-px bg-zinc-800" />

          <div className="space-y-1">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase
                tracking-widest text-zinc-600">
              Markets
            </p>
            {TOPIC_LINKS.map((l) => {
              const active = pathname.startsWith("/news") &&
                searchParams.get("topic") === l.topic;
              return (
                <Link key={l.href} href={l.href}
                    className={`block rounded-xl px-3 py-2.5 text-sm
                        font-medium transition ${
                      active ? l.activeStyle
                        : `${l.style} hover:bg-zinc-900`
                    }`}>
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div className="my-4 h-px bg-zinc-800" />

          <Link href="/about"
              className={`block rounded-xl px-3 py-2.5 text-sm font-medium
                  transition ${aboutActive
                    ? "bg-amber-500/15 text-amber-300"
                    : "text-zinc-300 hover:bg-zinc-900 hover:text-amber-300"
                  }`}>
            About
          </Link>
        </div>
      )}
    </>
  );
}
