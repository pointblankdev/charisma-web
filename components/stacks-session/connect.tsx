import React, { useEffect, useState } from "react";
import { AppConfig, showConnect, UserSession } from "@stacks/connect-react";
import styles from './index.module.css';
import { cn } from '@lib/utils';
import { Button } from "@components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@components/ui/navigation-menu"
import Link from "next/link";
import { BiSolidUserPin } from "react-icons/bi";
import Image from "next/image";
import charisma from "@public/quests/a1.png";

export const appConfig = new AppConfig(["store_write", "publish_data"]);

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
      <NavigationMenu className="hidden sm:block">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>{address}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-6 md:w-[400px]">
                <ListItem href="/portfolio" title="Portfolio">
                  View your Charisma supported token balances.
                </ListItem>
                <ListItem href="/governance" title="Governance">
                  Vote on DAO proposals using the Charisma token.
                </ListItem>
                <ListItem title="Sign Out" onClick={disconnect} className="cursor-pointer">
                  Securely disconnect your wallet.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
  }

  return (
    <Button onClick={authenticate} id="cta-btn" className={cn(styles['cta-btn'], 'whitespace-nowrap', 'w-full')}>
      Connect
    </Button>
  );
};

export default ConnectWallet;

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href="#"
          ref={ref}
          className={cn(
            "text-foreground block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="text-sm leading-snug line-clamp-2 text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"