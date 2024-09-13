import Link from 'next/link';
import { cn } from '@lib/utils';
import { useRouter } from 'next/router';
import { SkipNavContent } from '@reach/skip-nav';
import { NAVIGATION } from '@lib/constants';
import styles from './layout.module.css';
import styleUtils from '../utils.module.css';
import MobileMenu from '../mobile-menu';
import Footer from './footer';
import React, { useEffect } from 'react';
import Image from 'next/image';
import energyIcon from '@public/creatures/img/energy.png';
import experienceIcon from '@public/experience.png';
import numeral from 'numeral';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { forEach } from 'lodash';
import ConnectWallet from '../stacks-session/connect';
import useWallet from '@lib/hooks/wallet-balance-provider';
import charismaLogo from '@public/charisma.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
  DropdownMenuTrigger
} from '@components/ui/dropdown-menu';
import spiral from '@public/quests/memobots/spiral.gif';
import hiddenMemobot from '@public/quests/memobots/hidden-memobot.png';
import { FaSync } from 'react-icons/fa';
import { useAccount } from '@micro-stacks/react';

type Props = {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
  layoutStyles?: any;
};

export default function Layout({ children, className, hideNav, layoutStyles }: Props) {
  const router = useRouter();
  const activeRoute = router.asPath;

  const { wallet } = useWallet();
  const { stxAddress } = useAccount();
  const { lands, block, token, setToken, storedEnergy } = useGlobalState()

  const playerLands = Object.values(lands).filter((land: any) => land.energy);

  // Function to clear cache and reload the page 
  // to solve the wrong energy display issue
  const clearCacheAndReload = () => {
    if (typeof window !== 'undefined') {
      window.caches
        .keys()
        .then(names => {
          for (const name of names) {
            window.caches.delete(name);
          }
        })
        .then(() => {
          router.reload();
        });
    }
  };

  const showEnergyControls = activeRoute.includes('quests') && stxAddress

  return (
    <>
      <div className={styles.background}>
        {!hideNav && (
          <header className={cn(styles.header)}>
            <div className={styles['header-logos']}>
              <MobileMenu key={router.asPath} />
              <div className={cn(styleUtils['hide-on-mobile'])}>
                <Link href="/" className={cn(styles.logo)}>
                  <Image src={charismaLogo} alt="Logo" width="64" height="64" />
                </Link>
              </div>
            </div>
            <div className={styles.tabs}>
              {NAVIGATION.map(({ name, route }, i) => (
                <Link
                  key={i}
                  href={route}
                  className={cn(styles.tab, {
                    [styles['tab-active']]: activeRoute.endsWith(route)
                  })}
                >
                  <div className="relative flex flex-col items-center justify-center">
                    <div>{name}</div>
                  </div>
                </Link>
              ))}
            </div>
            <div
              className={cn(
                styles['header-right'],
                'items-center',
                'gap-4',
                'pr-4',
                ' whitespace-nowrap',
                'sm:relative'
              )}
            >
              <div className="flex items-center gap-2 pl-2 font-medium text-md text-muted sm:absolute sm:right-40">
                {/* <Image
                  alt={'Experience Icon'}
                  src={experienceIcon}
                  width={100}
                  height={100}
                  className={`z-30 border rounded-full h-5 w-5`}
                /> */}
                <div className={'cursor-pointer'} onClick={clearCacheAndReload} title='If your energy is not updating, try clicking here to clear your cache.'>✨ {numeral(wallet.experience.balance).format('0a')}</div>
              </div>
              <ConnectWallet />
            </div>
          </header>
        )}
        {showEnergyControls && <DropdownMenu>
          <DropdownMenuTrigger className="fixed z-30 self-end w-20 h-20 m-4 mt-10 sm:sticky bottom-16 sm:top-10 focus-visible:invisible">
            <div className="relative flex flex-col items-center justify-center">
              <Image
                alt={'Energy Icon'}
                src={token?.metadata?.image || energyIcon}
                width={100}
                height={100}
                className={`border rounded-full hover:scale-105 transition-all cursor-pointer`}
              />
              <div className="absolute -top-[30px] border bg-opacity-90 bg-black rounded-3xl px-2 text-sm flex space-x-1 items-center">
                <div>{numeral(token?.energy).format('0.0a')} ⚡</div>
                {/* <Image
                  alt={'Token Icon'}
                  src={energyIcon}
                  width={100}
                  height={100}
                  className={`z-30 rounded-full h-4 w-4`}
                /> */}
              </div>
              {storedEnergy > 0 && (
                <div className="absolute top-[5.5rem] border bg-opacity-90 bg-black rounded-3xl px-2 text-sm flex space-x-1 items-center">
                  <div>{numeral(storedEnergy).format('0.0a')}</div>
                  <Image
                    alt={'Token Icon'}
                    src={spiral}
                    width={100}
                    height={100}
                    className={`z-30 rounded-full h-4 w-4`}
                  />
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mx-2 mt-0.5">
            <DropdownMenuLabel>Select a token</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {playerLands.map((land: any) => (
              <DropdownMenuItem
                onClick={() => setToken(land)}
                className="cursor-pointer flex space-x-2"
                key={land.metadata.id}
              >
                <Image
                  alt={'Token Icon'}
                  src={land.metadata.image}
                  width={10}
                  height={10}
                  className={`z-30 rounded-full h-5 w-5`}
                />
                <div>{land.metadata.name}</div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>}
        <div className={cn(styles.page, showEnergyControls && 'sm:-mt-36')}>
          <main className={styles.main} style={layoutStyles}>
            <SkipNavContent />
            <div className={cn(styles.full, className)}>{children}</div>
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
