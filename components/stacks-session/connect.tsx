import React, { useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@components/ui/navigation-menu"
import { useAccount, useAuth } from '@micro-stacks/react';
import ListItem from "./list-item";

const ConnectWallet = () => {
  const { openAuthRequest, isRequestPending, signOut, isSignedIn } = useAuth();
  const { stxAddress } = useAccount();

  const shortAddress = `${stxAddress?.slice(0, 4)}...${stxAddress?.slice(-4)}`

  const handleConnect = async () => {
    if (isSignedIn) await signOut();
    else await openAuthRequest();
  }
  const label = isRequestPending ? 'Loading...' : isSignedIn ? shortAddress : 'Connect';

  const [isClientSide, setIsClientSide] = React.useState(false);

  useEffect(() => {
    setIsClientSide(true)
  }, [])

  return (
    <NavigationMenu className="hidden sm:block">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={!isSignedIn ? "bg-primary" : ''}>
            <div onClick={handleConnect}>
              {isClientSide && label}
            </div>
          </NavigationMenuTrigger>
          {isSignedIn && <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px]">
              <ListItem href="/portfolio" title="Portfolio">
                View your Charisma supported token balances.
              </ListItem>
              <ListItem href="/governance" title="Governance">
                Vote on DAO proposals using the Charisma token.
              </ListItem>
              <ListItem title="Sign Out" onClick={() => signOut()} className="cursor-pointer">
                Securely disconnect your wallet.
              </ListItem>
            </ul>
          </NavigationMenuContent>}
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default ConnectWallet;