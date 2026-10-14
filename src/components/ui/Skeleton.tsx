// Placeholder block shown while content streams in. Sized by the caller so
// the final content replaces it without layout shift.
export function Skeleton({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return <div aria-hidden="true" className={`rounded-lg ${dark ? "shimmer-dark" : "shimmer"} ${className}`} />;
}

// Wrapper announcing the loading state to screen readers once.
export function LoadingRegion({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

// Same footprint as VehicleCard: photo 4:3, title, facts, price, monthly.
export function CardSkeleton() {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5 sm:rounded-2xl">
      <div className="shimmer aspect-[4/3]" />
      <div className="space-y-2 p-2.5 sm:p-3.5">
        <div className="shimmer h-4 w-3/4 rounded" />
        <div className="shimmer h-3 w-full rounded" />
        <div className="shimmer mt-3 h-5 w-1/2 rounded" />
        <div className="shimmer h-3 w-2/3 rounded" />
      </div>
    </div>
  );
}
