import React, { createContext, useCallback, useContext, useEffect } from 'react';
import { usePersistedState } from './use-persisted-state';
import { getLatestBlock } from '@lib/user-api';
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';
import { useToast } from '@components/ui/use-toast';
import { CharismaToken } from '@lib/cha-token-api';
import { userSession } from '@components/stacks-session/connect';
import { Dexterity } from 'dexterity-sdk';
import { SITE_URL } from '@lib/constants';

const siteUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : SITE_URL
const socketUrl = 'https://api.mainnet.hiro.so';
const sc = new StacksApiSocketClient({ url: socketUrl });

interface GlobalState {
  stxAddress: string;
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
  isMempoolSubscribed: boolean;
  setIsMempoolSubscribed: (isMempoolSubscribed: boolean) => void;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const isWithinLast6Hours = (timestamp: string) => {
  const sixHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  return new Date(timestamp) > sixHoursAgo;
};

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stxAddress, setStxAddress] = usePersistedState('address', '');
  const [lands, setLands] = usePersistedState('lands', {});
  const [block, setBlock] = usePersistedState('block', {} as any);
  const [tapped, setTapped] = usePersistedState('tapped', {});
  const [tappedAt, setTappedAt] = usePersistedState('tappedAt', {});
  const [token, setToken] = usePersistedState('token', {});
  const [isMempoolSubscribed, setIsMempoolSubscribed] = usePersistedState(
    'isMempoolSubscribed',
    false
  );
  const { toast } = useToast();

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
  }, [setStxAddress]);

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
            <p className="text-xs">{formatTime(tx.receipt_time_iso)}</p>
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
        console.log('Dexterity Multihop Transaction:', tx);
        const description = (
          <div className="space-y-2">
            <p className="flex justify-between w-full text-xs">
              {JSON.stringify(tx?.contract_call)}
            </p>
            <p className="text-xs text-muted-foreground">{formatTime(tx.receipt_time_iso)}</p>
          </div>
        );
        toast({
          title: 'Dexterity Multihop Transaction',
          description,
          duration: 10000
        });
      }
    });

    return () => {
      sc.unsubscribeMempool();
    };
  }, [toast]);

  useEffect(() => {
    sc.subscribeBlocks(block => {
      setBlock(block as any);
    });

    const getBlockData = async () => {
      try {
        const block = await getLatestBlock();
        setBlock(block);
      } catch (error) {
        console.error('Error fetching latest block:', error);
      }
    };

    getBlockData();

    return () => {
      sc.unsubscribeBlocks();
    };
  }, [stxAddress, setBlock, toast]);

  return (
    <GlobalStateContext.Provider
      value={{
        stxAddress,
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
        isMempoolSubscribed,
        setIsMempoolSubscribed
      }}
    >
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
