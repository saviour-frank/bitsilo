import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { WalletState, VaultData, UserPosition } from '@/lib/types';
import { MOCK_VAULT_DATA, MOCK_USER_POSITION, MOCK_SBTC_BALANCE } from '@/lib/constants';

interface AppState {
  wallet: WalletState;
  vault: VaultData;
  userPosition: UserPosition | null;
  sbtcBalance: number;
  vaultLoading: boolean;
}

type Action =
  | { type: 'CONNECT_WALLET'; payload: { address: string; network: 'testnet' | 'mainnet' } }
  | { type: 'DISCONNECT_WALLET' }
  | { type: 'SET_VAULT_DATA'; payload: VaultData }
  | { type: 'SET_USER_POSITION'; payload: UserPosition | null }
  | { type: 'SET_SBTC_BALANCE'; payload: number }
  | { type: 'SET_VAULT_LOADING'; payload: boolean };

const initialState: AppState = {
  wallet: { isConnected: false, address: null, network: null, isCorrectNetwork: true },
  vault: MOCK_VAULT_DATA,
  userPosition: null,
  sbtcBalance: 0,
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
          isCorrectNetwork: action.payload.network === 'testnet',
        },
        userPosition: MOCK_USER_POSITION,
        sbtcBalance: MOCK_SBTC_BALANCE,
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
    case 'SET_VAULT_LOADING':
      return { ...state, vaultLoading: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'SET_VAULT_LOADING', payload: false });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
