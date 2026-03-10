export interface VaultData {
  name: string;
  tvl: number;
  apy: number;
  sharePrice: number;
  totalDepositors: number;
  depositCap: number;
  currentDeposits: number;
  status: 'active' | 'paused';
  contractAddress: string;
}

export interface UserPosition {
  shares: number;
  sbtcValue: number;
  depositedAmount: number;
  earnedYield: number;
}

export interface Transaction {
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

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  network: 'testnet' | 'mainnet' | null;
  isCorrectNetwork: boolean;
}

export type TransactionStep = 'idle' | 'preview' | 'confirming' | 'broadcasting' | 'pending' | 'confirmed' | 'failed';
