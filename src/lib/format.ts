// Formatting helpers shared by the server and the browser.

const SPACE = /[  ]/g;

export function formatAr(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR").replace(SPACE, " ")} Ar`;
}

export function formatNumber(n: number) {
  return Math.round(n).toLocaleString("fr-FR").replace(SPACE, " ");
}

export function formatKm(n: number | null | undefined) {
  return n == null ? "" : `${formatNumber(n)} km`;
}

// "1 930 000" → 1930000; "1.930.000", "1 930 000 Ar" and "1930000,00" too.
export function parseAmount(input: string): number | null {
  const raw = input.replace(/ar$/i, "").trim().replace(/[.,]\d{1,2}$/, "").replace(/[\s.,  ]/g, "");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n) : NaN;
}

// Malagasy numbers: "034 12 345 67", "+261 34 12 345 67" → "261341234567".
export function normalizePhone(input: string) {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "261" + d.slice(1);
  if (!d.startsWith("261") && d.length === 9) d = "261" + d;
  return d;
}

export function displayPhone(p: string) {
  const d = p.startsWith("261") ? "0" + p.slice(3) : p;
  return d.replace(/^(\d{3})(\d{2})(\d{3})(\d{2})$/, "$1 $2 $3 $4");
}

export function isValidPhone(p: string) {
  return /^\d{9,15}$/.test(p);
}

export function waLink(phone: string, text?: string) {
  const base = `https://wa.me/${phone.replace(/\D/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function telLink(phone: string) {
  return `tel:+${phone.replace(/\D/g, "")}`;
}

export function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Indian/Antananarivo" });
}

export function formatDateTime(d: string | Date) {
  return new Date(d).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Indian/Antananarivo",
  });
}

// Accent- and case-insensitive text for search and slugs.
export function fold(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function slugify(s: string) {
  return fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
