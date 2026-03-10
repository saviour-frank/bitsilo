import { useMemo, useState, useEffect, forwardRef } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Chip } from '@/components/shared/Chip';
import { SegmentedControl } from '@/components/shared/SegmentedControl';
import { MOCK_TRANSACTIONS } from '@/lib/constants';
import { formatBtc, formatShares, formatRelativeTime, getExplorerUrl } from '@/lib/formatting';
import { useApp } from '@/contexts/AppContext';
import { ExternalLink, ArrowRight, ChevronLeft, ChevronRight, ArrowDownToLine, ArrowUpFromLine, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

const TYPE_OPTIONS = ['All', 'Deposit', 'Withdraw'];
const STATUS_OPTIONS = ['All', 'Confirmed', 'Pending', 'Failed'];
const PAGE_SIZE = 10;

const Transactions = forwardRef<HTMLElement>((_, ref) => {
  useEffect(() => { document.title = 'Transactions | BitSilo'; }, []);
  const { state } = useApp();
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  const allTransactions = state.wallet.isConnected ? MOCK_TRANSACTIONS : [];

  const filtered = useMemo(() => {
    return allTransactions.filter((tx) => {
      const typeMatch = typeFilter === 'All' || tx.type === typeFilter.toLowerCase();
      const statusMatch = statusFilter === 'All' || tx.status === statusFilter.toLowerCase();
      return typeMatch && statusMatch;
    });
  }, [allTransactions, typeFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalVolume = useMemo(
    () => filtered.reduce((sum, tx) => sum + tx.sbtcAmount, 0),
    [filtered]
  );

  if (allTransactions.length === 0) {
    return (
      <PageContainer ref={ref}>
        <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-2 py-20 shadow-card">
          {/* Custom empty state illustration */}
          <div className="relative mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-3">
              <Wallet className="h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-surface-4">
              <ArrowDownToLine className="h-4 w-4 text-primary/60" aria-hidden="true" />
            </div>
          </div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">No transactions yet</h2>
          <p className="mb-2 max-w-sm text-center text-sm text-muted-foreground">
            {state.wallet.isConnected
              ? 'Your transaction history will appear here once you make your first deposit or withdrawal.'
              : 'Connect your wallet to view your transaction history.'}
          </p>
          {state.wallet.isConnected && (
            <div className="mb-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground/60 sm:gap-6">
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-3 text-[10px] font-bold text-muted-foreground">1</span>
                Go to Vault
              </span>
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-3 text-[10px] font-bold text-muted-foreground">2</span>
                Deposit sBTC
              </span>
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-3 text-[10px] font-bold text-muted-foreground">3</span>
                Earn yield
              </span>
            </div>
          )}
          <Link
            to="/vault"
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          >
            {state.wallet.isConnected ? 'Go to Vault' : 'Connect & Start'} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer ref={ref}>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Transaction History</h1>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SegmentedControl options={TYPE_OPTIONS} value={typeFilter} onChange={setTypeFilter} label="Filter by type" />
        <SegmentedControl options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} label="Filter by status" />
      </div>

      {/* Summary */}
      <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground" aria-live="polite">
        <span>
          <span className="font-medium text-foreground">{filtered.length}</span> transaction{filtered.length !== 1 ? 's' : ''}
        </span>
        <span className="text-border" aria-hidden="true">•</span>
        <span>
          Volume: <span className="font-mono font-medium text-foreground">{formatBtc(totalVolume)}</span>
        </span>
      </div>

      {/* Table or empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-2 py-16 shadow-card">
          <p className="text-sm text-muted-foreground">No matching transactions</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl bg-surface-2 shadow-card sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    {['Type', 'sBTC Amount', 'Shares', 'Share Price', 'Time', 'Status', ''].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" scope="col">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/20 transition-all duration-150 last:border-0 hover:-translate-y-px hover:bg-surface-3/50">
                      <td className="px-5 py-4">
                        <Chip variant={tx.type === 'deposit' ? 'success' : 'destructive'}>
                          {tx.type}
                        </Chip>
                      </td>
                      <td className="px-5 py-4 font-mono font-medium text-foreground">
                        {formatBtc(tx.sbtcAmount)}
                      </td>
                      <td className="px-5 py-4 font-mono text-muted-foreground">
                        {formatShares(tx.shares)}
                      </td>
                      <td className="px-5 py-4 font-mono text-muted-foreground">
                        ₿{tx.sharePriceAtTx.toFixed(6)}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground" title={tx.timestamp.toISOString()}>
                        {formatRelativeTime(tx.timestamp)}
                      </td>
                      <td className="px-5 py-4">
                        <Chip variant={tx.status === 'confirmed' ? 'success' : tx.status === 'pending' ? 'warning' : 'destructive'}>
                          {tx.status}
                        </Chip>
                      </td>
                      <td className="px-5 py-4">
                        <a
                          href={getExplorerUrl(tx.txId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View transaction ${tx.txId} on explorer`}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile card list */}
          <div className="space-y-3 sm:hidden">
            {paginated.map((tx) => (
              <div key={tx.id} className="rounded-2xl bg-surface-2 p-4 shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:shadow-elevated">
                <div className="mb-3 flex items-center justify-between">
                  <Chip variant={tx.type === 'deposit' ? 'success' : 'destructive'}>
                    {tx.type}
                  </Chip>
                  <Chip variant={tx.status === 'confirmed' ? 'success' : tx.status === 'pending' ? 'warning' : 'destructive'}>
                    {tx.status}
                  </Chip>
                </div>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">sBTC Amount</span>
                  <span className="font-mono text-sm font-medium text-foreground">{formatBtc(tx.sbtcAmount)}</span>
                </div>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">Shares</span>
                  <span className="font-mono text-sm text-muted-foreground">{formatShares(tx.shares)}</span>
                </div>
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">Share Price</span>
                  <span className="font-mono text-sm text-muted-foreground">₿{tx.sharePriceAtTx.toFixed(6)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/20 pt-3">
                  <span className="text-xs text-muted-foreground" title={tx.timestamp.toISOString()}>
                    {formatRelativeTime(tx.timestamp)}
                  </span>
                  <a
                    href={getExplorerUrl(tx.txId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View transaction on explorer`}
                    className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Explorer <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Transaction pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="flex items-center gap-1 rounded-lg bg-surface-3 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
              </button>
              <span className="font-mono text-sm text-muted-foreground" aria-current="page">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                className="flex items-center gap-1 rounded-lg bg-surface-3 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </>
      )}
    </PageContainer>
  );
});
Transactions.displayName = 'Transactions';
export default Transactions;
