import React, { useEffect, useState } from 'react';
import { AppConfig, showConnect, UserSession } from '@stacks/connect-react';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/button';
import { useGlobalState } from '@lib/hooks/global-state-context';
import * as Sentry from '@sentry/browser';
import { getNamesFromAddress } from '@lib/stacks-api';

export const appConfig = new AppConfig(['store_write', 'publish_data']);

export const userSession = new UserSession({ appConfig });

export const appDetails = {
  name: 'Charisma',
  icon: 'https://charisma.rocks/dmg-logo.gif'
};

export const network = 'mainnet' as any;

export function authenticate() {
  showConnect({
    appDetails,
    onFinish: async e => {
      window.location.pathname = '/swap';
      try {
        const userData = e.userSession.loadUserData();
        const address = userData.profile.stxAddress.mainnet;
        const bns = await getNamesFromAddress(address);
        const user = {
          id: address,
          names: bns,
          ip_address: '{{auto}}',
          email: userData.email
        };
        Sentry.setUser(user);
      } catch (error) {
        console.error(error);
      }
    },
    userSession
  });
}

export function disconnect() {
  userSession.signUserOut('/');
  Sentry.setUser(null);
}

export function toggleSession() {
  if (userSession.isUserSignedIn()) {
    disconnect();
  } else {
    authenticate();
  }
}

const ConnectWallet = () => {
  const [mounted, setMounted] = useState(false);
  const { stxAddress } = useGlobalState();

  const shortAddress = `${stxAddress.slice(0, 4)}...${stxAddress.slice(-4)}`;

  useEffect(() => {
    setMounted(true);
    try {
      const userData = userSession.loadUserData();
      const address = userData.profile.stxAddress.mainnet;
      getNamesFromAddress(address).then(bns => {
        const user = {
          id: address,
          names: bns,
          ip_address: '{{auto}}',
          email: userData.email
        };
        Sentry.setUser(user);
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <Button onClick={toggleSession} className={cn('whitespace-nowrap', 'w-full', 'bg-transparent')}>
      {mounted && userSession.isUserSignedIn() ? shortAddress : 'Connect Wallet'}
    </Button>
  );
};

export default ConnectWallet;
