
import { OverlayProvider } from 'react-aria';
import '@styles/global.css';
import '@styles/nprogress.css';
import '@styles/chrome-bug.css';
import type { AppProps } from 'next/app';
import NProgress from '@components/nprogress';
import ResizeHandler from '@components/resize-handler';
import { useEffect } from 'react';
import {
  Connect,
  AuthOptions,
  AppConfig,
  UserSession,
} from "@stacks/connect-react";
import { Analytics } from '@vercel/analytics/react';
import { Ysabeau_Infant } from 'next/font/google'
import { cn } from '@lib/utils';
import { Toaster } from "@components/ui/toaster"
import { SpeedInsights } from "@vercel/speed-insights/next"

// If loading a variable font, you don't need to specify the font weight
const font = Ysabeau_Infant({ subsets: ['latin'] })

export const appConfig = new AppConfig(["store_write", "publish_data"]);
export const userSession = new UserSession({ appConfig });
export const appDetails = {
  name: "Charisma",
  icon: "https://charisma.rocks/charisma.png",
};

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.body.classList?.remove('loading');
  }, []);

  const authOptions: AuthOptions = {
    redirectTo: "/",
    appDetails,
    userSession,
  };

  return (
    <OverlayProvider>
      <Connect authOptions={authOptions}>
        <main className={cn(font.className)}>
          <Component {...pageProps} />
        </main>
        <Toaster />
        <ResizeHandler />
        <NProgress />
        <Analytics />
        <SpeedInsights />
      </Connect>
    </OverlayProvider>
  );
}
