import type { Metadata } from "next";
import FilterBar from "@/components/FilterBar";
import InfiniteList from "@/components/InfiniteList";
import { getMeta, getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function str(v: string | string[] | undefined) {
  return typeof v === "string" ? v : "";
}

export const metadata: Metadata = {
  title: "Products & Pricing",
  description:
    "Scraped product and pricing pages from the world's top companies.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const filters = { field: str(sp.field), company: str(sp.company) };
  const [meta, { items, total }] = await Promise.all([
    getMeta(), getProducts(filters)]);

  return (
    <div className="space-y-8 pt-10">
      <header className="relative overflow-hidden rounded-2xl border
          border-zinc-800 bg-zinc-900/50 px-5 py-6 sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute -right-10 -top-10
            h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <h1 className="font-serif text-3xl font-bold text-zinc-50
            sm:text-4xl">
          Products &amp; Pricing
        </h1>
        <p className="mt-1 text-zinc-400">
          {meta.counts.products} product pages with extracted price points.
        </p>
      </header>

      <FilterBar
        fields={meta.fields}
        selects={[
          { key: "company", label: "Company", options: meta.companies },
        ]}
        current={filters}
        searchable={false}
        resultCount={total}
      >
        {total ? (
          <InfiniteList key={JSON.stringify(filters)} kind="products"
              initialItems={items} total={total} filters={filters} />
        ) : (
          <p className="py-24 text-center text-zinc-500">
            No product pages match these filters.
          </p>
        )}
      </FilterBar>
    </div>
  );
}
