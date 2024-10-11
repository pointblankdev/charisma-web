import { GetServerSideProps } from 'next';
import Layout from '@components/layout/layout';
import Page from '@components/page';
import { getPlayerEventData, getPlayerPill, getPlayerTokens } from '@lib/db-providers/kv';
import numeral from 'numeral';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import Image from 'next/image';
import { SkipNavContent } from '@reach/skip-nav';
import charismaSquare from '@public/charisma-logo-square.png';
import dmgLogo from '@public/dmg-logo.png';
import stxLogo from '@public/stx-logo.png';
import welshLogo from '@public/welsh-logo.png';
import rooLogo from '@public/roo-logo.png';
import dogLogo from '@public/sip10/dogLogo.jpg';
import ordiLogo from '@public/ordi-logo.png';
import synStxLogo from '@public/sip10/synthetic-stx/logo.png';
import experienceLogo from '@public/experience.png';
import redPill from '@public/sip9/pills/red-pill-floating.gif';
import bluePill from '@public/sip9/pills/blue-pill-floating.gif';
import { createChart, ColorType, UTCTimestamp, LineStyle, CrosshairMode } from 'lightweight-charts';
import { getNameFromAddress, getTokenBalance } from '@lib/stacks-api';
import PricesService from '@lib/prices-service';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import { InfoIcon } from 'lucide-react';


interface PlayerData {
    stxAddress: string;
    bnsName: string;
    pilled: string;
    experience: number;
    chaTokens: number;
    governanceTokens: number;
    iouWELSH: number;
    iouROO: number;
    synSTX: number;
    burnedGovernanceTokens: number;
    burnedIouWELSH: number;
    burnedIouROO: number;
    burnedSynSTX: number;
    lpTokenBalances: Record<string, number>;
}

interface SwapEvent {
    timestamp: number;
    type: 'swap';
    amountIn: number;
    amountOut: number;
    tokenIn: string;
    tokenOut: string;
    poolId: number;
    poolSymbol: string;
    user: string;
}

interface TokenEvent {
    timestamp: number;
    type: 'transfer' | 'mint' | 'burn' | 'swap';
    token: string;
    amount: number;
    swapDetails?: SwapEvent;
}

interface PlayerProfileProps {
    playerData: PlayerData;
    tokenEvents: TokenEvent[];
    tokenPrices: any;
    lpTokenPrices: any;
    portfolioValue: number;
    governanceValue: number;
}

export const getServerSideProps: GetServerSideProps<PlayerProfileProps> = async (context) => {
    const address = context.params?.address as string;

    const bnsName = await getNameFromAddress(address);

    const governanceTokens = await getPlayerTokens('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token', address);
    const experience = await getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience', address);
    const chaBalance = await getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', address);
    const iouWELSHBalance = await getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh', address);
    const iouROOBalance = await getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo', address);
    const synSTXBalance = await getPlayerTokens('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-stx', address);


    // Fetch LP token balances
    const lpTokenBalances = await Promise.all([
        getTokenBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.welsh-iouwelsh', address),
        getTokenBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.roo-iouroo', address),
        getTokenBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-welsh', address),
        getTokenBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx-cha', address),
        getTokenBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-iouwelsh', address),
        getTokenBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-ordi', address),
        getTokenBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-roo', address),
        getTokenBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.up-dog', address),
    ]);

    const pilled = await getPlayerPill(address);

    const eventData = await getPlayerEventData(address);

    const burnedGovernanceTokens = eventData.burns.reduce((total: number, burn: any) => {
        if (burn.asset_identifier === 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma') {
            return total + parseInt(burn.amount, 10);
        }
        return total;
    }, 0);

    const burnedIouWELSH = eventData.burns.reduce((total: number, burn: any) => {
        if (burn.asset_identifier === 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh::synthetic-welsh') {
            return total + parseInt(burn.amount, 10);
        }
        return total;
    }, 0);

    const burnedIouROO = eventData.burns.reduce((total: number, burn: any) => {
        if (burn.asset_identifier === 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo::synthetic-roo') {
            return total + parseInt(burn.amount, 10);
        }
        return total;
    }, 0);

    const burnedSynSTX = eventData.burns.reduce((total: number, burn: any) => {
        if (burn.asset_identifier === 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-stx::synthetic-stx') {
            return total + parseInt(burn.amount, 10);
        }
        return total;
    }, 0);

    // Fetch token prices using PricesService
    const tokenPrices = await PricesService.getAllTokenPrices();

    // Define pool information (you might want to move this to a separate configuration file)
    const poolsData = [
        {
            id: 1,
            token0: { symbol: 'WELSH', name: 'Welsh', image: '/welsh-logo.png', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', tokenId: 'welshcorgicoin', decimals: 6, price: tokenPrices['WELSH'] },
            token1: { symbol: 'iouWELSH', name: 'Synthetic Welsh', image: '/welsh-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh', tokenId: 'synthetic-welsh', decimals: 6, price: tokenPrices['WELSH'] },
            volume24h: 0,
            price: tokenPrices['WELSH'],
            contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.welsh-iouwelsh',
        },
        {
            id: 2,
            token0: { symbol: '$ROO', name: 'Roo', image: '/roo-logo.png', contractAddress: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo', tokenId: 'kangaroo', decimals: 6, price: tokenPrices['$ROO'] },
            token1: { symbol: 'iouROO', name: 'Synthetic Roo', image: '/roo-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo', tokenId: 'synthetic-roo', decimals: 6, price: tokenPrices['$ROO'] },
            volume24h: 0,
            price: tokenPrices['WELSH'],
            contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.roo-iouroo',
        },
        {
            id: 3,
            token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6, price: tokenPrices['CHA'] },
            token1: { symbol: 'WELSH', name: 'Welsh', image: '/welsh-logo.png', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', tokenId: 'welshcorgicoin', decimals: 6, price: tokenPrices['WELSH'] },
            volume24h: 0,
            contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-welsh',
        },
        {
            id: 4,
            token0: { symbol: 'STX', name: 'Stacks', image: '/stx-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx', decimals: 6, price: tokenPrices['STX'] },
            token1: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6, price: tokenPrices['CHA'] },
            volume24h: 0,
            contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wstx-cha',
        },
        {
            id: 5,
            token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6, price: tokenPrices['CHA'] },
            token1: { symbol: 'iouWELSH', name: 'Synthetic Welsh', image: '/welsh-logo.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh', tokenId: 'synthetic-welsh', decimals: 6, price: tokenPrices['WELSH'] },
            volume24h: 0,
            contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-iouwelsh',
        },
        {
            id: 6,
            token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6, price: tokenPrices['CHA'] },
            token1: { symbol: 'ORDI', name: 'Ordi', image: '/ordi-logo.png', contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.brc20-ordi', tokenId: 'brc20-ordi', decimals: 8, price: tokenPrices['ORDI'] },
            volume24h: 0,
            contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-ordi',
        },
        {
            id: 7,
            token0: { symbol: 'CHA', name: 'Charisma', image: '/charisma-logo-square.png', contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token', tokenId: 'charisma', decimals: 6, price: tokenPrices['CHA'] },
            token1: { symbol: '$ROO', name: 'Roo', image: '/roo-logo.png', contractAddress: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo', tokenId: 'kangaroo', decimals: 6, price: tokenPrices['$ROO'] },
            volume24h: 0,
            contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.cha-roo',
        },
        {
            id: 8,
            token0: { symbol: 'WELSH', name: 'Welsh', image: '/welsh-logo.png', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', tokenId: 'welshcorgicoin', decimals: 6, price: tokenPrices['WELSH'] },
            token1: { symbol: 'DOG', name: 'DOG-GO-TO-THE-MOON', image: '/sip10/dogLogo.webp', contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.runes-dog', tokenId: 'runes-dog', decimals: 8, price: tokenPrices['DOG'] },
            volume24h: 0,
            contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.up-dog',
        },
    ];

    // Calculate LP token prices
    const lpTokenPrices: any = {};
    for (const pool of poolsData) {
        const tokenBalance = await getTokenBalance(pool.contractAddress, address);

        const lpTokenPrice = await PricesService.getLpTokenPrice(
            pool.id,
            pool.token0,
            pool.token1,
            tokenBalance
        );

        lpTokenPrices[`${pool.token0.symbol}-${pool.token1.symbol}`] = lpTokenPrice;
    }

    const playerData: PlayerData = {
        stxAddress: address,
        bnsName: bnsName.names[0] || '',
        pilled,
        experience,
        chaTokens: chaBalance,
        governanceTokens,
        iouWELSH: iouWELSHBalance,
        iouROO: iouROOBalance,
        synSTX: synSTXBalance,
        burnedGovernanceTokens,
        burnedIouWELSH,
        burnedIouROO,
        burnedSynSTX,
        lpTokenBalances: {
            'WELSH-iouWELSH': lpTokenBalances[0],
            'ROO-iouROO': lpTokenBalances[1],
            'CHA-WELSH': lpTokenBalances[2],
            'STX-CHA': lpTokenBalances[3],
            'CHA-iouWELSH': lpTokenBalances[4],
            'CHA-ORDI': lpTokenBalances[5],
            'CHA-ROO': lpTokenBalances[6],
            'WELSH-DOG': lpTokenBalances[7],
        },
    };

    // Combine all token events into a single array
    const tokenEvents: TokenEvent[] = [
        ...eventData.burns.map((burn: any) => ({
            timestamp: burn.timestamp,
            type: 'burn' as const,
            token: burn.asset_identifier.split('::')[1],
            amount: parseInt(burn.amount, 10),
        })),
        // Add transfer and mint events here when available
    ];

    let portfolioValue = 0;
    const governanceValue = playerData.governanceTokens / 10 ** 6 * tokenPrices['CHA'];
    // Calculate TVL for main tokens
    portfolioValue += (playerData.chaTokens / 10 ** 6) * tokenPrices.CHA;
    portfolioValue += (playerData.iouWELSH / 10 ** 6) * tokenPrices.WELSH;
    portfolioValue += (playerData.iouROO / 10 ** 6) * tokenPrices['$ROO'];
    portfolioValue += (playerData.synSTX / 10 ** 6) * tokenPrices.STX;
    // Calculate TVL for LP tokens
    Object.entries(playerData.lpTokenBalances).forEach(([poolName, balance]) => {
        portfolioValue += (balance * (lpTokenPrices[poolName] || 0));
    });


    return {
        props: {
            playerData,
            tokenEvents,
            tokenPrices,
            lpTokenPrices,
            portfolioValue,
            governanceValue
        },
    };
};

export default function PlayerProfile({ playerData, tokenEvents, portfolioValue, governanceValue }: PlayerProfileProps) {
    const [selectedToken, setSelectedToken] = useState('all');

    const filteredEvents = selectedToken === 'all'
        ? tokenEvents
        : tokenEvents.filter(event => event.token === selectedToken);

    const meta = {
        title: `Charisma | Player Profile - ${playerData.bnsName}`,
        description: `Detailed profile and token events for player ${playerData.stxAddress}`,
    };

    return (
        <Page meta={meta} fullViewport>
            <SkipNavContent />
            <Layout>
                <div className="sm:max-w-[2400px] sm:mx-auto sm:pb-10">
                    <HeroSection playerData={playerData} portfolioValue={portfolioValue} governanceValue={governanceValue} />
                    <StatsSection playerData={playerData} />
                    <LPTokensSection lpTokenBalances={playerData.lpTokenBalances} />
                    <BurnedTokensSection playerData={playerData} />
                    <TokenEventsSection
                        playerData={playerData}
                        tokenEvents={filteredEvents}
                        selectedToken={selectedToken}
                        setSelectedToken={setSelectedToken}
                    />
                </div>
            </Layout>
        </Page>
    );
}

const HeroSection = ({ playerData, portfolioValue, governanceValue }: { playerData: PlayerData; portfolioValue: number; governanceValue: number }) => {
    const pillImage = playerData.pilled === 'RED' ? redPill : playerData.pilled === 'BLUE' ? bluePill : '';

    return (
        <div className='flex flex-col items-center overflow-hidden'>
            <Image src={pillImage} alt='Charisma Pilled' width={300} height={300} className='transition-all scale-150 translate-y-24 cursor-pointer sm:hidden' />
            <div className='relative flex w-full pt-24 pb-8 px-8 sm:p-24 sm:pb-0 my-[10vh] bg-[var(--sidebar)] border border-[var(--accents-7)] rounded-lg sm:rounded-lg mt-12'>
                <div className='flex-col items-center hidden w-full space-y-4 sm:w-64 sm:flex'>
                    <Image src={pillImage} alt='Charisma Pilled' width={300} height={300} className='transition-all -translate-x-12 -translate-y-20 cursor-pointer scale-[2]' />
                </div>
                {/* TVL Display */}
                <div className='absolute top-4 right-4 sm:top-8 sm:right-8 text-right'>
                    <div className='text-sm text-secondary/80'>Total Portfolio Value</div>
                    <div className='text-2xl sm:text-4xl font-bold'>${numeral(portfolioValue).format('0,0.00')}</div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className='flex justify-end items-center mt-1 min-w-24'>
                                    <span className='text-sm font-medium text-secondary/80'>${numeral(governanceValue).format('0,0.00')}</span>
                                    <InfoIcon className="w-3 h-3 ml-1 mr-0.5 text-secondary/80" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs text-sm">
                                    This value represents the DMG token balances at their post-wrap valuation using current CHA prices.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className='flex flex-col items-center justify-center w-full px-4 text-lg text-center -translate-y-16 sm:text-md sm:text-start sm:items-start sm:justify-start sm:px-0'>
                    <div className='flex items-baseline justify-center w-full text-center sm:justify-start mt-10 sm:mt-0'>
                        <div className='py-4 text-6xl sm:py-0'>{playerData.bnsName || 'Player Profile'}</div>
                    </div>
                    <div className='mt-4 text-base grow text-secondary/80'>{playerData.stxAddress}</div>
                    <div className='mt-8 text-md text-secondary/80'>
                        View detailed information and token events for this player.
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatsSection = ({ playerData }: { playerData: PlayerData }) => {
    return (
        <div>
            <div className='w-full pt-4 text-3xl font-bold text-center uppercase'>Player Stats</div>
            <div className='w-full pb-8 text-center text-md text-muted/90'>Overview of player's token holdings.</div>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3'>
                <StatCard title="Experience" value={playerData.experience} icon={experienceLogo} />
                <StatCard title="CHA Tokens" value={playerData.chaTokens} icon={charismaSquare} />
                <StatCard title="Governance Tokens" value={playerData.governanceTokens} icon={dmgLogo} />
                <StatCard title="iouWELSH" value={playerData.iouWELSH} icon={welshLogo} />
                <StatCard title="iouROO" value={playerData.iouROO} icon={rooLogo} />
                <StatCard title="synSTX" value={playerData.synSTX} icon={synStxLogo} />
            </div>
        </div>
    );
};

const LPTokensSection = ({ lpTokenBalances }: { lpTokenBalances: Record<string, number> }) => {
    const getTokenIcons = (poolName: string) => {
        const [token1, token2] = poolName.split('-');
        return [
            token1 === 'STX' ? stxLogo :
                token1 === 'CHA' ? charismaSquare :
                    token1 === 'WELSH' ? welshLogo :
                        token1 === 'ROO' ? rooLogo :
                            token1 === 'iouWELSH' ? welshLogo :
                                token1 === 'iouROO' ? rooLogo :
                                    token1 === 'ORDI' ? ordiLogo :
                                        token1 === 'DOG' && dogLogo,
            token2 === 'STX' ? stxLogo :
                token2 === 'CHA' ? charismaSquare :
                    token2 === 'WELSH' ? welshLogo :
                        token2 === 'ROO' ? rooLogo :
                            token2 === 'iouWELSH' ? welshLogo :
                                token2 === 'iouROO' ? rooLogo :
                                    token2 === 'ORDI' ? ordiLogo :
                                        token2 === 'DOG' && dogLogo,
        ];
    };

    return (
        <div className="mt-12">
            <div className='w-full pt-4 text-3xl font-bold text-center uppercase'>LP Tokens</div>
            <div className='w-full pb-8 text-center text-md text-muted/90'>Overview of player's liquidity pool tokens.</div>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
                {Object.entries(lpTokenBalances).map(([poolName, balance]) => (
                    <LpStatCard
                        key={poolName}
                        title={poolName}
                        value={balance}
                        icons={getTokenIcons(poolName) as any}
                    />
                ))}
            </div>
        </div>
    );
};

const BurnedTokensSection = ({ playerData }: { playerData: PlayerData }) => {
    return (
        <div className="mt-12">
            <div className='w-full pt-4 text-3xl font-bold text-center uppercase'>Burned Tokens</div>
            <div className='w-full pb-8 text-center text-md text-muted/90'>Overview of player's burned tokens.</div>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
                <StatCard title="Burned Governance" value={playerData.burnedGovernanceTokens} icon={dmgLogo} />
                <StatCard title="Burned iouWELSH" value={playerData.burnedIouWELSH} icon={welshLogo} />
                <StatCard title="Burned iouROO" value={playerData.burnedIouROO} icon={rooLogo} />
                <StatCard title="Burned synSTX" value={playerData.burnedSynSTX} icon={synStxLogo} />
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon }: { title: string, value: number, icon: any }) => {
    const [useFormat, setUseFormat] = useState(true);

    const toggleFormat = () => {
        setUseFormat(!useFormat);
    };

    const displayValue = useFormat
        ? numeral(value / 10 ** 6).format('0a')
        : numeral(value / 10 ** 6).value()?.toFixed(0)

    return (
        <div
            className='flex flex-col items-center justify-center p-4 space-y-2 rounded-lg text-md bg-[var(--sidebar)] border border-[var(--accents-7)] cursor-pointer'
            onClick={toggleFormat}
        >
            <div className='flex items-center space-x-2'>
                <div className='text-4xl font-semibold'>{displayValue}</div>
                <Image src={icon} alt={title} width={32} height={32} className='inline rounded-full' />
            </div>
            <div className='text-center text-muted/80'>{title}</div>
        </div>
    );
};


const LpStatCard = ({ title, value, icons }: { title: string, value: number, icons: [any, any] }) => {
    const [useFormat, setUseFormat] = useState(true);

    const toggleFormat = () => {
        setUseFormat(!useFormat);
    };

    const displayValue = useFormat
        ? numeral(value / 10 ** 6).format('0a')
        : numeral(value / 10 ** 6).value()?.toFixed(0)

    return (
        <div
            className='flex flex-col items-center justify-center p-4 space-y-2 rounded-lg text-md bg-[var(--sidebar)] border border-[var(--accents-7)] cursor-pointer'
            onClick={toggleFormat}
        >
            <div className='flex items-center space-x-2'>
                <div className='text-4xl font-semibold'>{displayValue}</div>
                <div className="relative w-12 h-8">
                    <Image src={icons[0]} alt={title.split('-')[0]} width={32} height={32} className='absolute left-0 top-0 rounded-full z-10' />
                    <Image src={icons[1]} alt={title.split('-')[1]} width={32} height={32} className='absolute left-6 top-0 rounded-full z-20' />
                </div>
            </div>
            <div className='text-center text-muted/80'>{title}</div>
        </div>
    );
};

const TokenEventsSection = ({
    playerData,
    tokenEvents,
    selectedToken,
    setSelectedToken
}: {
    playerData: PlayerData,
    tokenEvents: TokenEvent[],
    selectedToken: string,
    setSelectedToken: (token: string) => void
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipData, setTooltipData] = useState<{
        time: string;
        amount: string;
        type: string;
        token: string;
    }>({
        time: '',
        amount: '',
        type: '',
        token: '',
    });
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (chartContainerRef.current) {
            const handleResize = () => {
                chart.applyOptions({
                    width: chartContainerRef.current!.clientWidth,
                    height: 400
                });
            };

            const chart = createChart(chartContainerRef.current, {
                width: chartContainerRef.current.clientWidth,
                height: 400,
                layout: {
                    background: { type: ColorType.Solid, color: '#1A1A1A' },
                    textColor: '#DDD',
                },
                grid: {
                    vertLines: { color: '#2B2B2B', style: LineStyle.Dotted },
                    horzLines: { color: '#2B2B2B', style: LineStyle.Dotted },
                },
                crosshair: {
                    mode: CrosshairMode.Normal,
                    vertLine: {
                        labelVisible: false,
                        color: '#c1121f',
                        width: 1,
                        style: LineStyle.Solid,
                    },
                    horzLine: {
                        labelVisible: false,
                        color: '#c1121f',
                        width: 1,
                        style: LineStyle.Solid,
                    },
                },
                timeScale: {
                    timeVisible: true,
                    secondsVisible: false,
                },
            });

            const lineSeries = chart.addLineSeries({
                color: '#c1121f',
                lineWidth: 2,
            });

            const volumeSeries = chart.addHistogramSeries({
                color: '#c1121f',
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: 'volume',
            });

            const filteredEvents = selectedToken === 'all'
                ? tokenEvents
                : tokenEvents.filter(event => event.token === selectedToken);

            // Sort events by timestamp in ascending order
            const sortedEvents = [...filteredEvents].sort((a, b) => a.timestamp - b.timestamp);

            const lineData = sortedEvents.map(event => ({
                time: event.timestamp / 1000 as UTCTimestamp,
                value: event.amount / 10 ** 6,
            }));

            const volumeData = sortedEvents.map(event => ({
                time: event.timestamp / 1000 as UTCTimestamp,
                value: event.amount / 10 ** 6,
                color: event.type === 'burn' ? 'rgba(255, 82, 82, 0.8)' : 'rgba(0, 150, 136, 0.8)',
            }));

            lineSeries.setData(lineData);
            volumeSeries.setData(volumeData);

            chart.timeScale().fitContent();

            chart.subscribeCrosshairMove((param) => {
                if (
                    param.point === undefined ||
                    !param.time ||
                    param.point.x < 0 ||
                    param.point.x > chartContainerRef.current!.clientWidth ||
                    param.point.y < 0 ||
                    param.point.y > 400
                ) {
                    setTooltipVisible(false);
                } else {
                    const event = sortedEvents.find(e => e.timestamp / 1000 === param.time);
                    if (event) {
                        setTooltipData({
                            time: new Date(event.timestamp).toLocaleString(),
                            amount: numeral(event.amount / 10 ** 6).format('0a'),
                            type: event.type,
                            token: event.token,
                        });

                        setTooltipPosition({
                            x: param.point.x,
                            y: param.point.y,
                        });

                        setTooltipVisible(true);
                    }
                }
            });

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                chart.remove();
            };
        }
    }, [tokenEvents, selectedToken]);

    const totalEvents = tokenEvents.length;
    const totalAmount = tokenEvents.reduce((sum, event) => sum + event.amount, 0) / 10 ** 6;
    const burnEvents = tokenEvents.filter(event => event.type === 'burn').length;
    const largestEvent = Math.max(...tokenEvents.map(event => event.amount)) / 10 ** 6;
    const averageAmount = totalAmount / totalEvents;

    return (
        <div className='mt-20 mb-12 max-w-full'>
            <div className='w-full pt-8 text-3xl font-bold text-center uppercase'>Token Events</div>
            <div className='w-full pb-8 text-center text-md text-muted/90'>History of token transfers, mints, and burns.</div>
            <div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>
                <Card className='p-0 bg-[var(--sidebar)] border border-[var(--accents-7)]'>
                    <CardHeader className='p-4'>
                        <CardTitle className="text-xl font-bold">Event Summary</CardTitle>
                    </CardHeader>
                    <CardContent className='p-4 min-w-64'>
                        <div className='space-y-4'>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Events:</span>
                                <span className="text-base">{totalEvents}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Amount:</span>
                                <span className="text-base">{numeral(totalAmount).format('0a')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Burn Events:</span>
                                <span className="text-base">{burnEvents}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Largest Event:</span>
                                <span className="text-base">{numeral(largestEvent).format('0a')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Average Amount:</span>
                                <span className="text-base">{numeral(averageAmount).format('0a')}</span>
                            </div>
                            <div className="pt-4">
                                <div className="text-sm text-muted-foreground">First Event:</div>
                                <div>{tokenEvents.length > 0 ? new Date(tokenEvents[0].timestamp).toLocaleString() : 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Last Event:</div>
                                <div>{tokenEvents.length > 0 ? new Date(tokenEvents[tokenEvents.length - 1].timestamp).toLocaleString() : 'N/A'}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className='bg-[var(--sidebar)] border border-[var(--accents-7)] lg:col-span-3 p-0'>
                    <CardHeader className='p-4'>
                        <CardTitle className="text-xl font-bold">Event Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className='p-4'>
                        <Tabs defaultValue="all" className="mb-6">
                            <TabsList className='contents'>
                                <TabsTrigger value="all" onClick={() => setSelectedToken('all')}>All Tokens</TabsTrigger>
                                <TabsTrigger value="charisma" onClick={() => setSelectedToken('charisma')}>CHA</TabsTrigger>
                                <TabsTrigger value="governance" onClick={() => setSelectedToken('governance')}>Governance</TabsTrigger>
                                <TabsTrigger value="iouWELSH" onClick={() => setSelectedToken('iouWELSH')}>iouWELSH</TabsTrigger>
                                <TabsTrigger value="iouROO" onClick={() => setSelectedToken('iouROO')}>iouROO</TabsTrigger>
                                <TabsTrigger value="synSTX" onClick={() => setSelectedToken('synSTX')}>synSTX</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div ref={chartContainerRef} style={{ position: 'relative' }}>
                            {tooltipVisible && (
                                <div style={{
                                    position: 'absolute',
                                    left: tooltipPosition.x + 15,
                                    top: tooltipPosition.y + 15,
                                    padding: '10px',
                                    borderRadius: '5px',
                                    backgroundColor: '#0e0e10',
                                    border: '1px solid #333',
                                    color: '#ffffffDD',
                                    fontSize: '12px',
                                    zIndex: 1000,
                                    pointerEvents: 'none',
                                }}>
                                    <div className="font-bold">{tooltipData.time}</div>
                                    <div>Amount: {tooltipData.amount} {tooltipData.token}</div>
                                    <div>Event Type: {tooltipData.type}</div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};