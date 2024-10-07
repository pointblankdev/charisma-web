import React, { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react';
import { usePersistedState } from './use-persisted-state';
import { getClaimableAmount, getLandAmount, getLastLandId, getStoredEnergy } from '@lib/stacks-api';
import { getLandDataById, getLatestBlock } from '@lib/user-api';
import { StacksApiSocketClient, TransactionEventsResponse } from '@stacks/blockchain-api-client';
import { useAccount } from '@micro-stacks/react';
import { useToast } from '@components/ui/use-toast';
import { CharismaToken } from '@lib/cha-token-api';
import { set } from 'lodash';

const socketUrl = "https://api.mainnet.hiro.so";
const sc = new StacksApiSocketClient({ url: socketUrl });

interface GlobalState {
    lands: any;
    setLands: (lands: any) => void;
    block: any;
    setBlock: (block: any) => void;
    tapped: any;
    setTapped: (block: any) => void;
    tappedAt: any;
    setTappedAt: (block: any) => void;
    token: any;
    setToken: (token: any) => void;
    storedEnergy: number;
    setStoredEnergy: (amount: number) => void;
    updateTokenEnergy: (landId: string, energy: number) => void
    charismaTokenStats: any
    charismaClaims: any
    isMempoolSubscribed: boolean
    setIsMempoolSubscribed: (isMempoolSubscribed: boolean) => void
    highestBid: number
}

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { stxAddress } = useAccount()
    const [lands, setLands] = usePersistedState('lands', {});
    const [block, setBlock] = usePersistedState('block', {});
    const [tapped, setTapped] = usePersistedState('tapped', {});
    const [tappedAt, setTappedAt] = usePersistedState('tappedAt', {});
    const [token, setToken] = usePersistedState('token', {})
    const [storedEnergy, setStoredEnergy] = usePersistedState('storedEnergy', 0);
    const [isMempoolSubscribed, setIsMempoolSubscribed] = usePersistedState('isMempoolSubscribed', false);
    const [highestBid, setHighestBid] = usePersistedState('highestBid', 0);
    const [charismaTokenStats, setCharismaTokenStats] = usePersistedState('charismaTokenStats', {})
    const [charismaClaims, setCharismaClaims] = usePersistedState('charismaClaims', { hasFreeClaim: false, hasClaimed: false } as any)

    const { toast } = useToast()

    interface LandData {
        amount: number;
        energy: number;
        metadata: any;
    }

    interface LandState {
        [key: string]: LandData;
    }

    // Function to update energy of a specific token in the lands state
    const updateTokenEnergy = (landId: string, energy: number) => {
        setLands((prevLands: LandState) => {
            const updatedLands = { ...prevLands };
            if (updatedLands[landId]) {
                updatedLands[landId].energy = energy;
            }
            return updatedLands;
        });
    };

    const getCharismaTokenStats = useCallback(async () => {
        if (stxAddress) {
            try {
                const transactionsAvailable = await CharismaToken.getTransactionsAvailable()
                const blocksUntilUnlock = await CharismaToken.getBlocksUntilUnlock()
                const blocksPerTransaction = await CharismaToken.getBlocksPerTransaction()
                const tokensPerTransaction = await CharismaToken.getTokensPerTransaction()
                const hasFreeClaim = await CharismaToken.hasFreeClaim(stxAddress)
                const hasClaimed = await CharismaToken.hasClaimed(stxAddress)

                setCharismaTokenStats({
                    transactionsAvailable,
                    blocksUntilUnlock,
                    blocksPerTransaction,
                    tokensPerTransaction
                })

                setCharismaClaims({ hasFreeClaim, hasClaimed })
            } catch (error) {
                console.error("Error fetching Charisma token stats:", error);
            }
        }
    }, [stxAddress, setCharismaTokenStats, setCharismaClaims]);

    useEffect(() => {
        getCharismaTokenStats();
    }, [stxAddress, getCharismaTokenStats]);

    useEffect(() => {
        sc.subscribeBlocks((block) => {
            setBlock(block as any)
            toast({
                title: "New Block",
                description: `Stacks block ${block.height} has been mined.`,
            })

            // Reset highest wrap bid on each new block
            setHighestBid(0)

            // Update Charisma token stats on each new block
            // We're calling this asynchronously without awaiting to avoid returning a Promise
            getCharismaTokenStats().catch(error => {
                console.error("Error updating Charisma token stats:", error);
            });
        });

        const getBlockData = async () => {
            try {
                const block = await getLatestBlock()
                setBlock(block)
            } catch (error) {
                console.error("Error fetching latest block:", error);
            }
        }

        getBlockData();

        return () => {
            sc.unsubscribeBlocks()
        };
    }, [stxAddress, setBlock, toast, getCharismaTokenStats, setHighestBid]);

    useEffect(() => {
        if (isMempoolSubscribed) {
            sc.subscribeMempool((tx: any) => {
                if (tx?.contract_call?.contract_id === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token") {
                    let description;
                    const feeRateAmount = tx.fee_rate / 10 ** 6
                    switch (tx?.contract_call?.function_name) {
                        case 'wrap':
                            const shortSenderAddress = `${tx.sender_address.slice(0, 4)}...${tx.sender_address.slice(-4)}`
                            const newFeeRate = Math.ceil((Number((feeRateAmount).toFixed(6)) + 0.01) * 100) / 100
                            const isBidLower = feeRateAmount < highestBid;
                            const bidStatus = isBidLower ? "Lower than current highest bid" : "New highest bid";
                            const suggestedFee = isBidLower ? highestBid + 0.01 : newFeeRate;
                            description = (
                                <div className="w-full mt-4 space-y-2">
                                    <p className='flex justify-between w-full text-xs'>
                                        <div>Sender Address: {shortSenderAddress}</div>
                                        <div>Sender Fee: {feeRateAmount} STX</div>
                                    </p>
                                    <p className='font-light text-md'>{bidStatus}</p>
                                    <p className='font-light text-md'>Suggested fee to outbid: <strong>{suggestedFee.toFixed(2)} STX</strong></p>
                                    <p className='text-xs text-muted-foreground'>{formatTime(tx.receipt_time_iso)}</p>
                                </div>
                            );
                            if (highestBid < feeRateAmount) setHighestBid(feeRateAmount)
                            break;
                        default:
                            description = (
                                <div>
                                    <p>Transaction ID: {tx.tx_id}</p>
                                    <p>Transaction Type: {tx.tx_type}</p>
                                    <p>Contract ID: {tx?.contract_call?.contract_id}</p>
                                    <p>Function Name: {tx?.contract_call?.function_name}</p>
                                    <p>Sender Address: {tx.sender_address}</p>
                                    <p>Fee Rate: {tx.fee_rate}</p>
                                    <p>Nonce: {tx.nonce}</p>
                                    <p className='text-xs text-muted-foreground'>{formatTime(tx.receipt_time_iso)}</p>
                                </div>
                            );
                            break;
                    }

                    toast({
                        title: "New Wrap Transaction",
                        description,
                    });
                }
            });
        }

        return () => {
            sc.unsubscribeMempool()
        };
    }, [toast, isMempoolSubscribed]);

    return (
        <GlobalStateContext.Provider value={{
            lands,
            setLands,
            block,
            setBlock,
            tapped,
            setTapped,
            tappedAt,
            setTappedAt,
            token,
            setToken,
            storedEnergy,
            setStoredEnergy,
            updateTokenEnergy,
            charismaTokenStats,
            charismaClaims,
            isMempoolSubscribed,
            setIsMempoolSubscribed,
            highestBid
        }}>
            {children}
        </GlobalStateContext.Provider>
    );
};

export const useGlobalState = () => {
    const context = useContext(GlobalStateContext);
    if (context === undefined) {
        throw new Error('useGlobalState must be used within a GlobalStateProvider');
    }
    return context;
};