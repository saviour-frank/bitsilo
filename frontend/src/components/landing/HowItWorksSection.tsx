import { Wallet, TrendingUp, ArrowDownToLine, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

const stagger = (i: number) => ({ delay: 0.1 * i });

const STEPS = [
  {
    num: '01',
    icon: Wallet,
    title: 'Deposit sBTC',
    description: 'Connect your Leather or Xverse wallet and choose how much sBTC to deposit into the vault.',
  },
  {
    num: '02',
    icon: TrendingUp,
    title: 'Earn Yield',
    description: 'The vault\'s share price appreciates over time. Your position grows automatically — no staking, no claiming.',
  },
  {
    num: '03',
    icon: ArrowDownToLine,
    title: 'Withdraw Anytime',
    description: 'Non-custodial and no lockups. Withdraw your sBTC whenever you want, verified by on-chain post-conditions.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-background px-4 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          {...fadeUp}
          className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-primary"
        >
          How It Works
        </motion.h2>
        <motion.p
          {...fadeUp}
          className="mx-auto mb-16 max-w-md text-center text-2xl font-bold text-foreground sm:text-3xl"
        >
          Three steps to growing your sats
        </motion.p>

        <div className="relative grid gap-10 sm:grid-cols-3 sm:gap-8">
          {/* Gradient connecting line (desktop) */}
          <div className="absolute left-[16.67%] right-[16.67%] top-16 hidden h-px sm:block">
            <div className="h-full w-full border-t border-dashed border-primary/30" />
          </div>

          {STEPS.map((item, i) => (
            <motion.div
              key={item.num}
              {...fadeUp}
              transition={{ ...fadeUp.transition, ...stagger(i) } as any}
              className="relative flex flex-col items-center text-center"
            >
              {/* Numbered circle */}
              <div className="relative z-10 mb-2">
                <span className="font-mono text-xs font-bold tracking-wider text-primary/60">{item.num}</span>
              </div>

              {/* Icon container with gradient border */}
              <div className="border-gradient-orange relative z-10 mb-6 flex h-28 w-28 items-center justify-center rounded-2xl bg-surface-2 shadow-card">
                <div className="absolute -inset-1 rounded-2xl bg-primary/5 blur-xl" />
                <item.icon className="relative z-10 h-11 w-11 text-primary" />
              </div>

              <h3 className="mb-2 text-lg font-bold text-foreground">{item.title}</h3>
              <p className="max-w-[280px] text-sm leading-relaxed text-muted-foreground">{item.description}</p>

              {/* Chevron between steps (desktop) */}
              {i < STEPS.length - 1 && (
                <div className="absolute -right-4 top-16 z-20 hidden sm:block">
                  <ChevronRight className="h-5 w-5 text-primary/40" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
