import React, { useEffect, useState } from "react";
import { AppConfig, showConnect, UserSession } from "@stacks/connect-react";
import { cn } from '@lib/utils';
import { Button } from "@components/ui/button";
import { StacksMainnet } from "@stacks/network";
import { useGlobalState } from "@lib/hooks/global-state-context";
import * as Sentry from "@sentry/browser";
import { getNameFromAddress } from "@lib/stacks-api";

export const appConfig = new AppConfig(["store_write", "publish_data"]);

export const userSession = new UserSession({ appConfig });

export const appDetails = {
  name: "Charisma",
  icon: "https://charisma.rocks/dmg-logo.png",
};

export const network = new StacksMainnet()

export function authenticate() {
  showConnect({
    appDetails,
    onFinish: async (e) => {
      window.location.pathname = '/token';
      const userData = e.userSession.loadUserData()
      const address = userData.profile.stxAddress.mainnet
      const bns = await getNameFromAddress(address)
      const user = {
        id: address,
        username: bns.names[0],
        ip_address: '{{auto}}',
        email: userData.email
      }
      Sentry.setUser(user);
    },
    userSession,
  });
}

export function disconnect() {
  userSession.signUserOut("/");
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

  const shortAddress = `${stxAddress.slice(0, 4)}...${stxAddress.slice(-4)}`

  useEffect(() => {
    setMounted(true)
  }, []);

  return (
    <Button onClick={toggleSession} className={cn('whitespace-nowrap', 'w-full', 'bg-transparent')}>
      {mounted && userSession.isUserSignedIn() ? shortAddress : 'Connect Wallet'}
    </Button>
  );
};

export default ConnectWallet;