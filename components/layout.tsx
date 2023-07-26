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
import Logo from './icons/icon-logo';
import MobileMenu from './mobile-menu';
import Footer from './footer';
import React, { useCallback, useEffect, useState } from 'react';
import DemoButton from './hms/demo-cta';
import RoomCta from './hms/demo-cta/room-cta';
import { hmsConfig } from './hms/config';
import ParticleBackground from './ParticleBackground';
import { useConnect, UserData } from "@stacks/connect-react";
import { userSession, appDetails } from 'pages/_app';
import { SignInWithStacksMessage } from '@lib/stacks/signInWithStacksMessage';
import { getCsrfToken, signIn } from "next-auth/react";
import SignIn from './hms/stacks-session';
import SignOut from './hms/stacks-session/sign-out';

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
  const disableCta = ['/schedule', '/speakers', '/expo', '/jobs'];


  const { sign, authenticate } = useConnect();
  const [stacksUser, setStacksUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setStacksUser(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setStacksUser(userSession.loadUserData());
    }
  }, [userSession]);

  const handleLogin = useCallback(() => {
    authenticate({
      appDetails,
      onFinish: ({ userSession }) => setStacksUser(userSession.loadUserData()),
    });
  }, [authenticate]);

  const handleSign = async () => {
    if (!stacksUser) return;

    const callbackUrl = "/protected";
    const stacksMessage = new SignInWithStacksMessage({
      domain: `${window.location.protocol}//${window.location.host}`,
      address: stacksUser.profile.stxAddress.mainnet,
      statement: "Sign in with Stacks to the app.",
      uri: window.location.origin,
      version: "1",
      chainId: 1,
      nonce: (await getCsrfToken()) as string,
    });

    const message = stacksMessage.prepareMessage();

    sign({
      message,
      onFinish: ({ signature }) => {
        signIn("credentials", {
          message: message,
          redirect: false,
          signature,
          callbackUrl,
        });
      },
    });
  };


  return (
    <>
      <ParticleBackground />
      <div className={styles.background}>
        {/* Disabled the navbar with the false logic */}
        {!hideNav && false && (
          <header className={cn(styles.header)}>
            <div className={styles['header-logos']}>
              <MobileMenu key={router.asPath} />
              <Link href="/">
                {/* eslint-disable-next-line */}
                <a className={styles.logo}>
                  <Logo />
                </a>
              </Link>
            </div>
            <div className={styles.tabs}>
              {NAVIGATION.map(({ name, route }) => (
                <a
                  key={name}
                  href={route}
                  className={cn(styles.tab, {
                    [styles['tab-active']]: activeRoute.startsWith(route)
                  })}
                >
                  {name}
                </a>
              ))}
            </div>

            {(hmsConfig.hmsIntegration && isLive && !disableCta.includes(activeRoute)) ||
              activeRoute === '/' ? (
              <div className={cn(styles['header-right'])}>
                {!stacksUser ? <SignIn handleLogin={handleLogin} /> : <SignOut />}
              </div>
            ) : (
              <div />
            )}
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
