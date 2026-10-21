// "Ediat Facility" = the vehicle is financed by a PAMF "Crédit PME" loan.
// Shared by the simulator (browser) and the cards / vehicle pages (server).
//
// Same maths as the PAMF simulator (pamf.mg/simulation-pret):
// - the file fee (feePct of the loan) is added to the amount borrowed;
// - monthly rate = annual rate / 360 × 31;
// - fixed monthly payments (annuity).
// Check: 15 000 001 Ar over 36 months at 32 % + 3 % fee → 682 096 Ar, as on pamf.mg.

export const FINANCE_VERSION = 2; // bump when saved settings must be reset to the new defaults

export type FinanceSettings = {
  version: number;
  enabled: boolean;
  name: string; // "Ediat Facility"
  partner: string; // "PAMF"
  product: string; // "Crédit PME"
  minDownPct: number; // down payment asked by Ediat Garage, % of the price (0 = none)
  annualRatePct: number; // PAMF rate, 32
  feePct: number; // PAMF file fee, 3, added to the loan
  minLoan: number; // PAMF bounds for the amount borrowed
  maxLoan: number;
  durations: number[]; // months offered, max 36
  roundTo: number; // 1 = exact amount, as on pamf.mg
  conditions: string; // shown under the simulator
};

export const MAX_MONTHS = 36;

export type LoanPlan = {
  loan: number; // price − down payment
  fee: number; // file fee, financed
  monthly: number;
  total: number; // down payment + all monthly payments
};

// Monthly payment on `loan` Ariary (before the fee is added).
export function monthlyPayment(loan: number, months: number, s: Pick<FinanceSettings, "annualRatePct" | "feePct" | "roundTo">) {
  if (!months || loan <= 0) return 0;
  const borrowed = loan * (1 + s.feePct / 100);
  const r = (s.annualRatePct / 100 / 360) * 31;
  const raw = r > 0 ? (borrowed * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1) : borrowed / months;
  const step = Math.max(1, s.roundTo);
  return step === 1 ? Math.round(raw) : Math.ceil(raw / step) * step;
}

export function minDown(price: number, s: FinanceSettings) {
  return Math.ceil((price * s.minDownPct) / 100 / 1000) * 1000;
}

// Down payment range that keeps the loan within the PAMF bounds, or null when
// the vehicle cannot be financed (price too low once the minimum down payment is paid).
export function downRange(price: number, s: FinanceSettings) {
  if (!price) return null;
  const min = Math.max(minDown(price, s), price - s.maxLoan);
  const max = price - s.minLoan;
  return max >= min ? { min, max } : null;
}

export function loanPlan(price: number, down: number, months: number, s: FinanceSettings): LoanPlan | null {
  const range = downRange(price, s);
  if (!range || !months) return null;
  const d = Math.min(range.max, Math.max(range.min, down));
  const loan = price - d;
  const monthly = monthlyPayment(loan, months, s);
  return { loan, fee: Math.round((loan * s.feePct) / 100), monthly, total: d + monthly * months };
}

// The "à partir de … / mois" figure: smallest down payment, longest duration,
// unless the vehicle has its own advertised amount. Null when not financeable.
export function fromMonthly(
  v: { price: number | null; financing: boolean; monthlyOverride: number | null },
  s: FinanceSettings,
) {
  if (!s.enabled || !v.financing || !v.price) return null;
  const range = downRange(v.price, s);
  if (!range) return null;
  if (v.monthlyOverride) return v.monthlyOverride;
  const months = Math.max(...s.durations);
  if (!Number.isFinite(months) || months <= 0) return null;
  return monthlyPayment(v.price - range.min, months, s);
}

export function parseDurations(input: string) {
  const list = [...new Set(input.split(/[^\d]+/).map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= MAX_MONTHS))];
  return list.sort((a, b) => a - b);
}
