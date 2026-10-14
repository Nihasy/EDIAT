// Vehicle model and the lists behind every select, filter and badge.
// No server code here: the browser uses it too (admin forms, filters).

export const STATUSES = {
  showroom: {
    label: "Disponible au showroom",
    short: "Dispo de suite",
    hint: "Visible au showroom, à essayer et à emporter tout de suite.",
    isPublic: true,
    listed: true,
    rank: 0,
    tone: "green",
  },
  arrivage: {
    label: "En cours d'arrivage",
    short: "En arrivage",
    hint: "Déjà acheté, en route vers Madagascar : réservez-le avant son arrivée.",
    isPublic: true,
    listed: true,
    rank: 1,
    tone: "cyan",
  },
  sur_commande: {
    label: "Sur commande",
    short: "Sur commande",
    hint: "Importé de Corée pour vous : choisi, contrôlé, expédié et dédouané par Ediat Garage.",
    isPublic: true,
    listed: true,
    rank: 2,
    tone: "orange",
  },
  reserve: {
    label: "Réservé",
    short: "Réservé",
    hint: "Un client a versé un acompte. Demandez-nous un modèle similaire.",
    isPublic: true,
    listed: true,
    rank: 3,
    tone: "grey",
  },
  vendu: {
    label: "Vendu",
    short: "Vendu",
    hint: "Ce véhicule a trouvé preneur. Nous pouvons en importer un équivalent.",
    isPublic: true,
    listed: false,
    rank: 4,
    tone: "grey",
  },
  brouillon: {
    label: "Brouillon (masqué)",
    short: "Brouillon",
    hint: "Invisible sur le site.",
    isPublic: false,
    listed: false,
    rank: 5,
    tone: "grey",
  },
} as const;

export type VehicleStatus = keyof typeof STATUSES;
export const STATUS_IDS = Object.keys(STATUSES) as VehicleStatus[];
// Availability filters offered to visitors, in this order.
export const PUBLIC_DISPO: VehicleStatus[] = ["showroom", "arrivage", "sur_commande"];

export function isStatus(v: unknown): v is VehicleStatus {
  return typeof v === "string" && v in STATUSES;
}

export const FUELS = ["Diesel", "Essence", "Hybride", "Électrique", "GPL"];
export const GEARBOXES = ["Automatique", "Manuelle"];
export const BODIES = ["SUV", "4x4", "Berline", "Citadine", "Monospace", "Pick-up", "Utilitaire", "Minibus", "Break", "Coupé"];
export const DRIVES = ["2 roues motrices", "4x4 / AWD"];
// Suggestions only: any brand can be typed in.
export const BRANDS = [
  "Hyundai",
  "Kia",
  "SsangYong",
  "Daewoo",
  "Chevrolet",
  "Genesis",
  "Renault Samsung",
  "Volkswagen",
  "Audi",
  "Mercedes-Benz",
  "BMW",
  "Toyota",
];
// Brands shown on the home page, in this order.
export const FEATURED_BRANDS = ["Hyundai", "Kia", "SsangYong", "Daewoo"];

export type Vehicle = {
  id: number;
  ref: string;
  slug: string;
  status: VehicleStatus;
  brand: string;
  model: string;
  version: string;
  year: number | null;
  mileageKm: number | null;
  fuel: string;
  gearbox: string;
  body: string;
  drive: string;
  engine: string;
  powerHp: number | null;
  seats: number | null;
  doors: number | null;
  color: string;
  origin: string;
  price: number | null;
  oldPrice: number | null;
  monthlyOverride: number | null;
  financing: boolean;
  eta: string;
  featured: boolean;
  description: string;
  equipment: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

// Back-office only: never sent to the public pages.
export type AdminVehicle = Vehicle & { costAr: number | null; privateNotes: string };

export function vehicleTitle(v: Pick<Vehicle, "brand" | "model">) {
  return `${v.brand} ${v.model}`.trim();
}

export function vehicleFullTitle(v: Pick<Vehicle, "brand" | "model" | "version" | "year">) {
  return [vehicleTitle(v), v.version, v.year ? String(v.year) : ""].filter(Boolean).join(" ");
}

// "/voitures/kia-sportage-2-0-crdi-2015-12": readable, and the id at the end
// keeps old links working when the title changes.
export function vehicleSlug(v: Pick<Vehicle, "id" | "brand" | "model" | "version" | "year">) {
  const words = vehicleFullTitle(v)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return `${words}-${v.id}`;
}

export function idFromSlug(slug: string) {
  const m = slug.match(/(?:^|-)(\d{1,10})$/);
  return m ? Number(m[1]) : NaN;
}

export function vehicleHref(v: Pick<Vehicle, "slug">) {
  return `/voitures/${v.slug}`;
}

// Days a vehicle keeps its "Nouveau" badge after being published.
export const NEW_DAYS = 10;

export function isNew(v: Pick<Vehicle, "publishedAt">, now = Date.now()) {
  return !!v.publishedAt && now - new Date(v.publishedAt).getTime() < NEW_DAYS * 86_400_000;
}
