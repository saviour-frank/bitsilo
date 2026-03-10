import { truncateAddress } from '@/lib/formatting';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface TruncatedAddressProps {
  address: string;
  copyable?: boolean;
}

export function TruncatedAddress({ address, copyable = true }: TruncatedAddressProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground">
      {truncateAddress(address)}
      {copyable && (
        <button onClick={handleCopy} className="text-muted-foreground transition-colors hover:text-foreground">
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
        </button>
      )}
    </span>
  );
}
