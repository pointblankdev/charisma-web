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
import charismaLogo from '@public/charisma.png'

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
  const [energy, setEnergy] = React.useState<number>(0);
  const { lands, block } = useGlobalState()

  useEffect(() => {
    let totalEnergy = 0
    forEach(lands, (land: any) => {
      totalEnergy += Number(land.energy)
      setEnergy(totalEnergy)
    })
  }, [lands, block.height])

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
              <div className="flex items-center gap-2 text-md text-muted font-medium sm:absolute sm:right-64 mr-2">
                <Image
                  alt={'Energy Icon'}
                  src={energyIcon}
                  width={100}
                  height={100}
                  className={`z-30 border rounded-full h-6 w-6`}
                />
                <div>{numeral(energy).format('0.0a')}</div>
              </div>
              <div className="flex items-center gap-2 text-md text-muted font-medium pl-2 sm:absolute sm:right-48">
                <Image
                  alt={'Experience Icon'}
                  src={experienceIcon}
                  width={100}
                  height={100}
                  className={`z-30 border rounded-full h-5 w-5`}
                />
                <div>{numeral(wallet.experience.balance).format('0a')}</div>
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
