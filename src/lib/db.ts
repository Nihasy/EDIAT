import "server-only";
import { connection } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;
type QueryFn = (text: string, params?: unknown[]) => Promise<Row[]>;

// Append-only: the number of statements already applied is stored in
// "settings" (see migrate), so new statements go at the end.
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    ref TEXT,
    status TEXT NOT NULL DEFAULT 'brouillon',
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '',
    year INTEGER,
    mileage_km INTEGER,
    fuel TEXT NOT NULL DEFAULT '',
    gearbox TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    drive TEXT NOT NULL DEFAULT '',
    engine TEXT NOT NULL DEFAULT '',
    power_hp INTEGER,
    seats INTEGER,
    doors INTEGER,
    color TEXT NOT NULL DEFAULT '',
    origin TEXT NOT NULL DEFAULT '',
    price INTEGER,
    old_price INTEGER,
    monthly_override INTEGER,
    financing BOOLEAN NOT NULL DEFAULT TRUE,
    eta TEXT NOT NULL DEFAULT '',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT NOT NULL DEFAULT '',
    equipment TEXT NOT NULL DEFAULT '',
    images TEXT NOT NULL DEFAULT '[]',
    cost_ar INTEGER,
    private_notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    sold_at TIMESTAMPTZ
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS vehicles_ref_idx ON vehicles (ref)`,
  `CREATE INDEX IF NOT EXISTS vehicles_status_idx ON vehicles (status, published_at DESC)`,
  `CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    kind TEXT NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles (id) ON DELETE SET NULL,
    vehicle_label TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    details TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'nouveau',
    admin_note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status)`,
];

const globalForDb = globalThis as unknown as {
  __db?: Promise<QueryFn>;
};

async function createDriver(): Promise<QueryFn> {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  let query: QueryFn;
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    query = (text, params = []) => sql.query(text, params) as Promise<Row[]>;
  } else {
    if (process.env.VERCEL) {
      throw new Error("DATABASE_URL manquant : ajoutez une base Neon Postgres dans Vercel (Storage).");
    }
    // Local development: embedded Postgres stored on disk.
    const { PGlite } = await import("@electric-sql/pglite");
    const { mkdir } = await import("node:fs/promises");
    const dir = process.env.PGLITE_DIR || "./.data/pglite";
    await mkdir(dir, { recursive: true });
    const db = new PGlite(dir);
    query = async (text, params = []) => (await db.query<Row>(text, params)).rows;
  }
  await migrate(query);
  return query;
}

// The schema is replayed only when it grew: otherwise one read is enough and a
// cold start does not wake the database with a dozen statements.
async function migrate(query: QueryFn) {
  const version = String(SCHEMA.length);
  try {
    const rows = await query(`SELECT value FROM settings WHERE key = 'schema'`);
    if (rows[0]?.value === version) return;
  } catch {
    // First start: the settings table does not exist yet.
  }
  for (const statement of SCHEMA) await query(statement);
  await query(
    `INSERT INTO settings (key, value) VALUES ('schema', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [version],
  );
}

function driver() {
  if (!globalForDb.__db) {
    globalForDb.__db = createDriver().catch((err) => {
      globalForDb.__db = undefined;
      throw err;
    });
  }
  return globalForDb.__db;
}

// For reads kept in the Next.js cache (lib/catalog): they run outside a request,
// where connection() is not allowed.
export async function queryStatic(text: string, params: unknown[] = []) {
  const run = await driver();
  return run(text, params);
}

export async function query(text: string, params: unknown[] = []) {
  await connection();
  return queryStatic(text, params);
}

export async function queryOne(text: string, params: unknown[] = []) {
  const rows = await query(text, params);
  return rows[0] ?? null;
}

// Database ids are 32-bit integers: anything else (from a URL or a form) is not an id.
export function isDbId(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v > 0 && v <= 2_147_483_647;
}
