import React, { useEffect, useState } from 'react';
import type { AppConfig, UserSession } from '@stacks/connect';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/button';
import * as Sentry from '@sentry/browser';
import { STACKS_MAINNET } from '@stacks/network';
import { useGlobal } from '@lib/hooks/global-context';
export let appConfig: AppConfig;
export let userSession: UserSession;

const initializeStacks = async () => {
  const { AppConfig, UserSession } = await import('@stacks/connect');
  appConfig = new AppConfig(['store_write', 'publish_data']);
  userSession = new UserSession({ appConfig });
};

export const appDetails = {
  name: 'Charisma',
  icon: 'https://charisma.rocks/dmg-logo.gif'
};

export const network = STACKS_MAINNET;

export async function authenticate() {
  const { showConnect } = await import('@stacks/connect');
  showConnect({
    appDetails,
    onFinish: async e => {
      window.location.pathname = '/vaults';
      try {
        const userData = e.userSession.loadUserData();
        const address = userData.profile.stxAddress.mainnet;
        const user = {
          id: address,
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
    // disconnectWallet();
  } else {
    authenticate();
    // connectWallet();
  }
}

const ConnectWallet = () => {
  const [mounted, setMounted] = useState(false);
  const { stxAddress } = useGlobal();
  const [isHovered, setIsHovered] = useState(false);

  const shortAddress = `${stxAddress.slice(0, 4)}...${stxAddress.slice(-4)}`;

  useEffect(() => {
    try {
      initializeStacks().then(() => {
        setMounted(true);
        if (userSession.isUserSignedIn()) {
          userSession.loadUserData();
        }
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <Button
      variant={'ghost'}
      onClick={toggleSession}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn('whitespace-nowrap', 'w-32', 'bg-transparent', 'hover:bg-transparent', 'hover:text-white', 'text-center', 'relative')}
    >
      <div className={cn('transition-all duration-300 absolute top-2 opacity-0', {
        'opacity-100': isHovered
      })}>
        {mounted && userSession.isUserSignedIn() ? 'Disconnect' : 'Connect Wallet'}
      </div>
      <div className={cn('transition-all duration-300 absolute top-2 opacity-100', {
        'opacity-0': isHovered
      })}>
        {mounted && userSession.isUserSignedIn() ? shortAddress : 'Connect Wallet'}
      </div>
    </Button>
  );
};

export default ConnectWallet;