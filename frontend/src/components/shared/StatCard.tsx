import { forwardRef } from 'react';
import { AnimatedNumber } from './AnimatedNumber';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  numericValue?: number;
  formatFn?: (v: number) => string;
  sublabel?: string;
  onChain?: boolean;
  accentColor?: 'success' | 'primary' | 'warning';
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, numericValue, formatFn, sublabel, onChain = true, accentColor }, ref) => {
    const valueColorClass = accentColor
      ? accentColor === 'success' ? 'text-success' : accentColor === 'warning' ? 'text-warning' : 'text-primary'
      : 'text-foreground';

    return (
      <div
        ref={ref}
        className="flex flex-col gap-1.5 rounded-xl p-3 transition-all duration-150 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-surface-3/50"
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          {onChain && (
            <span className="rounded-full bg-surface-3 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
              On-chain
            </span>
          )}
        </div>
        {numericValue !== undefined && formatFn ? (
          <AnimatedNumber
            value={numericValue}
            format={formatFn}
            className={cn('font-mono text-lg font-semibold tracking-tight sm:text-2xl', valueColorClass)}
          />
        ) : (
          <span className={cn('animate-count-up font-mono text-lg font-semibold tracking-tight sm:text-2xl', valueColorClass)}>
            {value}
          </span>
        )}
        {sublabel && (
          <span className="text-xs text-muted-foreground">{sublabel}</span>
        )}
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';
