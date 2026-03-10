import React from 'react';

export const StatCardSkeleton = React.forwardRef<HTMLDivElement>(
  (_, ref) => {
    return (
      <div ref={ref} className="flex flex-col gap-2">
        <div className="h-3 w-20 rounded bg-surface-3 animate-skeleton" />
        <div className="h-7 w-28 rounded bg-surface-3 animate-skeleton" />
      </div>
    );
  }
);
StatCardSkeleton.displayName = 'StatCardSkeleton';
