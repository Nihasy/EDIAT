"use client";

import { useState } from "react";
import { FinanceSimulator } from "@/components/site/FinanceSimulator";
import { LeadForm } from "@/components/site/LeadForm";
import type { FinanceSettings } from "@/lib/finance";
import { formatAr } from "@/lib/format";

type Sim = { price: number; down: number; months: number; monthly: number };

// Simulator + request form: the simulation is sent with the request.
export function FinanceRequest({ settings, whatsapp }: { settings: FinanceSettings; whatsapp: string }) {
  const [sim, setSim] = useState<Sim | null>(null);
  const hidden: Record<string, string> = sim
    ? { budget: formatAr(sim.price), apport: formatAr(sim.down), duree: `${sim.months} mois`, mensualite: formatAr(sim.monthly) }
    : {};
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="card p-5 sm:p-7">
        <h2 className="font-display text-2xl font-semibold">1. Simulez</h2>
        <div className="mt-5">
          <FinanceSimulator settings={settings} whatsapp={whatsapp} onChange={setSim} />
        </div>
      </div>
      <div className="card p-5 sm:p-7">
        <h2 className="font-display text-2xl font-semibold">2. Envoyez votre demande</h2>
        <p className="mt-1 mb-5 text-sm text-muted">Votre simulation est jointe. Nous vous rappelons pour monter le dossier.</p>
        <LeadForm
          kind="financement"
          hidden={hidden}
          extra={[{ name: "modele", label: "Véhicule visé", placeholder: "Ex. Kia Sportage 2015" }]}
          messagePlaceholder="Votre situation (salarié, commerçant…), vos questions"
          submitLabel="Demander mon financement"
          whatsapp={whatsapp}
          whatsappText={
            sim
              ? `Bonjour Ediat Garage, je souhaite un financement ${settings.name}. Prix ${formatAr(sim.price)}, apport ${formatAr(sim.down)}, ${sim.months} mois, mensualité estimée ${formatAr(sim.monthly)}.`
              : `Bonjour Ediat Garage, je souhaite un financement ${settings.name}.`
          }
        />
      </div>
    </div>
  );
}
