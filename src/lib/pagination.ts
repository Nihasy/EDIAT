// Pagination maths shared by the public catalogue and the back-office.

export function pageParam(v: unknown): number {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n >= 1 && n <= 100_000 ? n : 1;
}

// Pages to show: first, last, and a window around the current one, with gaps.
export function pageWindow(page: number, pageCount: number, around = 1): (number | "…")[] {
  const pages = new Set([1, pageCount]);
  for (let p = page - around; p <= page + around; p++) if (p >= 1 && p <= pageCount) pages.add(p);
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}
