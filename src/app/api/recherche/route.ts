import { suggest } from "@/lib/catalog";

// Search-as-you-type suggestions for the search box (public data only, from
// the same cached snapshot as the public pages).
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 80);
  if (!q) return Response.json({ total: 0, approximate: false, brands: [], bodies: [], vehicles: [] });
  return Response.json(await suggest(q));
}
