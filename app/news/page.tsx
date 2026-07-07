import type { Metadata } from "next";
import DatasetCount from "@/components/DatasetCount";
import FilterBar from "@/components/FilterBar";
import InfiniteList from "@/components/InfiniteList";
import { getNews, TOPIC_LABELS } from "@/lib/queries";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function str(v: string | string[] | undefined) {
  return typeof v === "string" ? v : "";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const scope = [str(sp.company), str(sp.field), str(sp.source),
    TOPIC_LABELS[str(sp.topic)]].filter(Boolean).join(" · ");
  return {
    title: scope ? `${scope} — News` : "News",
    description: `Latest scraped news, stock updates and IPO coverage
        ${scope ? ` about ${scope}` : ""} from the world's top companies.`,
  };
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const filters = {
    field: str(sp.field),
    company: str(sp.company),
    source: str(sp.source),
    topic: str(sp.topic),
    q: str(sp.q),
  };
  const { items, total } = await getNews(filters);

  return (
    <div className="space-y-8 pt-10">
      <header className="relative overflow-hidden rounded-2xl border
          border-zinc-800 bg-zinc-900/50 px-5 py-6 sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute -right-10 -top-10
            h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <h1 className="font-serif text-3xl font-bold text-zinc-50
            sm:text-4xl">{sp.topic && TOPIC_LABELS[str(sp.topic)] ? TOPIC_LABELS[str(sp.topic)] : ""} News</h1>
        <DatasetCount kind="news" />
      </header>

      <FilterBar kind="news" current={filters} resultCount={total}>
        {total ? (
          <InfiniteList key={JSON.stringify(filters)} kind="news"
              initialItems={items} total={total} filters={filters} />
        ) : (
          <Empty />
        )}
      </FilterBar>
    </div>
  );
}

function Empty() {
  return (
    <p className="py-24 text-center text-zinc-500">
      No articles match these filters.
    </p>
  );
}
