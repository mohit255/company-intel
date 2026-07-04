import type { Metadata } from "next";
import FilterBar from "@/components/FilterBar";
import InfiniteList from "@/components/InfiniteList";
import { getJobs, getMeta } from "@/lib/queries";

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
  const [meta, { items, total }] = await Promise.all([
    getMeta(), getJobs(filters)]);

  return (
    <div className="space-y-8 pt-10">
      <header className="relative overflow-hidden rounded-2xl border
          border-zinc-800 bg-zinc-900/50 px-7 py-8">
        <div className="pointer-events-none absolute -right-10 -top-10
            h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <h1 className="font-serif text-4xl font-bold text-zinc-50">Jobs</h1>
        <p className="mt-1 text-zinc-400">
          {meta.counts.jobs} openings in {meta.countries.length} countries —
          straight from company career APIs.
        </p>
      </header>

      <FilterBar
        fields={meta.fields}
        selects={[
          { key: "company", label: "Company", options: meta.companies },
          {
            key: "country",
            label: "Country",
            options: meta.countries.map((c) => ({
              value: c.country,
              label: `${c.country} (${c.jobs})`,
            })),
          },
          { key: "city", label: "City", options: meta.allCities },
        ]}
        current={filters}
        citiesByCountry={meta.citiesByCountry}
        resultCount={total}
      >
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
