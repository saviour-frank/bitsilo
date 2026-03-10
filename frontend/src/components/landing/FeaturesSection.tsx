import { Shield, Code2, Unlock, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

const stagger = (i: number) => ({ delay: 0.08 * i });

const FEATURES = [
  {
    icon: Shield,
    title: 'Non-Custodial',
    description: 'Your keys, your Bitcoin. The vault never takes custody — every transaction is signed by you.',
  },
  {
    icon: Code2,
    title: 'On-Chain Verified',
    description: 'All vault logic lives in a public Clarity smart contract. Verify every operation on the Stacks explorer.',
  },
  {
    icon: Unlock,
    title: 'No Lockups',
    description: 'Withdraw your sBTC at any time. No unbonding periods, no penalties, no games.',
  },
  {
    icon: Lock,
    title: 'Post-Condition Protected',
    description: 'Every transaction enforces post-conditions so you never send more than you intended.',
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-surface-2 px-4 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          {...fadeUp}
          className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-primary"
        >
          Why BitSilo
        </motion.h2>
        <motion.p
          {...fadeUp}
          className="mx-auto mb-16 max-w-md text-center text-2xl font-bold text-foreground sm:text-3xl"
        >
          Built for trust, not promises
        </motion.p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, ...stagger(i) } as any}
              className="group relative rounded-2xl bg-surface-3/50 p-7 transition-all duration-200 hover:-translate-y-1.5 hover:bg-surface-3 hover:shadow-[0_0_30px_0_hsla(33,93%,54%,0.08)]"
            >
              {/* Gradient border on hover */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="absolute inset-[-1px] rounded-2xl bg-[linear-gradient(135deg,hsla(33,93%,54%,0.3),hsla(33,93%,54%,0.02))] p-px">
                  <div className="h-full w-full rounded-2xl bg-surface-3" />
                </div>
              </div>

              <div className="relative z-10">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <div className="absolute h-14 w-14 rounded-xl bg-primary/5 blur-lg transition-all duration-200 group-hover:bg-primary/10 group-hover:blur-xl" />
                  <f.icon className="relative h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-bold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
