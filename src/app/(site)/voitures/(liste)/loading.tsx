import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <LoadingRegion label="Chargement des véhicules" className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="h-10 w-80" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <Skeleton className="hidden h-[480px] lg:block" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[400px] rounded-2xl" />)}
        </div>
      </div>
    </LoadingRegion>
  );
}
