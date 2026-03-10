import { Bug, ChevronDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { formatBtc } from '@/lib/formatting';
import { VaultData } from '@/lib/types';

interface DevToolsPanelProps {
  vault: VaultData;
  devOpen: boolean;
  devPaused: boolean | null;
  devDeposits: number | null;
  effectiveDeposits: number;
  onToggleOpen: () => void;
  onPausedChange: (value: boolean) => void;
  onDepositsChange: (value: number) => void;
  onReset: () => void;
}

export function DevToolsPanel({
  vault,
  devOpen,
  devPaused,
  effectiveDeposits,
  onToggleOpen,
  onPausedChange,
  onDepositsChange,
  onReset,
}: DevToolsPanelProps) {
  return (
    <div className="mt-8 rounded-2xl border border-border/30 bg-surface-2 shadow-card">
      <button
        onClick={onToggleOpen}
        className="flex w-full items-center gap-2 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground sm:px-5"
      >
        <Bug className="h-3.5 w-3.5" />
        Dev Tools
        <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-transform duration-200 ${devOpen ? 'rotate-180' : ''}`} />
      </button>
      {devOpen && (
        <div className="space-y-5 border-t border-border/30 px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">Vault Paused</label>
            <Switch
              checked={devPaused ?? vault.status === 'paused'}
              onCheckedChange={(v) => onPausedChange(v)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Current Deposits</label>
              <span className="font-mono text-sm text-foreground">
                {formatBtc(effectiveDeposits)}
              </span>
            </div>
            <Slider
              value={[effectiveDeposits]}
              min={0}
              max={vault.depositCap}
              step={0.01}
              onValueChange={([v]) => onDepositsChange(v)}
              className="py-1"
            />
            <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
              <span>0</span>
              <span>{formatBtc(vault.depositCap, 0)}</span>
            </div>
          </div>
          <button
            onClick={onReset}
            className="rounded-lg bg-surface-3 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Reset Overrides
          </button>
        </div>
      )}
    </div>
  );
}
