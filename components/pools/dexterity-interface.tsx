/* eslint-disable @typescript-eslint/restrict-plus-operands */
import {
  ExternalLink,
  Verified,
  MoreHorizontal,
  Plus,
  ArrowLeftRight,
  Minus,
  HelpCircle,
  InfoIcon,
  ArrowUpDown,
  ZapIcon,
  ShieldHalf,
  Lock,
  Gift,
  CogIcon,
  Waves,
  BatteryCharging,
  HandCoins,
  HeartHandshake,
  HandHeart,
  Activity,
  AudioLines,
  AudioWaveform,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@components/ui/dropdown-menu';
import { Button } from '@components/ui/button';
import { useRouter } from 'next/router';
import { AddLiquidityModal } from './modals/add-liquidity-modal';
import { RemoveLiquidityModal } from './modals/remove-liquidity-modal';
import numeral from 'numeral';
import { cn } from '@lib/utils';
import { Dexterity } from 'dexterity-sdk';
import { Vault } from 'dexterity-sdk/dist/core/vault';
import { Opcode } from 'dexterity-sdk/dist/core/opcode';
import { PostConditionMode } from '@stacks/transactions';
import { useGlobal } from '@lib/hooks/global-context';
import { toast } from '@components/ui/use-toast';
import { QuickAddLiquidityModal } from './modals/quick-add-liquidity-modal';

const VERIFIED_ADDRESSES: Record<string, string> = {
  SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS: 'rozar.btc',
  SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS: 'mooningshark.btc',
  SPGYCP878RYFVT03ZT8TWGPKNYTSQB1578VVXHGE: 'kraqen.btc',
  SP3T1M18J3VX038KSYPP5G450WVWWG9F9G6GAZA4Q: 'vinzomniac.btc'
};

const AddressDisplay = ({ address }: { address: string }) => {
  const displayText =
    VERIFIED_ADDRESSES[address] || `${address.slice(0, 6)}...${address.slice(-4)}`;
  const isVerified = address in VERIFIED_ADDRESSES;

  return (
    <div className="flex items-center space-x-2">
      <div>{displayText}</div>
      {isVerified && <Verified className="mt-1 mb-1 text-blue-500 size-5" />}
    </div>
  );
};

const TokenPairDisplay = ({ liquidity }: { liquidity: any[] }) => {
  const [img0Error, setImg0Error] = useState(false);
  const [img1Error, setImg1Error] = useState(false);

  const handleImg0Error = () => {
    setImg0Error(true);
  };

  const handleImg1Error = () => {
    setImg1Error(true);
  };

  return (
    <div className="flex flex-col items-center justify-start">
      <div className="flex items-center -space-x-2">
        <div
          className={cn(
            'z-10 rounded-full border-background bg-card border-2',
          )}
        >
          <Image
            src={img0Error ? '/charisma.png' : liquidity[0].image}
            alt={liquidity[0].symbol}
            width={24}
            height={24}
            className={cn(`rounded-full`, img0Error ? 'blur-sm' : '')}
            onError={handleImg0Error}
          />
        </div>
        <div
          className={cn(
            'rounded-full border-background bg-card border-2',
          )}
        >
          <Image
            src={img1Error ? '/charisma.png' : liquidity[1].image}
            alt={liquidity[1].symbol}
            width={24}
            height={24}
            className={cn(`rounded-full`, img1Error ? 'blur-sm' : '')}
            onError={handleImg1Error}
          />
        </div>
      </div>
      <span className="whitespace-nowrap">
        {liquidity[0].symbol}-{liquidity[1].symbol}
      </span>
    </div>
  );
};

const calculateTVL = (pool: any, prices: Record<string, number>) => {
  const token0Value =
    (pool.liquidity[0].reserves / 10 ** pool.liquidity[0].decimals) *
    (prices[pool.liquidity[0].contractId] || 0);
  const token1Value =
    (pool.liquidity[1].reserves / 10 ** pool.liquidity[1].decimals) *
    (prices[pool.liquidity[1].contractId] || 0);
  return token0Value + token1Value;
};

const APYDisplay = ({ pool, prices }: { pool: any; prices: Record<string, number> }) => {
  const { vaultAnalytics, tapTokens, tappedAt, block, wallet, getBalance } = useGlobal();
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const vault = vaultAnalytics[pool.contractId];
  const tvl = calculateTVL(pool, prices);

  const handleAddLiquidityClick = async (pool: any, amount: number) => {
    const amountIn = Math.floor(amount);
    const vault = await Vault.build(pool.contractId);

    await vault.executeTransaction(
      Opcode.addLiquidity(),
      amountIn,
      {}
    );
  };

  const handleClaim = async () => {
    if (!pool.engineContractId) return;

    try {
      const { openContractCall } = await import('@stacks/connect');
      await openContractCall({
        contractAddress: pool.engineContractId.split('.')[0],
        contractName: pool.engineContractId.split('.')[1],
        functionName: 'tap',
        functionArgs: [],
        network: Dexterity.config.network,
        postConditionMode: PostConditionMode.Deny,
        onFinish: () => {
          tapTokens(pool.contractId);
        }
      });
    } catch (error) {
      console.error('Error claiming rewards:', error);
    }
  };

  // If it's an external pool, show a simple message
  if (pool.externalPoolId) {
    return (
      <div className="mt-1 leading-snug">
        <div className="flex flex-col items-center">
          <div className="text-sm text-muted-foreground">
            External Pool
          </div>
        </div>
      </div>
    );
  }

  // If it's a dexterity vault, show a loading message
  if (!vault) {
    return (
      <div className="mt-1 leading-snug">
        <div className="flex flex-col items-center">
          <div className="text-sm text-muted-foreground animate-pulse">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!vault.generalInfo) {
    return (
      <div className="mt-1 leading-snug">
        <div className="flex flex-col items-center">
          <div className="text-sm text-muted-foreground/40">
            No analytics
          </div>
        </div>
      </div>
    );
  }


  const lastTap = tappedAt[pool.contractId]
  const blocksSinceLastTap = block.height - lastTap.height
  const energyPerDay = vault.engine.energyPerBlock * 17280 / 10 ** 6
  const energyCapacity = 100 + (Number(wallet?.memobots?.count || 0) * 10)
  const lpTokenAmount = getBalance(`${pool.contractId}::${pool.identifier}`)
  const claimableTokens = vault.engine.energyPerBlockPerToken * blocksSinceLastTap * lpTokenAmount / 10 ** 6
  const fractionOfTotal = lpTokenAmount / pool.supply

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="w-full">
          <div className="mt-1 leading-snug">
            <div className="flex flex-col items-center">
              <div className="text-lg font-medium whitespace-nowrap">
                {(vault.generalInfo.lpRebateAPY).toFixed(2)}% APY
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground whitespace-nowrap ">
                <span className={cn(pool.engineContractId ? 'flex items-center text-yellow-400 animate-pulse-glow' : 'text-muted-foreground')}>
                  <span>{pool.engineContractId ? <span className="ml-auto font-semibold text-yellow-400">+{(vault.engine.energyPerBlockPerToken * 10 ** 6).toFixed(0)} <AudioWaveform className="w-3 h-3 mb-1 inline-block" /></span> : 'Trading Fee Yield'}</span>
                </span>
              </div>
            </div>
          </div>
          <QuickAddLiquidityModal
            pool={pool}
            tokenPrices={prices}
            onAddLiquidity={handleAddLiquidityClick}
            isOpen={showQuickAddModal}
            onClose={() => setShowQuickAddModal(false)}
          />
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-[800px] shadow-lg rounded-lg bg-accent-foreground/20 transition-all duration-300 backdrop-blur-2xl">
          <div className="p-1 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-medium text-lg">Yield Sources</div>
              <div className="text-sm text-muted-foreground">
                This vault generates
                ${numeral(
                  // Daily trading fees
                  (vault.summary.last24h.reduce((acc: number, curr: any) => acc + curr.volume, 0) *
                    vault.generalInfo.averageFeePercentage / 100) +
                  // Daily energy rewards in USD (energyPerDay * total supply * HOOT price)
                  (vault.engine.energyPerBlockPerToken * 17280 * (pool.supply / 10 ** pool.decimals) *
                    prices['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-the-owl'])
                ).format('0,0.00')}/day for its liquidity providers
              </div>
            </div>

            <div className="space-x-4 flex w-full">
              {/* Trading Fee Rewards Section */}
              <div className="space-y-2 rounded-lg bg-accent-foreground/70 p-3 w-full">
                <div className="font-medium text-primary-foreground/90 flex items-center text-base">
                  <ArrowLeftRight className="w-4 h-4 mr-2 text-primary" />
                  Trading Fee Rewards
                  <span className="ml-auto">{vault.generalInfo.lpRebateAPY.toFixed(2)}% APY</span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">LP Rebate</span>
                    <span>{vault.generalInfo.averageFeePercentage.toFixed(2)}%</span>
                  </div>

                  {/* 24h Volume Section */}
                  <div className="space-y-1">
                    <div className="text-muted-foreground">24h Volume</div>
                    <div className="ml-2 space-y-0.5">
                      {vault.summary.last24h.map((tokenData: any, index: number) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span>{pool.liquidity[index].symbol}</span>
                          <span>${numeral(tokenData.volume).format('0,0.00')}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-xs font-medium pt-0.5 border-t border-gray-700/50">
                        <span>Total</span>
                        <span>
                          ${numeral(vault.summary.last24h.reduce((acc: number, curr: any) => acc + curr.volume, 0)).format('0,0.00')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 30-day Fees Section */}
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Overall Fees Earned</div>
                    <div className="ml-2 space-y-0.5">
                      {vault.summary.overall.map((tokenData: any, index: number) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span>{pool.liquidity[index].symbol}</span>
                          <div className="space-x-2">
                            <span>{numeral(tokenData.tokenFee).format('0,0.00')} {pool.liquidity[index].symbol}</span>
                            <span className="text-muted-foreground">
                              ${numeral(tokenData.tokenFeeValue).format('0,0.00')}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between text-xs font-medium pt-0.5 border-t border-gray-700/50">
                        <span>Total Value</span>
                        <span>
                          ${numeral(vault.summary.overall.reduce((acc: number, curr: any) => acc + curr.tokenFeeValue, 0)).format('0,0.00')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Trading fees are automatically reinvested into your position
                </div>
              </div>

              {/* Show either active rewards or placeholder explanation */}
              {pool.engineContractId ? (
                <div className="space-y-4 rounded-lg bg-yellow-400/20 p-4 w-full">
                  {/* Header */}
                  <div className="font-medium text-primary-foreground/90 flex items-center text-base">
                    <HandCoins className="w-4 h-4 mr-2 text-yellow-400" />
                    Hold-to-Earn
                    <span className="ml-auto font-semibold">+{(vault.engine.energyPerBlockPerToken * 10 ** 6).toFixed(0)} <AudioWaveform className="w-4 h-4 mb-1 text-yellow-400 inline-block animate-pulse-glow" /></span>
                  </div>

                  {/* Description */}
                  <div className="text-sm text-primary-foreground/70 leading-tight">
                    Hold-to-earn is Charisma's way to reward long-term holders like you, without the need to give up custody of your tokens. Just hold LP tokens and earn rewards.
                    <div className='pt-2' />
                    When participating in hold-to-earn, you will be rewarded in the <ZapIcon className="w-3 h-3 mb-0.5 text-yellow-400 inline-block" /> Energy token. Energy is soulbound, and cannot be transferred, but you can burn it to receive tokens like HOOT or other rewards.
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded-md bg-black/20">
                      <span className="text-sm text-muted-foreground">Daily Emissions</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <ZapIcon className="w-3 h-3 mr-1 text-yellow-400" />
                          <span>{numeral(energyPerDay).format('0,0')}/day</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ≈ ${numeral(energyPerDay * prices['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-the-owl']).format('0,0.00')}/day
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-md bg-black/20">
                      <span className="text-sm text-muted-foreground">Your Yield Rate</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <ZapIcon className="w-3 h-3 mr-1 text-yellow-400" />
                          <span>{numeral(energyPerDay * fractionOfTotal).format('0,0')}/day</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ≈ ${numeral(energyPerDay * fractionOfTotal * prices['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-the-owl']).format('0,0.00')}/day
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Warning message when needed */}
                  {wallet.energy.balance + claimableTokens >= energyCapacity && Math.max(0, energyCapacity - wallet.energy.balance) <= 0 ?
                    (<div className="text-xs text-red-400 bg-red-400/20 p-2 rounded-md flex items-center leading-snug">
                      <InfoIcon className="h-4 mr-2 w-12" />
                      You are at maximum energy storage capacity. You're currently holding {wallet.energy.balance.toFixed(0)} energy. If you try to claim more than your capacity, the excess is burned and lost.
                    </div>
                    ) : (
                      <div className="text-xs text-orange-400 bg-orange-400/20 p-2 rounded-md flex items-center leading-snug">
                        <InfoIcon className="h-4 mr-2 w-12 text-orange-400" />
                        Warning: Claiming will exceed your maximum storage capacity. You can hold up to {energyCapacity} energy, so make sure to spend some of your tokens before trying to claim more.
                      </div>
                    )}

                  {/* Footer with claim section */}
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10">
                    {lpTokenAmount > 0 ? (
                      <>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Available to Claim</span>
                          <div className="flex items-center space-x-2">
                            <div
                              key={blocksSinceLastTap}
                              className={cn("flex items-center", "shake")}
                            >
                              <ZapIcon className="w-3 h-3 mr-1 text-yellow-400" />
                              <span className="font-medium">
                                {numeral(claimableTokens).format('0,0.00')}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              ≈ ${numeral(claimableTokens * prices['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-the-owl']).format('0,0.00')}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 px-3",
                            claimableTokens >= energyCapacity && "animate-pulse bg-red-500/20"
                          )}
                          onClick={handleClaim}
                          disabled={claimableTokens <= 0 || Math.max(0, energyCapacity - wallet.energy.balance) <= 0}
                        >
                          Claim Energy
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col">
                          <span className="text-xs text-primary-foreground/70">Estimated Weekly Yield on $100</span>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              <ZapIcon className="w-3 h-3 mr-1 text-yellow-400" />
                              <span className="font-medium">
                                {numeral((energyPerDay * 7) * (100 / tvl)).format('0,0.00')}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              ≈ ${numeral((energyPerDay * 7) * (100 / tvl) * prices['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hooter-the-owl']).format('0,0.00')}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3"
                          onClick={() => setShowQuickAddModal(true)}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add $100
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 rounded-lg bg-muted/20 p-3 w-full">
                  <div className="font-medium text-muted-foreground flex items-center text-base">
                    <ZapIcon className="w-4 h-4 mr-2" />
                    Energy Rewards
                    <span className="ml-auto">Inactive</span>
                  </div>
                  <div className="space-y-4 text-sm text-primary-foreground/90">
                    <p className="leading-snug">
                      Energy rewards are additional yield incentives that can be enabled for liquidity vaults. When active, liquidity providers earn extra rewards in the form of energy tokens.
                    </p>
                    <p className="leading-snug">
                      This vault currently does not have energy rewards enabled. Check other vaults for earning opportunities.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              APY calculations are based on historical data and may vary. Past performance does not guarantee future returns.
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const PoolRow = ({ pool, prices }: { pool: any; prices: Record<string, number> }) => {
  const [poolImgError, setPoolImgError] = useState(false);
  const deployerAddress = pool.contractId.split('.')[0];

  return (
    <tr className="border-t border-gray-700/50">
      <td className="flex px-4 py-4 text-white items-center">
        <Image
          src={poolImgError ? '/charisma.png' : pool.image}
          alt={pool.name}
          width={44}
          height={44}
          className="object-cover mt-0.5 mr-3 rounded-md h-32 sm:h-24 lg:h-16 xl:h-12"
          onError={() => setPoolImgError(true)}
        />
        <div>
          <div className="flex items-center space-x-1 leading-snug">
            <div className=''>
              <div className="text-lg md:block leading-snug">{pool.name}</div>
              <div className="text-lg lg:hidden block leading-snug text-gray-400 lg:text-white">
                {pool.symbol}
              </div>
            </div>
            <Link
              href={`https://explorer.stxer.xyz/txid/${pool.contractId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 hidden lg:block"
            >
              <ExternalLink size={14} />
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-400 hidden lg:block leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-64" title={pool.description}>
              {pool.description}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-white">
        <APYDisplay pool={pool} prices={prices} />
      </td>
      <td className="px-4 py-4 text-white">
        <TokenPairDisplay liquidity={pool.liquidity} />
      </td>
      <td className="px-4 py-4 text-white">
        <TVLDisplay pool={pool} prices={prices} />
      </td>
      <td className="px-4 py-4 space-x-2 text-lg leading-snug text-white">
        <AddressDisplay address={deployerAddress} />
      </td>
      <td className="px-4 py-4 text-right">
        <ActionMenu pool={pool} prices={prices} />
      </td>
    </tr>
  );
};

const TVLDisplay = ({ pool, prices }: { pool: any; prices: Record<string, number> }) => {
  const tvl = useMemo(() => {
    const token0Value =
      (pool.liquidity[0].reserves / 10 ** pool.liquidity[0].decimals) *
      (prices[pool.liquidity[0].contractId] || 0);
    const token1Value =
      (pool.liquidity[1].reserves / 10 ** pool.liquidity[1].decimals) *
      (prices[pool.liquidity[1].contractId] || 0);
    return token0Value + token1Value;
  }, [pool, prices]);

  const hasPriceData = prices[pool.liquidity[0].contractId] || prices[pool.liquidity[1].contractId];

  return (
    <div className="space-y-1">
      <div className="text-lg font-medium">
        {hasPriceData ? (
          `$${numeral(tvl).format('0,0.00')}`
        ) : (
          <span className="text-muted-foreground/40 text-sm">No price data</span>
        )}
      </div>
      <div className="text-xs text-gray-400">
        {numeral(pool.liquidity[0].reserves / 10 ** pool.liquidity[0].decimals).format('0,0.00')}{' '}
        {pool.liquidity[0].symbol}
        {' + '}
        {numeral(pool.liquidity[1].reserves / 10 ** pool.liquidity[1].decimals).format(
          '0,0.00'
        )}{' '}
        {pool.liquidity[1].symbol}
      </div>
    </div>
  );
};

const ActionMenu = ({ pool, prices }: { pool: any; prices: Record<string, number> }) => {
  const router = useRouter();

  // If pool has externalPoolId, don't show any actions
  if (pool.externalPoolId) {
    return null;
  }

  const handleRemoveLiquidityClick = async (pool: any, amount: number) => {
    const amountIn = Math.floor(amount);
    const vault = await Vault.build(pool.contractId)
    await vault.executeTransaction(
      Opcode.removeLiquidity(),
      amountIn,
      {}
    )
  };

  const handleAddLiquidityClick = async (pool: any, amount: number) => {
    const amountIn = Math.floor(amount);
    const vault = await Vault.build(pool.contractId)

    await vault.executeTransaction(
      Opcode.addLiquidity(),
      amountIn,
      {}
    )
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <AddLiquidityModal
          pool={pool}
          tokenPrices={prices}
          onAddLiquidity={handleAddLiquidityClick}
          trigger={
            <DropdownMenuItem onSelect={e => e.preventDefault()} className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Start Earning (Deposit)
            </DropdownMenuItem>
          }
        />
        <RemoveLiquidityModal
          pool={pool}
          tokenPrices={prices}
          onRemoveLiquidity={handleRemoveLiquidityClick}
          trigger={
            <DropdownMenuItem onSelect={e => e.preventDefault()} className="cursor-pointer">
              <Minus className="w-4 h-4 mr-2" />
              Stop Earning (Withdraw)
            </DropdownMenuItem>
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/swap`)} className="cursor-pointer">
          <ArrowLeftRight className="w-4 h-4 mr-2" /> Swap Tokens
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const DexterityInterface = ({ data }: any) => {
  const [sortField, setSortField] = useState('tvl');
  const [sortOrder, setSortOrder] = useState('desc');
  const [mounted, setMounted] = useState(false);
  const { vaultAnalytics } = useGlobal();
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);

  useEffect(() => {
    Dexterity.configure({ maxHops: 4 }).catch(console.error);
    const vaults = data.vaults.map((v: any) => new Vault(v));
    Dexterity.router.loadVaults(vaults);
    console.log('Router initialized:', Dexterity.router.getGraphStats());
  }, [data.vaults]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to descending when changing fields
    }
  };

  let totalTVL = 0;
  for (const vault of data.vaults) {
    const vaultTVL = calculateTVL(vault, data.prices);
    if (vaultTVL) {
      totalTVL += vaultTVL;
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  const sortedPools = useMemo(() => {
    return [...data.vaults].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'tvl':
          comparison = calculateTVL(b, data.prices) - calculateTVL(a, data.prices);
          break;
        case 'apy':
          const aAPY = vaultAnalytics[a.contractId]?.generalInfo?.lpRebateAPY || 0;
          const bAPY = vaultAnalytics[b.contractId]?.generalInfo?.lpRebateAPY || 0;
          comparison = bAPY - aAPY;
          break;
        default:
          comparison = calculateTVL(b, data.prices) - calculateTVL(a, data.prices);
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });
  }, [data.vaults, sortField, sortOrder, vaultAnalytics]);

  return (
    <div className="sm:mx-auto sm:px-4">
      <div className="mt-6">
        <div className="relative sm:px-6 pb-4 pt-5 sm:rounded-lg bg-[var(--sidebar)] border border-[var(--accents-7)] overflow-hidden">
          <div className="px-4 mb-4 sm:px-0">
            <div className="flex items-baseline justify-between">
              <div>
                <div className='flex items-center space-x-1.5'>
                  <h1 className="text-2xl font-bold text-white/95">
                    Liquidity Vaults
                  </h1>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="https://github.com/stacksgov/sips/pull/204"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 mt-2"
                        >
                          <InfoIcon className="w-4 h-4 text-gray-400/80 hover:text-gray-200" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="max-w-lg p-4 text-white bg-gray-800 border-none rounded-lg shadow-lg translate-y-24"
                      >
                        <div className="space-y-4 leading-snug">
                          <div className="flex items-center space-x-2">
                            <Lock className="w-5 h-5 text-blue-400" />
                            <p className="text-lg font-semibold">Liquidity Vaults</p>
                          </div>
                          <p className="text-white/80">
                            Liquidity vaults are smart contracts that manage token pairs for
                            trading. They are secure, decentralized, and simple enough that anyone
                            can create one.
                          </p>
                          <div className="flex items-center space-x-2">
                            <ShieldHalf className="w-5 h-5 text-green-400" />
                            <p className="font-semibold">Secure and Decentralized</p>
                          </div>
                          <p className="text-white/80">
                            Each vault is independent, so issues in one vault don't affect others.
                            There are no shared admin keys or upgrade mechanisms.
                          </p>
                          <div className="flex items-center space-x-2">
                            <ZapIcon className="w-5 h-5 text-yellow-400" />
                            <p className="font-semibold">Key Benefits</p>
                          </div>
                          <ul className="space-y-2 list-disc list-inside text-white/80">
                            <li>
                              <span className="font-semibold text-white/90">
                                Anyone Can Create:
                              </span>{' '}
                              Deploy your own vault using the standard interface.
                            </li>
                            <li>
                              <span className="font-semibold text-white/90">Efficient:</span>{' '}
                              Standardized controls with customizable settings and flexible fees.
                            </li>
                            <li>
                              <span className="font-semibold text-white/90">Open-Source:</span>{' '}
                              Easily link pools together and add new types.
                            </li>
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  Liquidity vaults are a more secure and decentralized form of liquidity pools.

                </div>
              </div >
              <div className="text-right">
                <div className="text-2xl font-bold text-white/95">
                  ${numeral(totalTVL).format('0,0.00')}
                </div>
                <div className="text-sm text-muted-foreground">Total Value Locked</div>
              </div>
            </div >
          </div >

          <div className="px-4 overflow-x-auto sm:px-0">
            <table className="w-full table-auto">
              <thead>
                {mounted ? (
                  <tr className="text-left text-gray-400">
                    <th className="px-4 py-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex items-center">
                            Vault <HelpCircle className="ml-1 size-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-64">
                              The liquidity vault name, description, and identity. Each vault is a
                              unique smart contract that manages a specific token pair.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </th>
                    <th className="px-4 py-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSort('apy')}
                              className={`flex self-center items-center space-x-1 ${sortField === 'apy' ? 'text-white' : ''
                                }`}
                            >
                              Yield <ArrowUpDown className="ml-1 size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-64">
                              Estimated annual percentage yield for liquidity providers. Click to
                              sort.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </th>
                    <th className="px-4 py-2 text-center items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex items-center justify-center">
                            Pair <HelpCircle className="ml-1 size-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-64">
                              The two tokens that can be exchanged in this vault. You can provide
                              liquidity for this token pair to earn fees from trades.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </th>
                    <th className="px-4 py-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSort('tvl')}
                              className={`flex items-center space-x-1 ${sortField === 'tvl' ? 'text-white' : ''
                                }`}
                            >
                              Liquidity <ArrowUpDown className="ml-1 size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-64">
                              The total value locked (TVL) in this vault. Click to sort.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </th>
                    <th className="px-4 py-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex items-center">
                            Deployer <HelpCircle className="ml-1 size-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-64">
                              The address that deployed this vault contract. Verified deployers are
                              marked with a blue checkmark.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </th>
                    <th className="px-4 py-2 text-right"></th>
                  </tr>
                ) : (
                  <tr className="text-left text-gray-400">
                    <th className="px-4 py-2">Vault</th>
                    <th className="px-4 py-2">Yield</th>
                    <th className="px-4 py-2 text-center">Pair</th>
                    <th className="px-4 py-2">Liquidity</th>
                    <th className="px-4 py-2">Deployer</th>
                    <th className="px-4 py-2 text-right"></th>
                  </tr>
                )}
              </thead>
              <tbody>
                {sortedPools.map((pool: any, index: number) => (
                  <PoolRow key={index} pool={pool} prices={data.prices} />
                ))}
              </tbody>
            </table>
          </div>
        </div >
      </div >
    </div >
  );
};

export default DexterityInterface;
