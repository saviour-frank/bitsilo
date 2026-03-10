import { useApp } from '@/contexts/AppContext';
import { Wallet, ChevronDown, Copy, LogOut, Check } from 'lucide-react';
import { truncateAddress } from '@/lib/formatting';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ConnectButton() {
  const { state, dispatch } = useApp();
  const [copied, setCopied] = useState(false);

  const handleConnect = () => {
    const address = 'ST24B7YS18HAXNQDRGFKYGHYZE9HCASG5MJ241M';
    dispatch({
      type: 'CONNECT_WALLET',
      payload: { address, network: 'testnet' },
    });
    toast.success('Wallet connected', { description: truncateAddress(address) });
  };

  const handleCopy = async () => {
    if (state.wallet.address) {
      await navigator.clipboard.writeText(state.wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!state.wallet.isConnected) {
    return (
      <button
        data-wallet-connect
        onClick={handleConnect}
        aria-label="Connect wallet"
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">Connect Wallet</span>
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Wallet menu"
          className="flex items-center gap-2 rounded-lg bg-surface-3 px-3.5 py-2.5 text-sm font-medium text-foreground transition-all duration-150 hover:bg-surface-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
          <span className="font-mono text-xs">
            {state.wallet.address && truncateAddress(state.wallet.address)}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52 bg-surface-2 border-border/50">
        <DropdownMenuItem onClick={handleCopy} className="gap-2.5 px-4 py-3 cursor-pointer">
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
          {copied ? 'Copied!' : 'Copy Address'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => { dispatch({ type: 'DISCONNECT_WALLET' }); toast('Wallet disconnected'); }}
          className="gap-2.5 px-4 py-3 text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
