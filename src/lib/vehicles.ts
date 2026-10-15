import "server-only";
import { query, queryOne, type Row } from "./db";
import { isStatus, vehicleSlug, type AdminVehicle, type Vehicle, type VehicleStatus } from "./vehicle";

function iso(v: unknown) {
  return v ? new Date(v as string).toISOString() : null;
}

function parseImages(raw: string): string[] {
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter((u) => typeof u === "string") : [];
  } catch {
    return [];
  }
}

export function toVehicle(r: Row): Vehicle {
  const base = {
    id: r.id,
    brand: r.brand,
    model: r.model,
    version: r.version ?? "",
    year: r.year ?? null,
  };
  return {
    ...base,
    ref: r.ref ?? "",
    slug: vehicleSlug(base),
    status: isStatus(r.status) ? r.status : "brouillon",
    mileageKm: r.mileage_km ?? null,
    fuel: r.fuel ?? "",
    gearbox: r.gearbox ?? "",
    body: r.body ?? "",
    drive: r.drive ?? "",
    engine: r.engine ?? "",
    powerHp: r.power_hp ?? null,
    seats: r.seats ?? null,
    doors: r.doors ?? null,
    color: r.color ?? "",
    origin: r.origin ?? "",
    price: r.price ?? null,
    oldPrice: r.old_price ?? null,
    monthlyOverride: r.monthly_override ?? null,
    financing: r.financing !== false,
    eta: r.eta ?? "",
    featured: !!r.featured,
    description: r.description ?? "",
    equipment: String(r.equipment ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    images: parseImages(r.images ?? "[]"),
    createdAt: iso(r.created_at)!,
    updatedAt: iso(r.updated_at)!,
    publishedAt: iso(r.published_at),
  };
}

export function toAdminVehicle(r: Row): AdminVehicle {
  return { ...toVehicle(r), costAr: r.cost_ar ?? null, privateNotes: r.private_notes ?? "" };
}

export type VehicleInput = {
  ref: string | null;
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
  equipment: string;
  images: string[];
  costAr: number | null;
  privateNotes: string;
};

const COLUMNS: [keyof VehicleInput, string][] = [
  ["ref", "ref"],
  ["status", "status"],
  ["brand", "brand"],
  ["model", "model"],
  ["version", "version"],
  ["year", "year"],
  ["mileageKm", "mileage_km"],
  ["fuel", "fuel"],
  ["gearbox", "gearbox"],
  ["body", "body"],
  ["drive", "drive"],
  ["engine", "engine"],
  ["powerHp", "power_hp"],
  ["seats", "seats"],
  ["doors", "doors"],
  ["color", "color"],
  ["origin", "origin"],
  ["price", "price"],
  ["oldPrice", "old_price"],
  ["monthlyOverride", "monthly_override"],
  ["financing", "financing"],
  ["eta", "eta"],
  ["featured", "featured"],
  ["description", "description"],
  ["equipment", "equipment"],
  ["images", "images"],
  ["costAr", "cost_ar"],
  ["privateNotes", "private_notes"],
];

function values(input: VehicleInput) {
  return COLUMNS.map(([k]) => (k === "images" ? JSON.stringify(input.images) : input[k]));
}

export async function createVehicle(input: VehicleInput) {
  const cols = COLUMNS.map(([, c]) => c);
  const row = await queryOne(
    `INSERT INTO vehicles (${cols.join(", ")}, published_at, sold_at)
     VALUES (${cols.map((_, i) => `$${i + 1}`).join(", ")},
       CASE WHEN $2 <> 'brouillon' THEN NOW() END,
       CASE WHEN $2 = 'vendu' THEN NOW() END)
     RETURNING id`,
    values(input),
  );
  const id = row!.id as number;
  if (!input.ref) await query(`UPDATE vehicles SET ref = $1 WHERE id = $2 AND ref IS NULL`, [defaultRef(id), id]);
  return id;
}

export function defaultRef(id: number) {
  return `EG-${String(id).padStart(4, "0")}`;
}

export async function updateVehicle(id: number, input: VehicleInput) {
  const sets = COLUMNS.map(([, c], i) => `${c} = $${i + 2}`);
  await query(
    `UPDATE vehicles SET ${sets.join(", ")}, updated_at = NOW(),
       published_at = COALESCE(published_at, CASE WHEN $3 <> 'brouillon' THEN NOW() END),
       sold_at = CASE WHEN $3 = 'vendu' THEN COALESCE(sold_at, NOW()) END
     WHERE id = $1`,
    [id, ...values({ ...input, ref: input.ref ?? defaultRef(id) })],
  );
}

export async function setVehiclesStatus(ids: number[], status: VehicleStatus) {
  if (!ids.length) return;
  await query(
    `UPDATE vehicles SET status = $2, updated_at = NOW(),
       published_at = COALESCE(published_at, CASE WHEN $2 <> 'brouillon' THEN NOW() END),
       sold_at = CASE WHEN $2 = 'vendu' THEN COALESCE(sold_at, NOW()) END
     WHERE id = ANY($1::int[])`,
    [ids, status],
  );
}

export async function deleteVehicle(id: number) {
  await query(`DELETE FROM vehicles WHERE id = $1`, [id]);
}

export async function getAdminVehicle(id: number) {
  const row = await queryOne(`SELECT * FROM vehicles WHERE id = $1`, [id]);
  return row ? toAdminVehicle(row) : null;
}

export async function refExists(ref: string, exceptId?: number) {
  const row = await queryOne(`SELECT id FROM vehicles WHERE ref = $1 AND id <> $2`, [ref, exceptId ?? 0]);
  return !!row;
}

export async function listAdminVehicles() {
  const rows = await query(`SELECT * FROM vehicles ORDER BY updated_at DESC`);
  return rows.map(toAdminVehicle);
}

