
import { AddressBalanceResponse } from '@stacks/blockchain-api-client';
import { createContext, useContext, useState } from 'react';

export type PageState = 'registration' | 'ticket';

export type WalletBalances = AddressBalanceResponse;

type WalletBalancesContextType = {
  balances: WalletBalances;
  setBalances: React.Dispatch<React.SetStateAction<WalletBalances>>;
  getKeyByContractAddress: any;
  getBalanceByKey: any
};

export const WalletBalancesContext = createContext<WalletBalancesContextType | null>(null);

export default function useWallet() {

  const result = useContext(WalletBalancesContext);
  if (!result) {
    throw new Error();
  }
  return result;
}
