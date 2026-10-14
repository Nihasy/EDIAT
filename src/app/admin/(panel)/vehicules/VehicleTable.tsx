"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { changeStatus } from "@/app/admin/actions";
import { FormMessage } from "@/components/ui/FormMessage";
import { Img } from "@/components/ui/Img";
import { Spinner } from "@/components/ui/Spinner";
import { formatAr, formatKm } from "@/lib/format";
import { thumbUrl } from "@/lib/images";
import { STATUS_IDS, STATUSES, vehicleHref, type AdminVehicle, type VehicleStatus } from "@/lib/vehicle";

function StatusSelect({ ids, value, onDone, label }: { ids: number[]; value: VehicleStatus | ""; onDone: (msg: { error?: string; ok?: string }) => void; label: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <span className="inline-flex items-center gap-1.5">
      <select
        aria-label={label}
        value={value}
        disabled={pending}
        onChange={(e) => {
          const status = e.target.value as VehicleStatus;
          if (!status) return;
          start(async () => {
            const res = await changeStatus(ids, status);
            onDone(res ?? {});
            router.refresh();
          });
        }}
        className="rounded-lg border border-black/15 bg-white px-2 py-1.5 text-sm"
      >
        {value === "" && <option value="">Changer le statut…</option>}
        {STATUS_IDS.map((s) => <option key={s} value={s}>{STATUSES[s].label}</option>)}
      </select>
      {pending && <Spinner />}
    </span>
  );
}

export function VehicleTable({ vehicles }: { vehicles: AdminVehicle[] }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [msg, setMsg] = useState<{ error?: string; ok?: string }>({});
  const all = selected.length === vehicles.length;
  const toggle = (id: number) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="space-y-3">
      <div className="flex min-h-11 flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={all} onChange={() => setSelected(all ? [] : vehicles.map((v) => v.id))} className="h-4 w-4" />
          Tout sélectionner ({vehicles.length})
        </label>
        {selected.length > 0 && (
          <span className="flex items-center gap-2 text-sm">
            <strong>{selected.length} sélectionné{selected.length > 1 ? "s" : ""}</strong>
            <StatusSelect ids={selected} value="" label="Statut des véhicules sélectionnés" onDone={(m) => { setMsg(m); if (!m.error) setSelected([]); }} />
          </span>
        )}
      </div>
      <FormMessage {...msg} />
      <ul className="card divide-y divide-black/5 overflow-hidden">
        {vehicles.map((v) => {
          const margin = v.price && v.costAr ? v.price - v.costAr : null;
          return (
            <li key={v.id} className={`flex flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap ${selected.includes(v.id) ? "bg-cyan/5" : ""}`}>
              <input type="checkbox" checked={selected.includes(v.id)} onChange={() => toggle(v.id)} aria-label={`Sélectionner ${v.brand} ${v.model}`} className="h-4 w-4 shrink-0" />
              <Link href={`/admin/vehicules/${v.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <span className="bg-brand-gradient h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                  {v.images[0] && <Img src={thumbUrl(v.images[0])} fallback={v.images[0]} alt="" className="h-full w-full object-cover" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{v.brand} {v.model} {v.version}</span>
                  <span className="block truncate text-sm text-muted">
                    {v.ref} · {[v.year, formatKm(v.mileageKm), v.fuel].filter(Boolean).join(" · ")}
                    {!v.images.length && <span className="ml-1 text-orange-deep">· sans photo</span>}
                  </span>
                </span>
              </Link>
              <span className="w-full text-right sm:w-40">
                <span className="block font-semibold">{v.price ? formatAr(v.price) : "—"}</span>
                {margin != null && <span className={`block text-xs ${margin < 0 ? "text-red-700" : "text-emerald-700"}`}>marge {formatAr(margin)}</span>}
              </span>
              <span className="flex w-full items-center justify-between gap-2 sm:w-auto">
                <StatusSelect ids={[v.id]} value={v.status} label={`Statut de ${v.brand} ${v.model}`} onDone={setMsg} />
                {STATUSES[v.status].isPublic && (
                  <a href={vehicleHref(v)} target="_blank" rel="noopener" className="px-2 text-sm text-cyan-deep hover:underline" aria-label="Voir sur le site">↗</a>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
