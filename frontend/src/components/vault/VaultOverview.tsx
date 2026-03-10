import { StatCard } from '@/components/shared/StatCard';
import { Chip } from '@/components/shared/Chip';
import { SharePriceChart } from '@/components/shared/SharePriceChart';
import { formatBtc, formatShares, formatPercent } from '@/lib/formatting';
import { VaultData, WalletState, UserPosition } from '@/lib/types';

interface VaultOverviewProps {
  vault: VaultData;
  effectiveStatus: string;
  effectiveDeposits: number;
  fillPercent: number;
  capBarColor: string;
  vaultLoading: boolean;
  wallet: WalletState;
  userPosition: UserPosition | null;
}

export function VaultOverview({
  vault,
  effectiveStatus,
  effectiveDeposits,
  fillPercent,
  capBarColor,
  vaultLoading,
  wallet,
  userPosition,
}: VaultOverviewProps) {
  return (
    <>
      {/* Vault Overview */}
        <div className="rounded-2xl bg-surface-2 p-4 shadow-card transition-all duration-150 hover:scale-[1.005] sm:p-6">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Vault Overview
        </h3>
        {vaultLoading ? (
          <div className="space-y-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-20 rounded bg-surface-3 animate-skeleton" />
                <div className="h-4 w-24 rounded bg-surface-3 animate-skeleton" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {[
              ['TVL', formatBtc(vault.tvl), null],
              ['APY', formatPercent(vault.apy), 'text-success'],
              ['Share Price', `₿${vault.sharePrice.toFixed(6)}`, null],
              ['Depositors', vault.totalDepositors.toLocaleString(), null],
              ['Status', effectiveStatus, null],
            ].map(([label, value, colorClass]) => (
              <div key={label as string} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className={`font-mono text-sm font-medium ${colorClass || 'text-foreground'}`}>
                  {label === 'Status' ? (
                    <Chip variant={value === 'active' ? 'success' : 'warning'}>
                      {value as string}
                    </Chip>
                  ) : (
                    value
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Vault Capacity Progress Bar */}
        {!vaultLoading && (
          <div className="mt-5 border-t border-border/30 pt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Vault Capacity</span>
              {fillPercent >= 90 && fillPercent < 100 && (
                <Chip variant="warning">Near capacity</Chip>
              )}
              {fillPercent >= 100 && (
                <Chip variant="destructive">Full</Chip>
              )}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
              <div
                className={`h-full rounded-full transition-all duration-300 ${capBarColor}`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
            <p className="mt-2 text-right font-mono text-xs text-muted-foreground">
              {formatBtc(effectiveDeposits)} / {formatBtc(vault.depositCap, 0)} sBTC
            </p>
          </div>
        )}
      </div>

      {/* Share Price Chart */}
      {!vaultLoading && (
        <div className="rounded-2xl bg-surface-2 p-4 shadow-card transition-all duration-150 hover:scale-[1.005] sm:p-6">
          <SharePriceChart />
        </div>
      )}

      {/* User Position */}
      {wallet.isConnected && userPosition && (
        <div className="rounded-2xl bg-surface-2 p-4 shadow-card transition-all duration-150 hover:scale-[1.005] sm:p-6">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your Position
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard label="Shares" value={formatShares(userPosition.shares)} numericValue={userPosition.shares} formatFn={(v) => formatShares(v)} />
            <StatCard label="Value" value={formatBtc(userPosition.sbtcValue)} numericValue={userPosition.sbtcValue} formatFn={(v) => formatBtc(v)} />
            <StatCard label="Deposited" value={formatBtc(userPosition.depositedAmount)} onChain={false} />
            <StatCard label="Yield" value={formatBtc(userPosition.earnedYield)} onChain={false} accentColor="success" />
          </div>
        </div>
      )}
    </>
  );
}
