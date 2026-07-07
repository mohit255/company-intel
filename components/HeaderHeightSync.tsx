"use client";

import { useEffect } from "react";

/* Keeps the --header-h CSS custom property in sync with the real rendered
   height of the <header>. The header's height is not static: MarketTicker
   is an async server component that streams in after initial paint (adding
   ~36-40px when there's ticker-worthy news), and the nav row can wrap on
   narrow viewports or when the mobile menu is open. Anything that reads
   --header-h (e.g. FilterBar's sticky offset) needs this to stay accurate
   for the lifetime of the page, not just on first paint. */

export default function HeaderHeightSync() {
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;

    function apply() {
      const height = header!.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--header-h", `${height}px`);
    }

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(header);

    return () => observer.disconnect();
  }, []);

  return null;
}
