import React, { createContext, useContext, useEffect } from 'react';
import { usePersistedState } from './use-persisted-state';
import { getClaimableAmount, getLandAmount, getLastLandId, getStoredEnergy } from '@lib/stacks-api';
import { getLandDataById, getLatestBlock } from '@lib/user-api';
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';
import { useAccount } from '@micro-stacks/react';
import { useToast } from '@components/ui/use-toast';


const socketUrl = "https://api.mainnet.hiro.so";
const sc = new StacksApiSocketClient({ url: socketUrl });

interface GlobalState {
    lands: any;
    setLands: (lands: any) => void;
    block: any;
    setBlock: (block: any) => void;
    tapped: any;
    setTapped: (block: any) => void;
    token: any;
    setToken: (token: any) => void;
    storedEnergy: number;
    setStoredEnergy: (amount: number) => void;
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { stxAddress } = useAccount()
    const [lands, setLands] = usePersistedState('lands', {});
    const [block, setBlock] = usePersistedState('block', {});
    const [tapped, setTapped] = usePersistedState('tapped', {});
    const [token, setToken] = usePersistedState('token', {})
    const [storedEnergy, setStoredEnergy] = usePersistedState('storedEnergy', 0);

    const { toast } = useToast()

    interface LandData {
        amount: number;
        energy: number;
        metadata: any;
    }

    interface LandState {
        [key: string]: LandData;
    }


    useEffect(() => {

        const getLandData = async () => {
            if (stxAddress) {

                const lastLandId = await getLastLandId()
                const stakedTokens = Array.from({ length: lastLandId }, (_, i) => i + 1)

                const newLandState: LandState = {};
                const storedEnergy = await getStoredEnergy(stxAddress);
                setStoredEnergy(storedEnergy);

                for (const landId of stakedTokens) {
                    try {
                        const metadata = await getLandDataById(landId)
                        const amount = await getLandAmount(landId, stxAddress);
                        const energy = await getClaimableAmount(landId, stxAddress);
                        newLandState[landId] = { amount, energy, metadata };
                    } catch (error) {
                        console.error('Error fetching land data:', error);
                    }
                }

                setLands(newLandState)
            }
        }
        getLandData()
    }, [stxAddress, setLands])

    useEffect(() => {

        sc.subscribeBlocks(block => {
            setBlock(block as any)
            setTapped({})
            toast({
                title: "New Block",
                description: `Stacks block ${block.height} has been mined.`,
            })
        });

        const getBlockData = async () => {
            const block = await getLatestBlock()
            setBlock(block)
        }

        getBlockData()

        return () => {
            sc.unsubscribeBlocks()
        };
    }, [setBlock])



    return (
        <GlobalStateContext.Provider value={{ lands, setLands, block, setBlock, tapped, setTapped, token, setToken, storedEnergy, setStoredEnergy }}>
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