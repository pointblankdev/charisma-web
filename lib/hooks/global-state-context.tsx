import React, { createContext, useContext, useEffect } from 'react';
import { usePersistedState } from './use-persisted-state';
import { getClaimableAmount, getLandAmount } from '@lib/stacks-api';
import { getLatestBlock } from '@lib/user-api';
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
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { stxAddress } = useAccount()
    const [lands, setLands] = usePersistedState('lands', {});
    const [block, setBlock] = usePersistedState('block', {});
    const [tapped, setTapped] = usePersistedState('tapped', {});

    const { toast } = useToast()


    interface LandData {
        amount: number;
        energy: number;
    }

    interface LandState {
        [key: string]: LandData;
    }

    const stakedTokens = [1, 2, 3, 4, 5, 6, 7, 8, 9]


    useEffect(() => {
        const getLandData = async () => {
            if (stxAddress) {

                const newLandState: LandState = {};

                for (const landId of stakedTokens) {
                    const amount = await getLandAmount(landId, stxAddress);
                    const energy = await getClaimableAmount(landId, stxAddress);

                    newLandState[landId] = { amount, energy };
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
        <GlobalStateContext.Provider value={{ lands, setLands, block, setBlock, tapped, setTapped }}>
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