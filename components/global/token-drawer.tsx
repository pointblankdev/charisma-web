import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@components/ui/context-menu';
import { Copy, ExternalLink, Send, LineChart, Star, Coins } from 'lucide-react';
import numeral from 'numeral';
import useWallet from '@lib/hooks/wallet-balance-provider';
import Image from 'next/image';

// Mock data structure for a token
interface TokenData {
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  priceUSD: number;
  change24h: number;
  contractAddress: string;
  icon: string;
}

const formatTokenInfo = (contractId: string, balance: string) => {
  const [namespace, name] = contractId.split('.');
  const parts = name.split('::');
  const symbol = parts[parts.length - 1].toUpperCase();

  return {
    symbol,
    name: parts[0],
    balance,
    contractId,
    icon: `/api/placeholder/40/40`
  };
};

const TokenListItem = ({ token, metadata }: { token: any; metadata?: any }) => {
  const formattedBalance = numeral(Number(token.balance)).format('0,0.00');
  const [imageError, setImageError] = useState(false);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex items-center justify-between p-3 transition-colors rounded-lg hover:bg-white/5 group max-h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 overflow-hidden rounded-lg">
              {metadata?.image && !imageError ? (
                <Image
                  src={metadata.image}
                  alt={token.symbol}
                  className="object-cover w-full h-full"
                  width={40}
                  height={40}
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              ) : (
                <Coins className="w-10 h-10" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium truncate">{token.symbol}</span>
                <span className="text-sm text-white/60">{metadata?.name || token.name}</span>
              </div>
              <div className="text-sm text-white/40">{formattedBalance}</div>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-64 bg-black/90 border-white/10 text-white/90">
        <div className="px-2 py-1.5 text-xs font-semibold text-white/60">
          {metadata?.name || token.name}
          <div className="text-[10px] font-normal text-white/40">
            Balance: {formattedBalance} {token.symbol}
          </div>
        </div>
        <ContextMenuSeparator className="bg-white/10" />

        <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10">
          <Send className="w-4 h-4 mr-2 opacity-50" />
          Send
        </ContextMenuItem>

        <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10">
          <LineChart className="w-4 h-4 mr-2 opacity-50" />
          Price History
        </ContextMenuItem>

        <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10">
          <Star className="w-4 h-4 mr-2 opacity-50" />
          Add to Watchlist
        </ContextMenuItem>

        <ContextMenuSeparator className="bg-white/10" />

        <ContextMenuItem
          className="hover:bg-white/10 focus:bg-white/10"
          onClick={() => navigator.clipboard.writeText(token.contractId)}
        >
          <Copy className="w-4 h-4 mr-2 opacity-50" />
          Copy Contract Address
        </ContextMenuItem>

        <ContextMenuItem
          className="hover:bg-white/10 focus:bg-white/10"
          onClick={() =>
            window.open(`https://explorer.stacks.co/token/${token.contractId}`, '_blank')
          }
        >
          <ExternalLink className="w-4 h-4 mr-2 opacity-50" />
          View on Explorer
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

// Token list container
const TokenList = () => {
  const [tokenMetadata, setTokenMetadata] = useState({} as any);
  const [isLoading, setIsLoading] = useState(true);
  const { balances } = useWallet();
  const tokens = useMemo(() => {
    const stxToken = {
      symbol: 'STX',
      name: 'Stacks',
      balance: balances.stx.balance,
      contractId: 'native.stx',
      icon: '/api/placeholder/40/40'
    };

    const fungibleTokens = Object.entries(balances.fungible_tokens).map(([contractId, data]: any) =>
      formatTokenInfo(contractId, data.balance)
    );

    return [stxToken, ...fungibleTokens].filter(token => Number(token.balance) > 0);
  }, [balances]);

  // Fetch metadata for all tokens
  useEffect(() => {
    const fetchMetadata = async () => {
      setIsLoading(true);
      const newMetadata: any = { ...tokenMetadata };

      try {
        // Filter out tokens that already have metadata
        const tokensToFetch = tokens.filter(
          token => token.contractId !== 'native.stx' && !newMetadata[token.contractId]
        );

        // Fetch metadata for each token
        for (const token of tokensToFetch) {
          try {
            const contractBase = token.contractId.split('::')[0];
            const response = await fetch(`/api/metadata/${contractBase}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const data = await response.json();
              newMetadata[token.contractId] = data;
            }
          } catch (error) {
            console.error(`Error fetching metadata for ${token.contractId}:`, error);
          }

          // Update state after each successful fetch
          setTokenMetadata((current: any) => ({ ...current, ...newMetadata }));
        }
      } catch (error) {
        console.error('Error in metadata fetch process:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (tokens.length > 0) {
      fetchMetadata();
    }
  }, [tokens]);

  return (
    <div className="space-y-4">
      {/* Portfolio Summary */}
      <div className="px-4 py-2 rounded-lg bg-white/5">
        <div className="mb-1 text-sm text-white/60">Portfolio Value</div>
        <div className="text-2xl font-medium">$4,891.23</div>
        <div className="text-sm text-green-500">+3.2% (24h)</div>
      </div>

      {/* Token count */}
      <div className="px-4 text-sm text-white/60">
        {tokens.length} Tokens
        {isLoading && ' • Loading metadata...'}
      </div>

      {/* Token List */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
        {tokens.map((token: any) => (
          <TokenListItem
            key={token.contractId}
            token={token}
            metadata={tokenMetadata[token.contractId]}
          />
        ))}
      </div>
    </div>
  );
};

export default TokenList;
