import { motion } from 'framer-motion';
import { StatCard } from '@/components/shared/StatCard';
import { StatCardSkeleton } from '@/components/shared/StatCardSkeleton';
import { formatBtc, formatPercent } from '@/lib/formatting';
import type { VaultData } from '@/lib/types';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

interface StatsSectionProps {
  vault: VaultData;
  vaultLoading: boolean;
}

export function StatsSection({ vault, vaultLoading }: StatsSectionProps) {
  return (
    <section className="bg-surface-2 px-4 py-14 lg:py-20">
      <motion.div
        {...fadeUp}
        className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6"
      >
        {vaultLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <GlassStatCard>
              <StatCard label="Total Value Locked" value={formatBtc(vault.tvl)} numericValue={vault.tvl} formatFn={(v) => formatBtc(v)} />
            </GlassStatCard>
            <GlassStatCard>
              <StatCard label="Current APY" value={formatPercent(vault.apy)} numericValue={vault.apy} formatFn={(v) => formatPercent(v)} accentColor="success" />
            </GlassStatCard>
            <GlassStatCard>
              <StatCard label="Share Price" value={`₿${vault.sharePrice.toFixed(6)}`} numericValue={vault.sharePrice} formatFn={(v) => `₿${v.toFixed(6)}`} />
            </GlassStatCard>
            <GlassStatCard>
              <StatCard label="Total Depositors" value={vault.totalDepositors.toLocaleString()} numericValue={vault.totalDepositors} formatFn={(v) => Math.round(v).toLocaleString()} />
            </GlassStatCard>
          </>
        )}
      </motion.div>
    </section>
  );
}

function GlassStatCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-1 transition-all duration-200 hover:glow-orange">
      {children}
    </div>
  );
}
