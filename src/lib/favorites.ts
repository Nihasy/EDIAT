"use client";

import { useSyncExternalStore } from "react";

// Favourites live in this browser only (no account needed). Every component
// using the hook updates at once, in all open tabs.
const KEY = "ediat:favoris";
const EVENT = "ediat:favoris";
const EMPTY: number[] = [];
let cache: { raw: string | null; list: number[] } = { raw: null, list: EMPTY };

function read(): number[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cache.raw) return cache.list;
  let list: number[] = EMPTY;
  try {
    const parsed = JSON.parse(raw ?? "[]");
    if (Array.isArray(parsed)) list = parsed.filter((n) => Number.isInteger(n) && n > 0).slice(0, 60);
  } catch {}
  cache = { raw, list };
  return list;
}

function write(list: number[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useFavorites() {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    ids: list,
    has: (id: number) => list.includes(id),
    toggle: (id: number) => write(list.includes(id) ? list.filter((x) => x !== id) : [id, ...list]),
    remove: (id: number) => write(list.filter((x) => x !== id)),
  };
}
