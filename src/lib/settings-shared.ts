import { FINANCE_VERSION, type FinanceSettings } from "./finance";

export type Settings = {
  whatsapp: string; // international format without +, e.g. 261340000000
  phone: string; // for calls, same format
  email: string;
  address: string;
  mapsUrl: string;
  hours: string;
  announcement: string; // thin banner above the header, empty = hidden
  orderDelay: string; // "45 à 75 jours" for vehicles imported on order
  orderDepositPct: number;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  finance: FinanceSettings;
};

export const DEFAULT_SETTINGS: Settings = {
  whatsapp: "261340000000",
  phone: "261340000000",
  email: "",
  address: "Antananarivo, Madagascar",
  mapsUrl: "",
  hours: "Lundi – Vendredi : 8h – 17h\nSamedi : 8h – 12h",
  announcement: "",
  orderDelay: "45 à 75 jours",
  orderDepositPct: 30,
  facebookUrl: "https://www.facebook.com/",
  instagramUrl: "",
  tiktokUrl: "",
  finance: {
    version: FINANCE_VERSION,
    enabled: true,
    name: "Ediat Facility",
    partner: "PAMF",
    product: "Crédit PME",
    minDownPct: 0,
    annualRatePct: 32,
    feePct: 3,
    minLoan: 15_000_001,
    maxLoan: 600_000_000,
    durations: [12, 24, 36],
    roundTo: 1,
    conditions:
      "Simulation indicative, sans valeur contractuelle : le taux, les frais et l'accord du prêt sont fixés par la PAMF après étude du dossier. Crédit PME de 15 000 001 à 600 000 000 Ar, jusqu'à 36 mois. Conditions PAMF : nationalité malgache ou résident permanent, 21 à 67 ans, activité exercée depuis au moins un an, aucun crédit en cours dans un autre établissement. Pièces : CIN de chaque signataire, RCS / NIF / STAT, statuts certifiés, lettre de pouvoir des signataires.",
  },
};

export function parseSettings(value: string | null | undefined): Settings {
  if (!value) return DEFAULT_SETTINGS;
  try {
    const saved = JSON.parse(value) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...saved, finance: parseFinance(saved.finance) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Settings saved before the PAMF partnership (in-house plan at 18 %) are reset
// to the PAMF defaults; only the on/off switch and the offer name are kept.
function parseFinance(saved: Partial<FinanceSettings> | undefined): FinanceSettings {
  const d = DEFAULT_SETTINGS.finance;
  if (!saved) return d;
  if (saved.version !== FINANCE_VERSION) return { ...d, enabled: saved.enabled ?? d.enabled, name: saved.name || d.name };
  return { ...d, ...saved };
}
