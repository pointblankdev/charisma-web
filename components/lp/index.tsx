
import { useState } from 'react';
import { PageState, ConfDataContext, UserData } from '@lib/hooks/use-conf-data';
import Whitelist from './whitelist';
import Layout from '../layout';
import Hero from './hero';
import Form from './form';
import LearnMore from './learn-more';
import styles from './hero.module.css';
import styleUtils from '@components/utils.module.css';
import ClaimFaucetButton from '@components/faucet/claim';
import { cn } from '@lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import { Info } from 'lucide-react';
import { clamp } from 'lodash';

type Props = {
  defaultUserData: UserData;
  sharePage?: boolean;
  defaultPageState?: PageState;
  data: any;
};

export default function LandingPage({
  defaultUserData,
  defaultPageState = 'registration',
  data
}: Props) {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [pageState, setPageState] = useState<PageState>(defaultPageState);

  const blockHeight = data.latestBlock
  const lastClaimBlockHeight = data.lastClaim
  const unclaimedBlocks = clamp(0, 999, blockHeight - lastClaimBlockHeight)
  const dripAmount = data.dripAmount

  return (
    <ConfDataContext.Provider
      value={{
        userData,
        setUserData,
        setPageState
      }}
    >
      <Layout>
        <div className={styleUtils.container}>
          {pageState === 'registration' ? (
            <>
              <Hero />
              {/* <Form /> */}
              {/* <LearnMore /> */}
              <h2
                className={cn(
                  styleUtils.appear,
                  styleUtils['appear-eighth'],
                  styles.description,
                )}
              >
                <div className='m-2'>
                  <ClaimFaucetButton tokensToClaim={unclaimedBlocks * dripAmount} />
                </div>
              </h2>
            </>
          ) : (
            <Whitelist />
          )}

        </div>
      </Layout>
    </ConfDataContext.Provider>
  );
}
