export function formatBtc(value: number, decimals = 8): string {
  return `₿${value.toFixed(decimals)}`;
}

export function formatShares(value: number, decimals = 6): string {
  return value.toFixed(decimals);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function truncateAddress(address: string, start = 5, end = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function getExplorerUrl(txId: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
  return `https://explorer.hiro.so/txid/${txId}?chain=${network}`;
}

export function getContractExplorerUrl(contractAddress: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
  return `https://explorer.hiro.so/txid/${contractAddress}?chain=${network}`;
}
