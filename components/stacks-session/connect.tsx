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
import { useRouter } from "next/navigation";

const ConnectWallet = () => {
  const { openAuthRequest, isRequestPending, signOut, isSignedIn } = useAuth();
  const { stxAddress } = useAccount();
  const router = useRouter();

  const shortAddress = `${stxAddress?.slice(0, 4)}...${stxAddress?.slice(-4)}`

  const handleConnect = async () => {
    if (isSignedIn) await signOut(() => { router.push('/') })
    else await openAuthRequest({
      onFinish: () => {
        router.push('/token')
      }
    });
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
          <NavigationMenuTrigger className={!isSignedIn ? "" : ''}>
            <div onClick={handleConnect}>
              {isClientSide && label}
            </div>
          </NavigationMenuTrigger>
          {isSignedIn && <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px]">
              <ListItem href="/portfolio" title="Portfolio">
                View your Charisma supported token balances.
              </ListItem>
              <ListItem href="/players" title="Players">
                View all Charisma players and their stats.
              </ListItem>
              <ListItem title="Sign Out" onClick={() => signOut(() => { router.push('/') })} className="cursor-pointer">
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