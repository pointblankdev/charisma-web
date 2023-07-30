/**
 * Copyright 2020 Vercel Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Link from 'next/link';
import cn from 'classnames';
import { useRouter } from 'next/router';
import { SkipNavContent } from '@reach/skip-nav';
import { NAVIGATION } from '@lib/constants';
import styles from './layout.module.css';
import styleUtils from './utils.module.css';
import Logo from './icons/icon-logo';
import MobileMenu from './mobile-menu';
import Footer from './footer';
import React from 'react';
import ConnectWallet from './hms/stacks-session/connect';

type Props = {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
  layoutStyles?: any;
  isLive?: boolean;
};

export default function Layout({
  children,
  className,
  hideNav,
  layoutStyles,
  isLive = false
}: Props) {
  const router = useRouter();
  const activeRoute = router.asPath;

  // const handleSign = async () => {
  //   if (!stacksUser) return;

  //   const callbackUrl = "/protected";
  //   const stacksMessage = new SignInWithStacksMessage({
  //     domain: `${window.location.protocol}//${window.location.host}`,
  //     address: stacksUser.profile.stxAddress.mainnet,
  //     statement: "Sign in with Stacks to the app.",
  //     uri: window.location.origin,
  //     version: "1",
  //     chainId: 1,
  //     nonce: (await getCsrfToken()) as string,
  //   });

  //   const message = stacksMessage.prepareMessage();

  //   sign({
  //     message,
  //     onFinish: ({ signature }) => {
  //       signIn("credentials", {
  //         message: message,
  //         redirect: false,
  //         signature,
  //         callbackUrl,
  //       });
  //     },
  //   });
  // };


  return (
    <>
      <div className={styles.background}>
        {!hideNav && (
          <header className={cn(styles.header)}>
            <div className={styles['header-logos']}>
              <MobileMenu key={router.asPath} />
              <div className={cn(styleUtils['hide-on-mobile'], styleUtils['hide-on-tablet'])}>
                <Link href="/"
                  className={cn(styles.logo)}>
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
                  {name}
                </Link>
              ))}
            </div>
            <div className={styles['header-right']}>
              <ConnectWallet />
            </div>
          </header>
        )}
        <div className={styles.page}>
          <main className={styles.main} style={layoutStyles}>
            <SkipNavContent />
            <div className={cn(styles.full, className)}>{children}</div>
          </main>
          {!activeRoute.startsWith('/stage') && <Footer />}
        </div>
      </div>
    </>
  );
}
