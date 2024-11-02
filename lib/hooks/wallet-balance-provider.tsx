import React, { useState, useEffect } from 'react';
import { getAccountBalance } from '@lib/stacks-api';
import { createContext, useContext } from 'react';
import { useGlobalState } from './global-state-context';

export type Wallet = {
  experience: { balance: number; amount: number };
  charisma: { balance: number; amount: number };
  governance: { balance: number; amount: number };
  redPilled: boolean;
  bluePilled: boolean;
};

export type WalletBalancesContextType = {
  balances: any;
  setBalances: React.Dispatch<React.SetStateAction<any>>;
  getKeyByContractAddress: any;
  getBalanceByKey: any;
  wallet: Wallet;
};

export const WalletBalancesContext = createContext<WalletBalancesContextType | null>(null);

export const WalletBalancesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { stxAddress } = useGlobalState();

  const [balances, setBalances] = useState<any>({
    stx: {},
    fungible_tokens: {},
    non_fungible_tokens: {},
    token_offering_locked: {}
  } as any);

  useEffect(() => {
    if (stxAddress) {
      getAccountBalance(stxAddress).then(balances => {
        setBalances(balances);
      });
    }
  }, [stxAddress]);

  const getKeyByContractAddress = (contractAddress: string) => {
    const tokensArray = Object.keys(balances?.fungible_tokens || {});
    const token = tokensArray.find((token: string) => token.includes(contractAddress)) || '';
    return token;
  };

  const getBalanceByKey = (key: string) => {
    if (key === 'STX::native') {
      return Number(balances?.stx?.balance || 0);
    }
    return Number(balances?.fungible_tokens?.[key]?.balance);
  };

  const experience = getBalanceByKey(
    'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience::experience'
  );
  const governance = getBalanceByKey(
    'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma'
  );
  const charisma = getBalanceByKey(
    'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token::charisma'
  );
  const redPill: any =
    balances?.non_fungible_tokens?.[
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.red-pill-nft::red-pill'
    ];
  const bluePill: any =
    balances?.non_fungible_tokens?.[
      'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blue-pill-nft::blue-pill'
    ];

  const wallet: Wallet = {
    experience: { amount: experience, balance: experience / Math.pow(10, 6) },
    governance: { amount: governance, balance: governance / Math.pow(10, 6) },
    charisma: { amount: charisma, balance: charisma / Math.pow(10, 6) },
    redPilled: redPill?.count > 0,
    bluePilled: bluePill?.count > 0
  };

  return (
    <WalletBalancesContext.Provider
      value={{ balances, setBalances, getKeyByContractAddress, getBalanceByKey, wallet }}
    >
      {children}
    </WalletBalancesContext.Provider>
  );
};

export default function useWallet() {
  const result = useContext(WalletBalancesContext);
  if (!result) throw new Error();
  return result;
}
