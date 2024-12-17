import { useState } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Card } from '@components/ui/card';
import Image from 'next/image';
import { cn } from '@lib/utils';
import { Alert, AlertDescription } from '@components/ui/alert';
import { AlertCircle } from 'lucide-react';

const PRESET_TOKENS = [
  {
    name: 'Stacks',
    symbol: 'STX',
    contractId: '.stx',
    image: '/stx-logo.png',
    description: 'Native token of the Stacks blockchain'
  },
  {
    name: 'Bitcoin',
    symbol: 'sBTC',
    contractId: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
    image: '/sbtc.png',
    description: 'Bitcoin token on the Stacks blockchain'
  },
  {
    name: 'Charisma',
    symbol: 'CHA',
    contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token',
    image: '/charisma-logo-square.png',
    description: 'Value token for the Charisma protocol'
  },
  {
    name: 'Charisma Governance',
    symbol: 'DMG',
    contractId: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token',
    image: '/dmg-logo.gif',
    description: 'Governance token for Charisma DAO'
  }
];

interface TokenSelectorProps {
  onSelect: (token: { contractId: string; name?: string; symbol?: string }) => void;
  excludeToken?: string;
}

export function TokenSelector({ onSelect, excludeToken }: TokenSelectorProps) {
  const [customContractId, setCustomContractId] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputError, setCustomInputError] = useState<string | null>(null);

  const handleCustomSubmit = () => {
    if (customContractId === excludeToken) {
      setCustomInputError('This token is already selected');
      return;
    }

    if (customContractId) {
      onSelect({ contractId: customContractId });
      setCustomContractId('');
      setCustomInputError(null);
      setShowCustomInput(false);
    }
  };

  return (
    <div className="my-2 space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {PRESET_TOKENS.map(token => {
          const isDisabled = token.contractId === excludeToken;

          return (
            <Card
              key={token.contractId}
              className={cn(
                'relative overflow-hidden transition-all',
                !isDisabled && 'cursor-pointer group hover:border-primary/50',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => !isDisabled && onSelect(token)}
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />

              <div className="relative p-6">
                {/* Token Image */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div
                      className={cn(
                        'absolute inset-0',
                        !isDisabled && 'transition-transform group-hover:scale-110'
                      )}
                    >
                      <Image
                        src={token.image}
                        alt={token.name}
                        width={80}
                        height={80}
                        className={cn('rounded-full size-20', isDisabled && 'grayscale')}
                      />
                    </div>
                    <div className="w-20 h-20" /> {/* Spacer */}
                  </div>
                </div>

                {/* Token Info */}
                <div className="space-y-2 text-center">
                  <div>
                    <h3 className="text-lg font-semibold text-white/95">{token.name}</h3>
                    <div className="inline-block px-2 py-1 mt-1 font-mono text-sm rounded-full bg-primary/10">
                      {token.symbol}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{token.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col items-center pt-4 space-y-4 border-t border-white/10">
        {showCustomInput ? (
          <div className="w-full max-w-md space-y-2">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter contract ID"
                value={customContractId}
                onChange={e => {
                  setCustomContractId(e.target.value);
                  setCustomInputError(null);
                }}
                className={cn(customInputError && 'border-red-500 focus-visible:ring-red-500')}
              />
              <Button
                onClick={handleCustomSubmit}
                disabled={!customContractId || customContractId === excludeToken}
              >
                Continue
              </Button>
            </div>
            {customInputError && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{customInputError}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <Button variant="outline" onClick={() => setShowCustomInput(true)}>
            Use Custom Token
          </Button>
        )}
      </div>
    </div>
  );
}
