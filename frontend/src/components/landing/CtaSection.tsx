import { ArrowRight, Zap, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-24 lg:py-32">
      {/* Background glow */}
      <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsla(33,93%,54%,0.1),transparent_60%)]" />

      <motion.div {...fadeUp} className="relative z-10 mx-auto max-w-2xl text-center">
        <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
          Ready to grow your sats?
        </h2>
        <p className="mb-8 text-muted-foreground">
          Join the vault and start earning yield on your sBTC today. Non-custodial, no lockups, fully on-chain.
        </p>
        <Link
          to="/vault"
          className="glow-orange-strong inline-flex items-center gap-2.5 rounded-xl bg-primary px-10 py-4.5 text-base font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary/90 hover:shadow-[0_0_60px_0_hsla(33,93%,54%,0.3)] active:scale-[0.98]"
        >
          Launch App
          <ArrowRight className="h-5 w-5" />
        </Link>

        {/* Micro-copy badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary/60" />
            No minimum deposit
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary/60" />
            Withdraw anytime
          </div>
        </div>
      </motion.div>
    </section>
  );
}
