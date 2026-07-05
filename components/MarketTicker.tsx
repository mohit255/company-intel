import { TOPIC_LABELS } from "@/lib/constants";
import { getTickerNews } from "@/lib/queries";

const topicStyle: Record<string, string> = {
  stock: "bg-emerald-500/15 text-emerald-400",
  market: "bg-blue-500/15 text-blue-400",
};

export default async function MarketTicker() {
  const items = await getTickerNews();
  if (!items.length) return null;

  // duplicate for seamless loop
  const looped = [...items, ...items];

  return (
    <div className="border-b border-zinc-800/60 bg-zinc-950">
      <div className="relative flex items-center overflow-hidden">
        {/* "LIVE" label — sticky left */}
        <div className="z-10 flex shrink-0 items-center gap-2 border-r
            border-zinc-800 bg-zinc-950 px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping
                rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full
                bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest
              text-zinc-400">
            Live
          </span>
        </div>

        {/* scrolling ticker */}
        <div className="flex min-w-0 flex-1 overflow-hidden">
          <ul className="animate-ticker flex shrink-0 items-center gap-0
              whitespace-nowrap">
            {looped.map((item, i) => (
              <li key={i} className="flex items-center">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2 text-[12px]
                      text-zinc-300 transition hover:text-amber-300"
                >
                  <span className={`rounded px-1.5 py-0.5 text-[10px]
                      font-semibold uppercase tracking-wider ${
                        topicStyle[item.topic] ?? "bg-zinc-800 text-zinc-400"
                      }`}>
                    {TOPIC_LABELS[item.topic] ?? item.topic}
                  </span>
                  <span className="font-medium text-zinc-400">
                    {item.company}
                  </span>
                  <span className="text-zinc-500">—</span>
                  {item.title}
                </a>
                <span className="text-zinc-700">·</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
