import { useState, useCallback, useEffect, forwardRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { toast } from 'sonner';
import { SegmentedControl } from '@/components/shared/SegmentedControl';
import { TransactionModal } from '@/components/vault/TransactionModal';
import { DepositForm } from '@/components/vault/DepositForm';
import { WithdrawForm } from '@/components/vault/WithdrawForm';
import { VaultOverview } from '@/components/vault/VaultOverview';
import { ActivityFeed } from '@/components/vault/ActivityFeed';
import { DevToolsPanel } from '@/components/vault/DevToolsPanel';
import { getExplorerUrl } from '@/lib/formatting';
import { MOCK_TRANSACTIONS } from '@/lib/constants';
import { TransactionStep } from '@/lib/types';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';

const Vault = forwardRef<HTMLElement>((_, ref) => {
  useEffect(() => { document.title = 'Vault | BitSilo'; }, []);
  const { state, dispatch } = useApp();
  const { vault, wallet, userPosition, sbtcBalance, vaultLoading } = state;
  const [tab, setTab] = useState('Deposit');
  const [amount, setAmount] = useState('');
  const [txStep, setTxStep] = useState<TransactionStep>('idle');
  const [errorCode, setErrorCode] = useState<string | undefined>();
  const [devOpen, setDevOpen] = useState(false);
  const [devPaused, setDevPaused] = useState<boolean | null>(null);
  const [devDeposits, setDevDeposits] = useState<number | null>(null);
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success'>('idle');

  const effectiveStatus = devPaused !== null ? (devPaused ? 'paused' : 'active') : vault.status;
  const effectiveDeposits = devDeposits !== null ? devDeposits : vault.currentDeposits;

  const ERROR_MAP: Record<string, string> = {
    u100: 'Not authorized',
    u101: 'Amount must be greater than 0',
    u102: 'Insufficient shares',
    u103: 'Vault is paused',
    u104: 'Deposit exceeds cap',
  };

  const numericAmount = parseFloat(amount) || 0;
  const sharePreview = tab === 'Deposit'
    ? numericAmount / vault.sharePrice
    : numericAmount * vault.sharePrice;

  const exceedsCap = effectiveDeposits + numericAmount > vault.depositCap;
  const isVaultPaused = effectiveStatus === 'paused';
  const isValidDeposit = numericAmount > 0 && numericAmount <= sbtcBalance && !exceedsCap && !isVaultPaused;
  const isValidWithdraw = numericAmount > 0 && userPosition && numericAmount <= userPosition.shares;

  const fillPercent = Math.min((effectiveDeposits / vault.depositCap) * 100, 100);
  const capBarColor = fillPercent >= 100 ? 'bg-destructive' : fillPercent >= 90 ? 'bg-warning' : 'bg-primary';

  const handleConnect = () => {
    dispatch({
      type: 'CONNECT_WALLET',
      payload: { address: 'ST24B7YS18HAXNQDRGFKYGHYZE9HCASG5MJ241M', network: 'testnet' },
    });
  };

  const handleSubmit = () => {
    setButtonState('loading');
    // Brief loading state before opening modal
    setTimeout(() => {
      setTxStep('preview');
      setButtonState('idle');
    }, 600);
  };

  const mockTxId = '0x8a3f...4e2b';
  const explorerUrl = getExplorerUrl(mockTxId);

  const handleConfirm = useCallback(() => {
    setErrorCode(undefined);
    setTxStep('confirming');
    setTimeout(() => setTxStep('broadcasting'), 2000);
    setTimeout(() => {
      const shouldFail = Math.random() < 0.2;
      if (shouldFail) {
        const codes = ['u100', 'u101', 'u102', 'u103', 'u104'];
        const code = codes[Math.floor(Math.random() * codes.length)];
        setErrorCode(code);
        setTxStep('failed');
        toast.error('Transaction failed', {
          description: ERROR_MAP[code] || 'An unexpected error occurred.',
        });
        return;
      }
      setTxStep('pending');
      toast('Transaction submitted', {
        description: 'Waiting for on-chain confirmation…',
        action: {
          label: 'View on Explorer',
          onClick: () => window.open(explorerUrl, '_blank'),
        },
      });
    }, 3500);
    setTimeout(() => {
      setTxStep((prev) => {
        if (prev === 'failed') return prev;
        setButtonState('success');
        toast.success('Transaction confirmed', {
          description: `${tab === 'Deposit' ? 'Deposit' : 'Withdrawal'} completed successfully.`,
          action: {
            label: 'View on Explorer',
            onClick: () => window.open(explorerUrl, '_blank'),
          },
        });
        return 'confirmed';
      });
    }, 4500);
  }, [tab, explorerUrl]);

  const handleModalClose = useCallback(() => {
    setTxStep('idle');
    if (txStep === 'confirmed') {
      setAmount('');
      // Reset success state after 2s
      setTimeout(() => setButtonState('idle'), 2000);
    } else {
      setButtonState('idle');
    }
  }, [txStep]);

  return (
    <PageContainer ref={ref}>
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr,0.65fr]">
        <div className="space-y-6">
          <div className="rounded-2xl bg-surface-2 p-6 shadow-card sm:p-8">
            <SegmentedControl
              options={['Deposit', 'Withdraw']}
              value={tab}
              onChange={(v) => { setTab(v); setAmount(''); setButtonState('idle'); }}
            />

            <div className="mt-8 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab}
                  initial={{ x: tab === 'Deposit' ? -60 : 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: tab === 'Deposit' ? 60 : -60, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  dragSnapToOrigin
                  onDragEnd={(_: any, info: PanInfo) => {
                    if (info.offset.x < -50 && tab === 'Deposit') {
                      setTab('Withdraw');
                      setAmount('');
                    } else if (info.offset.x > 50 && tab === 'Withdraw') {
                      setTab('Deposit');
                      setAmount('');
                    }
                  }}
                >
                  {tab === 'Deposit' ? (
                    <DepositForm
                      amount={amount}
                      onAmountChange={setAmount}
                      numericAmount={numericAmount}
                      sharePreview={sharePreview}
                      sbtcBalance={sbtcBalance}
                      vault={vault}
                      wallet={wallet}
                      isVaultPaused={isVaultPaused}
                      exceedsCap={exceedsCap}
                      isValidDeposit={isValidDeposit}
                      onSubmit={handleSubmit}
                      onConnect={handleConnect}
                      isLoading={buttonState === 'loading'}
                      isSuccess={buttonState === 'success'}
                    />
                  ) : (
                    <WithdrawForm
                      amount={amount}
                      onAmountChange={setAmount}
                      numericAmount={numericAmount}
                      sharePreview={sharePreview}
                      vault={vault}
                      wallet={wallet}
                      userPosition={userPosition}
                      isValidWithdraw={isValidWithdraw}
                      onSubmit={handleSubmit}
                      onConnect={handleConnect}
                      isLoading={buttonState === 'loading'}
                      isSuccess={buttonState === 'success'}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <VaultOverview
            vault={vault}
            effectiveStatus={effectiveStatus}
            effectiveDeposits={effectiveDeposits}
            fillPercent={fillPercent}
            capBarColor={capBarColor}
            vaultLoading={vaultLoading}
            wallet={wallet}
            userPosition={userPosition}
          />

          <ActivityFeed
            loading={vaultLoading}
            transactions={MOCK_TRANSACTIONS.slice(0, 6)}
          />
        </div>
      </div>

      <TransactionModal
        open={txStep !== 'idle'}
        step={txStep}
        type={tab === 'Deposit' ? 'deposit' : 'withdraw'}
        amount={numericAmount}
        sharesOrSbtc={sharePreview}
        sharePrice={vault.sharePrice}
        onConfirm={handleConfirm}
        onClose={handleModalClose}
        txId="0x8a3f...4e2b"
        errorCode={errorCode}
      />

      {import.meta.env.DEV && (
        <DevToolsPanel
          vault={vault}
          devOpen={devOpen}
          devPaused={devPaused}
          devDeposits={devDeposits}
          effectiveDeposits={effectiveDeposits}
          onToggleOpen={() => setDevOpen(!devOpen)}
          onPausedChange={(v) => setDevPaused(v)}
          onDepositsChange={(v) => setDevDeposits(v)}
          onReset={() => { setDevPaused(null); setDevDeposits(null); }}
        />
      )}
    </PageContainer>
  );
});
Vault.displayName = 'Vault';
export default Vault;
