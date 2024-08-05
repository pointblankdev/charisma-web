import { createContext, useEffect, useState } from 'react';
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';
import { getLatestBlock } from '@lib/user-api';

const useLatestBlock = () => {
    const [latestBlock, setLatestBlock] = useState({} as any);

    useEffect(() => {
        // for testnet, replace with https://api.testnet.hiro.so
        const socketUrl = "https://api.mainnet.hiro.so";

        const sc = new StacksApiSocketClient({ url: socketUrl });

        sc.subscribeBlocks(block => setLatestBlock(block as any));

        getLatestBlock().then(block => setLatestBlock(block));

        return () => {
            sc.unsubscribeBlocks()
        };
    }, []);

    return latestBlock;
};

export default useLatestBlock;

const SocketContext = createContext(null);

export const SocketProvider = ({ children }: any) => {
    const latestBlock = useLatestBlock();

    return (
        <SocketContext.Provider value={latestBlock}>
            {children}
        </SocketContext.Provider>
    );
};