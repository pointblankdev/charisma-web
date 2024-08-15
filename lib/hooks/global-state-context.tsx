import React, { createContext, useContext, useEffect } from 'react';
import { usePersistedState } from './use-persisted-state';
import { getClaimableAmount, getCreatureAmount } from '@lib/stacks-api';
import { getLatestBlock } from '@lib/user-api';
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';
import { useAccount } from '@micro-stacks/react';


const socketUrl = "https://api.mainnet.hiro.so";
const sc = new StacksApiSocketClient({ url: socketUrl });

interface GlobalState {
    creatures: any;
    setCreatures: (creatures: any) => void;
    block: any;
    setBlock: (block: any) => void;
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { stxAddress } = useAccount()
    const [creatures, setCreatures] = usePersistedState('creatures', {});
    const [block, setBlock] = usePersistedState('block', {});


    interface CreatureData {
        amount: number;
        energy: number;
    }

    interface CreatureState {
        [key: string]: CreatureData;
    }


    useEffect(() => {
        const CREATURES = ['farmers', 'blacksmiths', 'corgiSoldiers', 'alchemists'];

        const getCreatureData = async () => {
            if (stxAddress) {

                const newCreatureState: CreatureState = {};

                let i = 0;
                for (const creature of CREATURES) {
                    const creatureName = creature;
                    const creatureId = ++i;
                    const amount = await getCreatureAmount(creatureId, stxAddress);
                    const energy = await getClaimableAmount(creatureId, stxAddress);

                    newCreatureState[creatureName] = { amount, energy };
                }

                setCreatures(newCreatureState)
            }
        }
        getCreatureData()
    }, [stxAddress, setCreatures])

    useEffect(() => {

        sc.subscribeBlocks(block => setBlock(block as any));

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
        <GlobalStateContext.Provider value={{ creatures, setCreatures, block, setBlock }}>
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