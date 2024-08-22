import React, { useState, useEffect } from 'react';
import { getAccountBalance } from '@lib/stacks-api';
import { AddressBalanceResponse } from '@stacks/blockchain-api-client';
import { useAccount } from '@micro-stacks/react';
import { createContext, useContext } from 'react';

export type Wallet = {
  experience: { balance: number, amount: number }
  charisma: { balance: number, amount: number }
}

export type WalletBalancesContextType = {
  balances: AddressBalanceResponse;
  setBalances: React.Dispatch<React.SetStateAction<AddressBalanceResponse>>;
  getKeyByContractAddress: any;
  getBalanceByKey: any;
  wallet: Wallet;
};

export const WalletBalancesContext = createContext<WalletBalancesContextType | null>(null);

export const WalletBalancesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { stxAddress } = useAccount()

  const [balances, setBalances] = useState<AddressBalanceResponse>({} as AddressBalanceResponse);

  useEffect(() => {
    if (stxAddress) {
      getAccountBalance(stxAddress).then((balances) => {
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
    return Number((balances?.fungible_tokens?.[key] as any)?.balance)
  };

  const experience = getBalanceByKey('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience::experience')
  const charisma = getBalanceByKey('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma')

  const wallet: Wallet = {
    experience: { amount: experience, balance: experience / Math.pow(10, 6) },
    charisma: { amount: charisma, balance: charisma / Math.pow(10, 6) },
  }

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
