import "server-only";
import { query, queryOne } from "./db";
import { parseSettings, type Settings } from "./settings-shared";

export { DEFAULT_SETTINGS, parseSettings, type Settings } from "./settings-shared";

// Always read from the database: back-office and forms. Public pages use
// siteSettings() (lib/catalog), which is cached.
export async function getSettings(): Promise<Settings> {
  const row = await queryOne(`SELECT value FROM settings WHERE key = 'main'`);
  return parseSettings(row?.value);
}

export async function saveSettings(s: Settings) {
  await query(
    `INSERT INTO settings (key, value) VALUES ('main', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [JSON.stringify(s)],
  );
}
