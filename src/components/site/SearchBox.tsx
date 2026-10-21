"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { catalogHref, type Filters } from "@/lib/catalog-filter";
import type { Suggestions } from "@/lib/catalog";
import { BRAND_LOGOS } from "@/lib/brands";
import { formatAr } from "@/lib/format";
import { highlight, tokenize } from "@/lib/search";
import { STATUSES } from "@/lib/vehicle";
import { BodyIcon } from "./BodyIcon";
import { CloseIcon, SearchIcon } from "../Icons";
import { Spinner } from "../ui/Spinner";

const RECENT_KEY = "ediat:recherches";

function readRecent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

function remember(q: string) {
  try {
    const next = [q, ...readRecent().filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Private browsing: recent searches are only a convenience.
  }
}

function Marked({ text, q }: { text: string; q: string }) {
  return (
    <>
      {highlight(text, tokenize(q)).map((p, i) =>
        p.hit ? <mark key={i} className="bg-transparent font-bold text-orange-deep">{p.text}</mark> : <span key={i}>{p.text}</span>,
      )}
    </>
  );
}

type Option = { key: string; href?: string; text?: string };

/**
 * Catalogue search box, ported from Moto Import: suggestions while typing
 * (brands, types, vehicles with photo and price), recent searches, popular
 * brands before typing, arrow keys + Enter, Escape, and "/" from anywhere.
 */
export function SearchBox({
  value = "",
  keep = {},
  popularBrands,
  whatsappHref,
  placeholder = "Tucson, Sportage, diesel, SUV…",
  dark = false,
}: {
  value?: string;
  /** Filters kept when searching (the catalogue keeps its availability, type…). */
  keep?: Filters;
  /** Brands with the most cars, offered before typing. */
  popularBrands: { name: string; n: number }[];
  /** "Not found" link: we import on demand. */
  whatsappHref?: string;
  placeholder?: string;
  dark?: boolean;
}) {
  const router = useRouter();
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState(value);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Suggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const query = q.trim();

  // Follow the URL (back button, search chip removed).
  const [tracked, setTracked] = useState(value);
  if (value !== tracked) {
    setTracked(value);
    setQ(value);
  }

  useEffect(() => {
    const onDown = (e: globalThis.MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    // "/" opens the search from anywhere on the page, like most shops.
    const onKey = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || t.isContentEditable) return;
      e.preventDefault();
      input.current?.focus();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // 150 ms after the last key; a stale request is dropped.
  useEffect(() => {
    if (!query) return;
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/recherche?q=${encodeURIComponent(query)}`, { signal: abort.signal });
        if (!r.ok) throw new Error(String(r.status));
        setData((await r.json()) as Suggestions);
        setActive(-1);
      } catch {
        // Aborted or offline: the previous suggestions stay.
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    }, 150);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [query]);

  const brandHref = (b: string) => catalogHref({}, { marque: b });
  const options: Option[] = query
    ? [
        ...(data?.brands ?? []).map((b) => ({ key: `b:${b.name}`, href: brandHref(b.name) })),
        ...(data?.bodies ?? []).map((b) => ({ key: `t:${b.name}`, href: catalogHref({}, { carrosserie: b.name }) })),
        ...(data?.vehicles ?? []).map((v) => ({ key: `v:${v.slug}`, href: `/voitures/${v.slug}` })),
        { key: "all", text: query },
      ]
    : [
        ...recent.map((r) => ({ key: `r:${r}`, text: r })),
        ...popularBrands.map((b) => ({ key: `b:${b.name}`, href: brandHref(b.name) })),
      ];

  function run(text: string) {
    const t = text.trim();
    if (t) remember(t);
    setQ(t);
    setOpen(false);
    (document.activeElement as HTMLElement | null)?.blur();
    router.push(catalogHref(keep, { q: t || "" }));
  }

  function choose(o: Option | undefined) {
    if (!o) return;
    if (query) remember(query);
    setOpen(false);
    (document.activeElement as HTMLElement | null)?.blur();
    if (o.text !== undefined) return run(o.text);
    if (o.href) router.push(o.href);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      if (!options.length) return;
      setActive((i) => (e.key === "ArrowDown" ? (i + 1) % options.length : (i - 1 + options.length) % options.length));
    } else if (e.key === "Escape") {
      if (open) setOpen(false);
      else setQ("");
    }
  }

  const row = (i: number) => ({
    id: `${id}-o${i}`,
    role: "option" as const,
    "aria-selected": active === i,
    onMouseEnter: () => setActive(i),
    // Keeps the phone keyboard up: the field keeps focus until the click.
    onMouseDown: (e: MouseEvent) => e.preventDefault(),
    onClick: () => choose(options[i]),
    className: `flex min-h-11 w-full cursor-pointer items-center gap-3 px-4 py-2 text-left text-[15px] ${active === i ? "bg-paper" : ""}`,
  });

  const vehicleOffset = (data?.brands.length ?? 0) + (data?.bodies.length ?? 0);
  const panel = open && (query ? Boolean(data) || loading : recent.length + popularBrands.length > 0);
  const listId = `${id}-list`;
  const heading = "px-4 pt-3 pb-1 text-[11px] font-bold tracking-wide text-muted uppercase";

  return (
    <div ref={root} className="relative">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (active >= 0 && options[active]) choose(options[active]);
          else run(q);
        }}
        className={`flex items-center gap-1 rounded-full py-1 pr-1 pl-4 ring-1 focus-within:ring-2 focus-within:ring-cyan-deep ${dark ? "bg-white ring-white/20" : "bg-white ring-black/10"}`}
      >
        <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
        <input
          ref={input}
          type="search"
          name="q"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            if (!e.target.value.trim()) setData(null);
          }}
          onFocus={(e) => {
            setRecent(readRecent());
            setOpen(true);
            // Phones: the suggestions open under the box; lift it just below the header.
            if (window.matchMedia("(max-width: 767px)").matches) {
              const top = e.currentTarget.getBoundingClientRect().top;
              if (top > window.innerHeight * 0.35) {
                const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                window.scrollBy({ top: top - 88, behavior: smooth ? "smooth" : "auto" });
              }
            }
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Rechercher un véhicule"
          role="combobox"
          aria-expanded={panel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-o${active}` : undefined}
          enterKeyHint="search"
          autoComplete="off"
          maxLength={80}
          // 16 px: below that, Safari on iPhone zooms on the field.
          className="min-h-11 min-w-0 flex-1 bg-transparent px-1 text-[16px] text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setData(null);
              input.current?.focus();
            }}
            aria-label="Effacer la recherche"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-black/5 hover:text-ink"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}
        <button type="submit" className="flex min-h-10 shrink-0 items-center rounded-full bg-orange-deep px-4 text-sm font-semibold text-white hover:bg-orange-deep/90">
          Chercher
        </button>
      </form>

      {panel && (
        <div
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-[70dvh] overflow-auto rounded-2xl bg-white py-1 text-ink shadow-2xl ring-1 ring-black/10"
        >
          {!query ? (
            <>
              {recent.length > 0 && (
                <div className="flex items-center justify-between pr-4">
                  <p className={heading}>Recherches récentes</p>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      try {
                        localStorage.removeItem(RECENT_KEY);
                      } catch {}
                      setRecent([]);
                    }}
                    className="min-h-9 pt-2 text-xs text-muted underline"
                  >
                    Effacer
                  </button>
                </div>
              )}
              {recent.map((r, i) => (
                <div key={r} {...row(i)}>
                  <SearchIcon className="h-4 w-4 shrink-0 text-muted" />
                  {r}
                </div>
              ))}
              {popularBrands.length > 0 && <p className={heading}>Marques</p>}
              {popularBrands.map((b, i) => (
                <div key={b.name} {...row(recent.length + i)}>
                  <BrandMark name={b.name} />
                  <span className="flex-1">{b.name}</span>
                  {b.n > 0 && <span className="text-[13px] text-muted tabular-nums">{b.n}</span>}
                </div>
              ))}
            </>
          ) : data ? (
            <>
              {data.approximate && <p className="px-4 pt-2 pb-1 text-[13px] text-muted">Rien d&apos;exact pour « {query} » : les plus proches.</p>}
              {data.brands.map((b, i) => (
                <div key={b.name} {...row(i)}>
                  <BrandMark name={b.name} />
                  <span className="flex-1">
                    Toutes les <strong>{b.name}</strong>
                  </span>
                  <span className="text-[13px] text-muted tabular-nums">{b.n || "Sur commande"}</span>
                </div>
              ))}
              {data.bodies.map((b, i) => (
                <div key={b.name} {...row(data.brands.length + i)}>
                  <span className="flex h-9 w-12 shrink-0 items-center justify-center text-ink/80">
                    <BodyIcon type={b.name} className="h-5 w-12" />
                  </span>
                  <span className="flex-1">
                    Type <strong>{b.name}</strong>
                  </span>
                  <span className="text-[13px] text-muted tabular-nums">{b.n}</span>
                </div>
              ))}
              {data.vehicles.map((v, i) => (
                <div key={v.slug} {...row(vehicleOffset + i)}>
                  <span className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-paper">
                    {v.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      <Marked text={v.title} q={query} />
                    </span>
                    <span className="block truncate text-[13px] text-muted">{v.detail}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[14px] font-semibold">{v.price ? formatAr(v.price) : "Sur demande"}</span>
                    {v.status !== "showroom" && <span className="block text-[12px] text-muted">{STATUSES[v.status].short}</span>}
                  </span>
                </div>
              ))}
              {data.total === 0 && (
                <p className="px-4 py-3 text-[14px] text-muted">
                  Aucun véhicule pour « {query} ».{" "}
                  {whatsappHref ? (
                    <a href={whatsappHref} target="_blank" rel="noopener" className="font-semibold text-orange-deep underline">
                      Dites-nous ce que vous cherchez
                    </a>
                  ) : (
                    "Dites-nous ce que vous cherchez"
                  )}{" "}
                  : on l&apos;importe pour vous.
                </p>
              )}
              <div {...row(options.length - 1)}>
                <span className="font-semibold text-orange-deep underline">
                  {data.total > 1
                    ? `Voir les ${data.total} véhicules pour « ${query} »`
                    : data.total === 1
                      ? `Voir le véhicule pour « ${query} »`
                      : `Rechercher « ${query} »`}
                </span>
              </div>
            </>
          ) : (
            <p className="flex items-center gap-2 px-4 py-3 text-[14px] text-muted">
              <Spinner /> Recherche…
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BrandMark({ name }: { name: string }) {
  const logo = BRAND_LOGOS[name];
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-black/10">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span className="text-[10px] font-bold">{name.slice(0, 3)}</span>
      )}
    </span>
  );
}
