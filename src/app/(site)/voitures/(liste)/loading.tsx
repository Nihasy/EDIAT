import { CardSkeleton, LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

// Same layout as the catalogue: title, search, toolbar, grid of cards.
export default function Loading() {
  return (
    <LoadingRegion label="Chargement des véhicules" className="mx-auto max-w-7xl pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-4 sm:pt-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-11 w-full rounded-full sm:w-80" />
      </div>
      <div className="mt-3 flex gap-2 overflow-hidden border-y border-black/5 px-4 py-2">
        {[88, 64, 120, 104, 120].map((w, i) => (
          <div key={i} style={{ width: w }} className="shrink-0">
            <Skeleton className="h-10 rounded-full" />
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-6 px-4 lg:grid-cols-[260px_1fr]">
        <Skeleton className="hidden h-[520px] rounded-2xl lg:block" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    </LoadingRegion>
  );
}
