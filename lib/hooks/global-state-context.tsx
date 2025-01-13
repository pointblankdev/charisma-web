import React, { createContext, useCallback, useContext, useEffect } from 'react';
import { usePersistedState } from './use-persisted-state';
import { getLatestBlock } from '@lib/user-api';
import { StacksApiSocketClient } from '@stacks/blockchain-api-client';
import { useToast } from '@components/ui/use-toast';
import { CharismaToken } from '@lib/cha-token-api';
import { userSession } from '@components/stacks-session/connect';
import { Dexterity, Vault } from 'dexterity-sdk';
import { SITE_URL } from '@lib/constants';
import { bufferCVFromString, cvToJSON, cvToValue, hexToCV } from '@stacks/transactions';
import { hexToInt } from '@stacks/common';
import _ from 'lodash';

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
                      {/* <div className="font-light text-sm">
                        {amountOutput} {lastHopTokenOutput.symbol}
                      </div> */}
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
