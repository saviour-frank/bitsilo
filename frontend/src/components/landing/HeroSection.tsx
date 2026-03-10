import { useMemo } from 'react';
import { Bitcoin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatBtc, formatPercent } from '@/lib/formatting';
import type { VaultData } from '@/lib/types';

interface HeroSectionProps {
  vault: VaultData;
  vaultLoading: boolean;
}

export function HeroSection({ vault, vaultLoading }: HeroSectionProps) {
  const particles = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: `${5 + (i * 7.1) % 90}%`,
      top: `${60 + (i * 13.3) % 40}%`,
      size: 2 + (i % 3),
      opacity: 0.08 + (i % 5) * 0.03,
      duration: `${16 + (i % 5) * 2}s`,
      delay: `${(i * 1.7) % 12}s`,
    })), []);

  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 lg:py-36">
      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-primary animate-float-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              '--particle-opacity': p.opacity,
              '--particle-duration': p.duration,
              '--particle-delay': p.delay,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Primary glow orb */}
      <div className="absolute right-[20%] top-[10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,hsla(33,93%,54%,0.12),transparent_60%)] animate-gradient-shift" />
      {/* Secondary glow orb */}
      <div className="absolute left-[5%] bottom-[10%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,hsla(33,93%,54%,0.06),transparent_60%)]" />
      {/* Top-right ambient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsla(33,93%,54%,0.08),transparent_50%)]" />

      {/* Floating Bitcoin with glow ring */}
      <motion.div
        className="absolute right-8 top-16 hidden lg:block lg:right-[10%] lg:top-20"
        animate={{ y: [0, -16, 0], rotate: [0, 3, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-primary/10 blur-2xl animate-glow-pulse" />
          <div className="relative flex h-36 w-36 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 xl:h-44 xl:w-44">
            <Bitcoin className="h-20 w-20 text-primary xl:h-24 xl:w-24" />
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5"
        >
          <span className="live-dot" />
          <span className="text-xs font-semibold tracking-wide text-primary">Live on Testnet</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          Earn yield on your Bitcoin.{' '}
          <span className="text-gradient-bitcoin">No custody. No compromise.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-10 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          The non-custodial sBTC micro-yield vault on Stacks. Deposit, earn, withdraw — all verified on-chain with post-condition protection.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap gap-4"
        >
          <Link
            to="/vault"
            className="glow-orange inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary/90 hover:shadow-[0_0_40px_0_hsla(33,93%,54%,0.25)] active:scale-[0.98]"
          >
            Launch App
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="border-gradient-orange inline-flex items-center gap-2 rounded-xl bg-surface-2 px-8 py-4 text-sm font-semibold text-muted-foreground transition-all duration-150 hover:text-foreground"
          >
            How It Works
          </button>
        </motion.div>

        {/* Live stats strip */}
        {!vaultLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-16 flex flex-wrap gap-6 sm:gap-10 border-t border-border/20 pt-7"
          >
            {[
              { label: 'TVL', value: formatBtc(vault.tvl), color: 'text-foreground' },
              { label: 'APY', value: formatPercent(vault.apy), color: 'text-success' },
              { label: 'Depositors', value: vault.totalDepositors.toLocaleString(), color: 'text-foreground' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <span className="live-dot" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                <span className={`font-mono text-sm font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
