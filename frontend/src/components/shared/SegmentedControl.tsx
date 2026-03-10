import { cn } from '@/lib/utils';
import { useId } from 'react';

interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function SegmentedControl({ options, value, onChange, label }: SegmentedControlProps) {
  const groupId = useId();

  return (
    <div
      role="radiogroup"
      aria-label={label || 'Options'}
      className="flex rounded-full bg-surface-3 p-1"
    >
      {options.map((option) => (
        <button
          key={option}
          role="radio"
          aria-checked={value === option}
          id={`${groupId}-${option}`}
          onClick={() => onChange(option)}
          onKeyDown={(e) => {
            const idx = options.indexOf(option);
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
              e.preventDefault();
              const next = options[(idx + 1) % options.length];
              onChange(next);
              document.getElementById(`${groupId}-${next}`)?.focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
              e.preventDefault();
              const prev = options[(idx - 1 + options.length) % options.length];
              onChange(prev);
              document.getElementById(`${groupId}-${prev}`)?.focus();
            }
          }}
          tabIndex={value === option ? 0 : -1}
          className={cn(
            'flex-1 rounded-full px-3 sm:px-6 py-2 text-xs sm:text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            value === option
              ? 'bg-primary text-primary-foreground shadow-card'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
