import Link from "next/link";
import { fold } from "@/lib/format";
import { isStatus, STATUS_IDS, STATUSES } from "@/lib/vehicle";
import { listAdminVehicles } from "@/lib/vehicles";
import { VehicleTable } from "./VehicleTable";

export default async function VehiclesAdmin(props: PageProps<"/admin/vehicules">) {
  const sp = await props.searchParams;
  const statut = typeof sp.statut === "string" && isStatus(sp.statut) ? sp.statut : "";
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const all = await listAdminVehicles();
  const words = fold(q).split(/\s+/).filter(Boolean);
  const list = all.filter(
    (v) =>
      (!statut || v.status === statut) &&
      words.every((w) => fold(`${v.brand} ${v.model} ${v.version} ${v.ref} ${v.year ?? ""} ${v.color}`).includes(w)),
  );
  const tab = (s: string, label: string, n: number) => {
    const params = new URLSearchParams({ ...(s ? { statut: s } : {}), ...(q ? { q } : {}) });
    return (
      <Link
        key={s || "all"}
        href={`/admin/vehicules${params.size ? `?${params}` : ""}`}
        aria-current={statut === s ? "page" : undefined}
        className={`shrink-0 rounded-full px-3 py-1.5 text-sm whitespace-nowrap ${statut === s ? "bg-ink font-semibold text-white" : "bg-white text-black/70 hover:bg-black/5"}`}
      >
        {label} <span className={statut === s ? "text-white/60" : "text-muted"}>{n}</span>
      </Link>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Véhicules</h1>
        <Link href="/admin/vehicules/nouveau" className="btn-primary">+ Ajouter un véhicule</Link>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <nav aria-label="Filtrer par statut" className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {tab("", "Tous", all.length)}
          {STATUS_IDS.map((s) => tab(s, STATUSES[s].short, all.filter((v) => v.status === s).length))}
        </nav>
        <form className="ml-auto flex w-full gap-2 sm:w-auto">
          {statut && <input type="hidden" name="statut" value={statut} />}
          <label htmlFor="admin-q" className="sr-only">Rechercher</label>
          <input id="admin-q" name="q" defaultValue={q} placeholder="Marque, modèle, réf., année…" className="input sm:w-64" />
          <button className="btn-dark">OK</button>
        </form>
      </div>
      <div className="mt-5">
        {list.length ? (
          <VehicleTable vehicles={list} />
        ) : (
          <div className="card p-10 text-center">
            <p className="font-semibold">{all.length ? "Aucun véhicule ne correspond." : "Votre stock est vide."}</p>
            <Link href="/admin/vehicules/nouveau" className="btn-primary mt-4">Ajouter le premier véhicule</Link>
          </div>
        )}
      </div>
    </div>
  );
}
