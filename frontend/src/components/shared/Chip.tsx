import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ChipProps {
  variant?: 'default' | 'success' | 'warning' | 'bitcoin' | 'destructive';
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: 'bg-surface-3 text-muted-foreground',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  bitcoin: 'bg-primary/15 text-primary',
  destructive: 'bg-destructive/15 text-destructive',
};

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ variant = 'default', children, className }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
          variants[variant],
          className
        )}
      >
        {children}
      </span>
    );
  }
);

Chip.displayName = 'Chip';
