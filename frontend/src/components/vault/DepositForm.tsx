import { Info, Bitcoin, Check, Loader2 } from 'lucide-react';
import { formatBtc, formatShares } from '@/lib/formatting';
import { VaultData, WalletState } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { depositSchema, type DepositFormValues } from '@/lib/validation';
import { useDebounce } from '@/hooks/use-debounce';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DepositFormProps {
  amount: string;
  onAmountChange: (value: string) => void;
  numericAmount: number;
  sharePreview: number;
  sbtcBalance: number;
  vault: VaultData;
  wallet: WalletState;
  isVaultPaused: boolean;
  exceedsCap: boolean;
  isValidDeposit: boolean;
  onSubmit: () => void;
  onConnect: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
}

export function DepositForm({
  amount,
  onAmountChange,
  numericAmount,
  sharePreview,
  sbtcBalance,
  vault,
  wallet,
  isVaultPaused,
  exceedsCap,
  isValidDeposit,
  onSubmit,
  onConnect,
  isLoading = false,
  isSuccess = false,
}: DepositFormProps) {
  const {
    register,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    mode: 'onChange',
    defaultValues: { amount },
  });

  const debouncedAmount = useDebounce(numericAmount, 300);

  useEffect(() => {
    setValue('amount', amount, { shouldValidate: amount.length > 0 });
  }, [amount, setValue]);

  const displayPreview = debouncedAmount > 0 ? debouncedAmount / vault.sharePrice : 0;

  const buttonDisabled = !isValidDeposit || isLoading || isSuccess;

  return (
    <>
      <label
        htmlFor="deposit-amount"
        className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
      >
        Amount (sBTC)
      </label>
      <div className="relative">
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <Bitcoin className="h-5 w-5 text-primary/60" />
          </div>
          <input
            id="deposit-amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00000000"
            aria-describedby={errors.amount ? 'deposit-error' : undefined}
            aria-invalid={!!errors.amount}
            value={amount}
            onChange={(e) => {
              const v = e.target.value;
              if (/^[0-9]*\.?[0-9]{0,8}$/.test(v)) {
                onAmountChange(v);
                setValue('amount', v, { shouldValidate: true });
              }
            }}
            disabled={isVaultPaused || isLoading}
            className="w-full rounded-xl border-0 bg-surface-3 py-4 pl-12 pr-4 font-mono text-2xl font-semibold text-foreground placeholder:text-muted-foreground/40 transition-all duration-150 focus:bg-surface-4 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>
        {errors.amount && amount.length > 0 && (
          <p id="deposit-error" className="mt-1.5 text-xs text-destructive" role="alert">
            {errors.amount.message}
          </p>
        )}
        {wallet.isConnected && (
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Balance: <span className="font-mono">{formatBtc(sbtcBalance)}</span></span>
            <button
              type="button"
              onClick={() => {
                const maxVal = sbtcBalance.toFixed(8);
                onAmountChange(maxVal);
                setValue('amount', maxVal, { shouldValidate: true });
              }}
              aria-label="Set maximum deposit amount"
              className="rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              MAX
            </button>
          </div>
        )}
      </div>

      {debouncedAmount > 0 && (
        <div className="mt-6 space-y-3 rounded-xl bg-surface-3/50 p-4" aria-live="polite">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You will receive</span>
            <span className="font-mono font-medium text-foreground">
              {formatShares(displayPreview)} shares
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Exchange rate</span>
            <span className="font-mono text-muted-foreground">
              1 sBTC = {formatShares(1 / vault.sharePrice)} shares
            </span>
          </div>
        </div>
      )}

      {isVaultPaused && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-warning/10 p-3" role="alert">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden="true" />
          <p className="text-[11px] leading-relaxed text-warning">
            Vault is currently paused. Withdrawals remain active.
          </p>
        </div>
      )}

      {exceedsCap && numericAmount > 0 && !isVaultPaused && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-destructive/10 p-3" role="alert">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-[11px] leading-relaxed text-destructive">
            Deposit would exceed vault cap ({formatBtc(vault.depositCap, 0)} max).
          </p>
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-surface-3/30 p-3">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Post-conditions ensure your transaction will only execute if conditions are met. Deny mode enabled.
        </p>
      </div>

      {wallet.isConnected ? (
        <button
          type="button"
          disabled={buttonDisabled}
          onClick={onSubmit}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.span
                key="success"
                className="flex items-center gap-2"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Check className="h-4 w-4" />
                Success
              </motion.span>
            ) : isLoading ? (
              <motion.span
                key="loading"
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing…
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {isVaultPaused ? 'Deposits Paused' : 'Deposit sBTC'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      ) : (
        <button
          type="button"
          onClick={onConnect}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-surface-3 py-4 text-sm font-semibold text-muted-foreground transition-all duration-150 hover:bg-surface-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Connect Wallet
        </button>
      )}
    </>
  );
}
