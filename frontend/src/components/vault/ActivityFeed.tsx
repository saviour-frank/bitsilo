import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import { Chip } from '@/components/shared/Chip';
import { ActivityFeedSkeleton } from '@/components/shared/ActivityFeedSkeleton';
import { formatBtc, formatRelativeTime, truncateAddress, getExplorerUrl } from '@/lib/formatting';
import { Transaction } from '@/lib/types';

interface ActivityFeedProps {
  loading: boolean;
  transactions: Transaction[];
}

const ActivityRow = React.memo(React.forwardRef<HTMLDivElement, { tx: Transaction }>(function ActivityRow({ tx }, ref) {
  return (
    <div ref={ref} className="flex items-center justify-between border-b border-border/30 py-3 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`flex h-7 w-7 items-center justify-center rounded-full ${tx.type === 'deposit' ? 'bg-success/10' : 'bg-destructive/10'}`}>
          {tx.type === 'deposit' ? (
            <ArrowDownLeft className="h-3.5 w-3.5 text-success" aria-hidden="true" />
          ) : (
            <ArrowUpRight className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
          )}
        </div>
        <div>
          <Chip variant={tx.type === 'deposit' ? 'success' : 'destructive'}>
            {tx.type}
          </Chip>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {truncateAddress(tx.sender)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm font-medium text-foreground">
          {formatBtc(tx.sbtcAmount)}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5 justify-end">
          <span className="text-[11px] text-muted-foreground">
            {formatRelativeTime(tx.timestamp)}
          </span>
          <a
            href={getExplorerUrl(tx.txId)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View transaction on explorer`}
          >
            <ExternalLink className="h-3 w-3 text-muted-foreground transition-colors hover:text-foreground" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}));

export function ActivityFeed({ loading, transactions }: ActivityFeedProps) {
  return (
    <div className="rounded-2xl bg-surface-2 p-4 shadow-card sm:p-6">
      <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Recent Activity
      </h3>
      {loading ? (
        <ActivityFeedSkeleton />
      ) : (
        <div className="space-y-0">
          {transactions.map((tx) => (
            <ActivityRow key={tx.id} tx={tx} />
          ))}
        </div>
      )}
    </div>
  );
}
