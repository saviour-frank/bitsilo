import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, ReactNode } from 'react';
import { WalletState, VaultData, UserPosition, Transaction } from '@/lib/types';
import {
  connectWallet,
  disconnectWallet,
  checkIsConnected,
  getCachedAddress,
  fetchVaultData,
  fetchUserData,
  fetchTransactionHistory,
  satsToBtc,
  sharePriceToDisplay,
  sharesToDisplay,
  NETWORK,
} from '@/lib/stacks';

interface AppState {
  wallet: WalletState;
  vault: VaultData;
  userPosition: UserPosition | null;
  sbtcBalance: number;
  transactions: Transaction[];
  vaultLoading: boolean;
}

type Action =
  | { type: 'CONNECT_WALLET'; payload: { address: string; network: 'testnet' | 'mainnet' } }
  | { type: 'DISCONNECT_WALLET' }
  | { type: 'SET_VAULT_DATA'; payload: VaultData }
  | { type: 'SET_USER_POSITION'; payload: UserPosition | null }
  | { type: 'SET_SBTC_BALANCE'; payload: number }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_VAULT_LOADING'; payload: boolean };

const emptyVault: VaultData = {
  name: 'BitSilo sBTC Vault',
  tvl: 0,
  apy: 0,
  sharePrice: 1,
  totalDepositors: 0,
  depositCap: 0,
  currentDeposits: 0,
  status: 'active',
  contractAddress: '',
};

const initialState: AppState = {
  wallet: { isConnected: false, address: null, network: null, isCorrectNetwork: true },
  vault: emptyVault,
  userPosition: null,
  sbtcBalance: 0,
  transactions: [],
  vaultLoading: true,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'CONNECT_WALLET':
      return {
        ...state,
        wallet: {
          isConnected: true,
          address: action.payload.address,
          network: action.payload.network,
          isCorrectNetwork: action.payload.network === NETWORK,
        },
      };
    case 'DISCONNECT_WALLET':
      return {
        ...state,
        wallet: { isConnected: false, address: null, network: null, isCorrectNetwork: true },
        userPosition: null,
        sbtcBalance: 0,
      };
    case 'SET_VAULT_DATA':
      return { ...state, vault: action.payload };
    case 'SET_USER_POSITION':
      return { ...state, userPosition: action.payload };
    case 'SET_SBTC_BALANCE':
      return { ...state, sbtcBalance: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'SET_VAULT_LOADING':
      return { ...state, vaultLoading: action.payload };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  handleConnect: () => Promise<void>;
  handleDisconnect: () => void;
  refreshVault: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const vaultInterval = useRef<ReturnType<typeof setInterval>>();
  const userInterval = useRef<ReturnType<typeof setInterval>>();
  const txInterval = useRef<ReturnType<typeof setInterval>>();

  // ---- Fetch on-chain vault data ----
  const refreshVault = useCallback(async () => {
    try {
      const data = await fetchVaultData();
      const tvl = satsToBtc(data.totalSbtc);
      const cap = satsToBtc(data.depositCap);
      const price = sharePriceToDisplay(data.sharePrice);

      dispatch({
        type: 'SET_VAULT_DATA',
        payload: {
          name: 'BitSilo sBTC Vault',
          tvl,
          apy: 0, // Computed from event history — placeholder for now
          sharePrice: price,
          totalDepositors: 0, // Requires event indexing
          depositCap: cap,
          currentDeposits: tvl,
          status: data.paused ? 'paused' : 'active',
          contractAddress: '',
        },
      });
    } catch (e) {
      console.error('Failed to fetch vault data:', e);
    } finally {
      dispatch({ type: 'SET_VAULT_LOADING', payload: false });
    }
  }, []);

  // ---- Fetch on-chain user data ----
  const refreshUser = useCallback(async () => {
    const addr = state.wallet.address;
    if (!addr) return;
    try {
      const userData = await fetchUserData(addr);
      const shares = sharesToDisplay(userData.shares);
      const sbtcValue = satsToBtc(userData.withdrawPreview);
      const balance = satsToBtc(userData.sbtcBalance);

      dispatch({ type: 'SET_SBTC_BALANCE', payload: balance });

      if (userData.shares > 0n) {
        dispatch({
          type: 'SET_USER_POSITION',
          payload: {
            shares,
            sbtcValue,
            depositedAmount: 0, // Would need historical event indexing
            earnedYield: 0,
          },
        });
      } else {
        dispatch({ type: 'SET_USER_POSITION', payload: null });
      }
    } catch (e) {
      console.error('Failed to fetch user data:', e);
    }
  }, [state.wallet.address]);

  // ---- Fetch transaction history ----
  const refreshTransactions = useCallback(async () => {
    try {
      const txs = await fetchTransactionHistory(30);
      dispatch({ type: 'SET_TRANSACTIONS', payload: txs });
    } catch (e) {
      console.error('Failed to fetch transactions:', e);
    }
  }, []);

  // ---- Wallet connect / disconnect ----
  const handleConnect = useCallback(async () => {
    const address = await connectWallet();
    if (address) {
      dispatch({ type: 'CONNECT_WALLET', payload: { address, network: NETWORK } });
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    disconnectWallet();
    dispatch({ type: 'DISCONNECT_WALLET' });
  }, []);

  // ---- On mount: restore wallet + load vault data ----
  useEffect(() => {
    // Restore cached wallet session
    if (checkIsConnected()) {
      const cached = getCachedAddress();
      if (cached) {
        dispatch({ type: 'CONNECT_WALLET', payload: { address: cached, network: NETWORK } });
      }
    }
    // Initial vault fetch + transaction history
    refreshVault();
    refreshTransactions();
  }, [refreshVault, refreshTransactions]);

  // ---- Poll vault data every 30s, transactions every 30s ----
  useEffect(() => {
    vaultInterval.current = setInterval(refreshVault, 30_000);
    txInterval.current = setInterval(refreshTransactions, 30_000);
    return () => {
      clearInterval(vaultInterval.current);
      clearInterval(txInterval.current);
    };
  }, [refreshVault, refreshTransactions]);

  // ---- Load + poll user data when connected ----
  useEffect(() => {
    if (state.wallet.isConnected && state.wallet.address) {
      refreshUser();
      userInterval.current = setInterval(refreshUser, 15_000);
    }
    return () => clearInterval(userInterval.current);
  }, [state.wallet.isConnected, state.wallet.address, refreshUser]);

  return (
    <AppContext.Provider value={{ state, dispatch, handleConnect, handleDisconnect, refreshVault, refreshUser, refreshTransactions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
