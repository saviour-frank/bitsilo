import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { NetworkBadge } from '@/components/wallet/NetworkBadge';
import { Bitcoin, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Vault', path: '/vault' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Docs', path: '/docs' },
];

export function Navbar() {
  const location = useLocation();
  const { state } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const isHome = location.pathname === '/';

  useEffect(() => {
    if (!isHome) { setShowCta(false); return; }
    const onScroll = () => setShowCta(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);
  return (
    <>
      {state.wallet.isConnected && !state.wallet.isCorrectNetwork && (
        <div className="flex items-center justify-center gap-2 bg-warning/10 px-4 py-2 text-xs font-medium text-warning" role="alert">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />
          Wrong network detected. Please switch to Testnet.
        </div>
      )}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1080px] items-center justify-between px-4 lg:px-6">
          <Link to="/" className="flex items-center gap-2.5" aria-label="BitSilo home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Bitcoin className="h-4.5 w-4.5 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">BitSilo</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                aria-current={location.pathname === link.path ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-150',
                  location.pathname === link.path
                    ? 'bg-surface-3 text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <AnimatePresence>
              {isHome && showCta && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to="/vault"
                    className="hidden items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
                  >
                    Launch App
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="hidden sm:block"><NetworkBadge /></div>
            <ConnectButton />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav — animated */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-border/50 bg-background md:hidden"
              aria-label="Mobile navigation"
            >
              <div className="px-4 py-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    aria-current={location.pathname === link.path ? 'page' : undefined}
                    className={cn(
                      'block rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-150',
                      location.pathname === link.path
                        ? 'bg-surface-3 text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
