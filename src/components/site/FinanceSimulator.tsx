"use client";

import { useEffect, useState } from "react";
import { minDown, monthlyPayment, type FinanceSettings } from "@/lib/finance";
import { formatAr, formatNumber, parseAmount, waLink } from "@/lib/format";
import { WhatsAppIcon } from "../WhatsAppIcon";

// Ediat Facility simulator: price, down payment, duration → monthly payment.
// `onChange` lets a parent form send the simulation with the request.
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
  onChange?: (sim: { price: number; down: number; months: number; monthly: number }) => void;
}) {
  const [priceInput, setPriceInput] = useState(fixedPrice ? formatNumber(fixedPrice) : "40 000 000");
  const price = fixedPrice ?? Math.max(0, parseAmount(priceInput) || 0);
  const floor = price ? minDown(price, settings) : 0;
  const [downPct, setDownPct] = useState(settings.minDownPct);
  const durations = settings.durations.length ? settings.durations : [12];
  const [months, setMonths] = useState(durations[durations.length - 1]);
  const down = Math.max(floor, Math.round((price * downPct) / 100 / 1000) * 1000);
  const monthly = monthlyPayment(price, down, months, settings.annualRatePct, settings.roundTo);
  const total = down + monthly * months;

  useEffect(() => {
    onChange?.({ price, down, months, monthly });
  }, [onChange, price, down, months, monthly]);

  const text = `Bonjour Ediat Garage, je souhaite un financement ${settings.name}${vehicleLabel ? ` pour : ${vehicleLabel}` : ""}.\nPrix : ${formatAr(price)}\nApport : ${formatAr(down)}\nDurée : ${months} mois\nMensualité estimée : ${formatAr(monthly)}`;

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
        <div>
          <div className="flex items-baseline justify-between">
            <label className="label" htmlFor="sim-down">Apport</label>
            <span className="text-sm font-semibold">{formatAr(down)} <span className="text-muted">({Math.round(price ? (down / price) * 100 : 0)} %)</span></span>
          </div>
          <input
            id="sim-down"
            type="range"
            min={settings.minDownPct}
            max={90}
            step={5}
            value={downPct}
            onChange={(e) => setDownPct(Number(e.target.value))}
            className="h-11 w-full accent-[var(--color-orange-deep)]"
          />
          <p className="flex justify-between text-xs text-muted"><span>Min. {settings.minDownPct} %</span><span>90 %</span></p>
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
      </div>
      <div className="bg-orange-gradient flex min-w-60 flex-col justify-between rounded-2xl p-5 text-white">
        <div>
          <p className="text-sm text-white/85">Votre mensualité</p>
          <p className="font-display text-4xl font-bold" aria-live="polite">{price ? formatAr(monthly) : "—"}</p>
          <p className="text-sm text-white/85">pendant {months} mois</p>
        </div>
        <dl className="mt-4 space-y-1 border-t border-white/25 pt-3 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-white/80">Apport</dt><dd className="font-semibold">{formatAr(down)}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-white/80">Coût total</dt><dd className="font-semibold">{formatAr(total)}</dd></div>
        </dl>
        {!onChange && (
          <a href={waLink(whatsapp, text)} target="_blank" rel="noopener" className="btn mt-4 bg-white text-ink hover:bg-white/90">
            <WhatsAppIcon className="h-4 w-4 text-[#1da851]" /> Demander ce plan
          </a>
        )}
      </div>
      <p className="text-xs text-muted md:col-span-2">{settings.conditions}</p>
    </div>
  );
}
