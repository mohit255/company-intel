import { PAGE_SIZE } from "./constants";
import { pool } from "./db";

export { PAGE_SIZE, TOPIC_LABELS } from "./constants";

export type NewsItem = {
  company: string; field: string; title: string; link: string;
  source: string | null; published: string | null; added: string;
  source_url: string | null; company_site: string | null;
  company_image: string | null; topic: string;
};
export type JobItem = {
  company: string; field: string; title: string; url: string;
  location: string | null; places: string | null; added: string;
  company_site: string | null; company_image: string | null;
};
export type ProductItem = {
  company: string; field: string; url: string; page_title: string | null;
  prices: string[]; snippet: string | null; added: string;
  image: string | null; company_site: string | null;
  company_image: string | null;
};
export type Meta = {
  counts: { news: number; jobs: number; products: number };
  fields: string[];
  companies: string[];
  sources: string[];
  topics: string[];
  countries: { country: string; jobs: number }[];
  citiesByCountry: Record<string, string[]>;
  allCities: string[];
};

const MAX_LIMIT = 200;

function where(conds: string[]) {
  return conds.length ? ` WHERE ${conds.join(" AND ")}` : "";
}

/* COUNT(*) OVER() gives the total matching rows on every row; strip it
   from the items after reading it so pages can show "x of y". */
function unwrap<T>(rows: (T & { total: number })[]) {
  const total = rows[0]?.total ?? 0;
  return { items: rows.map(({ total: _, ...r }) => r as T), total };
}

export async function getMeta(): Promise<Meta> {
  const [counts, fields, companies, sources, topics, countries, cities] =
    await Promise.all([
      pool.query(`SELECT
        (SELECT COUNT(*) FROM news)     AS news,
        (SELECT COUNT(*) FROM jobs)     AS jobs,
        (SELECT COUNT(*) FROM products) AS products`),
      pool.query(`SELECT field FROM news UNION SELECT field FROM jobs
                  UNION SELECT field FROM products ORDER BY 1`),
      pool.query(`SELECT company FROM news UNION SELECT company FROM jobs
                  UNION SELECT company FROM products ORDER BY 1`),
      pool.query(`SELECT DISTINCT source FROM news
                  WHERE source IS NOT NULL AND source <> '' ORDER BY 1`),
      pool.query(`SELECT DISTINCT topic FROM news ORDER BY 1`),
      pool.query(`SELECT country, COUNT(DISTINCT job_id)::int AS jobs
                  FROM job_locations WHERE country IS NOT NULL
                  GROUP BY country ORDER BY jobs DESC, country`),
      pool.query(`SELECT DISTINCT country, city FROM job_locations
                  WHERE city IS NOT NULL ORDER BY city`),
    ]);

  const citiesByCountry: Record<string, string[]> = {};
  const allCities = new Set<string>();
  for (const r of cities.rows) {
    allCities.add(r.city);
    const key = r.country ?? "Other";
    (citiesByCountry[key] ??= []).push(r.city);
  }

  return {
    counts: {
      news: Number(counts.rows[0].news),
      jobs: Number(counts.rows[0].jobs),
      products: Number(counts.rows[0].products),
    },
    fields: fields.rows.map((r) => r.field),
    companies: companies.rows.map((r) => r.company),
    sources: sources.rows.map((r) => r.source),
    topics: topics.rows.map((r) => r.topic),
    countries: countries.rows,
    citiesByCountry,
    allCities: [...allCities].sort(),
  };
}

export async function getNews(f: {
  field?: string; company?: string; source?: string; topic?: string;
  q?: string; limit?: number; offset?: number;
}): Promise<{ items: NewsItem[]; total: number }> {
  const conds: string[] = [];
  const params: unknown[] = [];
  const add = (v: unknown, sql: string) => {
    if (v) { params.push(v); conds.push(sql.replace("?", `$${params.length}`)); }
  };
  add(f.field, "n.field = ?");
  add(f.company, "n.company = ?");
  add(f.source, "n.source = ?");
  add(f.topic, "n.topic = ?");
  if (f.q) {
    params.push(f.q);
    conds.push(`(n.title ILIKE '%' || $${params.length} || '%'
                 OR n.search @@ plainto_tsquery('english', $${params.length}))`);
  }
  params.push(Math.min(f.limit ?? PAGE_SIZE, MAX_LIMIT));
  const lim = params.length;
  params.push(f.offset ?? 0);
  const { rows } = await pool.query(
    `SELECT n.company, n.field, n.title, n.link, n.source, n.source_url,
            n.topic, c.website AS company_site, c.image AS company_image,
            to_char(n.published, 'DD Mon YYYY') AS published,
            to_char(n.fetched_at, 'DD Mon YYYY') AS added,
            COUNT(*) OVER()::int AS total
     FROM news n LEFT JOIN companies c ON c.name = n.company${where(conds)}
     ORDER BY n.published DESC NULLS LAST, n.id DESC
     LIMIT $${lim} OFFSET $${params.length}`, params);
  return unwrap<NewsItem>(rows);
}

export async function getJobs(f: {
  field?: string; company?: string; country?: string; city?: string;
  q?: string; limit?: number; offset?: number;
}): Promise<{ items: JobItem[]; total: number }> {
  const conds: string[] = [];
  const params: unknown[] = [];
  const add = (v: unknown, sql: string) => {
    if (v) { params.push(v); conds.push(sql.replace("?", `$${params.length}`)); }
  };
  add(f.field, "j.field = ?");
  add(f.company, "j.company = ?");
  add(f.country, `EXISTS (SELECT 1 FROM job_locations l
                  WHERE l.job_id = j.id AND l.country = ?)`);
  add(f.city, `EXISTS (SELECT 1 FROM job_locations l
               WHERE l.job_id = j.id AND l.city = ?)`);
  add(f.q, "j.title ILIKE '%' || ? || '%'");
  params.push(Math.min(f.limit ?? PAGE_SIZE, MAX_LIMIT));
  const lim = params.length;
  params.push(f.offset ?? 0);
  const { rows } = await pool.query(
    `SELECT j.company, j.field, j.title, j.url, j.location,
            c.website AS company_site, c.image AS company_image,
            to_char(j.fetched_at, 'DD Mon YYYY') AS added,
            (SELECT string_agg(DISTINCT COALESCE(l.city, l.country), ' · ')
             FROM job_locations l WHERE l.job_id = j.id) AS places,
            COUNT(*) OVER()::int AS total
     FROM jobs j LEFT JOIN companies c ON c.name = j.company${where(conds)}
     ORDER BY j.fetched_at DESC, j.company, j.title, j.id
     LIMIT $${lim} OFFSET $${params.length}`, params);
  return unwrap<JobItem>(rows);
}

export async function getProducts(f: {
  field?: string; company?: string; limit?: number; offset?: number;
}): Promise<{ items: ProductItem[]; total: number }> {
  const conds: string[] = [];
  const params: unknown[] = [];
  if (f.field) { params.push(f.field); conds.push(`p.field = $${params.length}`); }
  if (f.company) { params.push(f.company); conds.push(`p.company = $${params.length}`); }
  params.push(Math.min(f.limit ?? PAGE_SIZE, MAX_LIMIT));
  const lim = params.length;
  params.push(f.offset ?? 0);
  const { rows } = await pool.query(
    `SELECT p.company, p.field, p.url, p.page_title, p.prices, p.image,
            c.website AS company_site, c.image AS company_image,
            left(p.text_snippet, 200) AS snippet,
            to_char(p.fetched_at, 'DD Mon YYYY') AS added,
            COUNT(*) OVER()::int AS total
     FROM products p LEFT JOIN companies c ON c.name = p.company
     ${where(conds)} ORDER BY p.company
     LIMIT $${lim} OFFSET $${params.length}`, params);
  return unwrap<ProductItem>(rows);
}
