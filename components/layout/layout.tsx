import Link from 'next/link';
import { cn } from '@lib/utils';
import { useRouter } from 'next/router';
import { SkipNavContent } from '@reach/skip-nav';
import { BRAND_NAME, NAVIGATION } from '@lib/constants';
import styles from './layout.module.css';
import styleUtils from '../utils.module.css';
import MobileMenu from '../mobile-menu';
import Footer from './footer';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import ConnectWallet, { userSession } from '@components/stacks-session/connect';
import useWallet from '@lib/hooks/wallet-balance-provider';
import dmgLogo from '@public/dmg-logo.png';
import redPillFloating from '@public/sip9/pills/red-pill-floating.gif';
import bluePillFloating from '@public/sip9/pills/blue-pill-floating.gif';
import { useGlobalState } from '@lib/hooks/global-state-context';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@components/ui/navigation-menu';
import { ChartBarIcon, LineChartIcon, Sparkles } from 'lucide-react';
import { GlobalDrawer, useGlobalDrawer } from '@components/global/drawer';
import charisma from '@public/charisma.png';

type Props = {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
  layoutStyles?: any;
};

const ListItem = React.forwardRef<React.ElementRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="text-sm leading-snug line-clamp-2 text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = 'ListItem';

export default function Layout({ children, className, hideNav, layoutStyles }: Props) {
  const router = useRouter();
  const activeRoute = router.asPath;
  const { stxAddress } = useGlobalState();

  const drawer = useGlobalDrawer();

  const { wallet } = useWallet();
  const [navigationTabs, setNavigationTabs] = useState([] as any[]);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setNavigationTabs(NAVIGATION);
    }
  }, [stxAddress]);

  return (
    <>
      <div className={styles.background}>
        {!hideNav && (
          <header className={cn(styles.header, 'h-[42px]')}>
            <div className={styles['header-logos']}>
              <MobileMenu key={router.asPath} />
              <div className={cn(styleUtils['hide-on-mobile'])}>
                {router.pathname !== '/' && (
                  <Link href="/" className={cn(styles.logo, 'flex items-center gap-1')}>
                    <Image src={charisma} alt="Logo" width="50" height="50" className="size-7" />
                    <span
                      style={{
                        color: 'white',
                        fontSize: '30px',
                        lineHeight: 1.15,
                        letterSpacing: '-0.05em',
                        fontWeight: 700,
                        textAlign: 'center'
                      }}
                    >
                      {BRAND_NAME}
                    </span>
                  </Link>
                )}
              </div>
            </div>
            <div className={styles.tabs}>
              <NavigationMenu>
                <NavigationMenuList>
                  {navigationTabs.map(({ name, route }, i) => {
                    if (name === 'Pools') {
                      return (
                        <NavigationMenuItem key={i}>
                          <NavigationMenuTrigger
                            className={cn('text-md text-[var(--secondary-color)] mx-0')}
                          >
                            Pools
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className="grid gap-3 p-4 w-[500px] grid-cols-2 md:w-[700px]">
                              <ListItem
                                className="text-foreground"
                                href="/pools/spot"
                                title="Spot Pools"
                              >
                                <div className="flex items-center gap-2">
                                  <ChartBarIcon className="w-4 h-4" />
                                  <span>Trade and provide liquidity for base token pairs</span>
                                </div>
                              </ListItem>
                              <ListItem
                                className="text-foreground"
                                href="/pools/derivatives"
                                title="Derivative Pools"
                              >
                                <div className="flex items-center gap-2">
                                  <LineChartIcon className="w-4 h-4" />
                                  <span>Advanced pools featuring swappable liquidity</span>
                                </div>
                              </ListItem>
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      );
                    }
                    return (
                      <NavigationMenuItem key={i}>
                        <Link href={route} legacyBehavior passHref>
                          <NavigationMenuLink
                            className={cn(
                              'px-4 py-2 block',
                              {
                                [styles['tab-active']]: activeRoute.endsWith(route)
                              },
                              route ===
                                'https://charisma-3aadc5yyv-pointblankdev.vercel.app/pools/dexterity'
                                ? 'text-muted-foreground'
                                : 'text-foreground'
                            )}
                          >
                            {name}
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    );
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            <div
              className={cn(
                styles['header-right'],
                'items-center',
                'gap-4',
                'pr-4',
                'whitespace-nowrap',
                'sm:relative'
              )}
              onClick={drawer.open}
            >
              {/* {wallet.experience.balance > 1 && (
                <div
                  className="cursor-help"
                  title={'You have over 1 EXP and have unlocked all swap routes.'}
                >
                  ✨
                </div>
              )} */}
              {/* {wallet.redPilled && (
                <Image
                  src={redPillFloating}
                  alt="Red Pill"
                  width="40"
                  height="40"
                  className="cursor-help"
                  title={
                    'The Red Pill NFT enables you to wrap your earned rewards into Charisma tokens.'
                  }
                />
              )} */}
              {/* {wallet.bluePilled && (
                <Image
                  src={bluePillFloating}
                  alt="Blue Pill"
                  width="40"
                  height="40"
                  className="cursor-help"
                  title={
                    'The Blue Pill NFT offers your early access to Charisma Recovery token redemptions.'
                  }
                />
              )} */}
              <ConnectWallet />
            </div>
          </header>
        )}
        <div className={cn(styles.page)}>
          <main className={styles.main} style={layoutStyles}>
            <SkipNavContent />
            <div className={cn(styles.full, className)}>{children}</div>
            <GlobalDrawer open={drawer.isOpen} onClose={drawer.close} userAddress={stxAddress} />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
