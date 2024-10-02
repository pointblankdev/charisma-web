import React, { createContext, useContext, useEffect } from 'react';
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

    useEffect(() => {
        // const getLandData = async () => {
        //     if (stxAddress) {
        //         const lastLandId = await getLastLandId()
        //         const stakedTokens = Array.from({ length: lastLandId }, (_, i) => i + 1)

        //         const newLandState: LandState = {};
        //         const storedEnergy = await getStoredEnergy(stxAddress);
        //         setStoredEnergy(storedEnergy);

        //         for (const landId of stakedTokens) {
        //             try {
        //                 const metadata = await getLandDataById(landId)
        //                 const amount = await getLandAmount(landId, stxAddress);
        //                 const energy = await getClaimableAmount(landId, stxAddress);
        //                 newLandState[landId] = { amount, energy, metadata };
        //             } catch (error) {
        //                 console.error('Error fetching land data:', error);
        //             }
        //         }

        //         setLands(newLandState)
        //     }
        // };
        const getCharismaTokenStats = async () => {
            if (stxAddress) {

                // transactions available
                const transactionsAvailable = await CharismaToken.getTransactionsAvailable()
                setCharismaTokenStats((stats: any) => ({ ...stats, transactionsAvailable }))

                // blocks until unlocked
                const blocksUntilUnlock = await CharismaToken.getBlocksUntilUnlock()
                setCharismaTokenStats((stats: any) => ({ ...stats, blocksUntilUnlock }))

                // getBlocksPerTransaction
                const blocksPerTransaction = await CharismaToken.getBlocksPerTransaction()
                setCharismaTokenStats((stats: any) => ({ ...stats, blocksPerTransaction }))

                // getTokensPerTransaction
                const tokensPerTransaction = await CharismaToken.getTokensPerTransaction()
                setCharismaTokenStats((stats: any) => ({ ...stats, tokensPerTransaction }))

                const hasFreeClaim = await CharismaToken.hasFreeClaim(stxAddress)
                setCharismaClaims((data: any) => ({ ...data, hasFreeClaim }))

                const hasClaimed = await CharismaToken.hasClaimed(stxAddress)
                setCharismaClaims((data: any) => ({ ...data, hasClaimed }))
            }
        }

        // getLandData();
        getCharismaTokenStats()
    }, [stxAddress, setLands]);

    useEffect(() => {
        sc.subscribeBlocks((block) => {
            setBlock(block as any)
            // setTapped({})
            toast({
                title: "New Block",
                description: `Stacks block ${block.height} has been mined.`,
            })

            // // When a new block is detected, re-fetch energy for all lands
            // const stakedTokens = Object.keys(lands);
            // stakedTokens.forEach((landId) => {
            //     getClaimableAmount(parseInt(landId), stxAddress!)
            //         .then((energy) => {
            //             updateTokenEnergy(landId, energy); // Update the energy for each token
            //         })
            //         .catch((error) => {
            //             console.error(`Error updating energy for landId ${landId}:`, error);
            //         });
            // });
        });

        const getBlockData = async () => {
            const block = await getLatestBlock()
            setBlock(block)
        }

        getBlockData()

        return () => {
            sc.unsubscribeBlocks()
        };
    }, [stxAddress, setBlock, toast]);


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