import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger
} from '@components/ui/context-menu';
import {
  Copy,
  ExternalLink,
  Send,
  LineChart,
  Star,
  Coins,
  Info,
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react';
import numeral from 'numeral';
import useWallet from '@lib/hooks/wallet-balance-provider';
import Image from 'next/image';
import { Dexterity } from 'dexterity-sdk';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { useToast } from '@components/ui/use-toast';
interface FormattedToken {
  contractId: string;
  balance: string;
}

Dexterity.config.mode = 'client';

const formatBalance = (balance: string, decimals: number = 6) => {
  const value = Number(balance) / Math.pow(10, decimals);
  if (value > 1000000) {
    return numeral(value).format('0.00a').toUpperCase();
  }
  if (value > 1) {
    return numeral(value).format('0,0.00');
  }
  return numeral(value).format('0,0.000000');
};

// Update the TokenListItem component
const TokenListItem = ({ token, metadata }: { token: FormattedToken; metadata?: any }) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const formattedBalance = formatBalance(token.balance, metadata?.decimals);
  const { toast } = useToast();

  const handleCopyContract = (e: React.MouseEvent) => {
    // Don't trigger copy on right click (context menu)
    if (e.button === 2) return;

    const baseContractId = token.contractId.split('::')[0];
    navigator.clipboard.writeText(baseContractId);
    toast({
      title: 'Contract ID copied to clipboard',
      description: baseContractId,
      duration: 2000
    });
  };

  // If no metadata yet, show placeholder content
  if (!metadata && token.contractId !== '.stx') {
    return (
      <div className="flex items-center justify-between p-3 transition-colors rounded-lg hover:bg-white/5 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-white/10" />
          <div className="space-y-2">
            <div className="w-20 h-4 rounded bg-white/10" />
            <div className="w-16 h-3 rounded bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  const tokenImage = metadata?.image;
  const tokenSymbol = metadata?.symbol || token.contractId.split('::')[1] || 'UNKNOWN';
  const tokenName = metadata?.name || token.contractId.split('.')[1];

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className="flex items-center justify-between p-3 transition-colors rounded-lg cursor-pointer hover:bg-white/5 group"
          onClick={handleCopyContract}
        >
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 overflow-hidden rounded-lg bg-white/5">
              {!imageError ? (
                <Image
                  src={tokenImage}
                  alt={tokenSymbol}
                  className="object-cover"
                  fill
                  sizes="40px"
                  onError={() => setImageError(true)}
                  loading="lazy"
                />
              ) : (
                <Coins className="w-10 h-10 p-2 opacity-50" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{tokenSymbol}</span>
                <span className="text-sm text-white/60">{tokenName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{formattedBalance}</span>
                {metadata?.description && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 opacity-30 hover:opacity-60" />
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                        {metadata.description}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
          <div className="items-center hidden space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex">
            <Copy className="w-4 h-4 opacity-40" />
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-64 bg-black/90 border-white/10 text-white/90">
        <div className="px-2 py-1.5">
          <div className="font-medium">{tokenSymbol}</div>
          <div className="text-xs text-white/60">{tokenName}</div>
          {metadata?.description && (
            <div className="mt-1 text-xs text-white/40 line-clamp-2">{metadata.description}</div>
          )}
          <div className="mt-1 font-mono text-xs text-white/40">
            Balance: {formattedBalance} {tokenSymbol}
          </div>
        </div>

        <ContextMenuSeparator className="bg-white/10" />

        {/* <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10">
          <Send className="w-4 h-4 mr-2 opacity-50" />
          Send
        </ContextMenuItem> */}

        <ContextMenuItem
          className="hover:bg-white/10 focus:bg-white/10"
          onClick={() => router.push('/swap')}
        >
          <ArrowRightLeft className="w-4 h-4 mr-2 opacity-50" />
          Trade
        </ContextMenuItem>

        <ContextMenuItem
          className="hover:bg-white/10 focus:bg-white/10"
          onClick={() =>
            window.open(`https://stxtools.io/tokens/${token.contractId.split('::')[0]}`, '_blank')
          }
        >
          <LineChart className="w-4 h-4 mr-2 opacity-50" />
          Price Chart
        </ContextMenuItem>

        {/* <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10">
          <Star className="w-4 h-4 mr-2 opacity-50" />
          Add to Watchlist
        </ContextMenuItem> */}

        <ContextMenuSeparator className="bg-white/10" />

        {/* <ContextMenuItem
          className="text-xs hover:bg-white/10 focus:bg-white/10"
          onClick={() => navigator.clipboard.writeText(token.contractId.split('::')[0])}
        >
          <Copy className="w-4 h-4 mr-2 opacity-50" />
          {token.contractId}
        </ContextMenuItem> */}

        <ContextMenuItem
          className="hover:bg-white/10 focus:bg-white/10"
          onClick={() =>
            window.open(
              `https://explorer.stacks.co/token/${token.contractId.split('::')[0]}`,
              '_blank'
            )
          }
        >
          <ExternalLink className="w-4 h-4 mr-2 opacity-50" />
          View on Explorer
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

const TokenList = () => {
  const [tokenMetadata, setTokenMetadata] = useState({} as any);
  const [isLoading, setIsLoading] = useState(true);
  const { balances } = useWallet();

  const tokens = useMemo(() => {
    const stxToken = {
      balance: balances.stx.balance,
      contractId: '.stx'
    };

    const fungibleTokens = Object.entries(balances.fungible_tokens).map(
      ([contractId, data]: any) => ({
        contractId,
        balance: data.balance
      })
    );

    return [stxToken, ...fungibleTokens].filter(token => Number(token.balance) > 0);
  }, [balances]);

  useEffect(() => {
    const fetchMetadata = async () => {
      setIsLoading(true);
      try {
        for (const token of tokens) {
          const [contract] = token.contractId.split('::');
          if (!tokenMetadata[token.contractId]) {
            try {
              console.log('Fetching metadata for:', contract);
              const metadata = await Dexterity.getTokenInfo(contract);
              if (metadata) {
                setTokenMetadata((current: any) => ({
                  ...current,
                  [token.contractId]: metadata
                }));
              }
            } catch (error) {
              console.error(`Error fetching metadata for ${contract}:`, error);
            }
          }
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
      <div className="flex items-center justify-between px-4">
        <div className="text-sm text-white/60">
          {tokens.length} Token{tokens.length !== 1 ? 's' : ''}
          {isLoading && ' • Loading metadata...'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
        {tokens.map(token => (
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
