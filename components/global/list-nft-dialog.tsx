import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import { Input } from '@components/ui/input';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { API_URL } from '@lib/constants';
import { useGlobal } from '@lib/hooks/global-context';

interface ListNFTDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    image: string;
    contract: string;
  };
  onListingStart: () => void;
}

export default function ListNFTDialog({
  isOpen,
  onClose,
  item,
  onListingStart
}: ListNFTDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { stxAddress } = useGlobal();

  const clearBackendCache = async () => {
    try {
      await fetch(`${API_URL}/api/v0/nfts/cache/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractAddress: item.contract,
          tokenId: item.id,
          userAddress: stxAddress
        })
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !stxAddress) {
      setError('Please enter a valid price');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [contractAddress, contractName] = item.contract.split('.');

      // Start the listing - this will gray out the NFT
      onListingStart();

      // await openContractCall({
      //   network,
      //   contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      //   contractName: 'marketplace-v6',
      //   functionName: 'list-asset',
      //   functionArgs: [
      //     contractPrincipalCV(contractAddress, contractName),
      //     uintCV(parseInt(item.id)),
      //     uintCV(parseFloat(price) * 1_000_000),
      //     uintCV(250)
      //   ],
      //   postConditionMode: PostConditionMode.Allow,
      //   postConditions: []
      // });

      // Clear the backend cache
      await clearBackendCache();

      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>List NFT for Sale</DialogTitle>
          <DialogDescription>
            Set your price and create a listing on the marketplace
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateListing} className="space-y-6">
          <div className="flex gap-6">
            {/* NFT Preview */}
            <div className="relative w-[200px] h-[200px] rounded-lg overflow-hidden ring-1 ring-white/10">
              <Image src={item.image} alt={item.name} className="object-cover" fill sizes="200px" />
            </div>

            {/* NFT Details */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.contract.split('.')[1]}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (STX)</Label>
            <Input
              id="price"
              type="number"
              step="0.1"
              min="0"
              placeholder="Enter price in STX"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Listing...
                </>
              ) : (
                'Create Listing'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
