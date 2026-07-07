import type { Metadata } from "next";
import DatasetCount from "@/components/DatasetCount";
import FilterBar from "@/components/FilterBar";
import InfiniteList from "@/components/InfiniteList";
import { getJobs } from "@/lib/queries";

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
  const scope = [str(sp.company), str(sp.field), str(sp.city),
    str(sp.country)].filter(Boolean).join(" · ");
  return {
    title: scope ? `${scope} — Jobs` : "Jobs",
    description: `Open roles${scope ? ` (${scope})` : ""} at the world's top
        companies, filterable by country and city.`,
  };
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const filters = {
    field: str(sp.field),
    company: str(sp.company),
    country: str(sp.country),
    city: str(sp.city),
    q: str(sp.q),
  };
  const { items, total } = await getJobs(filters);

  return (
    <div className="space-y-8 pt-10">
      <header className="relative overflow-hidden rounded-2xl border
          border-zinc-800 bg-zinc-900/50 px-5 py-6 sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute -right-10 -top-10
            h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <h1 className="font-serif text-3xl font-bold text-zinc-50
            sm:text-4xl">Jobs</h1>
        <DatasetCount kind="jobs" />
      </header>

      <FilterBar kind="jobs" current={filters} resultCount={total}>
        {total ? (
          <InfiniteList key={JSON.stringify(filters)} kind="jobs"
              initialItems={items} total={total} filters={filters} />
        ) : (
          <p className="py-24 text-center text-zinc-500">
            No openings match these filters.
          </p>
        )}
      </FilterBar>
    </div>
  );
}
