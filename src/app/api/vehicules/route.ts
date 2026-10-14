import { publicVehicles, siteSettings } from "@/lib/catalog";

// Public vehicles by id, for the favourites page (ids come from the
// visitor's browser). Same data as the public pages, from the same cache.
export async function GET(request: Request) {
  const ids = (new URL(request.url).searchParams.get("ids") ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 60);
  const [all, settings] = await Promise.all([publicVehicles(), siteSettings()]);
  const byId = new Map(all.map((v) => [v.id, v]));
  return Response.json({
    vehicles: ids.map((id) => byId.get(id)).filter(Boolean),
    finance: settings.finance,
    orderDelay: settings.orderDelay,
    whatsapp: settings.whatsapp,
  });
}
