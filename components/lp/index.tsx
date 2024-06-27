
import { useState } from 'react';
import { WalletBalancesContext, WalletBalances } from '@lib/hooks/use-wallet-balances';
import Layout from '../layout';
import Hero from './hero';
import LearnMore from './learn-more';
import styleUtils from '@components/utils.module.css';


export default function LandingPage() {

  const [balances, setBalances] = useState<WalletBalances>({} as any);

  return (
    <WalletBalancesContext.Provider value={{ balances, setBalances }}>
      <Layout>
        <div className={styleUtils.container}>
          <>
            <Hero />
            <LearnMore />
          </>
        </div>
      </Layout>
    </WalletBalancesContext.Provider>
  );
}
