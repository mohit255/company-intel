import { createHash } from "crypto";

export const STATS_COOKIE = "stats-auth";

/* The cookie stores a salted hash of the password — never the password
   itself. Changing STATS_PASSWORD invalidates all existing sessions. */
export function statsToken(password: string) {
  return createHash("sha256")
    .update(`company-intel-stats:${password}`)
    .digest("hex");
}

export function isStatsAuthed(cookieValue: string | undefined) {
  const pw = process.env.STATS_PASSWORD;
  if (!pw || !cookieValue) return false;
  return cookieValue === statsToken(pw);
}
