
import { useState } from 'react';
import { PageState, ConfDataContext, UserData } from '@lib/hooks/use-conf-data';
import Whitelist from './whitelist';
import Layout from '../layout';
import Hero from './hero';
import Form from './form';
import LearnMore from './learn-more';
import styleUtils from '@components/utils.module.css';

type Props = {
  defaultUserData: UserData;
  sharePage?: boolean;
  defaultPageState?: PageState;
};

export default function LandingPage({
  defaultUserData,
  defaultPageState = 'registration'
}: Props) {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [pageState, setPageState] = useState<PageState>(defaultPageState);

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
              <Form />
              <LearnMore />
            </>
          ) : (
            <Whitelist />
          )}

        </div>
      </Layout>
    </ConfDataContext.Provider>
  );
}
