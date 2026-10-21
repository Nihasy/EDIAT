"use client";

import { useEffect, useState } from "react";
import { downRange, loanPlan, type FinanceSettings } from "@/lib/finance";
import { formatAr, formatNumber, parseAmount, waLink } from "@/lib/format";
import { WhatsAppIcon } from "../WhatsAppIcon";

export type Simulation = { price: number; down: number; loan: number; months: number; monthly: number };

// Ediat Facility simulator (PAMF Crédit PME): price, down payment, duration → monthly payment.
// `onChange` lets a parent form send the simulation with the request (null = not financeable).
export function FinanceSimulator({
  settings,
  price: fixedPrice,
  vehicleLabel,
  whatsapp,
  onChange,
}: {
  settings: FinanceSettings;
  price?: number;
  vehicleLabel?: string;
  whatsapp: string;
  onChange?: (sim: Simulation | null) => void;
}) {
  const [priceInput, setPriceInput] = useState(fixedPrice ? formatNumber(fixedPrice) : "40 000 000");
  const price = fixedPrice ?? Math.max(0, parseAmount(priceInput) || 0);
  const range = downRange(price, settings);
  const durations = settings.durations.length ? settings.durations : [12];
  const [months, setMonths] = useState(durations[durations.length - 1]);
  const [downPct, setDownPct] = useState(settings.minDownPct);

  // Slider in %, limited so the loan stays within the PAMF bounds.
  const pctMin = range ? Math.ceil((range.min / price) * 100) : 0;
  const pctMax = range ? Math.max(pctMin, Math.min(90, Math.floor((range.max / price) * 100))) : 0;
  const pct = Math.min(pctMax, Math.max(pctMin, downPct));
  const plan = range ? loanPlan(price, Math.round((price * pct) / 100 / 1000) * 1000, months, settings) : null;
  const down = plan ? price - plan.loan : 0;

  useEffect(() => {
    onChange?.(plan ? { price, down, loan: plan.loan, months, monthly: plan.monthly } : null);
  }, [onChange, plan?.monthly, plan?.loan, price, down, months]); // eslint-disable-line react-hooks/exhaustive-deps

  const offer = `${settings.name} (${settings.product} ${settings.partner})`;
  const text = plan
    ? `Bonjour Ediat Garage, je souhaite un financement ${offer}${vehicleLabel ? ` pour : ${vehicleLabel}` : ""}.\nPrix : ${formatAr(price)}\nApport : ${formatAr(down)}\nMontant emprunté : ${formatAr(plan.loan)}\nDurée : ${months} mois\nMensualité estimée : ${formatAr(plan.monthly)}`
    : `Bonjour Ediat Garage, je souhaite un financement ${offer}${vehicleLabel ? ` pour : ${vehicleLabel}` : ""}.`;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_auto]">
      <div className="space-y-5">
        {!fixedPrice && (
          <div>
            <label className="label" htmlFor="sim-price">Prix du véhicule (Ar)</label>
            <input
              id="sim-price"
              inputMode="numeric"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              onBlur={() => price && setPriceInput(formatNumber(price))}
              className="input text-lg font-semibold"
            />
          </div>
        )}
        {range ? (
          <>
            <div>
              <div className="flex items-baseline justify-between">
                <label className="label" htmlFor="sim-down">Apport</label>
                <span className="text-sm font-semibold">{formatAr(down)} <span className="text-muted">({Math.round((down / price) * 100)} %)</span></span>
              </div>
              <input
                id="sim-down"
                type="range"
                min={pctMin}
                max={pctMax}
                step={1}
                value={pct}
                disabled={pctMin === pctMax}
                onChange={(e) => setDownPct(Number(e.target.value))}
                className="h-11 w-full accent-[var(--color-orange-deep)]"
              />
              <p className="flex justify-between text-xs text-muted"><span>{pctMin ? `Min. ${pctMin} %` : "Sans apport"}</span><span>{pctMax} %</span></p>
            </div>
            <fieldset>
              <legend className="label">Durée</legend>
              <div className="flex flex-wrap gap-2">
                {durations.map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={months === m}
                    onClick={() => setMonths(m)}
                    className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors duration-200 ${months === m ? "border-ink bg-ink text-white" : "border-black/15 bg-white hover:border-ink"}`}
                  >
                    {m} mois
                  </button>
                ))}
              </div>
            </fieldset>
          </>
        ) : (
          price > 0 && (
            <p className="rounded-xl bg-paper px-4 py-3 text-sm text-black/75" role="status">
              Le {settings.product} {settings.partner} finance de {formatAr(settings.minLoan)} à {formatAr(settings.maxLoan)}
              {settings.minDownPct > 0 ? `, après un apport d'au moins ${settings.minDownPct} %` : ""}. Pour ce montant, parlons-en : nous trouverons une solution.
            </p>
          )
        )}
      </div>
      <div className="bg-orange-gradient flex min-w-60 flex-col justify-between rounded-2xl p-5 text-white">
        <div>
          <p className="text-sm text-white/85">Votre mensualité</p>
          <p className="font-display text-4xl font-bold" aria-live="polite">{plan ? formatAr(plan.monthly) : "—"}</p>
          <p className="text-sm text-white/85">{plan ? `pendant ${months} mois` : `${settings.product} ${settings.partner}`}</p>
        </div>
        {plan && (
          <dl className="mt-4 space-y-1 border-t border-white/25 pt-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-white/80">Apport</dt><dd className="font-semibold">{formatAr(down)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/80">Emprunté</dt><dd className="font-semibold">{formatAr(plan.loan)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/80">Frais de dossier ({settings.feePct} %)</dt><dd className="font-semibold">{formatAr(plan.fee)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-white/80">Coût total</dt><dd className="font-semibold">{formatAr(plan.total)}</dd></div>
          </dl>
        )}
        <p className="mt-3 text-xs text-white/80">Taux {formatNumber(settings.annualRatePct)} % / an · frais inclus dans le prêt · prêt accordé par la {settings.partner}</p>
        {!onChange && (
          <a href={waLink(whatsapp, text)} target="_blank" rel="noopener" className="btn mt-4 bg-white text-ink hover:bg-white/90">
            <WhatsAppIcon className="h-4 w-4 text-[#1da851]" /> {plan ? "Demander ce plan" : "En parler sur WhatsApp"}
          </a>
        )}
      </div>
      <p className="text-xs text-muted md:col-span-2">{settings.conditions}</p>
    </div>
  );
}
