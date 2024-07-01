
import { OverlayProvider } from 'react-aria';
import '@styles/global.css';
import '@styles/nprogress.css';
import '@styles/chrome-bug.css';
import type { AppProps } from 'next/app';
import NProgress from '@components/nprogress';
import ResizeHandler from '@components/resize-handler';
import { useEffect, useState } from 'react';
import { Connect, AuthOptions } from "@stacks/connect-react";
import { Analytics } from '@vercel/analytics/react';
import { Ysabeau_Infant } from 'next/font/google'
import { cn } from '@lib/utils';
import { Toaster } from "@components/ui/toaster"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { WalletBalances, WalletBalancesContext } from '@lib/hooks/use-wallet-balances';
import { getAccountBalance } from '@lib/stacks-api';
import { appDetails, userSession } from '@components/stacks-session/connect';
import { AddressBalanceResponse } from '@stacks/blockchain-api-client';

// If loading a variable font, you don't need to specify the font weight
const font = Ysabeau_Infant({ subsets: ['latin'] })



export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.body.classList?.remove('loading');
  }, []);

  const authOptions: AuthOptions = {
    redirectTo: "/",
    appDetails: appDetails,
    userSession: userSession,
  };

  const [balances, setBalances] = useState<WalletBalances>({} as AddressBalanceResponse);

  const getKeyByContractAddress = (contractAddress: string) => {
    const tokensArray = Object.keys(balances?.fungible_tokens || {});
    const token = tokensArray.find((token: string) => token.includes(contractAddress)) || '';
    console.log(token)
    return token
  }

  const getBalanceByKey = (key: string) => {
    return balances?.fungible_tokens?.[key]
  }

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const ca = userSession.loadUserData().profile.stxAddress.mainnet
      getAccountBalance(ca).then((balances) => {
        setBalances(balances);
      })
    }
  }, []);

  return (
    <OverlayProvider>
      <Connect authOptions={authOptions}>
        <WalletBalancesContext.Provider value={{ balances, setBalances, getKeyByContractAddress, getBalanceByKey }}>
          <main className={cn(font.className)}>
            <Component {...pageProps} />
          </main>
          <Toaster />
          <ResizeHandler />
          <NProgress />
          <Analytics />
          <SpeedInsights />
        </WalletBalancesContext.Provider>
      </Connect>
    </OverlayProvider>
  );
}
