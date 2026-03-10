import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Vault, ArrowLeftRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Vault', path: '/vault', icon: Vault },
  { label: 'Txns', path: '/transactions', icon: ArrowLeftRight },
  { label: 'Docs', path: '/docs', icon: BookOpen },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 transition-colors duration-150',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <motion.div className="flex flex-col items-center" whileTap={{ scale: 0.85 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span className="text-[10px] font-medium leading-tight">{label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
