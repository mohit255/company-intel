import Link from "next/link";
import { JobCard, NewsCard } from "@/components/Cards";
import IndustryChips from "@/components/IndustryChips";
import StatsTiles from "@/components/StatsTiles";
import { getJobs, getNews } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ items: news }, { items: jobs }] = await Promise.all([
    getNews({ limit: 6 }),
    getJobs({ limit: 6 }),
  ]);

  return (
    <div className="space-y-16 pt-16">
      <section className="space-y-8 text-center">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 mx-auto
              h-64 w-64 rounded-full
              bg-[radial-gradient(ellipse_at_center,theme(colors.amber.500/10),transparent_70%)]
              blur-3xl" />
          <h1 className="relative mx-auto max-w-3xl font-serif text-3xl
              font-bold leading-tight tracking-tight text-zinc-50
              sm:text-5xl lg:text-6xl">
            Intelligence on the world&apos;s{" "}
            <span className="bg-gradient-to-r from-amber-300 to-orange-500
                bg-clip-text text-transparent">
              top companies
            </span>
          </h1>
        </div>
        <p className="mx-auto max-w-2xl text-lg text-zinc-400">
          Fresh news, job openings and product pricing — scraped from public
          sources, filterable by industry, company, country and city.
        </p>
        <StatsTiles />
      </section>

      <section className="space-y-4">
        <h2 className="text-center text-sm font-bold uppercase
            tracking-widest text-zinc-400">
          Browse by industry
        </h2>
        <IndustryChips />
      </section>

      <Section title="Latest news" href="/news">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => <NewsCard key={n.link} item={n} />)}
        </div>
      </Section>

      <Section title="Open roles" href="/jobs">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((j) => <JobCard key={j.url} item={j} />)}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title, href, children,
}: {
  title: string; href: string; children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-3xl font-bold text-zinc-50">{title}</h2>
        <Link href={href}
              className="text-sm text-amber-400 hover:underline
                  underline-offset-4">
          View all →
        </Link>
      </div>
      {children}
    </section>
  );
}
