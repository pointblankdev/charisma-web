import React, { createContext, useCallback, useContext, useEffect } from 'react';
import { usePersistedState } from './use-persisted-state';
import { getClaimableAmount, getLandAmount, getLastLandId, getStoredEnergy } from '@lib/stacks-api';
import { getLandDataById, getLatestBlock } from '@lib/user-api';
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';
import { useAccount } from '@micro-stacks/react';
import { useToast } from '@components/ui/use-toast';
import { CharismaToken } from '@lib/cha-token-api';

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
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { stxAddress } = useAccount()
    const [lands, setLands] = usePersistedState('lands', {});
    const [block, setBlock] = usePersistedState('block', {});
    const [tapped, setTapped] = usePersistedState('tapped', {});
    const [tappedAt, setTappedAt] = usePersistedState('tappedAt', {});
    const [token, setToken] = usePersistedState('token', {})
    const [storedEnergy, setStoredEnergy] = usePersistedState('storedEnergy', 0);

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
    }, [stxAddress, setBlock, toast, getCharismaTokenStats]);

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
            charismaClaims
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