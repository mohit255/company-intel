import { recordEvent } from "@/lib/analytics";

/* Receives sendBeacon payloads. Always answers 204 fast — analytics must
   never break or slow the site. */
export async function POST(request: Request) {
  try {
    const raw = await request.json();
    if (raw && typeof raw === "object") await recordEvent(raw);
  } catch (err) {
    // Malformed or failed events must never surface to the client — log
    // server-side only so failures (e.g. DB permission errors) are visible.
    console.error("[analytics] failed to record event:", err);
  }
  return new Response(null, { status: 204 });
}
