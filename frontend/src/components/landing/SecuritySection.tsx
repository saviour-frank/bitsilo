import { FileCheck2, ShieldCheck, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

const SECURITY_ITEMS = [
  {
    icon: FileCheck2,
    title: 'Open Source Contract',
    description: 'The full Clarity source code is public and auditable by anyone.',
    href: 'https://explorer.hiro.so/txid/ST24BN6HQCT1B37TD9MDJ3Y3BEZCMG9V1Y9X5241M.bitsilo-vault?chain=testnet',
    linkLabel: 'View Contract',
  },
  {
    icon: ShieldCheck,
    title: 'Post-Condition Enforced',
    description: 'Every transaction uses strict post-conditions — you never send more than intended.',
    href: 'https://docs.stacks.co/get-started/build-a-frontend/post-conditions',
    linkLabel: 'Learn More',
  },
  {
    icon: Eye,
    title: 'Verified on Explorer',
    description: 'All operations are publicly visible and verifiable on the Hiro Stacks Explorer.',
    href: 'https://explorer.hiro.so/?chain=testnet',
    linkLabel: 'Open Explorer',
  },
];

export function SecuritySection() {
  return (
    <section className="bg-background px-4 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          {...fadeUp}
          className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-primary"
        >
          Security
        </motion.h2>
        <motion.p
          {...fadeUp}
          className="mx-auto mb-16 max-w-md text-center text-2xl font-bold text-foreground sm:text-3xl"
        >
          Verified & transparent
        </motion.p>

        <motion.div
          {...fadeUp}
          className="glass-card mx-auto grid max-w-4xl gap-0 divide-y divide-border/20 rounded-2xl sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        >
          {SECURITY_ITEMS.map((item) => (
            <div key={item.title} className="flex flex-col items-center px-8 py-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-1.5 text-sm font-bold text-foreground">{item.title}</h3>
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
              >
                {item.linkLabel}
                <span className="text-[10px]">↗</span>
              </a>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
