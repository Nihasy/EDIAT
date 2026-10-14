// "Ediat Facility" instalment plan: down payment, then fixed monthly payments.
// Shared by the simulator (browser) and the cards / vehicle pages (server).

export type FinanceSettings = {
  enabled: boolean;
  name: string; // "Ediat Facility"
  minDownPct: number; // minimum down payment, % of the price
  annualRatePct: number; // 0 = interest-free
  durations: number[]; // months offered, e.g. [6, 12, 18, 24]
  roundTo: number; // monthly amounts are rounded up to this many Ariary
  conditions: string; // shown under the simulator
};

export function monthlyPayment(price: number, down: number, months: number, annualRatePct: number, roundTo = 1000) {
  const principal = Math.max(0, price - down);
  if (!months || principal <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const raw = r > 0 ? (principal * r) / (1 - Math.pow(1 + r, -months)) : principal / months;
  const step = Math.max(1, roundTo);
  return Math.ceil(raw / step) * step;
}

export function minDown(price: number, s: FinanceSettings) {
  return Math.ceil((price * s.minDownPct) / 100 / 1000) * 1000;
}

// The "à partir de … / mois" figure: smallest down payment, longest duration,
// unless the vehicle has its own advertised amount.
export function fromMonthly(
  v: { price: number | null; financing: boolean; monthlyOverride: number | null },
  s: FinanceSettings,
) {
  if (!s.enabled || !v.financing || !v.price) return null;
  if (v.monthlyOverride) return v.monthlyOverride;
  const months = Math.max(...s.durations);
  if (!Number.isFinite(months) || months <= 0) return null;
  return monthlyPayment(v.price, minDown(v.price, s), months, s.annualRatePct, s.roundTo);
}

export function parseDurations(input: string) {
  const list = [...new Set(input.split(/[^\d]+/).map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 120))];
  return list.sort((a, b) => a - b);
}
