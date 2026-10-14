// Side silhouettes of the main body types (48×24, stroke = currentColor).
const PATHS: Record<string, string> = {
  SUV: "M3 17v-4l4-1 5-5h20l6 5 6 1v4M3 17h4m8 0h18m8 0h4",
  "4x4": "M3 17v-5h3l4-6h19l3 6h8l3 1v4M3 17h4m8 0h18m8 0h4M24 6v6",
  Berline: "M2 17v-3l7-2 6-5h14l7 5 9 1v4M2 17h5m8 0h18m8 0h4",
  Citadine: "M6 17v-4l3-2 5-5h13l6 6 6 1v4M6 17h3m8 0h12m8 0h3",
  Monospace: "M3 17v-6l5-5h28l6 6 3 1v4M3 17h4m8 0h18m8 0h4",
  "Pick-up": "M2 17v-5h22V7h9l5 5h7v5M2 17h5m8 0h18m8 0h4M24 12h21",
  Utilitaire: "M3 17V6h28l6 5h7v6M3 17h4m8 0h18m8 0h3M31 6v5h13",
  Minibus: "M3 17V6h36l5 6v5M3 17h4m8 0h18m8 0h3M8 6v5m8-5v5m8-5v5m8-5v5",
  Break: "M2 17v-4l5-2 5-5h22l6 5 6 1v4M2 17h5m8 0h18m8 0h4",
  Coupé: "M2 17v-3l9-2 7-5h11l8 5 9 1v3M2 17h5m8 0h18m8 0h4",
};

export function BodyIcon({ type, className = "h-7 w-14" }: { type: string; className?: string }) {
  const d = PATHS[type] ?? PATHS.SUV;
  return (
    <svg viewBox="0 0 48 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
      <circle cx="11" cy="17" r="3.2" />
      <circle cx="37" cy="17" r="3.2" />
    </svg>
  );
}
