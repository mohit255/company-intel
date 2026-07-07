import { getMeta } from "@/lib/queries";

export async function GET() {
  const meta = await getMeta();
  return Response.json(meta);
}
