import React, { useEffect, useState } from "react";
import { AppConfig, showConnect, UserSession } from "@stacks/connect";
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
      <NavigationMenu className="hidden sm:block">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>{address}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3 relative overflow-hidden rounded-md">
                  <NavigationMenuLink asChild className="z-20 absolute inset-0">
                    <Link
                      className="flex h-full w-full select-none flex-col justify-end bg-gradient-to-b from-accent-foreground/25 to-black/90 p-6 no-underline outline-none focus:shadow-md"
                      href="/settings"
                    >
                      <BiSolidUserPin className="h-6 w-6" />
                      <div className="mb-2 mt-4 text-lg font-medium">
                        {address}
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Manage your account profile and settings.
                      </p>
                    </Link>
                  </NavigationMenuLink>
                  <Image
                    src={charisma}
                    height={1200}
                    width={600}
                    alt='profile background'
                    className={cn("w-full object-cover transition-all", "aspect-[1/2]", 'flex', 'z - 0', 'absolute', 'inset-0')}
                  />
                </li>
                <ListItem href="/quest-manager" title="Quest Manager">
                  Create, manage, and track your quests all from one place.
                </ListItem>
                <div className='text-sm absolute right-[8.2rem] top-8 text-green-500 animate-pulse'>BETA</div>
                <ListItem href="/tokenomics" title="Tokenomics">
                  View stats and metrics on the Charisma token's distribution.
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
      Connect Wallet
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
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"