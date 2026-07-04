"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/news", label: "News" },
  { href: "/jobs", label: "Jobs" },
  { href: "/products", label: "Products" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2 text-sm">
      {LINKS.map((l) => {
        const active = pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-full px-3.5 py-1.5 transition ${
              active
                ? "bg-amber-500/15 font-semibold text-amber-300"
                : "text-zinc-400 hover:text-amber-300"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
