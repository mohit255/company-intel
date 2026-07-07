import { pool } from "./db";

/* Self-contained analytics: one events table, created lazily once per
   server boot so the site works even on a fresh database. */

/* Creating this table requires CREATE privilege on schema `public` for
   the DB user in DATABASE_URL — on Postgres 15+ this is NOT granted by
   default (same root cause as the scraper's InsufficientPrivilege error).
   Fix by granting/transferring public schema ownership to the app user,
   or by having an admin pre-create this table once and granting the app
   user only SELECT/INSERT/UPDATE/DELETE on it afterward. */
const SCHEMA = `
CREATE TABLE IF NOT EXISTS analytics_events (
  id         BIGSERIAL PRIMARY KEY,
  type       TEXT NOT NULL,
  page       TEXT,
  path       TEXT,
  field      TEXT,
  company    TEXT,
  topic      TEXT,
  kind       TEXT,
  title      TEXT,
  url        TEXT,
  visitor    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ae_type_idx    ON analytics_events (type);
CREATE INDEX IF NOT EXISTS ae_page_idx    ON analytics_events (page);
CREATE INDEX IF NOT EXISTS ae_created_idx ON analytics_events (created_at);
`;

let ready: Promise<void> | null = null;
function ensureTable() {
  if (!ready) {
    ready = pool.query(SCHEMA).then(
      () => undefined,
      (err) => {
        ready = null;
        console.error("[analytics] schema setup failed:", err);
        throw err;
      },
    );
  }
  return ready;
}

const clip = (v: unknown, n: number) =>
  typeof v === "string" ? v.slice(0, n) : null;

export async function recordEvent(raw: Record<string, unknown>) {
  await ensureTable();
  const type = raw.type === "click" ? "click" : "pageview";
  await pool.query(
    `INSERT INTO analytics_events
       (type, page, path, field, company, topic, kind, title, url, visitor)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      type,
      clip(raw.page, 40),
      clip(raw.path, 300),
      clip(raw.field, 80),
      clip(raw.company, 120),
      clip(raw.topic, 40),
      clip(raw.kind, 20),
      clip(raw.title, 300),
      clip(raw.url, 600),
      clip(raw.visitor, 64),
    ],
  );
}

export type Stats = {
  totals: { views: number; visitors: number; clicks: number };
  last7: { views: number; visitors: number; clicks: number };
  byPage: { page: string; views: number; visitors: number }[];
  byCategory: { field: string; events: number }[];
  topNews: { title: string; company: string | null; clicks: number }[];
  topJobs: { title: string; company: string | null; clicks: number }[];
  topCompanies: { company: string; clicks: number }[];
  daily: { day: string; views: number }[];
};

export async function getStats(): Promise<Stats> {
  await ensureTable();
  const [totals, last7, byPage, byCategory, topNews, topJobs,
    topCompanies, daily] = await Promise.all([
    pool.query(`SELECT
        COUNT(*) FILTER (WHERE type = 'pageview')::int AS views,
        COUNT(DISTINCT visitor)::int                   AS visitors,
        COUNT(*) FILTER (WHERE type = 'click')::int    AS clicks
      FROM analytics_events`),
    pool.query(`SELECT
        COUNT(*) FILTER (WHERE type = 'pageview')::int AS views,
        COUNT(DISTINCT visitor)::int                   AS visitors,
        COUNT(*) FILTER (WHERE type = 'click')::int    AS clicks
      FROM analytics_events
      WHERE created_at > now() - interval '7 days'`),
    pool.query(`SELECT COALESCE(page, 'other') AS page,
        COUNT(*)::int AS views, COUNT(DISTINCT visitor)::int AS visitors
      FROM analytics_events WHERE type = 'pageview'
      GROUP BY 1 ORDER BY views DESC`),
    pool.query(`SELECT field, COUNT(*)::int AS events
      FROM analytics_events
      WHERE field IS NOT NULL AND field <> ''
      GROUP BY field ORDER BY events DESC LIMIT 12`),
    pool.query(`SELECT title, MAX(company) AS company, COUNT(*)::int AS clicks
      FROM analytics_events
      WHERE type = 'click' AND kind = 'news' AND title IS NOT NULL
      GROUP BY title ORDER BY clicks DESC LIMIT 10`),
    pool.query(`SELECT title, MAX(company) AS company, COUNT(*)::int AS clicks
      FROM analytics_events
      WHERE type = 'click' AND kind = 'job' AND title IS NOT NULL
      GROUP BY title ORDER BY clicks DESC LIMIT 10`),
    pool.query(`SELECT company, COUNT(*)::int AS clicks
      FROM analytics_events
      WHERE type = 'click' AND company IS NOT NULL AND company <> ''
      GROUP BY company ORDER BY clicks DESC LIMIT 10`),
    pool.query(`SELECT to_char(d, 'DD Mon') AS day,
        COALESCE(v.views, 0)::int AS views
      FROM generate_series(current_date - 13, current_date, '1 day') AS d
      LEFT JOIN (
        SELECT created_at::date AS day, COUNT(*) AS views
        FROM analytics_events WHERE type = 'pageview'
          AND created_at > current_date - 14
        GROUP BY 1
      ) v ON v.day = d
      ORDER BY d`),
  ]);
  return {
    totals: totals.rows[0],
    last7: last7.rows[0],
    byPage: byPage.rows,
    byCategory: byCategory.rows,
    topNews: topNews.rows,
    topJobs: topJobs.rows,
    topCompanies: topCompanies.rows,
    daily: daily.rows,
  };
}
