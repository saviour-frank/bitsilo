import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatBtc, formatShares, getExplorerUrl } from '@/lib/formatting';
import { TransactionStep } from '@/lib/types';
import { CheckCircle2, XCircle, ExternalLink, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ERROR_MAP: Record<string, string> = {
  u100: 'Not authorized',
  u101: 'Amount must be greater than 0',
  u102: 'Insufficient shares',
  u103: 'Vault is paused',
  u104: 'Deposit exceeds cap',
};

const STEP_INDEX: Record<TransactionStep, number> = {
  idle: -1, preview: 0, confirming: 1, broadcasting: 2, pending: 3, confirmed: 4, failed: 4,
};

interface TransactionModalProps {
  open: boolean;
  step: TransactionStep;
  type: 'deposit' | 'withdraw';
  amount: number;
  sharesOrSbtc: number;
  sharePrice: number;
  onConfirm: () => void;
  onClose: () => void;
  errorCode?: string;
  txId?: string;
}

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-6">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current ? 'w-6 bg-primary' : i < current ? 'w-1.5 bg-primary/50' : 'w-1.5 bg-surface-4'
          }`}
        />
      ))}
    </div>
  );
}

function DotLoader() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  );
}

export function TransactionModal({
  open, step, type, amount, sharesOrSbtc, sharePrice, onConfirm, onClose, errorCode, txId,
}: TransactionModalProps) {
  const stepIndex = STEP_INDEX[step];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-surface-2 border-border/50 rounded-2xl max-w-md p-0 overflow-hidden">
        <div className="p-6">
          <StepDots current={stepIndex} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {step === 'preview' && (
                <>
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-foreground text-lg">
                      Confirm {type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                      Review your transaction before confirming
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 rounded-xl bg-surface-3/50 p-4 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">You will send</span>
                      <span className="font-mono font-medium text-foreground">
                        {type === 'deposit' ? formatBtc(amount) : `${formatShares(amount)} shares`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">You will receive</span>
                      <span className="font-mono font-medium text-primary">
                        {type === 'deposit' ? `${formatShares(sharesOrSbtc)} shares` : formatBtc(sharesOrSbtc)}
                      </span>
                    </div>
                    <div className="border-t border-border/30 pt-3 flex justify-between text-sm">
                      <span className="text-muted-foreground">Exchange rate</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        1 sBTC = {formatShares(1 / sharePrice)} shares
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-surface-3/30 p-3 mb-6">
                    <Shield className="h-3.5 w-3.5 shrink-0 text-success" />
                    <span className="text-[11px] text-muted-foreground">
                      Post-condition mode: <span className="font-semibold text-foreground">Deny</span>
                    </span>
                  </div>

                  <button
                    onClick={onConfirm}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-[0.99]"
                  >
                    Confirm {type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                  </button>
                </>
              )}

              {step === 'confirming' && (
                <div className="flex flex-col items-center py-8">
                  <DialogHeader className="mb-2">
                    <DialogTitle className="sr-only">Confirming</DialogTitle>
                  </DialogHeader>
                  <p className="text-lg font-semibold text-foreground animate-subtle-pulse">
                    Confirm in your wallet…
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Check your Leather or Xverse wallet
                  </p>
                </div>
              )}

              {step === 'broadcasting' && (
                <div className="flex flex-col items-center py-8">
                  <DialogHeader className="mb-2">
                    <DialogTitle className="sr-only">Broadcasting</DialogTitle>
                  </DialogHeader>
                  <p className="text-lg font-semibold text-foreground mb-3">
                    Broadcasting transaction
                  </p>
                  <DotLoader />
                </div>
              )}

              {step === 'pending' && (
                <div className="flex flex-col items-center py-8">
                  <DialogHeader className="mb-2">
                    <DialogTitle className="sr-only">Pending</DialogTitle>
                  </DialogHeader>
                  <p className="text-lg font-semibold text-foreground">Transaction submitted</p>
                  <p className="mt-2 text-sm text-muted-foreground">Waiting for confirmation…</p>
                  {txId && (
                    <a
                      href={getExplorerUrl(txId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      View on Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {step === 'confirmed' && (
                <div className="flex flex-col items-center py-6">
                  <DialogHeader className="mb-2">
                    <DialogTitle className="sr-only">Confirmed</DialogTitle>
                  </DialogHeader>
                  <CheckCircle2 className="h-12 w-12 text-success mb-4" />
                  <p className="text-lg font-semibold text-foreground">Transaction Confirmed</p>
                  <div className="mt-4 space-y-2 text-center">
                    <p className="font-mono text-sm text-muted-foreground">
                      {type === 'deposit' ? `Deposited ${formatBtc(amount)}` : `Withdrew ${formatShares(amount)} shares`}
                    </p>
                    <p className="font-mono text-sm text-primary">
                      {type === 'deposit' ? `Received ${formatShares(sharesOrSbtc)} shares` : `Received ${formatBtc(sharesOrSbtc)}`}
                    </p>
                  </div>
                  {txId && (
                    <a
                      href={getExplorerUrl(txId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      View on Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <button
                    onClick={onClose}
                    className="mt-6 w-full rounded-xl bg-surface-3 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-4"
                  >
                    Done
                  </button>
                </div>
              )}

              {step === 'failed' && (
                <div className="flex flex-col items-center py-6">
                  <DialogHeader className="mb-2">
                    <DialogTitle className="sr-only">Failed</DialogTitle>
                  </DialogHeader>
                  <XCircle className="h-12 w-12 text-destructive mb-4" />
                  <p className="text-lg font-semibold text-foreground">Transaction Failed</p>
                  <p className="mt-2 text-sm text-muted-foreground text-center">
                    {errorCode && ERROR_MAP[errorCode]
                      ? ERROR_MAP[errorCode]
                      : 'An unexpected error occurred. Please try again.'}
                  </p>
                  <button
                    onClick={onConfirm}
                    className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary/90"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
