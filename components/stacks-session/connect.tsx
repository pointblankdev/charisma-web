import React, { useEffect, useState } from 'react';
import type { AppConfig, UserSession } from '@stacks/connect-react';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/button';
import { useGlobalState } from '@lib/hooks/global-state-context';
import * as Sentry from '@sentry/browser';
import { getNamesFromAddress } from '@lib/stacks-api';
import { STACKS_MAINNET } from '@stacks/network';

export let appConfig: AppConfig;
export let userSession: UserSession;

const initializeStacks = async () => {
  const { AppConfig, UserSession } = await import('@stacks/connect-react');
  appConfig = new AppConfig(['store_write', 'publish_data']);
  userSession = new UserSession({ appConfig });
};

initializeStacks();

export const appDetails = {
  name: 'Charisma',
  icon: 'https://charisma.rocks/dmg-logo.gif'
};

export const network = STACKS_MAINNET;

export async function authenticate() {
  const { showConnect } = await import('@stacks/connect-react');
  showConnect({
    appDetails,
    onFinish: async e => {
      window.location.pathname = '/pools';
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
      userSession.loadUserData();
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
