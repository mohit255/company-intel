# Company Intel

A Next.js site presenting company news, job listings, and product/pricing
data scraped by the sibling [`company-intel-scraper`](../company-intel-scraper)
project. This repo is a **read-only consumer** of the PostgreSQL database that
scraper populates — it never writes to `companies`, `news`, `jobs`, `products`,
or `job_locations`.

## Architecture in one paragraph

Every page's **primary, SEO-relevant content** — the news/job/product lists,
filtered results, the `/stats` dashboard — is fetched directly from Postgres
inside an async Server Component and rendered server-side (SSR), with zero API
round trip. This matters because these are the pages search engines crawl and
users share links to; filters live in the URL (`/jobs?country=India`), so every
filtered view is a real server-rendered, indexable page. Everything else —
header ticker, footer "top news" picks, filter-dropdown option lists, live
dataset counts, infinite-scroll continuation pages — is **not** SEO-relevant,
changes independently of navigation, and would otherwise mean re-querying
Postgres on every request just to paint chrome. So those pieces are `"use
client"` components that lazily `fetch()` a `/api/*` route after first paint.
Net effect: one Postgres round trip per page load for the content that matters
for crawlability, and cheap, cacheable client fetches for everything ancillary.

---

## Prerequisites

- Node.js 20+ (or Docker)
- An external PostgreSQL database, already created and populated by
  [`company-intel-scraper`](../company-intel-scraper) (this app does not run
  migrations or seed data for `companies`/`news`/`jobs`/`products`/`job_locations`)

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Example / default | Used by | Description |
|---|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:port/db_name` | `lib/db.ts` | Postgres connection string for the `pg.Pool`. Same physical database the scraper writes to. |
| `PORT` | `3000` | Next.js server | Port the server listens on. |
| `SITE_URL` | `http://localhost:3000` | `app/layout.tsx` (metadata), `app/robots.ts`, `app/sitemap.ts` | Public URL of the site, used to build absolute metadata/OG URLs and the sitemap/robots output. |
| `STATS_PASSWORD` | `change-me` | `app/stats/page.tsx`, `lib/statsAuth.ts` | Password gating the `/stats` analytics dashboard. **If unset**, `isStatsAuthed()` always returns `false` and the `/stats` login form is replaced with an "unconfigured" notice — the page can never be unlocked until this is set. |

Both `npm run dev` and `npm run start` load `.env.local` automatically (via
`dotenv-cli`); `npm run build` does **not** — see [Docker](#docker) below for
how the build stage gets around that.

---

## Setup & run

### Local (npm)

```bash
git clone <repo-url> && cd company-intel
cp .env.local.example .env.local   # fill in DATABASE_URL at minimum
npm install

npm run dev                        # development, hot reload — http://localhost:3000
# or
npm run build && npm start         # production build + start
```

Exact scripts (`package.json`):

| Script | Command | Notes |
|---|---|---|
| `dev` | `dotenv -e .env.local -- next dev` | Loads `.env.local` automatically |
| `build` | `next build` | Does **not** load `.env.local` — env vars must already be in the process environment (or use the Docker path, which copies the file in before building) |
| `start` | `dotenv -e .env.local -- next start` | Loads `.env.local` automatically |
| `lint` | `eslint` | |

### Docker

```bash
git clone <repo-url> && cd company-intel
cp .env.local.example .env.local   # fill in DATABASE_URL at minimum
docker compose up --build
```

- `docker-compose.yml` builds from the local `Dockerfile`, uses
  `network_mode: host` (no published port mapping — the app binds directly to
  the host's `PORT`), and loads env vars from `.env.local` via `env_file`.
- `Dockerfile` is a 4-stage multi-stage build (`node:24-alpine`):
  1. `deps` — `npm install`
  2. `builder` — copies source, then explicitly `COPY .env.local .env.local`
     (since `npm run build` doesn't load it itself) and runs `npm run build`
  3. `runner` — production image running as a non-root `nextjs` user, copying
     only `.next/standalone` + `.next/static` (enabled by `output: "standalone"`
     in `next.config.ts`), `CMD ["node", "server.js"]`, `EXPOSE 3000`

Stop with `docker compose down`. If a rebuild seems to be reusing a stale
layer (e.g. after a dependency bump), force a fully clean image build with
no Docker layer cache: `docker compose build --no-cache` (see
[Reloading & clearing caches](#reloading--clearing-caches) for the full
picture across dev/prod/Docker).

---

## Pages

| Route | Shows | Data-fetching model |
|---|---|---|
| `/` | Hero, hero stat tiles, industry pills, latest 6 news items, latest 6 open roles | **SSR**: `getNews({limit:6})` + `getJobs({limit:6})` called directly in the Server Component. Stat tiles and industry pills are client components that separately fetch `/api/meta`. |
| `/news` | Filtered/searchable news list (field, company, source, topic, full-text query) | **SSR** for the first page of results: `getNews(filters)` built from `searchParams`. Filter dropdown options and the dataset-count sentence are lazy client fetches (`/api/meta`); scrolling past the first page lazy-fetches `/api/news`. |
| `/jobs` | Filtered/searchable job list (field, company, country, city, query) | **SSR** for the first page: `getJobs(filters)`. Same client-side pattern as `/news` for filters, counts, and scroll-continuation. |
| `/products` | Filtered product/pricing list (field, company) | **SSR** for the first page: `getProducts(filters)`. Same client-side pattern for filters/counts/continuation. |
| `/about` | Static description of the app, its data sources, and features | No database call — content is hardcoded. Its sidebar (`AboutStats`) is a client component that fetches `/api/meta` for live numbers/links/industries. |
| `/stats` | Password-gated analytics dashboard (see [Analytics & `/stats`](#analytics--stats)) | **SSR**, once authenticated: `getStats()` called directly. Not indexed (`robots: { index: false }`, disallowed in `robots.ts`). |

`app/robots.ts` and `app/sitemap.ts` are generated, not static files:
`robots.ts` allows `/`, disallows `/api/` and `/stats`; `sitemap.ts` lists
`/`, `/news`, `/jobs`, `/products` (all built off `SITE_URL`).

---

## API routes

All routes call `lib/queries.ts` / `lib/analytics.ts` directly server-side.
None have auth beyond `/stats` and `/api/track` being disallowed for crawlers
in `robots.ts`'s `/api/` rule.

| Route | Method | Query params / body | Returns |
|---|---|---|---|
| `/api/news` | `GET` | `field, company, source, topic, q, limit, offset` | `{ items: NewsItem[], total: number }` |
| `/api/jobs` | `GET` | `field, company, country, city, q, limit, offset` | `{ items: JobItem[], total: number }` |
| `/api/products` | `GET` | `field, company, limit, offset` | `{ items: ProductItem[], total: number }` |
| `/api/meta` | `GET` | — | `Meta` object: dataset counts, distinct fields/companies/sources/topics, countries with job counts, cities by country — powers `useMeta()` |
| `/api/ticker` | `GET` | — | `TickerItem[]` — latest stock/market news for the header ticker |
| `/api/track` | `POST` | Raw JSON analytics event | Always `204 No Content`; failures are caught and logged server-side only, never surfaced to the client |

`limit` defaults to `PAGE_SIZE` (25) and is capped at `MAX_LIMIT` (200) inside
`lib/queries.ts`.

---

## Component architecture

Rather than 14 flat files, components group into four roles:

**Primary content (server-rendered, consumed by Server Component pages)**
- `Cards.tsx` — `NewsCard` / `JobCard` / `ProductCard` (+ `logoUrl()`,
  `fieldColor()`, `FieldTag`). Pure, props-driven, no `"use client"` — safe to
  render on the server, used everywhere items are listed.
- `Spinner.tsx` — plain SVG loader, no data dependency.

**Lazy client-side widgets (fetch their own data after first paint)**
- `MarketTicker.tsx` — scrolling ticker, `fetch("/api/ticker")`
- `Footer.tsx` — "Top News" / "Trending Articles" columns, direct
  `fetch("/api/news?...")` calls (not via `useMeta`)
- `StatsTiles.tsx`, `IndustryChips.tsx`, `AboutStats.tsx`, `DatasetCount.tsx` —
  all consume the shared `useMeta()` hook
- `InfiniteList.tsx` — seeded with SSR'd `initialItems`, then lazy-fetches
  `/api/{news,jobs,products}` for every subsequent page on scroll

**Filter UI**
- `FilterBar.tsx` — collapsible filter sidebar; reads `useMeta()` to populate
  dropdown options, writes filter state into the URL via `router.push`,
  persists open/closed state to `localStorage`
- `SearchableSelect.tsx` — generic searchable dropdown primitive used inside
  `FilterBar`, no data dependency of its own

**Chrome / layout**
- `NavLinks.tsx` — desktop nav + mobile drawer, pure routing state
- `HeaderHeightSync.tsx` — invisible; keeps a `--header-h` CSS var in sync via
  `ResizeObserver` since the ticker streams in after first paint

**Analytics**
- `Tracker.tsx` — invisible; fires pageview/click events (see below)

---

## The `useMeta()` hook

`lib/useMeta.ts` is a `"use client"` hook that wraps `fetch("/api/meta")`
behind a module-level singleton cache with a 60-second TTL and in-flight
promise dedup. It exists because five separate client components
(`StatsTiles`, `IndustryChips`, `AboutStats`, `DatasetCount`, `FilterBar`) all
need the same `Meta` shape (dataset counts, distinct fields/companies/
sources/topics, country/city lists) — without it, each would independently
fire its own `/api/meta` request on every page that renders more than one of
them. `useMeta()` ensures they share a single in-flight fetch and a warm
cache; its lazy `useState` initializer reads the still-valid cache
synchronously, so client-side navigations within the TTL window render with
no loading flash. It declares its own local `Meta` type (a mirror of the one
in `lib/queries.ts`, not imported from it) specifically so client bundles
never pull in `pg` via `lib/db.ts`.

---

## Analytics & `/stats`

**Tracking.** `Tracker.tsx` is mounted once in the root layout. It has no
visual output — it fires one pageview event per route/filter change (every
route except `/stats`) and listens for clicks on any `a[data-track]` element
(the attribute `Cards.tsx` puts on every news/job/product card). Events are
sent to `POST /api/track` via `navigator.sendBeacon`, falling back to
`fetch(..., { keepalive: true })`. A visitor ID (`crypto.randomUUID()`) is
generated once and cached in `localStorage["ci-visitor"]`. `/api/track`
always returns `204`, and swallows/logs any failure server-side — tracking is
explicitly designed to never break or slow down the site.

**Storage.** Events land in `analytics_events`, a table this app owns and
lazily creates itself (`CREATE TABLE IF NOT EXISTS` on server boot, see
[Relationship to the scraper](#relationship-to-company-intel-scraper)).
`recordEvent()` in `lib/analytics.ts` truncates each field to a fixed max
length before inserting and normalizes `type` to `"click"` or `"pageview"`.

**Dashboard.** `/stats` shows (via `getStats()`): total page views, unique
visitors, and card clicks (all-time and last 7 days); a 14-day daily-pageviews
bar chart; views by page; most-visited categories; top 10 most-clicked news
titles, job titles, and companies.

**Password protection.** Access is gated by an httpOnly cookie
(`stats-auth`), not a header or session store:
1. The page renders a login form bound to a `"use server"` Server Action
   (`login`, defined inline in `app/stats/page.tsx`).
2. On submit, it does a plain string comparison of the submitted password
   against `process.env.STATS_PASSWORD`.
3. On match, it sets the `stats-auth` cookie to `statsToken(password)` — a
   SHA-256 hash of `"company-intel-stats:" + password` — with `httpOnly: true,
   sameSite: "lax", maxAge: 30 days, path: "/stats"` — and redirects to
   `/stats`. On mismatch, it redirects to `/stats?error=1`.
4. On every request, `isStatsAuthed()` independently recomputes
   `statsToken(process.env.STATS_PASSWORD)` and compares it to the cookie
   value. This is stateless — there's no session table — so rotating
   `STATS_PASSWORD` immediately invalidates every previously issued cookie.
5. If `STATS_PASSWORD` is unset, authentication can never succeed (see the
   [environment variables table](#environment-variables) above).

`/stats` is also excluded from indexing (`metadata.robots = { index: false }`)
and disallowed in `robots.ts`.

---

## Reloading & clearing caches

When something looks stale after a code or data change, there are several
independent cache layers between Postgres and your screen. Know which one
you're actually fighting before reaching for a bigger hammer:

| Layer | Lives in | TTL / lifetime | Cleared by |
|---|---|---|---|
| Browser HTTP cache (JS/CSS bundles, images) | The browser | Until evicted | Hard reload |
| `useMeta()` client cache (`lib/useMeta.ts`) | Browser tab's JS memory | 60s | Any page reload (soft or hard — reloading JS always wipes it), or just waiting 60s |
| Server in-memory caches: `getMeta()` (60s) and `getTickerNews()` (30s) in `lib/queries.ts` | The Node process | 60s / 30s | **Restarting the Node process** (dev or prod) — there is no manual clear, only wait or restart |
| Next.js build cache (`.next/`) | Disk, in the repo | Until you delete it | `rm -rf .next` |
| Docker image layer cache (Docker path only) | Docker's local build cache | Until you delete it | `docker compose build --no-cache` |

### Browser: refresh vs. hard reload

- **Normal refresh** (Cmd+R / F5, or clicking a nav link): revalidates
  HTML/data but may still serve JS/CSS bundles from the browser's HTTP
  cache. Fine for seeing new *data* (news/jobs/products, stats).
- **Hard reload** (Cmd+Shift+R / Ctrl+Shift+R, or DevTools → Network →
  "Disable cache" + reload): bypasses the browser's HTTP cache entirely.
  Use this whenever you've changed *code* (components, styles, the
  `useMeta`/`Tracker`/`MarketTicker` client bundles) — in dev mode
  Turbopack hot-reloads most of this for you automatically, but after a
  full server restart or in a deployed environment, a normal refresh can
  still show you yesterday's JS.

Either kind of reload resets all client-side JS state, including the
`useMeta()` cache — there's no scenario where a page reload keeps a stale
`Meta` object around.

### Restarting the app

**Dev, normal restart** (keeps Turbopack's incremental cache — fast):

```bash
# stop with Ctrl+C, then
npm run dev
```

**Dev, no-cache restart** (force a fully clean rebuild — use this if dev
mode is behaving strangely, e.g. a stale route, a phantom type error, or
the "Another next dev server is already running" lock error from a
process that didn't shut down cleanly):

```bash
rm -rf .next
npm run dev
```

**Production, normal restart** (reuses the build cache in `.next/cache`
for a faster rebuild):

```bash
npm run build && npm start
```

**Production, no-cache restart** (fully clean build from scratch —
guarantees you're not looking at a stale artifact after a dependency bump
or a confusing deploy):

```bash
rm -rf .next
npm run build && npm start
```

**Docker, normal rebuild** (reuses Docker's layer cache — fast if only
source files changed):

```bash
docker compose up --build
```

**Docker, no-cache rebuild** (ignores Docker's layer cache entirely —
use this after a `package.json`/`Dockerfile` change, or any time you
suspect a stale layer, e.g. `npm install` not picking up a version bump):

```bash
docker compose build --no-cache
docker compose up
```

Either way, restarting the Node process is the *only* way to force-clear
`getMeta()`/`getTickerNews()`'s server-side caches immediately — they
otherwise self-expire after 60s/30s on their own, so if you just changed
data in Postgres (ran the scraper) and want to see it site-wide right
away without restarting, waiting under a minute also works.

### Next.js route/prefetch cache

Every list page (`/news`, `/jobs`, `/products`) is `dynamic =
"force-dynamic"` with a `loading.tsx` boundary, and the client router's
`staleTimes.dynamic` is 0 (Next.js 15+ default, not overridden in
`next.config.ts`) — so dynamic pages are never served from a stale
client-side router cache. If a page ever appears to not update after a
client-side navigation, it's virtually never this cache; check the
server-side caches above first.

---

## Relationship to `company-intel-scraper`

This app and [`company-intel-scraper`](../company-intel-scraper) connect to
the same physical Postgres database, each via its own `DATABASE_URL`. There
is no direct code or network coupling between the two repos — the only
coupling is the shared schema.

- The scraper owns and creates `companies`, `news`, `jobs`, and `products`
  (its `db.py`); a separate script in that repo, `enrich_locations.py`, builds
  `job_locations`, which this app's `getJobs()`/`getMeta()` read for
  country/city filtering.
- This app only ever runs `SELECT` statements against those five tables —
  it never writes to them.
- This app additionally owns `analytics_events`, which it creates itself
  (`lib/analytics.ts`, `CREATE TABLE IF NOT EXISTS`, run once per server
  boot). The scraper has no knowledge of this table; it is exclusively
  read/written by this app, backing only `/stats` and `/api/track`.
