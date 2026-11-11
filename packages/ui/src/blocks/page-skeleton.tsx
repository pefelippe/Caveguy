import { Skeleton } from '@zapbots/ui/components/skeleton';

/**
 * Placeholder while a page's query loads, laid out as a page is (the title and the line under it,
 * then cards as the finance screens draw them), with the same tags and margins, so nothing moves when the page arrives.
 */
export function PageSkeleton() {
  return (
    <div aria-busy aria-label="Carregando" className="flex flex-col gap-8" role="status">
      <header>
        <h1>
          <Skeleton className="inline-block h-[0.8em] w-64 max-w-full align-middle" inline />
        </h1>
        <p className="mt-1">
          <Skeleton className="inline-block h-[0.9em] w-96 max-w-full align-middle" inline />
        </p>
      </header>
      <div className="grid gap-5 lg:grid-cols-2">
        {[0, 1].map(index => (
          <div
            className="flex flex-col gap-4 rounded-[20px] border-2 border-border p-6"
            key={index}
          >
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-3 w-full rounded-full" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 rounded-[20px] border-2 border-border p-6">
        <Skeleton className="h-5 w-48" />
        {[0, 1, 2, 3].map(index => (
          <Skeleton className="h-10 w-full" key={index} />
        ))}
      </div>
    </div>
  );
}
