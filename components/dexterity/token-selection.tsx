import { Alert, AlertDescription } from '@components/ui/alert';
import { TokenSelector } from '@components/dexterity/token-selector';
import { Info } from 'lucide-react';

interface TokenSelectionProps {
  onSelect: (token: { contractId: string; name?: string; symbol?: string }) => void;
  excludeToken?: string;
}

export function TokenSelection({ onSelect, excludeToken }: TokenSelectionProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Alert className="mb-6">
        <Info className="w-4 h-4" />
        <AlertDescription>Select a token for your liquidity pool.</AlertDescription>
      </Alert>
      <TokenSelector onSelect={onSelect} excludeToken={excludeToken} />
    </div>
  );
}
