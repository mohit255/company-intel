import { getTickerNews } from "@/lib/queries";

export async function GET() {
  const data = await getTickerNews();
  return Response.json(data);
}
