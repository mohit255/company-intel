// Client-safe constants — no server imports here (this module is used by
// client components; lib/queries.ts pulls in the pg driver).

export const PAGE_SIZE = 25;

export const TOPIC_LABELS: Record<string, string> = {
  general: "Company news",
  stock: "Stock updates",
  ipo: "IPO",
  market: "Market updates",
};
