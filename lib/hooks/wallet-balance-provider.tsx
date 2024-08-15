import React, { useState, useEffect } from 'react';
import { WalletBalances, WalletBalancesContext } from '@lib/hooks/use-wallet-balances';
import { getAccountBalance } from '@lib/stacks-api';
import { AddressBalanceResponse } from '@stacks/blockchain-api-client';
import { useAccount } from '@micro-stacks/react';

export const WalletBalancesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { stxAddress } = useAccount()

  const [balances, setBalances] = useState<WalletBalances>({} as AddressBalanceResponse);

  const getKeyByContractAddress = (contractAddress: string) => {
    const tokensArray = Object.keys(balances?.fungible_tokens || {});
    const token = tokensArray.find((token: string) => token.includes(contractAddress)) || '';
    return token;
  };

  const getBalanceByKey = (key: string) => {
    return balances?.fungible_tokens?.[key] || 0;
  };

  useEffect(() => {
    if (stxAddress) {
      getAccountBalance(stxAddress).then((balances) => {
        setBalances(balances);
      });
    }
  }, [stxAddress]);

  return (
    <WalletBalancesContext.Provider
      value={{ balances, setBalances, getKeyByContractAddress, getBalanceByKey }}
    >
      {children}
    </WalletBalancesContext.Provider>
  );
};