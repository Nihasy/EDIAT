"use client";

import { useState } from "react";
import { updateSettings, type FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { useFormAction } from "@/components/useFormAction";
import { monthlyPayment, parseDurations } from "@/lib/finance";
import { displayPhone, formatAr } from "@/lib/format";
import type { Settings } from "@/lib/settings-shared";

function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, onSubmit, pending] = useFormAction<FormState>(updateSettings, undefined);
  const f = settings.finance;
  const [down, setDown] = useState(String(f.minDownPct));
  const [rate, setRate] = useState(String(f.annualRatePct));
  const [durations, setDurations] = useState(f.durations.join(", "));
  const [roundTo, setRoundTo] = useState(String(f.roundTo));
  const example = 40_000_000;
  const months = Math.max(...parseDurations(durations), 0);
  const d = Math.ceil((example * (Number(down) || 0)) / 100 / 1000) * 1000;
  const m = months ? monthlyPayment(example, d, months, Number(rate) || 0, Number(roundTo) || 1) : 0;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <section className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <h2 className="font-display text-xl font-semibold sm:col-span-2">Contact & showroom</h2>
        <Field label="WhatsApp" hint="Reçoit les messages des boutons WhatsApp du site"><input name="whatsapp" defaultValue={displayPhone(settings.whatsapp)} className="input" /></Field>
        <Field label="Téléphone (appels)"><input name="phone" defaultValue={displayPhone(settings.phone)} className="input" /></Field>
        <Field label="E-mail"><input name="email" type="email" defaultValue={settings.email} className="input" /></Field>
        <Field label="Lien Google Maps" hint="Bouton « Itinéraire »"><input name="mapsUrl" defaultValue={settings.mapsUrl} className="input" placeholder="https://maps.app.goo.gl/…" /></Field>
        <Field label="Adresse du showroom"><textarea name="address" rows={2} defaultValue={settings.address} className="input" /></Field>
        <Field label="Horaires"><textarea name="hours" rows={2} defaultValue={settings.hours} className="input" /></Field>
        <Field label="Bandeau d'annonce (haut du site)" hint="Vide = masqué. Ex. « Nouvel arrivage de 12 véhicules le 20 novembre ! »" className="sm:col-span-2">
          <input name="announcement" defaultValue={settings.announcement} className="input" />
        </Field>
      </section>

      <section className="card grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
        <h2 className="font-display text-xl font-semibold sm:col-span-3">Réseaux sociaux</h2>
        <Field label="Facebook"><input name="facebookUrl" defaultValue={settings.facebookUrl} className="input" /></Field>
        <Field label="Instagram"><input name="instagramUrl" defaultValue={settings.instagramUrl} className="input" /></Field>
        <Field label="TikTok"><input name="tiktokUrl" defaultValue={settings.tiktokUrl} className="input" /></Field>
      </section>

      <section className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <h2 className="font-display text-xl font-semibold sm:col-span-2">Import sur commande</h2>
        <Field label="Délai annoncé" hint="Affiché sur les véhicules « sur commande »"><input name="orderDelay" defaultValue={settings.orderDelay} className="input" /></Field>
        <Field label="Acompte à la commande (%)"><input name="orderDepositPct" inputMode="decimal" defaultValue={settings.orderDepositPct} className="input" /></Field>
      </section>

      <section className="card grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-3">
          <h2 className="font-display text-xl font-semibold">Paiement échelonné</h2>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="financeEnabled" defaultChecked={f.enabled} className="h-4 w-4 accent-[var(--color-orange-deep)]" /> Activé sur le site
          </label>
        </div>
        <Field label="Nom de l'offre"><input name="financeName" defaultValue={f.name} className="input" /></Field>
        <Field label="Apport minimum (%)"><input name="minDownPct" inputMode="decimal" value={down} onChange={(e) => setDown(e.target.value)} className="input" /></Field>
        <Field label="Taux annuel (%)" hint="0 = sans intérêts"><input name="annualRatePct" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} className="input" /></Field>
        <Field label="Durées proposées (mois)"><input name="durations" value={durations} onChange={(e) => setDurations(e.target.value)} className="input" placeholder="6, 12, 18, 24" /></Field>
        <Field label="Arrondi des mensualités (Ar)"><input name="roundTo" inputMode="numeric" value={roundTo} onChange={(e) => setRoundTo(e.target.value)} className="input" /></Field>
        <p className="self-end rounded-lg bg-paper px-3 py-2.5 text-sm">
          Exemple : véhicule à {formatAr(example)}, apport {formatAr(d)} → <strong>{formatAr(m)} / mois</strong> sur {months} mois
        </p>
        <Field label="Conditions (affichées sous le simulateur)" className="sm:col-span-3"><textarea name="conditions" rows={3} defaultValue={f.conditions} className="input" /></Field>
      </section>

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center gap-3 border-t border-black/10 bg-paper/95 px-4 py-3 backdrop-blur">
        <Button type="submit" pending={pending} pendingLabel="Enregistrement…" className="btn-primary">Enregistrer</Button>
        <FormMessage error={state?.error} ok={state?.ok} />
      </div>
    </form>
  );
}
