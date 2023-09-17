import React, { useEffect, useState } from "react";
import { AppConfig, showConnect, UserSession } from "@stacks/connect";
import styles from './index.module.css';
import { cn } from '@lib/utils';
import { Button } from "@components/ui/button";

const appConfig = new AppConfig(["store_write", "publish_data"]);

export const userSession = new UserSession({ appConfig });

export const appDetails = {
  name: "Charisma",
  icon: "https://charisma.rocks/charisma.png",
};

function authenticate() {
  showConnect({
    appDetails,
    redirectTo: "/",
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

function disconnect() {
  userSession.signUserOut("/");
}

const ConnectWallet = () => {
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState('');
  useEffect(() => {
    setMounted(true)
    if (userSession.isUserSignedIn()) {
      setAddress(`${userSession.loadUserData().profile.stxAddress.mainnet.slice(0, 4)}...${userSession.loadUserData().profile.stxAddress.mainnet.slice(-4)}`)
    }
  }, []);

  if (mounted && userSession.isUserSignedIn()) {
    return (
      <Button className='text-gray-300 whitespace-nowrap' variant="ghost" onClick={disconnect}>
        {address}
      </Button>
    );
  }

  return (
    <Button onClick={authenticate} id="cta-btn" className={cn(styles['cta-btn'], 'whitespace-nowrap', 'w-full')}>
      Connect Wallet
    </Button>
  );
};

export default ConnectWallet;
