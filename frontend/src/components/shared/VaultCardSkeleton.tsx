import React from 'react';

export const VaultCardSkeleton = React.forwardRef<HTMLDivElement>(
  (_, ref) => {
    return (
      <div ref={ref} className="overflow-hidden rounded-2xl bg-surface-2 shadow-card">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-6 w-40 rounded bg-surface-3 animate-skeleton" />
            <div className="h-5 w-12 rounded-full bg-surface-3 animate-skeleton" />
            <div className="h-5 w-14 rounded-full bg-surface-3 animate-skeleton" />
          </div>
          <div className="h-10 w-24 rounded bg-surface-3 animate-skeleton" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-20 rounded bg-surface-3 animate-skeleton" />
              <div className="h-3 w-32 rounded bg-surface-3 animate-skeleton" />
            </div>
            <div className="h-2 w-full rounded-full bg-surface-4 animate-skeleton" />
          </div>
        </div>
        <div className="border-t border-border/50 p-6 sm:p-8">
          <div className="h-12 w-full rounded-lg bg-surface-3 animate-skeleton" />
        </div>
      </div>
    );
  }
);
VaultCardSkeleton.displayName = 'VaultCardSkeleton';
