"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CompareIcon, HeartIcon } from "@/components/Icons";
import { StatusBadge } from "@/components/StatusBadge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { VehicleCard } from "@/components/VehicleCard";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { useFavorites } from "@/lib/favorites";
import { fromMonthly, type FinanceSettings } from "@/lib/finance";
import { formatAr, formatKm, waLink } from "@/lib/format";
import { thumbUrl } from "@/lib/images";
import { STATUSES, vehicleFullTitle, vehicleHref, vehicleTitle, type Vehicle } from "@/lib/vehicle";

type Data = { vehicles: Vehicle[]; finance: FinanceSettings; orderDelay: string; whatsapp: string };

const MAX_COMPARE = 3;

export function Favorites() {
  const { ids } = useFavorites();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);
  const [compare, setCompare] = useState<number[]>([]);
  const key = ids.join(",");

  useEffect(() => {
    if (!key) return;
    let alive = true;
    fetch(`/api/vehicules?ids=${key}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Data) => alive && (setData(d), setError(false)))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [key]);

  // Keep the order of the list (latest liked first) and drop removed ones.
  const vehicles = data ? ids.map((id) => data.vehicles.find((v) => v.id === id)).filter((v): v is Vehicle => !!v) : [];
  const loading = !!key && !data && !error;
  const selected = vehicles.filter((v) => compare.includes(v.id));

  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 pb-10">
      <h1 className="font-display flex items-center gap-2 text-3xl font-bold sm:text-4xl">
        <HeartIcon filled className="h-7 w-7 text-red-600" /> Mes favoris
        {ids.length > 0 && <span className="text-xl font-semibold text-muted">{ids.length}</span>}
      </h1>

      {!ids.length && (
        <div className="mt-8 rounded-3xl bg-white px-6 py-12 text-center ring-1 ring-black/5">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
            <HeartIcon className="h-8 w-8" />
          </span>
          <p className="font-display mt-4 text-2xl font-semibold">Aucun favori pour l&apos;instant</p>
          <p className="mx-auto mt-1 max-w-xs text-muted">Touchez le cœur sur une photo pour garder un véhicule et le comparer.</p>
          <Link href="/voitures" className="btn-primary mt-6">Voir les véhicules</Link>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Impossible de charger vos favoris. Vérifiez votre connexion puis rechargez la page.
        </p>
      )}

      {loading && (
        <div role="status" aria-label="Chargement des favoris" className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {ids.slice(0, 8).map((id) => <CardSkeleton key={id} />)}
        </div>
      )}

      {data && vehicles.length > 0 && (
        <>
          <p className="mt-2 text-sm text-muted">Cochez jusqu&apos;à {MAX_COMPARE} véhicules pour les comparer.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {vehicles.map((v) => {
              const on = compare.includes(v.id);
              const full = !on && compare.length >= MAX_COMPARE;
              return (
                <div key={v.id} className="flex flex-col gap-2">
                  <VehicleCard v={v} finance={data.finance} orderDelay={data.orderDelay} />
                  <label className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold ring-1 transition-colors duration-200 ${on ? "bg-ink text-white ring-ink" : "bg-white ring-black/10"} ${full ? "opacity-50" : "cursor-pointer"}`}>
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={full}
                      onChange={() => setCompare((c) => (on ? c.filter((x) => x !== v.id) : [...c, v.id]))}
                      className="h-4 w-4 accent-[var(--color-orange-deep)]"
                    />
                    Comparer
                  </label>
                </div>
              );
            })}
          </div>
        </>
      )}

      {data && ids.length > 0 && vehicles.length === 0 && (
        <p className="mt-6 rounded-xl bg-white px-4 py-6 text-center text-muted ring-1 ring-black/5">
          Ces véhicules ne sont plus en ligne. <Link href="/voitures" className="font-semibold text-orange-deep underline">Voir le stock actuel</Link>
        </p>
      )}

      {selected.length >= 2 && data && <Comparison vehicles={selected} finance={data.finance} orderDelay={data.orderDelay} whatsapp={data.whatsapp} />}

      {/* Sticky reminder while choosing. */}
      {compare.length > 0 && selected.length < 2 && (
        <p className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] mx-auto mt-4 w-fit rounded-full bg-ink px-4 py-2 text-sm text-white shadow-lg lg:bottom-6">
          Choisissez encore {2 - selected.length} véhicule pour comparer
        </p>
      )}
    </div>
  );
}

function Comparison({ vehicles, finance, orderDelay, whatsapp }: { vehicles: Vehicle[]; finance: FinanceSettings; orderDelay: string; whatsapp: string }) {
  const rows: [string, (v: Vehicle) => string][] = [
    ["Prix", (v) => (v.price ? formatAr(v.price) : "Sur demande")],
    ["Mensualité", (v) => { const m = fromMonthly(v, finance); return m ? `dès ${formatAr(m)}` : "—"; }],
    ["Disponibilité", (v) => (v.status === "sur_commande" ? `Sur commande (${v.eta || orderDelay})` : v.status === "arrivage" ? `En arrivage${v.eta ? ` (${v.eta})` : ""}` : STATUSES[v.status].label)],
    ["Année", (v) => (v.year ? String(v.year) : "—")],
    ["Kilométrage", (v) => formatKm(v.mileageKm) || "—"],
    ["Carburant", (v) => v.fuel || "—"],
    ["Boîte", (v) => v.gearbox || "—"],
    ["Moteur", (v) => v.engine || "—"],
    ["Puissance", (v) => (v.powerHp ? `${v.powerHp} ch` : "—")],
    ["Transmission", (v) => v.drive || "—"],
    ["Type", (v) => v.body || "—"],
    ["Places", (v) => (v.seats ? String(v.seats) : "—")],
    ["Couleur", (v) => v.color || "—"],
  ];
  const best = (fn: (v: Vehicle) => number | null, lower: boolean) => {
    const vals = vehicles.map(fn).filter((x): x is number => x != null);
    return vals.length ? (lower ? Math.min(...vals) : Math.max(...vals)) : null;
  };
  const cheapest = best((v) => v.price, true);
  const lowestKm = best((v) => v.mileageKm, true);
  const newest = best((v) => v.year, false);
  const highlight = (label: string, v: Vehicle) =>
    (label === "Prix" && v.price === cheapest) || (label === "Kilométrage" && v.mileageKm === lowestKm) || (label === "Année" && v.year === newest);

  return (
    <section aria-labelledby="comparatif" className="mt-10">
      <h2 id="comparatif" className="font-display flex items-center gap-2 text-2xl font-bold sm:text-3xl">
        <CompareIcon className="h-6 w-6 text-cyan-deep" /> Comparatif
      </h2>
      <p className="mt-1 text-sm text-muted">Le meilleur prix, le plus faible kilométrage et l&apos;année la plus récente sont en vert.</p>
      <p className="mt-1 text-xs font-semibold text-cyan-deep sm:hidden">Faites glisser le tableau pour voir tous les véhicules →</p>
      <div className="mt-4 overflow-x-auto rounded-2xl bg-white ring-1 ring-black/5">
        <table className="w-full border-collapse text-sm" style={{ minWidth: 96 + vehicles.length * 160 }}>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 w-24 bg-white p-3 text-left text-xs font-semibold text-muted uppercase">Véhicule</th>
              {vehicles.map((v) => (
                <th key={v.id} scope="col" className="p-3 text-left align-top font-normal">
                  <Link href={vehicleHref(v)} className="block">
                    <span className="shimmer block aspect-[4/3] overflow-hidden rounded-lg">
                      {v.images[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumbUrl(v.images[0])} alt="" className="h-full w-full object-cover" />
                      )}
                    </span>
                    <span className="mt-2 block font-bold text-ink">{vehicleTitle(v)}</span>
                    <span className="block text-xs text-muted">{v.version}</span>
                  </Link>
                  <StatusBadge status={v.status} small className="mt-1.5" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, fn]) => (
              <tr key={label} className="border-t border-black/5">
                <th scope="row" className="sticky left-0 z-10 bg-white p-3 text-left text-xs font-semibold text-muted uppercase">{label}</th>
                {vehicles.map((v) => (
                  <td key={v.id} className={`p-3 tabular-nums ${highlight(label, v) && vehicles.length > 1 ? "font-bold text-emerald-700" : ""}`}>
                    {fn(v)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-black/5">
              <td className="sticky left-0 bg-white p-3" />
              {vehicles.map((v) => (
                <td key={v.id} className="p-3">
                  <a
                    href={waLink(whatsapp, `Bonjour Ediat Garage, je suis intéressé(e) par le ${vehicleFullTitle(v)} (réf. ${v.ref}).`)}
                    target="_blank"
                    rel="noopener"
                    className="btn-whatsapp w-full px-3"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> Intéressé
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
