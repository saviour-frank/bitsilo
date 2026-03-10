import { Shield, Code2, Layers, TestTube2 } from 'lucide-react';

const badges = [
  { icon: Layers, label: 'Built on Stacks' },
  { icon: Shield, label: 'sBTC Powered' },
  { icon: Code2, label: 'Open Source' },
  { icon: TestTube2, label: 'Testnet' },
];

export function TrustBar() {
  return (
    <div className="border-gradient-orange flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-surface-2 px-4 sm:px-8 py-5 shadow-card sm:gap-0">
      {badges.map(({ icon: Icon, label }, i) => (
        <div key={label} className="flex items-center">
          <div className="group flex items-center gap-2.5 px-4 text-muted-foreground transition-all duration-150 hover:scale-105 hover:text-foreground">
            <Icon className="h-[18px] w-[18px] text-muted-foreground/60 transition-colors group-hover:text-primary" />
            <span className="text-[10px] sm:text-xs font-semibold tracking-wide uppercase">{label}</span>
          </div>
          {i < badges.length - 1 && (
            <div className="hidden h-4 w-px bg-border/40 sm:block" />
          )}
        </div>
      ))}
    </div>
  );
}
