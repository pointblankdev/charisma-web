import Link from 'next/link';
import { cn } from '@lib/utils';
import { useRouter } from 'next/router';
import { SkipNavContent } from '@reach/skip-nav';
import { BRAND_NAME, NAVIGATION } from '@lib/constants';
import styles from './layout.module.css';
import styleUtils from '../utils.module.css';
import MobileMenu from '../mobile-menu';
import Footer from './footer';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import ConnectWallet, { userSession } from '@components/stacks-session/connect';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@components/ui/navigation-menu';
import { ChartBarIcon, LineChartIcon } from 'lucide-react';
import { BreadcrumbPage } from '@components/ui/breadcrumb';
import { BreadcrumbSeparator } from '@components/ui/breadcrumb';
import { BreadcrumbLink } from '@components/ui/breadcrumb';
import { SidebarTrigger } from '@components/ui/sidebar';
import { BreadcrumbItem } from '@components/ui/breadcrumb';
import { Separator } from '@components/ui/separator';
import { Breadcrumb, BreadcrumbList } from '@components/ui/breadcrumb';
import charisma from '@public/charisma.png';
import { useGlobal } from '@lib/hooks/global-context';
import _ from 'lodash';
import { SseStatus } from '@components/ui/sse-status';
import { NotificationBell } from '@components/ui/notification-bell';
import { NotificationPanel } from '@components/ui/notification-panel';
import { useNotifications } from '@lib/hooks/use-notifications';

type Props = {
  children: React.ReactNode;
  className?: string;
  hideNav?: boolean;
  layoutStyles?: any;
};

const ListItem = React.forwardRef<React.ElementRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="text-sm leading-snug line-clamp-2 text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = 'ListItem';

export default function Layout({ children, className, hideNav, layoutStyles }: Props) {
  const router = useRouter();
  const activeRoute = router.asPath;

  const { stxAddress } = useGlobal();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const { notifications, markAsRead, deleteNotifications } = useNotifications(stxAddress);

  const [navigationTabs, setNavigationTabs] = useState([] as any[]);

  useEffect(() => {
    if (userSession?.isUserSignedIn()) {
      setNavigationTabs(NAVIGATION);
    }
  }, [stxAddress, userSession]);

  // Add helper function to check if string is a contract address
  const isContractAddress = (str: string) => {
    return str && str.length > 34 && (str.startsWith('SP') || str.startsWith('ST') || str.startsWith('SM'));
  };

  // Add helper function to format path segment
  const formatPathSegment = (segment: string) => {
    if (isContractAddress(segment)) {
      const contractId = segment.split('.')[0];
      return `${contractId?.slice(0, 4)}...${contractId?.slice(-4)}.${segment.split('.')[1]}`;
    }
    return _.capitalize(segment);
  };

  return (
    <>
      <div className={styles.background}>
        <div className={cn(styles.page)}>
          <header className="justify-between flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              {activeRoute !== '/' ? <SidebarTrigger className="-ml-1" /> : <Link href="/swap">Launch App</Link>}
              {activeRoute !== '/' && <Separator orientation="vertical" className="mr-2 h-4" />}
              <Breadcrumb>
                <BreadcrumbList className="text-md">
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href={`/${activeRoute.split('/')[1]}`}>
                      {formatPathSegment(activeRoute.split('/')[1] || '')}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {activeRoute.split('/').length > 2 && <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{formatPathSegment(activeRoute.split('/')[2] || '')}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-2">
              {stxAddress && (
                <NotificationBell
                  notifications={notifications}
                  onClick={() => setIsNotificationPanelOpen(true)}
                />
              )}
              <ConnectWallet />
            </div>
          </header>
          <main className={styles.main} style={layoutStyles}>
            <SkipNavContent />
            <div className={cn(styles.full, className)}>{children}</div>
          </main>
          <Footer />
          <SseStatus />
          <NotificationPanel
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onDeleteNotifications={deleteNotifications}
            isOpen={isNotificationPanelOpen}
            onClose={() => setIsNotificationPanelOpen(false)}
          />
        </div>
      </div>
    </>
  );
}
