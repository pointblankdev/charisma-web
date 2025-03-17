import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';
import { useToast } from '@components/ui/use-toast';
import { Dexterity, Token, Vault } from 'dexterity-sdk';
import { SITE_URL } from '@lib/constants';
import { hexToCV } from '@stacks/transactions';
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar';
import { AppSidebar } from '@components/sidebar/app-sidebar';
import styles from '../../components/layout/layout.module.css';
import { cn } from '@lib/utils';
import _, { add } from 'lodash';
import { usePersistedState } from './use-persisted-state';
import { Balance } from 'blaze-sdk';
import { connect, isConnected } from '@stacks/connect';

// Extend the Balance type to include lastUpdated
interface ExtendedBalance extends Balance {
    lastUpdated: number;
}

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

    // Placeholder for future Blaze balance support
    syncBlazeBalances: () => Promise<void>;

    // On-chain balance related
    fetchOnChainBalances: () => Promise<any>;
    isFetchingBalances: boolean;
    refreshBalances: () => Promise<any>;

    // Global state
    stxAddress: string;
    setStxAddress: (stxAddress: string) => void;
    getActiveWalletAddress: () => Promise<string | null>;
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
    dexteritySignerSource: 'sip30' | 'blaze';
    setDexteritySignerSource: (source: 'sip30' | 'blaze') => void;
    dexterityConfig: any;
    refreshDexterityConfig: () => boolean | undefined;
    configureDexterity: (address: string) => Promise<boolean>;

    // Kraxel prices
    prices: any;
    setPrices: (prices: any) => void;
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
    const [dexteritySignerSource, setDexteritySignerSource] = usePersistedState<'sip30' | 'blaze'>('dexterity-signer', 'sip30');
    const [dexterityConfig, setDexterityConfig] = useState<any>(null);
    const { toast } = useToast();

    // Wallet balances state
    const [balances, setBalances] = usePersistedState<any>('balances', {
        stx: {},
        fungible_tokens: {},
        non_fungible_tokens: {},
    });

    // Note: Not managing Blaze balances directly anymore

    // Prices state
    const [prices, setPrices] = usePersistedState<any>('prices', {});

    // Track client-side rendering to prevent hydration mismatch
    const [isClient, setIsClient] = useState(false);
    // Track when on-chain balances are being fetched
    const [isFetchingBalances, setIsFetchingBalances] = useState(false);

    // Set isClient to true when component mounts (client-side only)
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Get the current active wallet address based on signer source
    const getActiveWalletAddress = useCallback(async () => {
        if (!isClient) return null;

        try {
            if (dexteritySignerSource === 'blaze') {
                // For Blaze/Signet, import and use getSignetStatus
                const { getSignetStatus } = await import('signet-sdk');
                const signetStatus = await getSignetStatus();

                // this is quite hacky, we should add some primitive messages like getSignerAddress
                for (const key in signetStatus) {
                    return signetStatus[key].signer
                }
            }

            // Default to SIP30 address
            return stxAddress;
        } catch (error) {
            console.error('Error getting active wallet address:', error);
            return stxAddress;
        }
    }, [isClient, dexteritySignerSource, stxAddress]);

    // Function to fetch on-chain balances from our API endpoint
    const fetchOnChainBalances = useCallback(async () => {
        // Skip during server-side rendering
        if (!isClient) return;

        try {
            setIsFetchingBalances(true);

            // Get the active wallet address based on current signer source
            const activeAddress = await getActiveWalletAddress();

            if (!activeAddress) {
                console.log('No active wallet address found');
                return;
            }

            console.log(`Fetching balances for active address: ${activeAddress}`);

            // Call our API endpoint to get the balances
            const response = await fetch(`/api/v0/balances/${activeAddress}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch balances: ${response.status}`);
            }

            const balanceData = await response.json();

            // Update balances in state
            setBalances(balanceData);
            console.log('On-chain balances fetched for address', activeAddress, balanceData);

            return balanceData;
        } catch (error) {
            console.error('Error fetching on-chain balances:', error);
        } finally {
            setIsFetchingBalances(false);
        }
    }, [isClient, getActiveWalletAddress, setBalances, setIsFetchingBalances]);

    // Placeholder for future direct Signet balance fetching
    const syncBlazeBalances = useCallback(async () => {
        // This function is temporarily disabled as we're not using Blaze balances directly
        console.log('Note: syncBlazeBalances is disabled - not using Blaze balances directly');
        return;
    }, []);

    // Update stxAddress when the wallet type changes
    useEffect(() => {
        if (!isClient) return;

        const updateActiveAddress = async () => {
            const activeAddress = await getActiveWalletAddress();
            if (activeAddress && activeAddress !== stxAddress) {
                console.log(`Updating active address from ${stxAddress} to ${activeAddress}`);
                setStxAddress(activeAddress as string);
            }
        };

        updateActiveAddress();
    }, [isClient, dexteritySignerSource, getActiveWalletAddress, stxAddress, setStxAddress]);

    // Configure Dexterity in anonymous mode - only on client side
    useEffect(() => {
        // Skip during server-side rendering
        if (!isClient) return;

        // Configure Dexterity in anonymous mode for basic functionality
        const initializeBasicServices = async () => {
            try {
                // Set up Dexterity in anonymous mode
                await Dexterity.configure({
                    mode: 'client',
                    proxy: `${siteUrl}/api/v0/proxy`,
                });
            } catch (error) {
                console.error('Error initializing services:', error);
            }
        };

        initializeBasicServices();

        // Note: No auto-connection to wallets
        // Wallet connections will be handled explicitly in the settings page
    }, [isClient]);

    // Dexterity configuration functions
    const refreshDexterityConfig = useCallback(() => {
        // Only execute on client side
        if (!isClient) return;

        try {
            // Get the current configuration directly from Dexterity
            const currentConfig = Dexterity.config;
            setDexterityConfig({
                ...currentConfig,
                signedBy: dexteritySignerSource
            });

            return true;
        } catch (error) {
            console.error('Failed to refresh Dexterity configuration:', error);
            return false;
        }
    }, [isClient, dexteritySignerSource]);

    // Configure Dexterity with current STX address and signer preferences
    const configureDexterity = useCallback(async (address: string) => {
        // Only execute on client side
        if (!isClient) return false;

        try {
            await Dexterity.configure({
                stxAddress: address,
                mode: 'client',
                proxy: `${siteUrl}/api/v0/proxy`,
                maxHops,
                defaultSlippage: slippage
            });

            // Update the local config state after configuration
            refreshDexterityConfig();

            console.log(`Dexterity configured with address ${address}`);
            return true;
        } catch (error) {
            console.error('Failed to configure Dexterity:', error);
            return false;
        }
    }, [isClient, maxHops, slippage, refreshDexterityConfig]);

    // Wallet helper functions - only execute on client-side
    const getKeyByContractAddress = useCallback((contractAddress: string) => {
        // Return empty string during server-side rendering
        if (!isClient) return '';

        if (!contractAddress) return '';
        if (contractAddress.endsWith('.wstx')) return 'STX::native';
        if (contractAddress.endsWith('.stx')) return 'STX::native';
        const tokensArray = Object.keys(balances?.fungible_tokens || {});
        return tokensArray.find((token: string) => token.includes(contractAddress)) || '';
    }, [balances, isClient]);

    const getBalanceByKey = useCallback((key: string) => {
        // Return zero during server-side rendering
        if (!isClient) return 0;

        if (key === 'STX::native') {
            return Number(balances?.stx?.balance || 0);
        }
        return Number(balances?.fungible_tokens?.[key]?.balance || 0);
    }, [balances, isClient]);

    const getBalance = useCallback((ca: string) => {
        // Return zero during server-side rendering
        if (!isClient) return 0;

        // Always return SIP30 balances for now
        // In the future, we'll implement direct Signet balance querying when dexteritySignerSource is 'blaze'
        return getBalanceByKey(getKeyByContractAddress(ca)) || 0;
    }, [getBalanceByKey, getKeyByContractAddress, isClient]);

    // Calculate wallet state - use default values during server-side rendering
    const wallet = useMemo(() => {
        // Return default values during server-side rendering
        if (!isClient) {
            return {
                energy: { amount: 0, balance: 0 },
                experience: { amount: 0, balance: 0 },
                governance: { amount: 0, balance: 0 },
                charisma: { amount: 0, balance: 0 },
                redPilled: false,
                bluePilled: false,
                ravens: null,
                memobots: null
            };
        }

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
    }, [balances, getBalanceByKey, isClient]);

    // Mempool subscription effect - only run on client-side
    useEffect(() => {
        // Skip mempool subscription during server-side rendering
        if (!isClient) return;

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
    }, [toast, isClient]);


    // function to update record of tapped at
    const tapTokens = (vaultId: string) => {
        setTappedAt((prev: any) => ({ ...prev, [vaultId]: block }));
    };

    // Fetch on-chain balances when address changes
    useEffect(() => {
        if (stxAddress && isClient) {
            // Fetch initial balances
            fetchOnChainBalances();
        }
    }, [stxAddress, isClient, fetchOnChainBalances]);

    // Sync Blaze balances when component mounts or signer changes
    useEffect(() => {
        // Skip during server-side rendering
        if (!isClient) return;

        // Set up periodic refresh every 30 seconds
        const intervalId = setInterval(() => {
            // This will now fetch balances using the current active wallet address
            // regardless of which wallet is selected
            fetchOnChainBalances();
        }, 30000);

        return () => clearInterval(intervalId);
    }, [isClient, fetchOnChainBalances]);

    // Function to refresh balances based on current signer type
    const refreshBalances = useCallback(async () => {
        // For now, only fetch on-chain balances
        // In the future, we'll handle Blaze balances differently
        if (stxAddress) {
            return fetchOnChainBalances();
        }
    }, [fetchOnChainBalances, stxAddress]);

    const contextValue = {
        balances,
        wallet,
        getKeyByContractAddress,
        getBalanceByKey,
        getBalance,
        // Note: Direct Blaze balance support is removed temporarily
        syncBlazeBalances,
        // On-chain balance related
        fetchOnChainBalances,
        isFetchingBalances,
        refreshBalances,
        // Global state
        stxAddress,
        setStxAddress,
        getActiveWalletAddress,
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
        dexteritySignerSource,
        setDexteritySignerSource,
        dexterityConfig,
        refreshDexterityConfig,
        configureDexterity,
        prices,
        setPrices,
    };

    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset />
            <div className={cn('flex flex-col w-full z-10', styles.background)}>
                <GlobalContext.Provider value={{
                    ...contextValue,
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