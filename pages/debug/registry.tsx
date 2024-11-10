import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  RefreshCw,
  Search,
  Timer,
  Shield,
  GitBranch,
  Link2,
  Code,
  ChevronDown,
  ChevronUp,
  Terminal,
  Check,
  AlertCircle,
  Info,
  Logs,
  Scroll
} from 'lucide-react';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { toast } from 'sonner';
import { cn } from '@lib/utils';
import { GetStaticProps } from 'next';
import TokenRegistryClient from '@lib/server/registry/registry.client';
import Image from 'next/image';

const TokenImage = ({ src, alt }: { src?: string; alt: string }) => {
  if (!src) return null;

  // Safely handle image urls
  const imageUrl = src.startsWith('http') ? src : `/api/placeholder/96/96`;

  return (
    <div className="relative overflow-hidden rounded-lg size-10">
      <Image
        src={imageUrl}
        alt={alt}
        width={40}
        height={40}
        className="object-cover"
        onError={e => {
          // Fallback to placeholder on error
          e.currentTarget.src = '/api/placeholder/96/96';
        }}
      />
    </div>
  );
};

const client = new TokenRegistryClient();

interface Props {
  data: {
    tokens: any;
    lastUpdate: string;
  };
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  // Get all prices
  const { tokens } = await client.listAll();

  return {
    props: {
      data: {
        tokens,
        lastUpdate: new Date().toISOString()
      }
    },
    // Revalidate every minute
    revalidate: 60
  };
};

const TokenStatusBadge = ({
  children,
  variant
}: {
  children: React.ReactNode;
  variant: 'mintable' | 'transferable' | 'burnable' | 'lp';
}) => {
  const variants = {
    mintable: 'text-lime-700 dark:text-lime-300',
    transferable: 'text-sky-700 dark:text-sky-300',
    burnable: 'text-amber-700 dark:text-amber-300',
    lp: 'text-violet-700 dark:text-violet-300'
  };

  return (
    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', variants[variant])}>
      {children}
    </span>
  );
};

const TokenCard = ({ token }: { token: any }) => {
  const [expanded, setExpanded] = useState(false);

  // Get the best available image URL
  const imageUrl =
    token.metadata?.image_canonical_uri ||
    token.metadata?.image_uri ||
    token.metadata?.images?.logo ||
    token.metadata?.image;

  // Determine token type for header styling
  const getTokenStyle = () => {
    if (token.lpInfo) return 'text-violet-500 dark:text-violet-400';
    if (token.audit?.fungibleTokens?.[0]?.isMintable) return 'text-lime-500 dark:text-lime-400';
    return 'text-sky-500 dark:text-sky-400';
  };

  return (
    <Card className="overflow-hidden border-none">
      <div className="p-4 rounded-lg bg-gray-800/90">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start min-w-0 gap-3">
            {' '}
            {/* added min-w-0 to allow truncation */}
            {imageUrl ? (
              <TokenImage src={imageUrl} alt={token.metadata?.name || 'Contract'} />
            ) : (
              <div
                className={cn('flex-shrink-0 size-10 rounded-lg flex items-center justify-center')}
              >
                <Scroll className={cn('size-6', getTokenStyle())} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {' '}
              {/* added min-w-0 and flex-1 */}
              <div className="font-semibold truncate">
                {token.metadata?.symbol || token.metadata?.name || 'Unknown Contract'}
              </div>
              <div className="text-sm truncate text-muted-foreground">
                {token.metadata?.description || 'No description'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 p-1.5 rounded-md hover:bg-accent transition-colors ml-2"
          >
            {expanded ? (
              <ChevronUp className="size-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Contract ID */}
        <div className="flex items-center gap-2 group">
          <code className="flex-1 px-2 py-1.5 text-xs rounded-md bg-background/50 font-mono truncate border border-border/50">
            {token.contractId}
          </code>
          <CopyButton text={token.contractId} />
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Terminal className="size-4" />
            <span className="tabular-nums">{token.stats.interactions}</span> interactions
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Timer className="size-4" />
            {new Date(token.stats.lastSeen).toLocaleString()}
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="pt-4 mt-4 space-y-6 border-t border-border/50">
            {/* Large Image Display */}
            {imageUrl && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground/80">Contract Image</div>
                <div className="relative w-32 h-32 mx-auto overflow-hidden rounded-xl bg-background/50">
                  <Image
                    src={imageUrl}
                    alt={token.metadata?.name || 'Contract'}
                    fill
                    className="object-contain"
                    onError={e => {
                      e.currentTarget.src = '/api/placeholder/128/128';
                    }}
                  />
                </div>
                <div className="text-xs text-center break-all text-muted-foreground">
                  {imageUrl}
                </div>
              </div>
            )}

            {/* Metadata */}
            {token.metadata && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground/80">Metadata</div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(token.metadata)
                    .filter(([key]) => !key.includes('image') && key !== 'lastUpdated')
                    .map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="text-muted-foreground">{key}:</span>
                        <div className="mt-0.5 font-mono text-xs truncate">{String(value)}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Audit Status */}
            {token.audit && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                  <Shield className="size-4" />
                  Contract Audit
                </div>
                <div className="space-y-3">
                  {token.audit.fungibleTokens?.map((ft: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 border rounded-lg bg-background/50 border-border/50"
                    >
                      <div className="grid gap-1 mb-2">
                        <div className="text-sm">{ft.name}</div>
                        <div className="text-sm text-muted-foreground">{ft.decimals} decimals</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ft.isMintable && (
                          <TokenStatusBadge variant="mintable">Mintable</TokenStatusBadge>
                        )}
                        {ft.isTransferable && (
                          <TokenStatusBadge variant="transferable">Transferable</TokenStatusBadge>
                        )}
                        {ft.isBurnable && (
                          <TokenStatusBadge variant="burnable">Burnable</TokenStatusBadge>
                        )}
                        {ft.isLpToken && <TokenStatusBadge variant="lp">LP Token</TokenStatusBadge>}
                      </div>
                    </div>
                  ))}
                  {token.audit.arcanaRecommendation && (
                    <div className="p-3 text-sm border rounded-lg text-muted-foreground bg-background/50 border-border/50">
                      {token.audit.arcanaRecommendation.reasoning}
                    </div>
                  )}
                  {!token.audit.fungibleTokens && token.audit && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-3">
                        {Object.entries(token.audit)
                          .filter(([key]) => !key.includes('image') && key !== 'lastUpdated')
                          .map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="text-muted-foreground">{key}:</span>
                              <div className="mt-0.5 font-mono text-xs truncate">
                                {key === 'timestamp'
                                  ? new Date(Number(value)).toString()
                                  : String(value)}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LP Info */}
            {token.lpInfo && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                  <Link2 className="size-4" />
                  LP Token Info
                </div>
                <div className="p-3 space-y-2 border rounded-lg bg-background/50 border-border/50">
                  <div className="text-sm">
                    <span className="text-muted-foreground">DEX:</span> {token.lpInfo.dex}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Pool:</span> {token.lpInfo.poolId}
                  </div>
                  <div className="grid gap-1">
                    <div className="font-mono text-xs truncate">
                      <span className="text-muted-foreground">Token0:</span> {token.lpInfo.token0}
                    </div>
                    <div className="font-mono text-xs truncate">
                      <span className="text-muted-foreground">Token1:</span> {token.lpInfo.token1}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pools */}
            {token.pools?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                  <GitBranch className="size-4" />
                  Pool Relationships
                </div>
                <div className="flex flex-wrap gap-2">
                  {token.pools.map((poolId: string) => (
                    <div
                      key={poolId}
                      className="px-3 py-1 text-sm rounded-full text-violet-700 bg-violet-100 dark:bg-violet-900/20 dark:text-violet-300"
                    >
                      Pool {poolId}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copyToClipboard}
      className="transition-opacity opacity-0 group-hover:opacity-100"
    >
      {copied ? (
        <Check className="text-green-500 size-4" />
      ) : (
        <Code className="text-purple-600 size-4 dark:text-purple-400" />
      )}
    </button>
  );
};

export default function TokenRegistryDebug({
  data: { tokens, lastUpdate }
}: {
  data: { tokens: any[]; lastUpdate: string };
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastUpdateDate = new Date(lastUpdate);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetch('/api/revalidate?path=/debug/tokens');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to refresh token data');
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredTokens = tokens.filter(
    token =>
      token.contractId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.metadata?.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log(filteredTokens);

  return (
    <div className="container p-6 mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contract Registry Debug</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="size-4" />
            Last update: {lastUpdateDate.toLocaleTimeString()}
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Search className="size-4 text-muted-foreground" />
        <Input
          placeholder="Search tokens by symbol, name, or contract..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-xl"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredTokens.map(token => (
          <TokenCard key={token.contractId} token={token} />
        ))}
      </div>
    </div>
  );
}
