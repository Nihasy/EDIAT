import "server-only";
import { query, queryOne, type Row } from "./db";
import { isLeadKind, isLeadStatus, type Lead, type LeadKind, type LeadStatus } from "./leads-shared";

function toLead(r: Row): Lead {
  let details: Record<string, string> = {};
  try {
    details = JSON.parse(r.details ?? "{}");
  } catch {}
  return {
    id: r.id,
    kind: isLeadKind(r.kind) ? r.kind : "contact",
    vehicleId: r.vehicle_id ?? null,
    vehicleLabel: r.vehicle_label ?? "",
    name: r.name,
    phone: r.phone,
    email: r.email ?? "",
    message: r.message ?? "",
    details,
    status: isLeadStatus(r.status) ? r.status : "nouveau",
    adminNote: r.admin_note ?? "",
    createdAt: new Date(r.created_at).toISOString(),
  };
}

export type LeadInput = {
  kind: LeadKind;
  vehicleId: number | null;
  vehicleLabel: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  details: Record<string, string>;
};

export async function createLead(input: LeadInput) {
  const row = await queryOne(
    `INSERT INTO leads (kind, vehicle_id, vehicle_label, name, phone, email, message, details)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [input.kind, input.vehicleId, input.vehicleLabel, input.name, input.phone, input.email, input.message, JSON.stringify(input.details)],
  );
  return row!.id as number;
}

export async function listLeads(filter: { status?: LeadStatus; kind?: LeadKind; q?: string; limit?: number; offset?: number }) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter.status) where.push(`status = $${params.push(filter.status)}`);
  if (filter.kind) where.push(`kind = $${params.push(filter.kind)}`);
  if (filter.q) {
    const digits = filter.q.replace(/\D/g, "");
    const like = `%${filter.q.toLowerCase()}%`;
    const parts = [`LOWER(name) LIKE $${params.push(like)}`, `LOWER(vehicle_label) LIKE $${params.length}`, `LOWER(message) LIKE $${params.length}`];
    if (digits.length >= 4) parts.push(`phone LIKE $${params.push(`%${digits.replace(/^0/, "")}%`)}`);
    where.push(`(${parts.join(" OR ")})`);
  }
  const sql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [rows, total] = await Promise.all([
    query(`SELECT * FROM leads ${sql} ORDER BY created_at DESC LIMIT ${filter.limit ?? 50} OFFSET ${filter.offset ?? 0}`, params),
    query(`SELECT COUNT(*)::int AS n FROM leads ${sql}`, params),
  ]);
  return { items: rows.map(toLead), total: total[0].n as number };
}

export async function leadCounts() {
  const rows = await query(`SELECT status, COUNT(*)::int AS n FROM leads GROUP BY status`);
  return Object.fromEntries(rows.map((r) => [r.status, r.n])) as Partial<Record<LeadStatus, number>>;
}

export async function updateLead(id: number, status: LeadStatus, adminNote: string) {
  await query(`UPDATE leads SET status = $2, admin_note = $3, updated_at = NOW() WHERE id = $1`, [id, status, adminNote]);
}

export async function deleteLead(id: number) {
  await query(`DELETE FROM leads WHERE id = $1`, [id]);
}

export async function leadsForVehicle(vehicleId: number) {
  const rows = await query(`SELECT * FROM leads WHERE vehicle_id = $1 ORDER BY created_at DESC LIMIT 20`, [vehicleId]);
  return rows.map(toLead);
}
