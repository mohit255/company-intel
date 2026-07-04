"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/* Fire-and-forget analytics. sendBeacon runs off the critical path — it
   never blocks rendering, navigation, or scrolling. */

function visitorId() {
  try {
    let id = localStorage.getItem("ci-visitor");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("ci-visitor", id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

function send(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify({ ...payload, visitor: visitorId() });
    if (!navigator.sendBeacon?.("/api/track", body)) {
      fetch("/api/track", { method: "POST", body, keepalive: true })
        .catch(() => {});
    }
  } catch {
    // analytics must never throw
  }
}

function pageName(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/news")) return "news";
  if (pathname.startsWith("/jobs")) return "jobs";
  if (pathname.startsWith("/products")) return "products";
  if (pathname.startsWith("/stats")) return "stats";
  return "other";
}

export default function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // one pageview per route/filter change
  useEffect(() => {
    if (pathname.startsWith("/stats")) return; // don't count the admin panel
    send({
      type: "pageview",
      page: pageName(pathname),
      path: pathname + (searchParams.size ? `?${searchParams}` : ""),
      field: searchParams.get("field") ?? "",
      company: searchParams.get("company") ?? "",
      topic: searchParams.get("topic") ?? "",
    });
  }, [pathname, searchParams]);

  // delegated click tracking for card links (news / job / product)
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as Element).closest?.("a[data-track]");
      if (!(a instanceof HTMLAnchorElement)) return;
      send({
        type: "click",
        kind: a.dataset.track,
        title: a.dataset.title,
        company: a.dataset.company,
        field: a.dataset.field,
        url: a.href,
        page: pageName(location.pathname),
      });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () =>
      document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
