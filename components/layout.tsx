
import Link from 'next/link';
import { cn } from '@lib/utils';
import { useRouter } from 'next/router';
import { SkipNavContent } from '@reach/skip-nav';
import { NAVIGATION } from '@lib/constants';
import styles from './layout.module.css';
import styleUtils from './utils.module.css';
import Logo from './icons/icon-logo';
import MobileMenu from './mobile-menu';
import Footer from './footer';
import React from 'react';
import { BsBookHalf, BsDiscord, BsTwitter } from 'react-icons/bs';
import ConnectWallet from './stacks-session/connect';

type Props = {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
  layoutStyles?: any;
};

export default function Layout({
  children,
  className,
  hideNav,
  layoutStyles,
}: Props) {
  const router = useRouter();
  const activeRoute = router.asPath;

  return (
    <>
      <div className={styles.background}>
        {!hideNav && (
          <header className={cn(styles.header)}>
            <div className={styles['header-logos']}>
              <MobileMenu key={router.asPath} />
              <div className={cn(styleUtils['hide-on-mobile'])}>
                <Link href="/" className={cn(styles.logo)}>
                  <Logo />
                </Link>
              </div>
            </div>
            <div className={styles.tabs}>
              {NAVIGATION.map(({ name, route }) => (
                <Link
                  href={route}
                  key={name}
                  className={cn(styles.tab, {
                    [styles['tab-active']]: activeRoute.startsWith(route)
                  })}
                >
                  <div className='flex flex-col items-center justify-center relative'>
                    <div>{name}</div>
                    {name === 'Quests' && <div className='text-xxs absolute top-4 text-primary animate-pulse'>live</div>}
                    {name === 'Faucet' && <div className='text-xxs absolute top-4 text-primary animate-pulse'>live</div>}
                    {name === 'Liquid Staked Welsh' && <div className='text-xxs absolute top-4 text-[green] animate-pulse'>new</div>}
                    {name === 'Wishing Well' && <div className='text-xxs absolute top-4 text-[green] animate-pulse'>new</div>}
                  </div>
                </Link>
              ))}
            </div>
            <div className={cn(styles['header-right'], 'items-center', 'gap-4')}>
              <Link href={'https://twitter.com/CharismaBTC'}><BsTwitter className='cursor-pointer fill-gray-300 hover:fill-gray-100 hidden sm:flex' /></Link>
              <Link href={'https://discord.gg/UTZmwWGC8C'}><BsDiscord className='cursor-pointer fill-gray-300 hover:fill-gray-100 hidden sm:flex' /></Link>
              {/* <Link href={'https://docs.charisma.rocks'}><BsBookHalf className='cursor-pointer fill-gray-300 hover:fill-gray-100 hidden sm:flex' /></Link> */}
              <ConnectWallet />
            </div>
          </header>
        )}
        <div className={styles.page}>
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
