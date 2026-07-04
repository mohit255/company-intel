import { memo } from "react";
import type { JobItem, NewsItem, ProductItem } from "@/lib/queries";

/** Favicon/logo for a site via Google's favicon service. */
export function logoUrl(site: string | null | undefined, size = 64) {
  if (!site) return null;
  try {
    const domain = new URL(site).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
  } catch {
    return null;
  }
}

export function fieldColor(field: string) {
  let h = 0;
  for (const c of field) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `hsl(${h} 60% 55%)`;
}

export function FieldTag({ field }: { field: string }) {
  const color = fieldColor(field);
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ color, backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}
    >
      {field}
    </span>
  );
}

/** Banner image on top of a card; falls back to the company logo on a
    gradient so every card keeps the same shape. */
function CardImage({
  src, logo, alt,
}: {
  src: string | null; logo: string | null; alt: string;
}) {
  if (src) {
    return (
      <div className="flex h-40 w-full shrink-0 items-center justify-center
          overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" decoding="async"
             className="max-h-full max-w-full object-contain" />
      </div>
    );
  }
  return (
    <div className="flex h-40 w-full shrink-0 items-center justify-center
        rounded-xl border border-zinc-800 bg-gradient-to-br
        from-zinc-800/70 via-zinc-900 to-zinc-950">
      {logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={alt} loading="lazy" decoding="async"
             className="h-14 w-14 rounded-2xl border border-zinc-700
                 bg-zinc-900 p-2" />
      )}
    </div>
  );
}

/* content-visibility lets the browser skip painting off-screen cards, which
   is most of the work during fast scrolling of a long list */
const cardClass = `group flex flex-col gap-2.5 rounded-2xl border
    border-zinc-800 bg-zinc-900/60 p-5 transition-colors
    [contain-intrinsic-size:auto_380px] [content-visibility:auto]
    hover:border-amber-500/40 hover:bg-zinc-900`;

const TOPIC_STYLES: Record<string, { label: string; cls: string }> = {
  stock: {
    label: "📈 Stock",
    cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  ipo: {
    label: "🚀 IPO",
    cls: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  },
  market: {
    label: "📊 Market",
    cls: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  },
};

function TopicBadge({ topic }: { topic: string }) {
  const s = TOPIC_STYLES[topic];
  if (!s) return null;
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[11px]
        font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}

export const NewsCard = memo(function NewsCard({
  item,
}: {
  item: NewsItem;
}) {
  const icon = logoUrl(item.source_url) ?? logoUrl(item.company_site);
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer"
       className={cardClass}>
      <CardImage src={item.company_image}
                 logo={logoUrl(item.company_site, 128)} alt={item.company} />
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5 rounded-md border
            border-zinc-700 px-2 py-0.5 text-zinc-400">
          {icon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={icon} alt="" loading="lazy"
                 className="h-4 w-4 rounded-sm" />
          )}
          {item.source || "news"}
        </span>
        <TopicBadge topic={item.topic} />
        {item.published && <time>{item.published}</time>}
      </div>
      <h3 className="line-clamp-3 min-h-[75px] font-serif text-lg
          leading-snug text-zinc-100 transition group-hover:text-amber-300">
        {item.title}
      </h3>
      <div className="mt-auto flex items-center gap-2 text-xs text-zinc-400">
        <FieldTag field={item.field} />
        {item.company}
        <span className="ml-auto text-zinc-600">Added {item.added}</span>
      </div>
    </a>
  );
});

export const JobCard = memo(function JobCard({ item }: { item: JobItem }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer"
       className={cardClass}>
      <CardImage src={item.company_image}
                 logo={logoUrl(item.company_site, 128)} alt={item.company} />
      <h3 className="line-clamp-2 min-h-[50px] font-serif text-lg
          leading-snug text-zinc-100 transition group-hover:text-amber-300">
        {item.title}
      </h3>
      <div className="flex flex-wrap items-center gap-2 text-xs
          text-zinc-400">
        <FieldTag field={item.field} />
        <span className="font-medium text-zinc-300">{item.company}</span>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 text-xs
          text-zinc-500">
        <span>
          {(item.places || item.location) &&
            `📍 ${item.places || item.location}`}
        </span>
        <span className="text-zinc-600">Added {item.added}</span>
      </div>
    </a>
  );
});

export const ProductCard = memo(function ProductCard({
  item,
}: {
  item: ProductItem;
}) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer"
       className={cardClass}>
      <CardImage src={item.image ?? item.company_image}
                 logo={logoUrl(item.company_site, 128)}
                 alt={item.page_title ?? item.company} />
      <div className="flex items-center gap-2 text-xs">
        <FieldTag field={item.field} />
        <span className="font-medium text-zinc-300">{item.company}</span>
      </div>
      <h3 className="line-clamp-2 min-h-[50px] font-serif text-lg
          leading-snug text-zinc-100 transition group-hover:text-amber-300">
        {item.page_title || item.url}
      </h3>
      {item.prices.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.prices.slice(0, 8).map((p) => (
            <span key={p} className="rounded-md bg-emerald-500/10 px-2 py-0.5
                text-xs font-medium text-emerald-400">{p}</span>
          ))}
        </div>
      )}
      {item.snippet && (
        <p className="line-clamp-2 text-[13px] leading-relaxed
            text-zinc-500">
          {item.snippet}…
        </p>
      )}
      <div className="mt-auto text-right text-xs text-zinc-600">
        Updated {item.added}
      </div>
    </a>
  );
});
