"use client";

import { useState } from "react";
import { saveVehicle, type FormState } from "@/app/admin/actions";
import { PendingTiles, UploadTile, useUploads } from "@/components/admin/UploadTile";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { Img } from "@/components/ui/Img";
import { useFormAction } from "@/components/useFormAction";
import { StarIcon } from "@/components/Icons";
import { fromMonthly, type FinanceSettings } from "@/lib/finance";
import { formatAr, formatNumber, parseAmount } from "@/lib/format";
import { thumbUrl } from "@/lib/images";
import { BODIES, BRANDS, DRIVES, FUELS, GEARBOXES, STATUS_IDS, STATUSES, type AdminVehicle, type VehicleStatus } from "@/lib/vehicle";

const EQUIPMENT = [
  "Climatisation",
  "Climatisation automatique",
  "Caméra de recul",
  "Radar de recul",
  "GPS / écran tactile",
  "Bluetooth",
  "Toit ouvrant",
  "Sièges cuir",
  "Sièges chauffants",
  "Régulateur de vitesse",
  "Démarrage sans clé",
  "Jantes alliage",
  "Vitres électriques",
  "Rétroviseurs rabattables",
  "Airbags",
  "ABS / ESP",
  "Barres de toit",
  "Phares LED / xénon",
];

function Field({ label, children, hint, className = "" }: { label: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function VehicleForm({ vehicle, finance, orderDelay }: { vehicle?: AdminVehicle; finance: FinanceSettings; orderDelay: string }) {
  const [state, onSubmit, pending] = useFormAction<FormState>(saveVehicle, undefined);
  const [status, setStatus] = useState<VehicleStatus>(vehicle?.status ?? "brouillon");
  const [images, setImages] = useState<string[]>(vehicle?.images ?? []);
  const [equipment, setEquipment] = useState((vehicle?.equipment ?? []).join("\n"));
  const [price, setPrice] = useState(vehicle?.price ? formatNumber(vehicle.price) : "");
  const [cost, setCost] = useState(vehicle?.costAr ? formatNumber(vehicle.costAr) : "");
  const [financing, setFinancing] = useState(vehicle?.financing ?? true);
  const [monthlyOverride, setMonthlyOverride] = useState(vehicle?.monthlyOverride ? formatNumber(vehicle.monthlyOverride) : "");
  const [dirty, setDirty] = useState(false);
  const uploads = useUploads((url) => {
    setImages((list) => [...list, url]);
    setDirty(true);
  });

  const priceN = parseAmount(price) || null;
  const costN = parseAmount(cost) || null;
  const autoMonthly = priceN ? fromMonthly({ price: priceN, financing: true, monthlyOverride: null }, finance) : null;
  const lines = equipment.split("\n").map((s) => s.trim()).filter(Boolean);
  const toggleEquipment = (e: string) => {
    setEquipment((lines.includes(e) ? lines.filter((l) => l !== e) : [...lines, e]).join("\n"));
    setDirty(true);
  };
  const move = (i: number, d: number) => {
    setImages((list) => {
      const next = [...list];
      const j = i + d;
      if (j < 0 || j >= next.length) return list;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setDirty(true);
  };

  return (
    <form onSubmit={(e) => { setDirty(false); onSubmit(e); }} onChange={() => setDirty(true)} className="space-y-5 pb-24">
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <Section title="Disponibilité">
        <fieldset>
          <legend className="sr-only">Statut</legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {STATUS_IDS.map((s) => (
              <label key={s} className={`cursor-pointer rounded-xl border-2 p-3 transition ${status === s ? "border-orange-deep bg-orange/5" : "border-black/10 hover:border-black/30"}`}>
                <span className="flex items-center gap-2 font-semibold">
                  <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} className="accent-[var(--color-orange-deep)]" />
                  {STATUSES[s].label}
                </span>
                <span className="mt-1 block text-xs text-muted">{STATUSES[s].hint}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {(status === "arrivage" || status === "sur_commande") && (
            <Field
              label={status === "arrivage" ? "Arrivée prévue" : "Délai (si différent)"}
              hint={status === "arrivage" ? "Ex. « fin novembre », « semaine 47 »" : `Par défaut : ${orderDelay}`}
            >
              <input name="eta" defaultValue={vehicle?.eta} className="input" placeholder={status === "arrivage" ? "Fin novembre" : orderDelay} />
            </Field>
          )}
          {status !== "arrivage" && status !== "sur_commande" && <input type="hidden" name="eta" value={vehicle?.eta ?? ""} />}
          <Field label="Référence stock" hint="Vide = automatique (EG-0012)">
            <input name="ref" defaultValue={vehicle?.ref} className="input uppercase" placeholder="EG-…" />
          </Field>
          <label className="flex items-center gap-2 self-center pt-4 text-sm font-medium">
            <input type="checkbox" name="featured" defaultChecked={vehicle?.featured} className="h-4 w-4 accent-[var(--color-orange-deep)]" />
            <StarIcon className="h-4 w-4 text-orange-deep" /> Coup de cœur (mis en avant)
          </label>
        </div>
      </Section>

      <Section title="Photos" aside={<span className="text-sm text-muted">{images.length} photo{images.length > 1 ? "s" : ""} · la 1re est la photo principale</span>}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {images.map((src, i) => (
            <div key={src} className="group relative">
              <div className={`shimmer aspect-[4/3] overflow-hidden rounded-lg border-2 ${i === 0 ? "border-orange-deep" : "border-transparent"}`}>
                <Img src={thumbUrl(src)} fallback={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
              </div>
              {i === 0 && <span className="absolute top-1.5 left-1.5 rounded bg-orange-deep px-1.5 py-0.5 text-[10px] font-bold text-white">PRINCIPALE</span>}
              <div className="mt-1 grid grid-cols-2 gap-1 sm:grid-cols-4">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Déplacer à gauche" className="h-11 rounded-md bg-black/5 text-sm disabled:opacity-30">←</button>
                {i > 0 && (
                  <button type="button" onClick={() => { setImages((l) => [src, ...l.filter((x) => x !== src)]); setDirty(true); }} className="flex h-11 items-center justify-center rounded-md bg-black/5" title="Photo principale" aria-label="Mettre en photo principale"><StarIcon className="h-4 w-4 text-orange-deep" /></button>
                )}
                <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="Déplacer à droite" className="h-11 rounded-md bg-black/5 text-sm disabled:opacity-30">→</button>
                <button type="button" onClick={() => { setImages((l) => l.filter((x) => x !== src)); setDirty(true); }} aria-label="Supprimer la photo" className="h-11 rounded-md bg-red-50 text-sm text-red-700">✕</button>
              </div>
            </div>
          ))}
          <PendingTiles count={uploads.remaining} className="aspect-[4/3]" />
          <UploadTile label="Ajouter des photos" className="aspect-[4/3]" pending={uploads.pending} progress={uploads.progress} onFiles={uploads.upload} />
        </div>
        {uploads.error && <p role="alert" className="mt-3 text-sm text-red-700">{uploads.error}</p>}
        <p className="mt-3 text-xs text-muted">Conseil : 8 à 15 photos — 3/4 avant, 3/4 arrière, profil, intérieur, tableau de bord (kilométrage), moteur, coffre.</p>
      </Section>

      <Section title="Véhicule">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Marque *">
            <input name="brand" required list="brands" defaultValue={vehicle?.brand} className="input" />
            <datalist id="brands">{BRANDS.map((b) => <option key={b} value={b} />)}</datalist>
          </Field>
          <Field label="Modèle *"><input name="model" required defaultValue={vehicle?.model} className="input" placeholder="Sportage" /></Field>
          <Field label="Version / finition" className="sm:col-span-2"><input name="version" defaultValue={vehicle?.version} className="input" placeholder="2.0 CRDi Premium 4WD" /></Field>
          <Field label="Année"><input name="year" inputMode="numeric" defaultValue={vehicle?.year ?? ""} className="input" placeholder="2015" /></Field>
          <Field label="Kilométrage (km)"><input name="mileage_km" inputMode="numeric" defaultValue={vehicle?.mileageKm != null ? formatNumber(vehicle.mileageKm) : ""} className="input" placeholder="85 000" /></Field>
          <Field label="Couleur"><input name="color" defaultValue={vehicle?.color} className="input" placeholder="Gris argent" /></Field>
          <Field label="Provenance"><input name="origin" defaultValue={vehicle?.origin ?? "Corée du Sud"} className="input" /></Field>
        </div>
      </Section>

      <Section title="Technique">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["fuel", "Carburant", FUELS, vehicle?.fuel],
            ["gearbox", "Boîte", GEARBOXES, vehicle?.gearbox],
            ["body", "Type", BODIES, vehicle?.body],
            ["drive", "Transmission", DRIVES, vehicle?.drive],
          ].map(([name, label, options, value]) => (
            <Field key={name as string} label={label as string}>
              <select name={name as string} defaultValue={(value as string) ?? ""} className="input">
                <option value="">—</option>
                {(options as string[]).map((o) => <option key={o} value={o}>{o}</option>)}
                {value && !(options as string[]).includes(value as string) && <option value={value as string}>{value as string}</option>}
              </select>
            </Field>
          ))}
          <Field label="Moteur"><input name="engine" defaultValue={vehicle?.engine} className="input" placeholder="2.0 CRDi" /></Field>
          <Field label="Puissance (ch)"><input name="power_hp" inputMode="numeric" defaultValue={vehicle?.powerHp ?? ""} className="input" /></Field>
          <Field label="Places"><input name="seats" inputMode="numeric" defaultValue={vehicle?.seats ?? ""} className="input" /></Field>
          <Field label="Portes"><input name="doors" inputMode="numeric" defaultValue={vehicle?.doors ?? ""} className="input" /></Field>
        </div>
      </Section>

      <Section title="Prix & financement">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Prix de vente (Ar)" hint={priceN ? formatAr(priceN) : "Vide = « Prix sur demande »"}>
            <input name="price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className="input text-lg font-semibold" placeholder="45 000 000" />
          </Field>
          <Field label="Ancien prix (barré)" hint="Pour afficher une baisse de prix">
            <input name="old_price" inputMode="numeric" defaultValue={vehicle?.oldPrice ? formatNumber(vehicle.oldPrice) : ""} className="input" />
          </Field>
          <Field label="Prix de revient (privé)" hint={priceN && costN ? `Marge : ${formatAr(priceN - costN)} (${Math.round(((priceN - costN) / priceN) * 100)} %)` : "Jamais affiché sur le site"}>
            <input name="cost_ar" inputMode="numeric" value={cost} onChange={(e) => setCost(e.target.value)} className="input" />
          </Field>
          <div />
          <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
            <input type="checkbox" name="financing" checked={financing} onChange={(e) => setFinancing(e.target.checked)} className="h-4 w-4 accent-[var(--color-orange-deep)]" />
            Éligible {finance.name} (afficher « à partir de … / mois »)
          </label>
          {financing && (
            <Field
              label="Mensualité affichée (optionnel)"
              className="sm:col-span-2"
              hint={autoMonthly ? `Calcul automatique : ${formatAr(autoMonthly)} / mois (${finance.minDownPct} % d'apport, ${Math.max(...finance.durations)} mois). Saisissez un montant pour l'imposer, ex. celui de votre affiche.` : "Renseignez le prix pour voir le calcul."}
            >
              <input name="monthly_override" inputMode="numeric" value={monthlyOverride} onChange={(e) => setMonthlyOverride(e.target.value)} className="input" placeholder={autoMonthly ? formatNumber(autoMonthly) : ""} />
            </Field>
          )}
          {!financing && <input type="hidden" name="monthly_override" value={monthlyOverride} />}
        </div>
      </Section>

      <Section title="Description & équipements">
        <Field label="Description" hint="État, entretien, points forts… Affichée telle quelle sur la fiche.">
          <textarea name="description" rows={5} defaultValue={vehicle?.description} className="input" />
        </Field>
        <div className="mt-5">
          <label htmlFor="equipment" className="label">Équipements (un par ligne)</label>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {EQUIPMENT.map((e) => (
              <button
                key={e}
                type="button"
                aria-pressed={lines.includes(e)}
                onClick={() => toggleEquipment(e)}
                className={`min-h-10 rounded-full border px-3 text-xs transition-colors duration-200 ${lines.includes(e) ? "border-cyan-deep bg-cyan-deep text-white" : "border-black/15 hover:border-ink"}`}
              >
                {lines.includes(e) ? "✓ " : "+ "}{e}
              </button>
            ))}
          </div>
          <textarea id="equipment" name="equipment" rows={5} value={equipment} onChange={(e) => setEquipment(e.target.value)} className="input" />
        </div>
      </Section>

      <Section title="Notes internes">
        <textarea name="private_notes" rows={3} defaultValue={vehicle?.privateNotes} className="input" placeholder="Fournisseur, n° de châssis, frais engagés, client intéressé… (jamais affiché)" />
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Button type="submit" pending={pending || uploads.pending} pendingLabel={uploads.pending ? "Photos en cours…" : "Enregistrement…"} className="btn-primary">
            Enregistrer
          </Button>
          <span className="text-sm text-muted">{STATUSES[status].isPublic ? "Visible sur le site" : "Masqué du site"}</span>
          <div className="min-w-0 flex-1">
            <FormMessage error={state?.error} ok={!dirty ? state?.ok : undefined} />
          </div>
          {dirty && <span className="text-sm text-orange-deep">Modifications non enregistrées</span>}
        </div>
      </div>
    </form>
  );
}
