import { OverlayProvider } from 'react-aria';
import '@styles/global.css';
import '@styles/nprogress.css';
import '@styles/chrome-bug.css';
import type { AppProps } from 'next/app';
import NProgress from '@components/nprogress';
import ResizeHandler from '@components/resize-handler';
import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Ysabeau_Infant } from 'next/font/google'
import { cn } from '@lib/utils';
import { Toaster } from "@components/ui/toaster"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GlobalProvider } from '@lib/hooks/global-context';

// If loading a variable font, you don't need to specify the font weight
const font = Ysabeau_Infant({ subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.body.classList?.remove('loading');
  }, []);


  return (
    <OverlayProvider>
      <GlobalProvider>
        <main className={cn(font.className)}>
          <Component {...pageProps} />
        </main>
        <Toaster />
        <ResizeHandler />
        <NProgress />
        <Analytics />
        <SpeedInsights />
      </GlobalProvider>
    </OverlayProvider>
  );
}
