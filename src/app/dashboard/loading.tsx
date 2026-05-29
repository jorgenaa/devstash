import { Skeleton } from "@/components/ui/skeleton";

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-10" />
            </div>
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CollectionsSkeleton() {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-14" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-start justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="size-4 rounded-sm" />
            </div>
            <Skeleton className="mb-3 h-3 w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="size-4 rounded-sm" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ItemRowsSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          <Skeleton className="size-4 shrink-0 rounded-sm" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-2.5 w-32" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      <header className="flex flex-col gap-1">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-52" />
      </header>

      <StatsCardsSkeleton />
      <CollectionsSkeleton />

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="size-4 rounded-sm" />
          <Skeleton className="h-4 w-16" />
        </div>
        <ItemRowsSkeleton count={2} />
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="size-4 rounded-sm" />
          <Skeleton className="h-4 w-14" />
        </div>
        <ItemRowsSkeleton count={8} />
      </section>
    </div>
  );
}
