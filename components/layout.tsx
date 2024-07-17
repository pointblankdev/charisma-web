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
import ConnectWallet, { userSession } from './stacks-session/connect';
import { getClaimableAmount } from '@lib/stacks-api';
import Image from 'next/image';
import energyIcon from '@public/creatures/img/energy.png'
import experienceIcon from '@public/experience.png'
import useWallet from '@lib/hooks/use-wallet-balances';

type Props = {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
  layoutStyles?: any;
};

export default function Layout({ children, className, hideNav, layoutStyles }: Props) {
  const router = useRouter();
  const activeRoute = router.asPath;

  const { getBalanceByKey } = useWallet();

  const sender = userSession.isUserSignedIn() && userSession.loadUserData().profile.stxAddress.mainnet

  const [energy, setEnergy] = React.useState<number>(0);

  const experience = getBalanceByKey('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience::experience').balance / Math.pow(10, 6)

  useEffect(() => {
    // get energy
    let energy = 0
    getClaimableAmount(1, sender).then((res) => { energy = + res }).then(
      async () => await getClaimableAmount(2, sender).then((res) => { energy = + res }).then(
        async () => await getClaimableAmount(3, sender).then((res) => { energy = + res }).then(
          async () => await getClaimableAmount(4, sender).then((res) => { energy = + res }).then(
            () => setEnergy(energy)
          )
        )
      )
    )

  }, [sender])

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
            <div className={cn(styles['header-right'], 'items-center', 'gap-4', 'pr-4', ' whitespace-nowrap')}>
              <div className='flex items-center gap-2 text-lg text-muted/80 font-semibold'>
                <Image
                  alt={'Energy Icon'}
                  src={energyIcon}
                  width={100}
                  height={100}
                  className={`z-30 border rounded-full h-6 w-6`}
                />
                <div>{energy}</div>
              </div>
              <div className='flex items-center gap-2 text-lg text-muted/80 font-semibold pl-2'>
                <Image
                  alt={'Experience Icon'}
                  src={experienceIcon}
                  width={100}
                  height={100}
                  className={`z-30 border rounded-full h-5 w-5`}
                />
                <div>{experience} EXP</div>
              </div>
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