import type { Metadata } from "next";
import FilterBar from "@/components/FilterBar";
import InfiniteList from "@/components/InfiniteList";
import { getMeta, getNews } from "@/lib/queries";

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
  const scope = [str(sp.company), str(sp.field), str(sp.source)]
    .filter(Boolean).join(" · ");
  return {
    title: scope ? `${scope} — News` : "News",
    description: `Latest scraped news${scope ? ` about ${scope}` : ""} from
        the world's top companies.`,
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
    q: str(sp.q),
  };
  const [meta, { items, total }] = await Promise.all([
    getMeta(), getNews(filters)]);

  return (
    <div className="space-y-8 pt-10">
      <header className="space-y-1">
        <h1 className="font-serif text-4xl font-bold text-zinc-50">News</h1>
        <p className="text-zinc-400">
          {meta.counts.news} articles from Google News, across{" "}
          {meta.fields.length} industries.
        </p>
      </header>

      <FilterBar
        fields={meta.fields}
        selects={[
          { key: "company", label: "Company", options: meta.companies },
          { key: "source", label: "Source", options: meta.sources },
        ]}
        current={filters}
        resultCount={total}
      >
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
