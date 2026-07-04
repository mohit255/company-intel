import { recordEvent } from "@/lib/analytics";

/* Receives sendBeacon payloads. Always answers 204 fast — analytics must
   never break or slow the site. */
export async function POST(request: Request) {
  try {
    const raw = await request.json();
    if (raw && typeof raw === "object") await recordEvent(raw);
  } catch {
    // ignore malformed or failed events
  }
  return new Response(null, { status: 204 });
}
