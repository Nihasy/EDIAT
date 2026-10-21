"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";
import { SITE_TAG } from "@/lib/catalog";
import { isDbId } from "@/lib/db";
import { FINANCE_VERSION, MAX_MONTHS, parseDurations } from "@/lib/finance";
import { isValidPhone, normalizePhone, parseAmount } from "@/lib/format";
import { isAllowedImageUrl, MAX_IMAGES } from "@/lib/images";
import { deleteLead, updateLead } from "@/lib/leads";
import { isLeadStatus } from "@/lib/leads-shared";
import { rateLimit } from "@/lib/rate-limit";
import { getSettings, saveSettings, type Settings } from "@/lib/settings";
import { isStatus, type VehicleStatus } from "@/lib/vehicle";
import {
  createVehicle,
  deleteVehicle,
  getAdminVehicle,
  refExists,
  setVehiclesStatus,
  updateVehicle,
  type VehicleInput,
} from "@/lib/vehicles";

export type FormState = { error?: string; ok?: string } | undefined;

// Any change visible on the site: drop the cached snapshot and re-render the
// cached pages (home, catalogue, vehicle pages).
function refreshSite() {
  updateTag(SITE_TAG);
  revalidatePath("/", "layout");
}

function str(form: FormData, key: string, max = 2000) {
  return String(form.get(key) ?? "").trim().slice(0, max);
}

function int(form: FormData, key: string): number | null {
  const raw = str(form, key).replace(/\s/g, "");
  if (!raw) return null;
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? Math.round(n) : NaN;
}

function amount(form: FormData, key: string) {
  return parseAmount(str(form, key));
}

// ---------- Session ----------

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  if (!(await rateLimit("login", 10, 15 * 60 * 1000))) return { error: "Trop de tentatives. Réessayez dans 15 minutes." };
  if (!checkPassword(str(form, "password", 200))) {
    await new Promise((r) => setTimeout(r, 600)); // slows down password guessing
    return { error: "Mot de passe incorrect." };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

// ---------- Vehicles ----------

const LIMITS = {
  year: [1980, new Date().getFullYear() + 1],
  mileageKm: [0, 2_000_000],
  powerHp: [20, 1500],
  seats: [1, 60],
  doors: [1, 6],
  price: [100_000, 5_000_000_000],
} as const;

function readVehicle(form: FormData): { input?: VehicleInput; error?: string } {
  const status = str(form, "status");
  if (!isStatus(status)) return { error: "Statut invalide." };
  const brand = str(form, "brand", 60);
  const model = str(form, "model", 80);
  if (!brand || !model) return { error: "Marque et modèle sont obligatoires." };

  let images: unknown;
  try {
    images = JSON.parse(str(form, "images", 40000) || "[]");
  } catch {
    return { error: "Photos invalides." };
  }
  if (!Array.isArray(images) || images.some((u) => typeof u !== "string" || !isAllowedImageUrl(u))) {
    return { error: "Une adresse de photo est invalide." };
  }
  if (images.length > MAX_IMAGES) return { error: `${MAX_IMAGES} photos maximum.` };

  const numbers = {
    year: int(form, "year"),
    powerHp: int(form, "power_hp"),
    seats: int(form, "seats"),
    doors: int(form, "doors"),
  };
  const labels: Record<keyof typeof numbers, string> = {
    year: "Année",
    powerHp: "Puissance",
    seats: "Places",
    doors: "Portes",
  };
  for (const [k, v] of Object.entries(numbers) as [keyof typeof numbers, number | null][]) {
    const [min, max] = LIMITS[k];
    if (v != null && (Number.isNaN(v) || v < min || v > max)) return { error: `${labels[k]} invalide (entre ${min} et ${max}).` };
  }
  const mileage = parseAmount(str(form, "mileage_km"));
  if (mileage != null && (Number.isNaN(mileage) || mileage < 0 || mileage > LIMITS.mileageKm[1])) return { error: "Kilométrage invalide." };

  const prices = {
    price: amount(form, "price"),
    oldPrice: amount(form, "old_price"),
    monthlyOverride: amount(form, "monthly_override"),
    costAr: amount(form, "cost_ar"),
  };
  for (const [k, v] of Object.entries(prices)) {
    if (v != null && (Number.isNaN(v) || v < 0 || v > LIMITS.price[1])) {
      return { error: `Montant invalide : ${{ price: "prix", oldPrice: "ancien prix", monthlyOverride: "mensualité", costAr: "prix de revient" }[k]}.` };
    }
  }
  if (prices.price != null && prices.price < LIMITS.price[0]) {
    return { error: "Le prix semble trop bas : saisissez-le en Ariary (ex. 45 000 000)." };
  }
  if (status !== "brouillon" && status !== "vendu" && images.length === 0) {
    return { error: "Ajoutez au moins une photo avant de mettre le véhicule en ligne (ou laissez-le en brouillon)." };
  }

  const ref = str(form, "ref", 30).toUpperCase().replace(/\s+/g, "-");
  if (ref && !/^[A-Z0-9][A-Z0-9._-]*$/.test(ref)) return { error: "Référence : lettres, chiffres, - _ . uniquement." };

  return {
    input: {
      ref: ref || null,
      status,
      brand,
      model,
      version: str(form, "version", 120),
      year: numbers.year,
      mileageKm: mileage,
      fuel: str(form, "fuel", 40),
      gearbox: str(form, "gearbox", 40),
      body: str(form, "body", 40),
      drive: str(form, "drive", 40),
      engine: str(form, "engine", 60),
      powerHp: numbers.powerHp,
      seats: numbers.seats,
      doors: numbers.doors,
      color: str(form, "color", 40),
      origin: str(form, "origin", 60),
      price: prices.price,
      oldPrice: prices.oldPrice,
      monthlyOverride: prices.monthlyOverride,
      financing: form.get("financing") === "on",
      eta: str(form, "eta", 60),
      featured: form.get("featured") === "on",
      description: str(form, "description", 6000),
      equipment: str(form, "equipment", 6000),
      images: images as string[],
      costAr: prices.costAr,
      privateNotes: str(form, "private_notes", 4000),
    },
  };
}

export async function saveVehicle(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(form.get("id")) || null;
  if (id && (!isDbId(id) || !(await getAdminVehicle(id)))) return { error: "Ce véhicule n'existe plus." };
  const { input, error } = readVehicle(form);
  if (!input) return { error };
  if (input.ref && (await refExists(input.ref, id ?? undefined))) return { error: `La référence ${input.ref} est déjà utilisée.` };

  let savedId = id;
  if (id) await updateVehicle(id, input);
  else savedId = await createVehicle(input);
  refreshSite();
  if (!id) redirect(`/admin/vehicules/${savedId}?cree=1`);
  return { ok: "Enregistré." };
}

export async function changeStatus(ids: number[], status: VehicleStatus): Promise<FormState> {
  await requireAdmin();
  if (!isStatus(status)) return { error: "Statut invalide." };
  const valid = ids.filter(isDbId).slice(0, 500);
  if (status !== "brouillon" && status !== "vendu") {
    // Same rule as the form: nothing goes online without a photo.
    const missing: string[] = [];
    for (const id of valid) {
      const v = await getAdminVehicle(id);
      if (v && !v.images.length) missing.push(v.ref || `${v.brand} ${v.model}`);
    }
    if (missing.length) return { error: `Sans photo, reste(nt) hors ligne : ${missing.join(", ")}.` };
  }
  await setVehiclesStatus(valid, status);
  refreshSite();
  return { ok: "Statut mis à jour." };
}

export async function removeVehicle(id: number) {
  await requireAdmin();
  if (!isDbId(id)) return;
  await deleteVehicle(id);
  refreshSite();
  redirect("/admin/vehicules");
}

export async function duplicateVehicle(id: number) {
  await requireAdmin();
  const v = isDbId(id) ? await getAdminVehicle(id) : null;
  if (!v) return;
  const newId = await createVehicle({
    ...v,
    ref: null,
    status: "brouillon",
    equipment: v.equipment.join("\n"),
    images: [],
    featured: false,
  });
  redirect(`/admin/vehicules/${newId}?copie=1`);
}

// ---------- Leads ----------

export async function saveLead(id: number, status: string, note: string): Promise<FormState> {
  await requireAdmin();
  if (!isDbId(id) || !isLeadStatus(status)) return { error: "Demande invalide." };
  await updateLead(id, status, String(note).slice(0, 4000));
  revalidatePath("/admin", "layout");
  return { ok: "Enregistré." };
}

export async function removeLead(id: number): Promise<FormState> {
  await requireAdmin();
  if (!isDbId(id)) return { error: "Demande invalide." };
  await deleteLead(id);
  revalidatePath("/admin", "layout");
  return { ok: "Supprimée." };
}

// ---------- Settings ----------

export async function updateSettings(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const current = await getSettings();
  const whatsapp = normalizePhone(str(form, "whatsapp", 30));
  const phone = normalizePhone(str(form, "phone", 30)) || whatsapp;
  if (!isValidPhone(whatsapp)) return { error: "Numéro WhatsApp invalide." };
  if (!isValidPhone(phone)) return { error: "Numéro de téléphone invalide." };
  const urls = ["facebookUrl", "instagramUrl", "tiktokUrl", "mapsUrl"] as const;
  const links = Object.fromEntries(urls.map((k) => [k, str(form, k, 300)])) as Record<(typeof urls)[number], string>;
  for (const [k, v] of Object.entries(links)) if (v && !/^https:\/\//.test(v)) return { error: `Lien invalide (${k}) : il doit commencer par https://` };

  const pct = (key: string, max: number) => {
    const n = Number(str(form, key).replace(",", "."));
    return Number.isFinite(n) && n >= 0 && n <= max ? n : NaN;
  };
  const minDownPct = pct("minDownPct", 90);
  const annualRatePct = pct("annualRatePct", 100);
  const orderDepositPct = pct("orderDepositPct", 100);
  const roundTo = pct("roundTo", 1_000_000);
  const feePct = pct("feePct", 20);
  const durations = parseDurations(str(form, "durations", 100));
  const minLoan = parseAmount(str(form, "minLoan", 20)) || 0;
  const maxLoan = parseAmount(str(form, "maxLoan", 20)) || 0;
  if ([minDownPct, annualRatePct, orderDepositPct, roundTo, feePct].some(Number.isNaN)) return { error: "Un pourcentage ou un arrondi est invalide." };
  if (!durations.length) return { error: `Indiquez au moins une durée de financement, ${MAX_MONTHS} mois au plus (ex. 12, 24, 36).` };
  if (!maxLoan || minLoan > maxLoan) return { error: "Le prêt maximum doit être supérieur au prêt minimum." };

  const next: Settings = {
    ...current,
    whatsapp,
    phone,
    email: str(form, "email", 120),
    address: str(form, "address", 300),
    hours: str(form, "hours", 300),
    announcement: str(form, "announcement", 200),
    orderDelay: str(form, "orderDelay", 40) || current.orderDelay,
    orderDepositPct,
    ...links,
    finance: {
      enabled: form.get("financeEnabled") === "on",
      version: FINANCE_VERSION,
      name: str(form, "financeName", 40) || "Ediat Facility",
      partner: str(form, "financePartner", 40) || "PAMF",
      product: str(form, "financeProduct", 40) || "Crédit PME",
      minDownPct,
      annualRatePct,
      feePct,
      minLoan,
      maxLoan,
      durations,
      roundTo: Math.max(1, roundTo),
      conditions: str(form, "conditions", 1000),
    },
  };
  await saveSettings(next);
  refreshSite();
  return { ok: "Paramètres enregistrés." };
}
