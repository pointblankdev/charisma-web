
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

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
                // <TooltipProvider key={name}>
                //   <Tooltip>
                //     <TooltipTrigger>
                <Link
                  href={route}
                  className={cn(styles.tab, {
                    [styles['tab-active']]: activeRoute.endsWith(route)
                  })}
                >
                  <div className='relative flex flex-col items-center justify-center'>
                    <div>{name}</div>
                    {/* {name === 'Apps' && <div className='text-xxs absolute top-4 text-primary animate-pulse'>live</div>}
                          {name === 'Swap' && <div className='absolute text-xxs top-4 text-primary animate-pulse'>live</div>}
                          {name === 'Liquid Staking' && <div className='absolute text-xxs top-4 text-primary animate-pulse'>live</div>} */}
                    {/* {name === 'Crafting' && <div className='whitespace-nowrap absolute text-xs top-4 text-primary animate-pulse'>FENRIR IS ALIVE</div>} */}
                  </div>
                </Link>
                //     </TooltipTrigger>
                //     {name === 'Crafting' && <TooltipContent className={`text-md max-h-[80vh] overflow-scroll bg-black text-white border-primary leading-tight shadow-2xl max-w-prose`}>
                //       <div className="relative flex flex-col items-start p-4 space-y-4 shadow-md rounded-lg">
                //         <h3 className="font-bold text-xl mb-2">Crafting Overview</h3>
                //         <p>The Indexes page allows you to leverage your liquid staked assets to mint new tokens called index tokens.</p>
                //         <p>Here are some of the key terms to know:</p>
                //         <p><strong>Index Token:</strong> A token created by combining two or more other tokens at a fixed ratio.</p>
                //         <p><strong>Add Liquidity:</strong> The process through which index tokens are created by depositing base tokens.</p>
                //         <p><strong>Remove Liquidity:</strong> Involves the breakdown of an index token back into its original base assets.</p>
                //       </div>
                //     </TooltipContent>}
                //   </Tooltip>
                // </TooltipProvider>
              ))}
            </div>
            <div className={cn(styles['header-right'], 'items-center', 'gap-4')}>
              <Link href={'https://twitter.com/CharismaBTC'}><BsTwitter className='hidden cursor-pointer fill-gray-300 hover:fill-gray-100 sm:flex' /></Link>
              <Link href={'https://discord.gg/UTZmwWGC8C'}><BsDiscord className='hidden cursor-pointer fill-gray-300 hover:fill-gray-100 sm:flex' /></Link>
              <Link href={'https://docs.charisma.rocks'}><BsBookHalf className='hidden cursor-pointer fill-gray-300 hover:fill-gray-100 sm:flex' /></Link>
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
