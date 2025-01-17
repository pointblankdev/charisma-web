import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { usePersistedState } from './use-persisted-state';
import { getBalances, getLatestBlock } from '@lib/fetchers/user-api';
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';
import { useToast } from '@components/ui/use-toast';
import { userSession } from '@components/stacks-session/connect';
import { Dexterity, Vault } from 'dexterity-sdk';
import { SITE_URL } from '@lib/constants';
import { hexToCV } from '@stacks/transactions';
import _ from 'lodash';

const siteUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : SITE_URL;
const socketUrl = 'https://api.mainnet.hiro.so';
const sc = new StacksApiSocketClient({ url: socketUrl });

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
}

const GlobalContext = createContext<GlobalState | undefined>(undefined);

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stxAddress, setStxAddress] = usePersistedState('address', '');
    const [block, setBlock] = usePersistedState('block', {} as any);
    const [tappedAt, setTappedAt] = usePersistedState('tappedAt', {} as any);
    const [vaultAnalytics, setVaultAnalytics] = usePersistedState('vaultAnalytics', {} as any);
    const [isMempoolSubscribed, setIsMempoolSubscribed] = usePersistedState(
        'isMempoolSubscribed',
        false
    );
    const { toast } = useToast();

    // Wallet balances state
    const [balances, setBalances] = usePersistedState<any>('balances', {
        stx: {},
        fungible_tokens: {},
        non_fungible_tokens: {},
    });

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

    // Fetch balances when stxAddress changes
    useEffect(() => {
        if (stxAddress) {
            getBalances(stxAddress).then(data => {
                setBalances(data);
            }).catch(console.error);
        }
    }, [stxAddress, block]);

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
                });
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
                        const firstHopTokenInput = vaults[0].liquidity[opcodes[0]];
                        const lastHopTokenOutput = vaults[vaults.length - 1].liquidity[Math.abs(opcodes[opcodes.length - 1] - 1)];
                        const amountInput = (Number(firstArg.value) / 10 ** firstHopTokenInput.decimals).toLocaleString(
                            undefined, { maximumFractionDigits: firstHopTokenInput.decimals }
                        );
                        const amountOutput = (Number(lastArg.value) / 10 ** lastHopTokenOutput.decimals).toLocaleString(
                            undefined, { maximumFractionDigits: lastHopTokenOutput.decimals }
                        );

                        const description = (
                            <div className="space-y-3">
                                <div className="overflow-x-auto">
                                    <div className="flex items-center gap-3 whitespace-nowrap w-max m-2">
                                        <div className="flex flex-col items-center min-w-[80px] flex-shrink-0">
                                            <img
                                                src={firstHopTokenInput.image}
                                                alt={firstHopTokenInput.symbol}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <div className="font-light text-sm">
                                                {amountInput} {firstHopTokenInput.symbol}
                                            </div>
                                        </div>
                                        <span className="text-muted-foreground text-xl flex-shrink-0">→</span>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            {vaults.map((vault, index) => (
                                                <React.Fragment key={vault?.contractId || index}>
                                                    <img
                                                        src={vault?.image}
                                                        alt={`Vault ${index + 1}`}
                                                        className="w-12 h-12 rounded-md flex-shrink-0"
                                                    />
                                                    {index < vaults.length - 1 && (
                                                        <span className="text-muted-foreground text-xl flex-shrink-0">→</span>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        <span className="text-muted-foreground text-xl flex-shrink-0">→</span>
                                        <div className="flex flex-col items-center min-w-[80px] flex-shrink-0">
                                            <img
                                                src={lastHopTokenOutput.image}
                                                alt={lastHopTokenOutput.symbol}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">{formatTime(tx.receipt_time_iso)}</p>
                            </div>
                        );

                        toast({
                            title: `Multihop Swap ${firstHopTokenInput.symbol} → ${lastHopTokenOutput.symbol}: ${_.capitalize(tx.tx_status)}`,
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

    useEffect(() => {
        // Add a cleanup flag to prevent race conditions
        let isSubscribed = true;

        // Helper function to process vault analytics
        const processVaultAnalytics = async (block: any) => {
            try {
                const response = await fetch(`${siteUrl}/api/v0/vaults/analytics`);
                const { vaults } = await response.json();

                // Only proceed if we're still subscribed
                if (!isSubscribed) return;

                const vaultAnalytics: any = {};

                for (const [vaultId, analytics] of Object.entries(vaults)) {
                    // Skip if we're no longer subscribed
                    if (!isSubscribed) return;
                    if (!tappedAt[vaultId]?.height || typeof tappedAt[vaultId] === 'number') tapTokens(vaultId)
                    const vault = Dexterity.getVault(vaultId)
                    const totalSupply = Number(vault?.supply || Infinity)
                    vaultAnalytics[vaultId] = analytics;
                    const energyPerBlock = (analytics as any).energyRate * totalSupply;
                    vaultAnalytics[vaultId].engine = {
                        energyPerBlockPerToken: (analytics as any).energyRate,
                        energyPerBlock,
                    };
                }

                // Only update state if we're still subscribed
                if (isSubscribed) {
                    setVaultAnalytics(vaultAnalytics);
                }
            } catch (error) {
                console.error('Error processing vault analytics:', error);
            }
        };

        // Debounce the block subscription handler to prevent rapid updates
        const debouncedProcessVaultAnalytics = _.debounce(processVaultAnalytics, 500);

        sc.subscribeBlocks((block) => {
            // if (isSubscribed) {
            //     debouncedProcessVaultAnalytics(block);
            // }
            setBlock(block as any);
        });

        const getRealTimeData = async () => {
            try {
                // const block = await getLatestBlock();
                if (isSubscribed) {
                    await processVaultAnalytics(block);
                }
            } catch (error) {
                console.error('Error fetching latest block:', error);
            }
        };

        getRealTimeData();

        // Cleanup function
        return () => {
            isSubscribed = false;
            sc.unsubscribeBlocks();
        };
    }, [stxAddress]);

    // function to update record of tapped at
    const tapTokens = (vaultId: string) => {
        setTappedAt((prev: any) => ({ ...prev, [vaultId]: block }));
    };

    return (
        <GlobalContext.Provider
            value={{
                // Wallet state
                balances,
                wallet,
                getKeyByContractAddress,
                getBalanceByKey,
                getBalance,

                // Global state
                stxAddress,
                block,
                setBlock,
                tappedAt,
                tapTokens,
                isMempoolSubscribed,
                setIsMempoolSubscribed,
                vaultAnalytics,
                setVaultAnalytics
            }}
        >
            {children}
        </GlobalContext.Provider>
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