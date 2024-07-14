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
import React, { useEffect } from 'react';
import { BsBookHalf, BsDiscord, BsTwitter } from 'react-icons/bs';
import ConnectWallet from './stacks-session/connect';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import velarApi from '@lib/velar-api';

type Props = {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
  layoutStyles?: any;
};

export default function Layout({ children, className, hideNav, layoutStyles }: Props) {
  const router = useRouter();
  const activeRoute = router.asPath;

  const [priceFeedActive, setPriceFeedActive] = React.useState<boolean>(true);

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
                    {/* {name === 'Arbitrage' && <div className='text-xxs absolute top-4 text-primary animate-pulse'>early access</div>} */}
                    {/* {name === 'Creatures' && <div className='text-xs whitespace-nowrap absolute top-4 text-primary animate-pulse'>early access</div>} */}
                    {/* {name === 'Portfolio' && (
                      <div className="whitespace-nowrap absolute text-xs top-4 text-yellow-500 animate-pulse">
                        preview
                      </div>
                    )} */}
                  </div>
                </Link>
              ))}
            </div>
            <div className={cn(styles['header-right'], 'items-center', 'gap-4')}>
              <PriceDataLiveMonitor active={priceFeedActive} />
              <Link href={'https://twitter.com/CharismaBTC'}>
                <BsTwitter className="hidden cursor-pointer fill-gray-300 hover:fill-gray-100 sm:flex" />
              </Link>
              <Link href={'https://discord.gg/UTZmwWGC8C'}>
                <BsDiscord className="hidden cursor-pointer fill-gray-300 hover:fill-gray-100 sm:flex" />
              </Link>
              <Link href={'https://docs.charisma.rocks'}>
                <BsBookHalf className="hidden cursor-pointer fill-gray-300 hover:fill-gray-100 sm:flex" />
              </Link>
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

const PriceDataLiveMonitor = ({
  active
}: {
  active: boolean;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="relative w-4 h-4">
            <div
              className={`absolute top-0 left-0 w-4 h-4 rounded-full ${active ? 'bg-green-500 animate-ping' : 'bg-red-500'
                }`}
            />
            <div
              className={`absolute top-0 left-0 w-4 h-4 rounded-full ${active ? 'bg-green-500' : 'bg-red-500 animate-ping'
                }`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent
          className={`overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}
        >
          {active
            ? 'Price data feed is live'
            : `There is an error getting token pricing data. Expect liquidity pool TVLs and portfolio balances to be inaccurate until the price data feed is back online.`
          }
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};