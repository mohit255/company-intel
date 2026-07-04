import { getJobs, PAGE_SIZE } from "@/lib/queries";

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const data = await getJobs({
    field: p.get("field") ?? "",
    company: p.get("company") ?? "",
    country: p.get("country") ?? "",
    city: p.get("city") ?? "",
    q: p.get("q") ?? "",
    limit: Number(p.get("limit")) || PAGE_SIZE,
    offset: Number(p.get("offset")) || 0,
  });
  return Response.json(data);
}
