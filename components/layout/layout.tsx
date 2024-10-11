import Link from 'next/link';
import { cn } from '@lib/utils';
import { useRouter } from 'next/router';
import { SkipNavContent } from '@reach/skip-nav';
import { NAVIGATION } from '@lib/constants';
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

type Props = {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
  layoutStyles?: any;
};

export default function Layout({ children, className, hideNav, layoutStyles }: Props) {
  const router = useRouter();
  const activeRoute = router.asPath;
  const { stxAddress } = useGlobalState();

  const { wallet } = useWallet();
  const [navigationTabs, setNavigationTabs] = useState([] as any[]);

  useEffect(() => {
    if (stxAddress) {
      setNavigationTabs(NAVIGATION);
    }
  }, [stxAddress]);

  return (
    <>
      <div className={styles.background}>
        {!hideNav && (
          <header className={cn(styles.header)}>
            <div className={styles['header-logos']}>
              <MobileMenu key={router.asPath} />
              <div className={cn(styleUtils['hide-on-mobile'])}>
                <Link href="/" className={cn(styles.logo)}>
                  <Image src={dmgLogo} alt="DMG Logo" width="64" height="64" />
                </Link>
              </div>
            </div>
            <div className={styles.tabs}>
              {navigationTabs.map(({ name, route }, i) => (
                <Link key={i} href={route} className={cn(styles.tab, { [styles['tab-active']]: activeRoute.endsWith(route) })}                >
                  <div className="relative flex flex-col items-center justify-center">
                    <div>{name}</div>
                  </div>
                </Link>
              ))}
            </div>
            <div className={cn(styles['header-right'], 'items-center', 'gap-4', 'pr-4', ' whitespace-nowrap', 'sm:relative')}>
              {wallet.redPilled && <Image src={redPillFloating} alt="Red Pill" width="40" height="40" className='cursor-help' title={'The Red Pill NFT enables you to wrap your earned rewards into Charisma tokens.'} />}
              {wallet.bluePilled && <Image src={bluePillFloating} alt="Blue Pill" width="40" height="40" className='cursor-help' title={'The Blue Pill NFT offers your early access to Charisma Recovery token redemptions.'} />}
              <ConnectWallet />
            </div>
          </header>
        )}
        <div className={cn(styles.page)}>
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
