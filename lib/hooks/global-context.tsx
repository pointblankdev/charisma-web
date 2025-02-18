import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';
import { useToast } from '@components/ui/use-toast';
import { userSession } from '@components/stacks-session/connect';
import { Dexterity, Token, Vault } from 'dexterity-sdk';
import { SITE_URL } from '@lib/constants';
import { hexToCV } from '@stacks/transactions';
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar';
import { AppSidebar } from '@components/sidebar/app-sidebar';
import styles from '../../components/layout/layout.module.css';
import { cn } from '@lib/utils';
import _ from 'lodash';
import { usePersistedState } from './use-persisted-state';
import { Balance } from 'blaze-sdk';

const siteUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : SITE_URL;
const socketUrl = 'https://api.mainnet.hiro.so';
const sc = new StacksApiSocketClient({ url: socketUrl });

const STX: Token = {
    name: 'Stacks',
    symbol: 'STX',
    image: '/stx-logo.png',
    contractId: '.stx',
    identifier: '.stx',
    decimals: 6,
    description: 'Native token of the Stacks blockchain'
}

export type Wallet = {
    experience: { balance: number; amount: number };
    charisma: { balance: number; amount: number };
    governance: { balance: number; amount: number };
    energy: { balance: number; amount: number };
    redPilled: boolean;
    bluePilled: boolean;
    ravens: any;
    memobots: any;
};

export type Friend = {
    address: string;
    lastUsed?: number;
};

export interface GlobalState {
    // Wallet-related state
    balances: any;
    wallet: Wallet;
    getKeyByContractAddress: (contractAddress: string) => string;
    getBalanceByKey: (key: string) => number;
    getBalance: (contractAddress: string) => number;

    // Global state
    stxAddress: string;
    block: any;
    setBlock: (block: any) => void;
    tappedAt: any;
    tapTokens: (vaultId: string) => void;
    isMempoolSubscribed: boolean;
    setIsMempoolSubscribed: (isMempoolSubscribed: boolean) => void;
    vaultAnalytics: any;
    setVaultAnalytics: (vaultAnalytics: any) => void;

    // Swap state
    fromToken: any;
    setFromToken: (fromToken: any) => void;
    toToken: any;
    setToToken: (toToken: any) => void;

    // Dexterity state
    maxHops: number;
    setMaxHops: (maxHops: number) => void;
    slippage: number;
    setSlippage: (slippage: number) => void;

    // Kraxel prices
    prices: any;
    setPrices: (prices: any) => void;

    // Blaze state
    blazeBalances: Record<string, Balance>;
    setBlazeBalances: (blazeBalances: Record<string, Balance>) => void;

    // Friends list state
    friends: Friend[];
    addFriend: (address: string) => void;
    removeFriend: (address: string) => void;
    updateFriendLastUsed: (address: string) => void;
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [maxHops, setMaxHops] = usePersistedState('maxHops', 3);
    const [fromToken, setFromToken] = usePersistedState('fromToken', STX);
    const [toToken, setToToken] = usePersistedState('toToken', STX);
    const [slippage, setSlippage] = usePersistedState('slippage', 0.01);
    const [stxAddress, setStxAddress] = usePersistedState('address', '');
    const [block, setBlock] = usePersistedState('block', {} as any);
    const [tappedAt, setTappedAt] = usePersistedState('tappedAt', {} as any);
    const [vaultAnalytics, setVaultAnalytics] = usePersistedState('vaultAnalytics', {} as any);
    const [isMempoolSubscribed, setIsMempoolSubscribed] = usePersistedState('isMempoolSubscribed', false);
    const { toast } = useToast();

    // Wallet balances state
    const [balances] = usePersistedState<any>('balances', {
        stx: {},
        fungible_tokens: {},
        non_fungible_tokens: {},
    });

    // Prices state
    const [prices, setPrices] = usePersistedState<any>('prices', {});

    // Blaze balances state
    const [blazeBalances, setBlazeBalances] = useState<Record<string, Balance>>({});

    // Friends list state
    const [friends, setFriends] = usePersistedState<Friend[]>('blaze-friends', [{ address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', lastUsed: Date.now() }]);

    // Add fetchBlazeBalances function
    const fetchBlazeBalances = useCallback(async () => {
        if (!stxAddress) return;
        try {
            const response = await fetch(`/api/v0/blaze/subnets/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-welsh-v0/balances/${stxAddress}`);
            const data = await response.json();
            setBlazeBalances({ 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-welsh-v0': data });
        } catch (error) {
            console.error('Error fetching blaze balances:', error);
        }
    }, [stxAddress]);

    // Load user data and configure Dexterity
    useEffect(() => {
        if (userSession?.isUserSignedIn()) {
            const userStxAddress = userSession.loadUserData().profile.stxAddress.mainnet;
            setStxAddress(userStxAddress);
            Dexterity.configure({
                stxAddress: userStxAddress,
                mode: 'client',
                proxy: `${siteUrl}/api/v0/proxy`,
            }).catch(console.error);
        }
    }, [userSession, setStxAddress]);

    // Wallet helper functions
    const getKeyByContractAddress = useCallback((contractAddress: string) => {
        if (!contractAddress) return '';
        if (contractAddress.endsWith('.wstx')) return 'STX::native';
        if (contractAddress.endsWith('.stx')) return 'STX::native';
        const tokensArray = Object.keys(balances?.fungible_tokens || {});
        return tokensArray.find((token: string) => token.includes(contractAddress)) || '';
    }, [balances]);

    const getBalanceByKey = useCallback((key: string) => {
        if (key === 'STX::native') {
            return Number(balances?.stx?.balance || 0);
        }
        return Number(balances?.fungible_tokens?.[key]?.balance);
    }, [balances]);

    const getBalance = useCallback((ca: string) =>
        getBalanceByKey(getKeyByContractAddress(ca)) || 0,
        [getBalanceByKey, getKeyByContractAddress]
    );

    // Calculate wallet state
    const wallet = useMemo(() => {
        const experience = getBalanceByKey(
            'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience::experience'
        );
        const energy = getBalanceByKey('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.energy::energy');
        const governance = getBalanceByKey(
            'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma'
        );
        const charisma = getBalanceByKey(
            'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token::charisma'
        );

        return {
            energy: { amount: energy, balance: energy / Math.pow(10, 6) },
            experience: { amount: experience, balance: experience / Math.pow(10, 6) },
            governance: { amount: governance, balance: governance / Math.pow(10, 6) },
            charisma: { amount: charisma, balance: charisma / Math.pow(10, 6) },
            redPilled: balances?.non_fungible_tokens?.['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.red-pill-nft::red-pill']?.count > 0,
            bluePilled: balances?.non_fungible_tokens?.['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blue-pill-nft::blue-pill']?.count > 0,
            ravens: balances?.non_fungible_tokens?.['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.odins-raven::raven'],
            memobots: balances?.non_fungible_tokens?.['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.memobots-guardians-of-the-gigaverse::memobots-guardians-of-the-gigaverse']
        };
    }, [balances, getBalanceByKey]);

    // Mempool subscription effect
    useEffect(() => {
        sc.subscribeMempool((tx: any) => {
            if (
                tx?.contract_call?.function_name === 'execute'
            ) {
                try {
                    console.log('Dexterity Vault Update:', tx);
                    const functionName = tx?.contract_call?.function_name;
                    const shortAddress = `${tx.sender_address.slice(0, 4)}...${tx.sender_address.slice(-4)}`;

                    const description = (
                        <div className="space-y-2">
                            <p className="flex justify-between w-full text-sm">
                                <span>Address: {shortAddress}</span>
                                <span>Action: {functionName.toUpperCase()}</span>
                            </p>
                            <p className="text-xs text-primary-foreground/80">{formatTime(tx.receipt_time_iso)}</p>
                        </div>
                    );

                    Dexterity.getTokenInfo(tx.contract_call.contract_id).then(async metadata => {
                        try {
                            toast({
                                image: metadata.image,
                                title: 'Degen Activity Detected in the Dexterity Vaults',
                                description,
                                duration: 10000
                            });
                        } catch (error) {
                            toast({
                                image: '/charisma.png',
                                title: 'Degen Activity Detected in the Dexterity Vaults',
                                description,
                                duration: 10000
                            });
                        }
                    }).catch(console.error);
                } catch (error) {
                    console.error('Non-Dexterity execute transaction:', error);
                }
            } else if (tx?.contract_call?.contract_id === 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.multihop') {
                try {
                    const args = tx.contract_call.function_args.map((arg: any) => arg.hex);
                    const firstArg = hexToCV(args[0]) as any;
                    const lastArg = hexToCV(args[args.length - 1]) as any;
                    const hops = args.slice(1);
                    const vaults: Vault[] = [];
                    const opcodes: number[] = [];
                    console.log('Multihop Swap:', tx)

                    hops.forEach((hop: string) => {
                        try {
                            const hopValue = hexToCV(hop) as any;
                            const vaultId = hopValue.value.pool.value;
                            const opcode = Number(hopValue.value.opcode.value.value.slice(1, 2));
                            const vault = Dexterity.getVault(vaultId);

                            if (vault?.image) {
                                vaults.push(vault);
                                opcodes.push(opcode);
                            }
                        } catch (error) {
                            console.error('Error processing hop:', error);
                        }
                    })
                    // Only proceed if we have valid vaults
                    if (vaults.length > 0) {
                        const firstHopTokenInput = vaults[0]!.liquidity[opcodes[0]!];
                        const lastHopTokenOutput = vaults[vaults.length - 1]!.liquidity[Math.abs(opcodes[opcodes.length - 1]! - 1)];
                        const amountInput = (Number(firstArg.value) / 10 ** firstHopTokenInput!.decimals).toLocaleString(
                            undefined, { maximumFractionDigits: firstHopTokenInput!.decimals }
                        );
                        const amountOutput = (Number(lastArg.value) / 10 ** lastHopTokenOutput!.decimals).toLocaleString(
                            undefined, { maximumFractionDigits: lastHopTokenOutput!.decimals }
                        );

                        const description = (
                            <div className="space-y-3">
                                <div className="overflow-x-auto">
                                    <div className="flex items-center gap-3 whitespace-nowrap w-max m-2">
                                        <div className="flex flex-col items-center min-w-[80px] flex-shrink-0">
                                            <img
                                                src={firstHopTokenInput!.image}
                                                alt={firstHopTokenInput!.symbol}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <div className="font-light text-xs">
                                                {amountInput} {firstHopTokenInput!.symbol}
                                            </div>
                                        </div>
                                        <span className="text-muted-foreground text-xl flex-shrink-0 px-1.5">→</span>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            {vaults.map((vault, index) => (
                                                <React.Fragment key={vault?.contractId || index}>
                                                    <img
                                                        src={vault?.image}
                                                        alt={`Vault ${index + 1}`}
                                                        className="w-12 h-12 rounded-md flex-shrink-0"
                                                    />
                                                    {index < vaults.length - 1 && (
                                                        <span className="text-muted-foreground text-xl flex-shrink-0 px-1.5">→</span>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        <span className="text-muted-foreground text-xl flex-shrink-0 px-1.5">→</span>
                                        <div className="flex flex-col items-center min-w-[80px] flex-shrink-0">
                                            <img
                                                src={lastHopTokenOutput!.image}
                                                alt={lastHopTokenOutput!.symbol}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">{formatTime(tx.receipt_time_iso)}</p>
                            </div>
                        );

                        toast({
                            title: `Multihop Swap ${firstHopTokenInput!.symbol} → ${lastHopTokenOutput!.symbol}: ${_.capitalize(tx.tx_status)}`,
                            description,
                            duration: 8000
                        });
                    }
                } catch (error) {
                    console.error('Error processing multihop transaction:', error);
                }
            }

        });

        return () => {
            sc.unsubscribeMempool();
        };
    }, [toast]);

    // Set up SSE connection for real-time balance updates
    useEffect(() => {
        if (!stxAddress) return;

        const eventSource = new EventSource('/api/v0/blaze/balance-stream');

        eventSource.onmessage = (event) => {
            try {
                if (event.data === ' heartbeat') return;

                const update = JSON.parse(event.data);
                if (!update || typeof update !== 'object') return;

                setBlazeBalances((prev: Record<string, Balance>) => ({
                    ...prev,
                    [update.contract]: {
                        ...prev[update.contract],
                        total: update.balance,
                        confirmed: update.balance,
                        unconfirmed: 0
                    }
                }));
            } catch (error) {
                console.error('Error processing SSE message:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            eventSource.close();
            // Attempt to reconnect after a delay
            setTimeout(() => {
                fetchBlazeBalances();
            }, 5000);
        };

        // Initial balance fetch
        fetchBlazeBalances();

        return () => {
            eventSource.close();
        };
    }, [stxAddress, fetchBlazeBalances]);

    // Remove the polling interval from getRealTimeData
    // const getRealTimeData = async () => {
    //     try {
    //         await fetchBlazeBalances();
    //     } catch (error) {
    //         console.error('Error fetching latest data:', error);
    //     }
    // };

    // function to update record of tapped at
    const tapTokens = (vaultId: string) => {
        setTappedAt((prev: any) => ({ ...prev, [vaultId]: block }));
    };

    // Friends list functions
    const addFriend = useCallback((address: string) => {
        setFriends((currentFriends: Friend[]) => {
            // Don't add if address already exists
            if (currentFriends.some((f: Friend) => f.address === address)) {
                return currentFriends;
            }
            return [...currentFriends, { address, lastUsed: Date.now() }];
        });
    }, [setFriends]);

    const removeFriend = useCallback((address: string) => {
        setFriends((currentFriends: Friend[]) =>
            currentFriends.filter((f: Friend) => f.address !== address)
        );
    }, [setFriends]);

    const updateFriendLastUsed = useCallback((address: string) => {
        setFriends((currentFriends: Friend[]) =>
            currentFriends.map((f: Friend) =>
                f.address === address
                    ? { ...f, lastUsed: Date.now() }
                    : f
            )
        );
    }, [setFriends]);

    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset />
            <div className={cn('flex flex-col w-full z-10', styles.background)}>
                <GlobalContext.Provider value={{
                    balances,
                    wallet,
                    getKeyByContractAddress,
                    getBalanceByKey,
                    getBalance,
                    stxAddress,
                    block,
                    setBlock,
                    tappedAt,
                    tapTokens,
                    isMempoolSubscribed,
                    setIsMempoolSubscribed,
                    vaultAnalytics,
                    setVaultAnalytics,
                    fromToken,
                    setFromToken,
                    toToken,
                    setToToken,
                    maxHops,
                    setMaxHops,
                    slippage,
                    setSlippage,
                    prices,
                    setPrices,
                    blazeBalances,
                    setBlazeBalances,
                    friends,
                    addFriend,
                    removeFriend,
                    updateFriendLastUsed,
                }}>
                    <div>
                        {children}
                    </div>
                </GlobalContext.Provider>
            </div>
        </SidebarProvider>
    );
};

// Hook to use the global context
export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
};