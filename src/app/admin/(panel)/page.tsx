import Link from "next/link";
import { LeadStatusBadge } from "@/components/admin/LeadStatusBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatAr, formatDateTime } from "@/lib/format";
import { listLeads, leadCounts } from "@/lib/leads";
import { LEAD_KINDS } from "@/lib/leads-shared";
import { STATUS_IDS, STATUSES } from "@/lib/vehicle";
import { listAdminVehicles } from "@/lib/vehicles";

export default async function Dashboard() {
  const [vehicles, leads, lc] = await Promise.all([listAdminVehicles(), listLeads({ limit: 8 }), leadCounts()]);
  const byStatus = Object.fromEntries(STATUS_IDS.map((s) => [s, vehicles.filter((v) => v.status === s)]));
  const stockValue = byStatus.showroom.reduce((sum, v) => sum + (v.price ?? 0), 0);
  const soldThisMonth = vehicles.filter((v) => v.status === "vendu" && v.updatedAt.slice(0, 7) === new Date().toISOString().slice(0, 7));
  const margin = soldThisMonth.reduce((sum, v) => sum + (v.price && v.costAr ? v.price - v.costAr : 0), 0);
  const noPhoto = vehicles.filter((v) => !v.images.length && v.status !== "vendu");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Tableau de bord</h1>
        <Link href="/admin/vehicules/nouveau" className="btn-primary">+ Ajouter un véhicule</Link>
      </div>

      <section aria-label="Stock" className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {STATUS_IDS.map((s) => (
          <Link key={s} href={`/admin/vehicules?statut=${s}`} className="card p-4 transition hover:border-ink/30">
            <p className="text-xs text-muted">{STATUSES[s].label}</p>
            <p className="font-display mt-1 text-3xl font-bold">{byStatus[s].length}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-muted">Valeur du showroom</p>
          <p className="font-display mt-1 text-2xl font-bold">{formatAr(stockValue)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted">Vendus ce mois</p>
          <p className="font-display mt-1 text-2xl font-bold">{soldThisMonth.length}</p>
          {margin > 0 && <p className="text-sm text-emerald-700">Marge : {formatAr(margin)}</p>}
        </div>
        <Link href="/admin/demandes?statut=nouveau" className="card p-5 transition hover:border-ink/30">
          <p className="text-sm text-muted">Demandes à traiter</p>
          <p className="font-display mt-1 text-2xl font-bold text-orange-deep">{lc.nouveau ?? 0}</p>
          <p className="text-sm text-muted">{lc.en_cours ?? 0} en cours</p>
        </Link>
      </section>

      {noPhoto.length > 0 && (
        <p className="rounded-xl bg-orange/10 px-4 py-3 text-sm text-orange-deep">
          {noPhoto.length} véhicule{noPhoto.length > 1 ? "s" : ""} sans photo (invisible{noPhoto.length > 1 ? "s" : ""} tant qu&apos;il{noPhoto.length > 1 ? "s restent" : " reste"} en brouillon) :{" "}
          {noPhoto.slice(0, 5).map((v, i) => (
            <span key={v.id}>{i > 0 && ", "}<Link href={`/admin/vehicules/${v.id}`} className="font-semibold underline">{v.brand} {v.model}</Link></span>
          ))}
        </p>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Dernières demandes</h2>
          <Link href="/admin/demandes" className="text-sm font-semibold text-orange-deep">Tout voir →</Link>
        </div>
        {leads.items.length ? (
          <ul className="card divide-y divide-black/5">
            {leads.items.map((l) => (
              <li key={l.id}>
                <Link href={`/admin/demandes#d${l.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-paper">
                  <span aria-hidden="true">{LEAD_KINDS[l.kind].icon}</span>
                  <span className="font-semibold">{l.name}</span>
                  <span className="text-sm text-muted">{LEAD_KINDS[l.kind].label}{l.vehicleLabel ? ` · ${l.vehicleLabel}` : ""}</span>
                  <span className="ml-auto flex items-center gap-3 text-xs text-muted">{formatDateTime(l.createdAt)} <LeadStatusBadge status={l.status} /></span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card p-6 text-sm text-muted">Aucune demande pour l&apos;instant. Elles arrivent ici depuis les formulaires du site.</p>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Derniers véhicules modifiés</h2>
          <Link href="/admin/vehicules" className="text-sm font-semibold text-orange-deep">Tout le stock →</Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {vehicles.slice(0, 4).map((v) => (
            <li key={v.id}>
              <Link href={`/admin/vehicules/${v.id}`} className="card block p-4 hover:border-ink/30">
                <StatusBadge status={v.status} />
                <p className="mt-2 font-semibold">{v.brand} {v.model} {v.year ?? ""}</p>
                <p className="text-sm text-muted">{v.price ? formatAr(v.price) : "Sans prix"} · {v.ref}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
