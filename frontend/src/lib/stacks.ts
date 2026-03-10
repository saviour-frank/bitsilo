/**
 * Blockchain service layer — all on-chain reads and writes for BitSilo.
 *
 * Uses the latest @stacks/connect + @stacks/transactions APIs per Stacks docs:
 *   - connect() / disconnect() / isConnected() / getLocalStorage() for wallet
 *   - request('stx_callContract', ...) for write transactions
 *   - fetchCallReadOnlyFunction() for read-only calls
 *   - Pc builder for post-conditions
 *   - network string ('testnet' | 'mainnet') — no legacy StacksNetwork objects
 */

import {
  connect,
  disconnect as stacksDisconnect,
  isConnected as stacksIsConnected,
  getLocalStorage,
  request,
} from '@stacks/connect';
import {
  fetchCallReadOnlyFunction,
  Cl,
  Pc,
  cvToValue,
  type ClarityValue,
} from '@stacks/transactions';

// ---------------------------------------------------------------------------
// Config — hardcoded per deployed contracts, no .env needed
// ---------------------------------------------------------------------------
export const NETWORK: 'testnet' | 'mainnet' = 'testnet';

export const DEPLOYER = 'ST24BN6HQCT1B37TD9MDJ3Y3BEZCMG9V1Y9X5241M';
export const VAULT_CONTRACT_NAME = 'bitsilo-vault';
export const VAULT_CONTRACT = `${DEPLOYER}.${VAULT_CONTRACT_NAME}`;

export const SBTC_DEPLOYER = 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT';
export const SBTC_CONTRACT_NAME = 'sbtc-token';
export const SBTC_CONTRACT = `${SBTC_DEPLOYER}.${SBTC_CONTRACT_NAME}`;

export const SHARE_PRECISION = 1_000_000n;

export const EXPLORER_BASE = 'https://explorer.hiro.so';

// ---------------------------------------------------------------------------
// Wallet helpers
// ---------------------------------------------------------------------------

/** Connect wallet — returns the STX address or null */
export async function connectWallet(): Promise<string | null> {
  const response = await connect({ network: NETWORK });
  const stxEntry = response.addresses.find((a) => a.symbol === 'STX');
  return stxEntry?.address ?? response.addresses[2]?.address ?? null;
}

/** Disconnect wallet */
export function disconnectWallet(): void {
  stacksDisconnect();
}

/** Check if wallet is connected (uses cached localStorage) */
export function checkIsConnected(): boolean {
  return stacksIsConnected();
}

/** Get cached STX address from localStorage (no wallet prompt) */
export function getCachedAddress(): string | null {
  const data = getLocalStorage();
  if (!data) return null;
  return data.addresses?.stx?.[0]?.address ?? null;
}

// ---------------------------------------------------------------------------
// Read-only contract calls
// ---------------------------------------------------------------------------

async function readVault(
  functionName: string,
  functionArgs: ClarityValue[] = [],
  senderAddress?: string,
): Promise<ClarityValue> {
  return fetchCallReadOnlyFunction({
    contractAddress: DEPLOYER,
    contractName: VAULT_CONTRACT_NAME,
    functionName,
    functionArgs,
    senderAddress: senderAddress ?? DEPLOYER,
    network: NETWORK,
  });
}

/** get-total-sbtc -> (ok uint) in sats */
export async function getTotalSbtc(): Promise<bigint> {
  const cv = await readVault('get-total-sbtc');
  return BigInt(cvToValue(cv, true));
}

/** get-total-shares -> (ok uint) */
export async function getTotalShares(): Promise<bigint> {
  const cv = await readVault('get-total-shares');
  return BigInt(cvToValue(cv, true));
}

/** get-share-price -> (ok uint) scaled by SHARE_PRECISION */
export async function getSharePrice(): Promise<bigint> {
  const cv = await readVault('get-share-price');
  return BigInt(cvToValue(cv, true));
}

/** get-deposit-cap -> (ok uint) in sats */
export async function getDepositCap(): Promise<bigint> {
  const cv = await readVault('get-deposit-cap');
  return BigInt(cvToValue(cv, true));
}

/** is-paused -> (ok bool) */
export async function isPaused(): Promise<boolean> {
  const cv = await readVault('is-paused');
  return cvToValue(cv, true) as boolean;
}

/** get-shares for a specific principal -> (ok uint) */
export async function getUserShares(principal: string): Promise<bigint> {
  const cv = await readVault(
    'get-shares',
    [Cl.standardPrincipal(principal)],
    principal,
  );
  return BigInt(cvToValue(cv, true));
}

/** preview-withdraw -> (ok uint) sBTC in sats for given shares */
export async function previewWithdraw(shareAmount: bigint): Promise<bigint> {
  const cv = await readVault('preview-withdraw', [Cl.uint(shareAmount)]);
  return BigInt(cvToValue(cv, true));
}

/** Get sBTC balance for a principal */
export async function getSbtcBalance(principal: string): Promise<bigint> {
  const cv = await fetchCallReadOnlyFunction({
    contractAddress: SBTC_DEPLOYER,
    contractName: SBTC_CONTRACT_NAME,
    functionName: 'get-balance',
    functionArgs: [Cl.standardPrincipal(principal)],
    senderAddress: principal,
    network: NETWORK,
  });
  // Returns (ok uint) — unwrap
  const val = cvToValue(cv, true);
  return BigInt(val);
}

// ---------------------------------------------------------------------------
// Write transactions (wallet-signed)
// ---------------------------------------------------------------------------

/** Deposit sBTC into the vault */
export async function deposit(
  sbtcAmountSats: bigint,
  senderAddress: string,
): Promise<{ txId: string }> {
  const postCondition = Pc.principal(senderAddress)
    .willSendEq(Number(sbtcAmountSats))
    .ft(`${SBTC_CONTRACT}`, 'sbtc-token');

  const result = await request('stx_callContract', {
    contract: VAULT_CONTRACT,
    functionName: 'deposit',
    functionArgs: [Cl.uint(sbtcAmountSats)],
    network: NETWORK,
    postConditions: [postCondition],
    postConditionMode: 'deny',
  });

  if (!result.txid) throw new Error('No transaction ID returned by wallet');
  return { txId: result.txid };
}

/** Withdraw shares from the vault */
export async function withdraw(
  shareAmount: bigint,
): Promise<{ txId: string }> {
  const result = await request('stx_callContract', {
    contract: VAULT_CONTRACT,
    functionName: 'withdraw',
    functionArgs: [Cl.uint(shareAmount)],
    network: NETWORK,
    postConditions: [],
    postConditionMode: 'deny',
  });

  if (!result.txid) throw new Error('No transaction ID returned by wallet');
  return { txId: result.txid };
}

// ---------------------------------------------------------------------------
// Utility: fetch all vault data in one batch
// ---------------------------------------------------------------------------
export interface VaultOnChainData {
  totalSbtc: bigint;
  totalShares: bigint;
  sharePrice: bigint;
  depositCap: bigint;
  paused: boolean;
}

export async function fetchVaultData(): Promise<VaultOnChainData> {
  const [totalSbtc, totalShares, sharePrice, depositCap, paused] = await Promise.all([
    getTotalSbtc(),
    getTotalShares(),
    getSharePrice(),
    getDepositCap(),
    isPaused(),
  ]);
  return { totalSbtc, totalShares, sharePrice, depositCap, paused };
}

export interface UserOnChainData {
  shares: bigint;
  sbtcBalance: bigint;
  withdrawPreview: bigint;
}

export async function fetchUserData(principal: string): Promise<UserOnChainData> {
  const shares = await getUserShares(principal);
  const [sbtcBalance, withdrawPreview] = await Promise.all([
    getSbtcBalance(principal),
    shares > 0n ? previewWithdraw(shares) : Promise.resolve(0n),
  ]);
  return { shares, sbtcBalance, withdrawPreview };
}

// ---------------------------------------------------------------------------
// Conversion helpers (sats <-> BTC display)
// ---------------------------------------------------------------------------
const SATS_PER_BTC = 100_000_000n;

/** Convert sats (bigint) to BTC display number */
export function satsToBtc(sats: bigint): number {
  return Number(sats) / Number(SATS_PER_BTC);
}

/** Convert BTC display number to sats (bigint) */
export function btcToSats(btc: number): bigint {
  return BigInt(Math.round(btc * Number(SATS_PER_BTC)));
}

/** Convert share price from on-chain uint to display ratio */
export function sharePriceToDisplay(onChainPrice: bigint): number {
  return Number(onChainPrice) / Number(SHARE_PRECISION);
}

/** Convert shares (on-chain uint) to display number */
export function sharesToDisplay(shares: bigint): number {
  return Number(shares) / Number(SHARE_PRECISION);
}

/** Convert display shares to on-chain uint */
export function displayToShares(displayShares: number): bigint {
  return BigInt(Math.round(displayShares * Number(SHARE_PRECISION)));
}

// ---------------------------------------------------------------------------
// Transaction history from Hiro API
// ---------------------------------------------------------------------------

const HIRO_API = NETWORK === 'testnet'
  ? 'https://api.testnet.hiro.so'
  : 'https://api.hiro.so';

export interface HiroTxEvent {
  id: string;
  type: 'deposit' | 'withdraw';
  sbtcAmount: number;
  shares: number;
  sharePriceAtTx: number;
  timestamp: Date;
  status: 'confirmed' | 'pending' | 'failed';
  txId: string;
  sender: string;
}

/**
 * Fetch recent contract call transactions for the vault from the Hiro API.
 * Returns them mapped to the app's Transaction shape.
 */
export async function fetchTransactionHistory(limit = 20): Promise<HiroTxEvent[]> {
  const url = `${HIRO_API}/extended/v1/address/${VAULT_CONTRACT}/transactions?limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const results: (typeof data.results) = data.results ?? [];

  return results
    .filter((tx: any) => tx.tx_type === 'contract_call')
    .map((tx: any, idx: number) => {
      const fnName: string = tx.contract_call?.function_name ?? '';
      const isDeposit = fnName === 'deposit';
      const isWithdraw = fnName === 'withdraw';
      if (!isDeposit && !isWithdraw) return null;

      // Parse the function argument (first arg is the uint amount)
      const rawArgs: any[] = tx.contract_call?.function_args ?? [];
      const argVal = rawArgs[0]?.repr
        ? Number(rawArgs[0].repr.replace('u', ''))
        : 0;

      const sbtcAmount = isDeposit
        ? Number(argVal) / 1e8
        : 0; // For withdrawals, amount is in shares not sBTC
      const shares = isWithdraw
        ? Number(argVal) / Number(SHARE_PRECISION)
        : 0;

      let status: 'confirmed' | 'pending' | 'failed' = 'pending';
      if (tx.tx_status === 'success') status = 'confirmed';
      else if (tx.tx_status === 'abort_by_response' || tx.tx_status === 'abort_by_post_condition') status = 'failed';

      return {
        id: tx.tx_id ?? `tx-${idx}`,
        type: isDeposit ? 'deposit' : 'withdraw',
        sbtcAmount: isDeposit ? sbtcAmount : shares, // display the relevant amount
        shares: isDeposit ? 0 : shares,
        sharePriceAtTx: 1, // Not available from raw tx data
        timestamp: new Date(tx.burn_block_time_iso ?? tx.receipt_time_iso ?? Date.now()),
        status,
        txId: tx.tx_id ?? '',
        sender: tx.sender_address ?? '',
      } satisfies HiroTxEvent;
    })
    .filter(Boolean) as HiroTxEvent[];
}
