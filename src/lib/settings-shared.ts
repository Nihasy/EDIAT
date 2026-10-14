import type { FinanceSettings } from "./finance";

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
    enabled: true,
    name: "Ediat Facility",
    minDownPct: 30,
    annualRatePct: 18,
    durations: [6, 12, 18, 24],
    roundTo: 5000,
    conditions:
      "Simulation indicative, sous réserve d'acceptation du dossier. Pièces demandées : CIN, justificatif de domicile et de revenus. Le véhicule reste la propriété d'Ediat Garage jusqu'au dernier paiement.",
  },
};

export function parseSettings(value: string | null | undefined): Settings {
  if (!value) return DEFAULT_SETTINGS;
  try {
    const saved = JSON.parse(value) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...saved, finance: { ...DEFAULT_SETTINGS.finance, ...saved.finance } };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
