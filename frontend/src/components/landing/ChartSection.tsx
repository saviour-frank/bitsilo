import { motion } from 'framer-motion';
import { SharePriceChart } from '@/components/shared/SharePriceChart';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

export function ChartSection() {
  return (
    <section className="bg-surface-2 px-4 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          {...fadeUp}
          className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-primary"
        >
          Performance
        </motion.h2>
        <motion.p
          {...fadeUp}
          className="mx-auto mb-12 max-w-md text-center text-2xl font-bold text-foreground sm:text-3xl"
        >
          Share price over time
        </motion.p>

        <motion.div
          {...fadeUp}
          className="border-gradient-orange rounded-2xl bg-surface-2 p-6 shadow-card sm:p-8"
        >
          <SharePriceChart />
        </motion.div>
      </div>
    </section>
  );
}
