import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fieldColor } from "@/components/Cards";
import { getStats } from "@/lib/analytics";
import { isStatsAuthed, STATS_COOKIE, statsToken } from "@/lib/statsAuth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visitor Stats",
  description: "Traffic analytics for Company Intel.",
  robots: { index: false },
};

async function login(formData: FormData) {
  "use server";
  const pw = process.env.STATS_PASSWORD;
  if (pw && formData.get("password") === pw) {
    (await cookies()).set(STATS_COOKIE, statsToken(pw), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/stats",
    });
    redirect("/stats");
  }
  redirect("/stats?error=1");
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function StatsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const store = await cookies();
  if (!isStatsAuthed(store.get(STATS_COOKIE)?.value)) {
    const sp = await searchParams;
    return (
      <LoginGate error={sp.error === "1"}
                 unconfigured={!process.env.STATS_PASSWORD} />
    );
  }

  const s = await getStats();
  const maxDaily = Math.max(1, ...s.daily.map((d) => d.views));
  const maxPage = Math.max(1, ...s.byPage.map((p) => p.views));
  const maxCat = Math.max(1, ...s.byCategory.map((c) => c.events));

  return (
    <div className="space-y-8 pt-10">
      <header className="relative overflow-hidden rounded-2xl border
          border-zinc-800 bg-zinc-900/50 px-7 py-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40
            w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <h1 className="font-serif text-4xl font-bold text-zinc-50">
          Visitor Stats
        </h1>
        <p className="mt-1 text-zinc-400">
          Page views, unique visitors and what people click the most.
        </p>
      </header>

      {/* totals */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatTile label="Page views" value={s.totals.views}
                  sub={`${s.last7.views} in the last 7 days`} />
        <StatTile label="Unique visitors" value={s.totals.visitors}
                  sub={`${s.last7.visitors} in the last 7 days`} />
        <StatTile label="Card clicks" value={s.totals.clicks}
                  sub={`${s.last7.clicks} in the last 7 days`} />
      </div>

      {/* daily views */}
      <Panel title="Daily page views — last 14 days">
        <div className="flex h-36 items-end gap-1.5">
          {s.daily.map((d) => (
            <div key={d.day} className="group flex flex-1 flex-col
                items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 opacity-0
                  transition group-hover:opacity-100">
                {d.views}
              </span>
              <div className="w-full rounded-t bg-amber-500/70 transition
                      group-hover:bg-amber-400"
                   style={{ height: `${(d.views / maxDaily) * 100}%`,
                            minHeight: d.views > 0 ? 3 : 1 }} />
              <span className="whitespace-nowrap text-[10px]
                  text-zinc-600">
                {d.day.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* views per page */}
        <Panel title="Views by page">
          {s.byPage.length === 0 && <Empty />}
          <div className="space-y-3">
            {s.byPage.map((p) => (
              <Bar key={p.page} label={p.page} count={p.views}
                   sub={`${p.visitors} visitors`}
                   pct={(p.views / maxPage) * 100} color="#f59e0b" />
            ))}
          </div>
        </Panel>

        {/* categories */}
        <Panel title="Most-visited categories">
          {s.byCategory.length === 0 && <Empty />}
          <div className="space-y-3">
            {s.byCategory.map((c) => (
              <Bar key={c.field} label={c.field} count={c.events}
                   pct={(c.events / maxCat) * 100}
                   color={fieldColor(c.field)} />
            ))}
          </div>
        </Panel>

        {/* top news */}
        <Panel title="Most-clicked news">
          {s.topNews.length === 0 && <Empty />}
          <ol className="space-y-2.5">
            {s.topNews.map((n, i) => (
              <RankRow key={n.title} rank={i + 1} title={n.title}
                       sub={n.company} count={n.clicks} />
            ))}
          </ol>
        </Panel>

        {/* top jobs */}
        <Panel title="Most-clicked jobs">
          {s.topJobs.length === 0 && <Empty />}
          <ol className="space-y-2.5">
            {s.topJobs.map((j, i) => (
              <RankRow key={j.title} rank={i + 1} title={j.title}
                       sub={j.company} count={j.clicks} />
            ))}
          </ol>
        </Panel>
      </div>

      {/* top companies */}
      <Panel title="Most-clicked companies">
        {s.topCompanies.length === 0 && <Empty />}
        <div className="flex flex-wrap gap-2">
          {s.topCompanies.map((c) => (
            <span key={c.company} className="flex items-center gap-2
                rounded-full border border-zinc-800 bg-zinc-900 px-3.5
                py-1.5 text-sm text-zinc-300">
              {c.company}
              <span className="rounded-full bg-amber-500/15 px-2 text-xs
                  font-semibold text-amber-300">
                {c.clicks}
              </span>
            </span>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function StatTile({
  label, value, sub,
}: {
  label: string; value: number; sub: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="mt-1 font-serif text-4xl font-bold text-amber-400">
        {value.toLocaleString()}
      </div>
      <div className="mt-1 text-xs text-zinc-600">{sub}</div>
    </div>
  );
}

function Panel({
  title, children,
}: {
  title: string; children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60
        p-6">
      <h2 className="mb-5 font-serif text-xl font-bold text-zinc-100">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Bar({
  label, count, pct, color, sub,
}: {
  label: string; count: number; pct: number; color: string; sub?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-medium capitalize text-zinc-200">{label}</span>
        <span className="text-zinc-400">
          {count.toLocaleString()}
          {sub && <span className="ml-2 text-xs text-zinc-600">{sub}</span>}
        </span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800">
        <div className="h-full rounded-full"
             style={{ width: `${Math.max(pct, 2)}%`,
                      backgroundColor: color }} />
      </div>
    </div>
  );
}

function RankRow({
  rank, title, sub, count,
}: {
  rank: number; title: string; sub: string | null; count: number;
}) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <span className="w-6 shrink-0 text-right font-serif font-bold
          text-zinc-600">
        {rank}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 text-zinc-200">{title}</span>
        {sub && <span className="text-xs text-zinc-500">{sub}</span>}
      </span>
      <span className="shrink-0 rounded-full bg-amber-500/15 px-2.5 py-0.5
          text-xs font-semibold text-amber-300">
        {count}
      </span>
    </li>
  );
}

function Empty() {
  return (
    <p className="py-6 text-center text-sm text-zinc-600">
      No data yet — it fills up as people browse the site.
    </p>
  );
}

function LoginGate({
  error, unconfigured,
}: {
  error: boolean; unconfigured: boolean;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center pt-10">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800
          bg-zinc-900/60 p-8">
        <h1 className="font-serif text-2xl font-bold text-zinc-50">
          Visitor Stats
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          This panel is private — enter the admin password.
        </p>

        {unconfigured ? (
          <p className="mt-5 rounded-lg border border-amber-500/30
              bg-amber-500/10 p-3 text-sm text-amber-300">
            No password configured. Set <code>STATS_PASSWORD</code> in
            your environment to enable this panel.
          </p>
        ) : (
          <form action={login} className="mt-5 space-y-3">
            <input
              type="password"
              name="password"
              required
              autoFocus
              placeholder="Password"
              className="h-10 w-full rounded-lg border border-zinc-700
                  bg-zinc-950 px-3 text-sm text-zinc-200 outline-none
                  placeholder:text-zinc-600 focus:border-amber-500/60
                  focus:ring-2 focus:ring-amber-500/20"
            />
            {error && (
              <p className="text-sm text-red-400">
                Wrong password — try again.
              </p>
            )}
            <button type="submit"
                className="h-10 w-full rounded-lg bg-amber-500 text-sm
                    font-semibold text-zinc-950 transition
                    hover:bg-amber-400">
              Unlock
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
