// Catalogue search engine, in memory. Shared by the server (catalogue, search
// suggestions) and the browser (highlighting). Ported from Moto Import:
// accents and punctuation ignored, prefixes, typos ("tuscon" finds Tucson),
// weighted fields, and an "any word" fallback when nothing matches every word.
// Only public fields are indexed: never the cost price or the private notes.

import type { Vehicle, VehicleStatus } from "./vehicle";

/** Lower case, no accents, no punctuation. "Coupé" → "coupe", "2.0 CRDi" → "2 0 crdi". */
export function normalize(s: string): string {
  return s
    .replace(/œ/gi, "oe")
    .replace(/æ/gi, "ae")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Words that say nothing about the car: "voiture kia" must find the Kias,
// "EG-012" the reference 012.
const STOP_WORDS = new Set([
  "voiture", "voitures", "vehicule", "vehicules", "occasion", "occasions", "de", "du", "des", "d", "la", "le",
  "les", "l", "un", "une", "et", "en", "a", "au", "aux", "pour", "avec", "sur", "eg", "ref",
]);

/** Query words, normalized, no duplicates, eight at most. */
export function tokenize(q: string | undefined): string[] {
  const words = normalize(q ?? "").split(" ").filter((w) => w && !STOP_WORDS.has(w));
  return [...new Set(words)].slice(0, 8);
}

/** Edit distance with transposition ("kai" → "kia" counts 1). Gives up past `max`. */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const n = b.length;
  let prev2: number[] = [];
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let min = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      row[j] = v;
      if (v < min) min = v;
    }
    if (min > max) return max + 1;
    prev2 = prev;
    prev = row;
  }
  return prev[n];
}

const NUMBER = /^\d+$/;

/**
 * Score of one query word against one indexed word: exact > prefix > typo > inside.
 * A number only matches a whole number: "2015" never passes for "2016", and
 * "20" does not find "2015".
 */
export function scoreWord(token: string, word: string, fuzzy = true): number {
  if (word === token) return 1;
  if (NUMBER.test(token)) return word.startsWith(token) && !/\d/.test(word[token.length] ?? "") ? 0.8 : 0;
  if (word.startsWith(token)) return token.length >= 2 ? 0.8 : 0.4;
  if (!fuzzy) return 0;
  if (token.length >= 4 && !/\d/.test(token)) {
    const max = token.length >= 7 ? 2 : 1;
    const d = Math.min(
      distance(token, word, max),
      distance(token, word.slice(0, token.length), max),
      distance(token, word.slice(0, token.length + max), max),
    );
    if (d <= max) return 0.55 - d * 0.1;
  }
  if (token.length >= 3 && word.includes(token)) return 0.35;
  return 0;
}

export type SearchField = {
  text: string;
  weight: number;
  /** Typos and partial matches allowed (default true). Off for long texts. */
  fuzzy?: boolean;
  /** Also index joined and split forms: "Santa Fe" → "santafe", "ix35" → "ix", "35". Short names only. */
  forms?: boolean;
};

export type PreparedField = { weight: number; fuzzy: boolean; words: string[] };

const pieces = (w: string) => w.match(/[a-z]+|\d+/g) ?? [];

export function prepareFields(fields: SearchField[]): PreparedField[] {
  return fields.map((f) => {
    const words = normalize(f.text).split(" ").filter(Boolean);
    const all = new Set(words);
    if (f.forms) {
      for (const w of words) for (const p of pieces(w)) all.add(p);
      for (let i = 0; i + 1 < words.length; i++) all.add(words[i] + words[i + 1]);
      if (words.length > 1) all.add(words.join(""));
    }
    return { weight: f.weight, fuzzy: f.fuzzy !== false, words: [...all] };
  });
}

// What buyers type for each type, fuel, gearbox and availability.
export const BODY_WORDS: Record<string, string> = {
  SUV: "suv crossover",
  "4x4": "4x4 4wd awd tout terrain",
  Berline: "berline sedan",
  Citadine: "citadine petite compacte ville",
  Monospace: "monospace minivan familiale",
  "Pick-up": "pickup pick up plateau double cabine",
  Utilitaire: "utilitaire fourgon fourgonnette van camionnette",
  Minibus: "minibus bus navette",
  Break: "break estate",
  Coupé: "coupe sportive cabriolet",
};
const FUEL_WORDS: Record<string, string> = {
  Diesel: "diesel gasoil gazole",
  Essence: "essence",
  Hybride: "hybride hybrid",
  Électrique: "electrique electric ev",
  GPL: "gpl lpg",
};
const GEARBOX_WORDS: Record<string, string> = {
  Automatique: "automatique auto bva",
  Manuelle: "manuelle manuel bvm",
};
const STATUS_WORDS: Partial<Record<VehicleStatus, string>> = {
  showroom: "disponible dispo showroom suite stock tana",
  arrivage: "arrivage bientot route",
  sur_commande: "commande importer import",
  reserve: "reserve",
};
export const BRAND_NICKNAMES: Record<string, string> = {
  "mercedes benz": "mercedes benz merco",
  volkswagen: "vw",
  "renault samsung": "samsung rsm",
  ssangyong: "ssang yong",
  "land rover": "range",
  chevrolet: "chevy",
};

export type Indexable = Pick<
  Vehicle,
  "brand" | "model" | "version" | "ref" | "year" | "body" | "fuel" | "gearbox" | "drive" | "engine" | "color" | "status"
> &
  Partial<Pick<Vehicle, "equipment" | "description">>;

export function vehicleFields(v: Indexable): SearchField[] {
  return [
    { text: v.model, weight: 4, forms: true },
    { text: `${v.brand} ${BRAND_NICKNAMES[normalize(v.brand)] ?? ""}`, weight: 3, forms: true },
    { text: v.ref, weight: 4, forms: true, fuzzy: false },
    { text: `${v.version} ${v.engine}`, weight: 2.5, forms: true },
    { text: `${v.body} ${BODY_WORDS[v.body] ?? ""}`, weight: 2 },
    { text: `${v.fuel} ${FUEL_WORDS[v.fuel] ?? ""} ${/crdi|vgt|tci|dci/i.test(v.engine + v.version) ? "diesel" : ""}`, weight: 2 },
    { text: `${v.gearbox} ${GEARBOX_WORDS[v.gearbox] ?? ""}`, weight: 2 },
    { text: /4x4|awd/i.test(v.drive) ? "4x4 4wd awd integrale" : "", weight: 1.5 },
    { text: v.year ? String(v.year) : "", weight: 1.5 },
    { text: v.color, weight: 1 },
    { text: STATUS_WORDS[v.status] ?? "", weight: 0.8, fuzzy: false },
    { text: (v.equipment ?? []).join(" "), weight: 0.7, fuzzy: false },
    { text: v.description ?? "", weight: 0.5, fuzzy: false },
  ];
}

// One index per vehicle object, rebuilt if the object changed.
const memo = new WeakMap<object, { sig: string; fields: PreparedField[] }>();
function index(v: Indexable): PreparedField[] {
  const sig = [v.brand, v.model, v.version, v.ref, v.year, v.body, v.fuel, v.gearbox, v.drive, v.engine, v.color, v.status, v.description?.length].join("|");
  const hit = memo.get(v);
  if (hit && hit.sig === sig) return hit.fields;
  const fields = prepareFields(vehicleFields(v));
  memo.set(v, { sig, fields });
  return fields;
}

/**
 * Scorer for one query. Every word must match ("kia 2015" narrows); with
 * `anyWord`, one is enough and the score is weighted by the share found.
 */
export function makeScorer(tokens: string[]) {
  const cache = tokens.map(() => new Map<string, number>());
  const joined = tokens.join("");
  return (fields: PreparedField[], anyWord = false): number => {
    if (!tokens.length) return 1;
    let total = 0;
    let found = 0;
    for (let i = 0; i < tokens.length; i++) {
      let best = 0;
      for (const f of fields) {
        const prefix = f.fuzzy ? "f" : "s";
        for (const w of f.words) {
          const k = prefix + w;
          let n = cache[i].get(k);
          if (n === undefined) cache[i].set(k, (n = scoreWord(tokens[i], w, f.fuzzy)));
          if (n * f.weight > best) best = n * f.weight;
        }
      }
      if (best > 0) found++;
      else if (!anyWord) return 0;
      total += best;
    }
    if (anyWord) return found ? total * (found / tokens.length) : 0;
    // Typed in one go inside the model or brand ("santa fe" → "Santa Fe"): first.
    if (tokens.length > 1 && fields.slice(0, 2).some((f) => f.words.some((w) => w.startsWith(joined)))) total += 1.5;
    return total;
  };
}

export type Found<T> = { item: T; score: number };

/**
 * Vehicles that answer the query, with their score. No useful word: all pass.
 * Nothing matches every word: the closest ones, flagged `approximate`.
 */
export function searchList<T extends Indexable>(list: T[], q: string | undefined): { found: Found<T>[]; approximate: boolean; tokens: string[] } {
  const tokens = tokenize(q);
  if (!tokens.length) return { found: list.map((item) => ({ item, score: 0 })), approximate: false, tokens };
  const score = makeScorer(tokens);
  const strict = list.map((item) => ({ item, score: score(index(item)) })).filter((x) => x.score > 0);
  if (strict.length) return { found: strict, approximate: false, tokens };
  const close = list.map((item) => ({ item, score: score(index(item), true) })).filter((x) => x.score > 0);
  return { found: close, approximate: close.length > 0, tokens };
}

/** Score of free texts (brand names, types) against a query: suggestions. */
export function scoreTexts(texts: string[], q: string | undefined): number {
  const tokens = tokenize(q);
  if (!tokens.length) return 0;
  return makeScorer(tokens)(prepareFields(texts.map((text) => ({ text, weight: 1, forms: true }))));
}

/** Splits `text` into pieces, the ones matching a query word flagged (for <mark>). */
export function highlight(text: string, tokens: string[]): { text: string; hit: boolean }[] {
  if (!tokens.length) return [{ text, hit: false }];
  const parts: { text: string; hit: boolean }[] = [];
  for (const bit of text.match(/[\p{L}\p{N}]+|[^\p{L}\p{N}]+/gu) ?? []) {
    const n = normalize(bit).replace(/ /g, "");
    const hit = n !== "" && tokens.some((t) => scoreWord(t, n) > 0.3 || pieces(n).some((p) => scoreWord(t, p) >= 0.8));
    const last = parts[parts.length - 1];
    if (last && last.hit === hit) last.text += bit;
    else parts.push({ text: bit, hit });
  }
  return parts;
}
