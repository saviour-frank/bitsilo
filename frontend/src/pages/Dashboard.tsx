import { useEffect, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatCard } from '@/components/shared/StatCard';
import { StatCardSkeleton } from '@/components/shared/StatCardSkeleton';
import { SharePriceChart } from '@/components/shared/SharePriceChart';
import { ActivityFeed } from '@/components/vault/ActivityFeed';
import { Progress } from '@/components/ui/progress';
import { Chip } from '@/components/shared/Chip';
import { formatBtc, formatPercent } from '@/lib/formatting';
import { MOCK_TRANSACTIONS } from '@/lib/constants';
import { ArrowRight, Wallet } from 'lucide-react';

const Dashboard = forwardRef<HTMLElement>((_, ref) => {
  useEffect(() => {
    document.title = 'Dashboard | BitSilo';
  }, []);

  const { state } = useApp();
  const { vault, userPosition, vaultLoading } = state;
  const capacityPct = vault.depositCap > 0 ? (vault.currentDeposits / vault.depositCap) * 100 : 0;

  return (
    <PageContainer ref={ref}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Dashboard</h1>
        <Link
          to="/vault"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Open Vault
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Vault Stats */}
      <section aria-label="Vault statistics">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {vaultLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="Total Value Locked"
                value={formatBtc(vault.tvl)}
                numericValue={vault.tvl}
                formatFn={(v) => formatBtc(v)}
              />
              <StatCard
                label="APY"
                value={formatPercent(vault.apy)}
                numericValue={vault.apy}
                formatFn={(v) => formatPercent(v)}
                accentColor="success"
              />
              <StatCard
                label="Share Price"
                value={formatBtc(vault.sharePrice, 6)}
                numericValue={vault.sharePrice}
                formatFn={(v) => formatBtc(v, 6)}
                accentColor="primary"
              />
              <StatCard
                label="Depositors"
                value={vault.totalDepositors.toLocaleString()}
                numericValue={vault.totalDepositors}
                formatFn={(v) => Math.round(v).toLocaleString()}
                onChain={false}
              />
            </>
          )}
        </div>
      </section>

      {/* Share Price Chart */}
      <section className="mt-6 rounded-2xl bg-surface-2 p-4 shadow-card sm:p-6" aria-label="Share price chart">
        <SharePriceChart />
      </section>

      {/* Vault Health */}
      <section className="mt-6 rounded-2xl bg-surface-2 p-4 shadow-card sm:p-6" aria-label="Vault health">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Vault Health
        </h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Chip variant={vault.status === 'active' ? 'success' : 'warning'}>
              {vault.status === 'active' ? 'Active' : 'Paused'}
            </Chip>
            <span className="font-mono text-xs text-muted-foreground">
              {formatBtc(vault.currentDeposits)} / {formatBtc(vault.depositCap, 2)} cap
            </span>
          </div>
          <div className="w-full max-w-xs">
            <Progress value={capacityPct} className="h-2 bg-surface-3" />
            <p className="mt-1 text-right font-mono text-[11px] text-muted-foreground">
              {capacityPct.toFixed(1)}% filled
            </p>
          </div>
        </div>
      </section>

      {/* User Position */}
      {state.wallet.isConnected && userPosition ? (
        <section className="mt-6 rounded-2xl bg-surface-2 p-4 shadow-card sm:p-6" aria-label="Your position">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your Position
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Shares"
              value={userPosition.shares.toFixed(6)}
              numericValue={userPosition.shares}
              formatFn={(v) => v.toFixed(6)}
            />
            <StatCard
              label="Current Value"
              value={formatBtc(userPosition.sbtcValue)}
              numericValue={userPosition.sbtcValue}
              formatFn={(v) => formatBtc(v)}
            />
            <StatCard
              label="Deposited"
              value={formatBtc(userPosition.depositedAmount)}
              numericValue={userPosition.depositedAmount}
              formatFn={(v) => formatBtc(v)}
            />
            <StatCard
              label="Yield Earned"
              value={formatBtc(userPosition.earnedYield)}
              numericValue={userPosition.earnedYield}
              formatFn={(v) => formatBtc(v)}
              accentColor="success"
            />
          </div>
        </section>
      ) : (
        <section className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-surface-2 p-6 text-center shadow-card" aria-label="Connect wallet prompt">
          <Wallet className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">Connect your wallet to see your position</p>
        </section>
      )}

      {/* Recent Activity */}
      <section className="mt-6" aria-label="Recent activity">
        <ActivityFeed loading={vaultLoading} transactions={MOCK_TRANSACTIONS.slice(0, 10)} />
      </section>
    </PageContainer>
  );
});
Dashboard.displayName = 'Dashboard';
export default Dashboard;
