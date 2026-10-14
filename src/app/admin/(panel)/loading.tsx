import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <LoadingRegion label="Chargement">
      <Skeleton className="h-9 w-64" />
      <div className="mt-6 grid gap-3">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
    </LoadingRegion>
  );
}
