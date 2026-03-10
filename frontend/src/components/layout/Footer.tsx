import React from 'react';
import { ExternalLink, Bitcoin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Chip } from '@/components/shared/Chip';

export const Footer = React.forwardRef<HTMLElement>(
  (_, ref) => {
    return (
      <footer ref={ref} className="mt-auto border-t border-border/50 bg-background pb-20 md:pb-0">
        <div className="mx-auto max-w-[1080px] px-4 py-10 lg:px-6">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            {/* Branding */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                  <Bitcoin className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="text-sm font-bold text-foreground">BitSilo</span>
              </div>
              <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                Non-custodial sBTC micro-yield vault on Stacks. Deposit, earn yield, withdraw — all verified on-chain.
              </p>
              <Chip variant="warning">Testnet</Chip>
            </div>

            {/* Links */}
            <div className="flex gap-6 sm:gap-12">
              <div className="flex flex-col gap-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Product</span>
                <Link to="/vault" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Vault</Link>
                <Link to="/transactions" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Transactions</Link>
                <Link to="/docs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Docs</Link>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Community</span>
                <a href="https://github.com/bitsilo" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  GitHub <ExternalLink className="h-3 w-3" />
                </a>
                <a href="https://twitter.com/bitsilo" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Twitter / X <ExternalLink className="h-3 w-3" />
                </a>
                <a href="https://explorer.hiro.so" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-border/30 pt-6">
            <span className="text-xs text-muted-foreground">
              © 2026 BitSilo. Non-custodial. Open source.
            </span>
          </div>
        </div>
      </footer>
    );
  }
);
Footer.displayName = 'Footer';
