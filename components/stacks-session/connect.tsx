import React, { useEffect, useState } from "react";
import { AppConfig, showConnect, UserSession } from "@stacks/connect-react";
import { cn } from '@lib/utils';
import { Button } from "@components/ui/button";
import { StacksMainnet } from "@stacks/network";
import { useGlobalState } from "@lib/hooks/global-state-context";

export const appConfig = new AppConfig(["store_write", "publish_data"]);

export const userSession = new UserSession({ appConfig });

export const appDetails = {
  name: "Charisma",
  icon: "https://charisma.rocks/dmg-logo.png",
};

export const network = new StacksMainnet()

function authenticate() {
  showConnect({
    appDetails,
    onFinish: () => {
      window.location.pathname = '/token';
    },
    userSession,
  });
}

function disconnect() {
  userSession.signUserOut("/");
}

function toggleSession() {
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