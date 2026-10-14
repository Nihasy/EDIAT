import Link from "next/link";
import { notFound } from "next/navigation";
import { duplicateVehicle, removeVehicle } from "@/app/admin/actions";
import { LeadStatusBadge } from "@/components/admin/LeadStatusBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { isDbId } from "@/lib/db";
import { displayPhone, formatDateTime, waLink } from "@/lib/format";
import { leadsForVehicle } from "@/lib/leads";
import { LEAD_KINDS } from "@/lib/leads-shared";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site";
import { socialPost } from "@/lib/social-post";
import { STATUSES, vehicleHref } from "@/lib/vehicle";
import { getAdminVehicle } from "@/lib/vehicles";
import { ConfirmDelete } from "./ConfirmDelete";
import { VehicleForm } from "../VehicleForm";

export default async function EditVehicle(props: PageProps<"/admin/vehicules/[id]">) {
  const id = Number((await props.params).id);
  const sp = await props.searchParams;
  if (!isDbId(id)) notFound();
  const [vehicle, settings, leads] = await Promise.all([getAdminVehicle(id), getSettings(), leadsForVehicle(id)]);
  if (!vehicle) notFound();
  const url = `${siteUrl()}${vehicleHref(vehicle)}`;

  return (
    <div>
      <Link href="/admin/vehicules" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-ink">← Véhicules</Link>
      <div className="mt-1 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-bold">{vehicle.brand} {vehicle.model} {vehicle.year ?? ""}</h1>
        <StatusBadge status={vehicle.status} long />
        <span className="text-sm text-muted">{vehicle.ref}</span>
      </div>
      {sp.cree && <p role="status" className="mb-5 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">Véhicule créé.</p>}
      {sp.copie && <p role="status" className="mb-5 rounded-lg bg-cyan/10 px-3 py-2 text-sm text-cyan-deep">Copie créée en brouillon : ajoutez les photos et ajustez les infos.</p>}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <VehicleForm vehicle={vehicle} finance={settings.finance} orderDelay={settings.orderDelay} />
        <aside className="space-y-4">
          <div className="card space-y-2 p-5">
            <h2 className="font-display text-lg font-semibold">Actions</h2>
            {STATUSES[vehicle.status].isPublic && (
              <a href={vehicleHref(vehicle)} target="_blank" rel="noopener" className="btn-ghost w-full">Voir sur le site ↗</a>
            )}
            <CopyButton text={socialPost(vehicle, settings, url)} label="Copier le texte Facebook" className="btn-cyan w-full" />
            <CopyButton text={url} label="Copier le lien" className="btn-ghost w-full" />
            <form action={duplicateVehicle.bind(null, vehicle.id)}>
              <SubmitButton pendingLabel="Copie…" className="btn-ghost w-full">Dupliquer (même modèle)</SubmitButton>
            </form>
            <ConfirmDelete action={removeVehicle.bind(null, vehicle.id)} />
          </div>
          <div className="card p-5">
            <h2 className="font-display text-lg font-semibold">Demandes sur ce véhicule</h2>
            {leads.length ? (
              <ul className="mt-3 space-y-3 text-sm">
                {leads.map((l) => (
                  <li key={l.id} className="rounded-lg bg-paper p-3">
                    <p className="flex items-center justify-between gap-2"><strong>{l.name}</strong> <LeadStatusBadge status={l.status} /></p>
                    <p className="text-muted">{LEAD_KINDS[l.kind].label} · {formatDateTime(l.createdAt)}</p>
                    <a href={waLink(l.phone, `Bonjour ${l.name}, Ediat Garage concernant le ${vehicle.brand} ${vehicle.model}…`)} target="_blank" rel="noopener" className="text-cyan-deep hover:underline">
                      {displayPhone(l.phone)} · WhatsApp
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">Aucune demande pour l&apos;instant.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
