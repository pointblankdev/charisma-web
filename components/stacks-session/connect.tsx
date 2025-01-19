import React, { useEffect, useState } from 'react';
import type { AppConfig, UserSession } from '@stacks/connect';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/button';
import * as Sentry from '@sentry/browser';
import { STACKS_MAINNET } from '@stacks/network';
import { useGlobal } from '@lib/hooks/global-context';
import { LAMPORTS_PER_SOL, Connection, PublicKey } from '@solana/web3.js';
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

// Check if Phantom wallet is installed
const getProvider = () => {
  if ('phantom' in window) {
    const provider = window.phantom as { solana?: { isPhantom?: boolean } };

    if (provider.solana?.isPhantom) {
      return provider.solana;
    }
  }

  // Redirect to Phantom wallet download if not installed
  window.open('https://phantom.app/', '_blank');
};

// Connect to Phantom wallet
async function connectWallet() {
  try {
    const provider: any = getProvider();

    if (provider) {
      const response = await provider.connect();
      const publicKey = response.publicKey.toString();
      console.log('Connected with Public Key:', publicKey);
      return publicKey;
    }
  } catch (err) {
    console.error("Error connecting to wallet:", err);
  }
}

// Disconnect from Phantom wallet
async function disconnectWallet() {
  try {
    const provider: any = getProvider();

    if (provider) {
      await provider.disconnect();
      console.log('Disconnected from wallet');
    }
  } catch (err) {
    console.error("Error disconnecting from wallet:", err);
  }
}

// Get wallet balance
async function getWalletBalance(publicKey: string) {
  try {
    const provider = getProvider();

    if (provider) {
      const connection = new Connection(
        'https://api.mainnet-beta.solana.com',
        'confirmed'
      );

      const balance = await connection.getBalance(new PublicKey(publicKey));
      return balance / LAMPORTS_PER_SOL;
    }
  } catch (err) {
    console.error("Error getting balance:", err);
  }
}
