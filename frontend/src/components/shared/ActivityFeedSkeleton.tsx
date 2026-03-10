export function ActivityFeedSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between border-b border-border/30 py-3 last:border-0">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-surface-3 animate-skeleton" />
            <div className="space-y-1.5">
              <div className="h-4 w-14 rounded-full bg-surface-3 animate-skeleton" />
              <div className="h-3 w-20 rounded bg-surface-3 animate-skeleton" />
            </div>
          </div>
          <div className="space-y-1.5 flex flex-col items-end">
            <div className="h-4 w-24 rounded bg-surface-3 animate-skeleton" />
            <div className="h-3 w-12 rounded bg-surface-3 animate-skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}
