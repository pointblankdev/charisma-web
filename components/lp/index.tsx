
import { useState } from 'react';
import useWallet, { WalletBalancesContext, WalletBalances } from '@lib/hooks/use-wallet-balances';
import Layout from '../layout';
import Hero from './hero';
import LearnMore from './learn-more';
import styleUtils from '@components/utils.module.css';

type Props = {
  defaultWalletBalances: WalletBalances;
};

export default function LandingPage({ defaultWalletBalances }: Props) {

  const [balances, setBalances] = useState<WalletBalances>(defaultWalletBalances);

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
