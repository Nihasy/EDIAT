"use server";

import { isDbId } from "@/lib/db";
import { isValidPhone, normalizePhone } from "@/lib/format";
import { createLead } from "@/lib/leads";
import { DETAIL_LABELS, isLeadKind } from "@/lib/leads-shared";
import { rateLimit } from "@/lib/rate-limit";
import { publicVehicle } from "@/lib/catalog";
import { vehicleFullTitle } from "@/lib/vehicle";

export type LeadState = { error?: string; ok?: boolean; name?: string } | undefined;

function str(form: FormData, key: string, max = 500) {
  return String(form.get(key) ?? "").trim().slice(0, max);
}

// Every public form (vehicle interest, test drive, import request, financing,
// trade-in, contact) lands in the "Demandes" list of the back-office.
export async function submitLead(_prev: LeadState, form: FormData): Promise<LeadState> {
  // Honeypot: hidden from people, filled in by bots.
  if (str(form, "website")) return { ok: true };
  const kind = str(form, "kind");
  if (!isLeadKind(kind)) return { error: "Formulaire invalide." };
  const name = str(form, "name", 80);
  const phone = normalizePhone(str(form, "phone", 30));
  const email = str(form, "email", 120);
  const message = str(form, "message", 2000);
  if (name.length < 2) return { error: "Indiquez votre nom." };
  if (!isValidPhone(phone)) return { error: "Numéro de téléphone invalide (ex. 034 12 345 67)." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Adresse e-mail invalide." };
  if (!(await rateLimit("lead", 8, 60 * 60 * 1000))) {
    return { error: "Trop de demandes envoyées. Réessayez plus tard ou écrivez-nous sur WhatsApp." };
  }

  let vehicleId: number | null = Number(str(form, "vehicle_id")) || null;
  let vehicleLabel = "";
  if (vehicleId) {
    const v = isDbId(vehicleId) ? await publicVehicle(vehicleId) : null;
    if (v) vehicleLabel = `${vehicleFullTitle(v)} (${v.ref})`;
    else vehicleId = null;
  }
  const details: Record<string, string> = {};
  for (const key of Object.keys(DETAIL_LABELS)) {
    const v = str(form, key, 120);
    if (v) details[key] = v;
  }

  await createLead({ kind, vehicleId, vehicleLabel, name, phone, email, message, details });
  return { ok: true, name };
}
