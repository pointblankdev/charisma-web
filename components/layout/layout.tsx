import Link from 'next/link';
import { cn } from '@lib/utils';
import { useRouter } from 'next/router';
import { SkipNavContent } from '@reach/skip-nav';
import { BRAND_NAME } from '@lib/constants';
import styles from './layout.module.css';
import styleUtils from '../utils.module.css';
import MobileMenu from '../mobile-menu';
import Footer from './footer';
import React, { useState } from 'react';
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton
} from '@clerk/nextjs';
import {
  NavigationMenuLink
} from '@components/ui/navigation-menu';
import { BreadcrumbPage } from '@components/ui/breadcrumb';
import { BreadcrumbSeparator } from '@components/ui/breadcrumb';
import { BreadcrumbLink } from '@components/ui/breadcrumb';
import { SidebarTrigger } from '@components/ui/sidebar';
import { BreadcrumbItem } from '@components/ui/breadcrumb';
import { Separator } from '@components/ui/separator';
import { Breadcrumb, BreadcrumbList } from '@components/ui/breadcrumb';
import { useGlobal } from '@lib/hooks/global-context';
import _ from 'lodash';
import { NotificationBell } from '@components/ui/notification-bell';
import { NotificationPanel } from '@components/ui/notification-panel';
import { useNotifications } from '@lib/hooks/use-notifications';
import { Button } from '@components/ui/button';

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

  // Add helper function to format path segment and remove any query params
  const formatPathSegment = (segment: string) => {
    // Remove any query parameters from the segment
    const cleanSegment = segment.split('?')[0];
    return _.capitalize(cleanSegment);
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
                  {/* Get the first part of the path without any query parameters */}
                  {(() => {
                    // Remove query params from the route before splitting
                    const routePath = activeRoute.split('?')[0];
                    const segments = routePath.split('/').filter(Boolean);
                    
                    return (
                      <>
                        {segments[0] && (
                          <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href={`/${segments[0]}`}>
                              {formatPathSegment(segments[0])}
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                        )}
                        
                        {segments.length > 1 && (
                          <>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                              <BreadcrumbPage>{formatPathSegment(segments[1])}</BreadcrumbPage>
                            </BreadcrumbItem>
                          </>
                        )}
                      </>
                    );
                  })()}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <main className={styles.main} style={layoutStyles}>
            <SkipNavContent />
            <div className={cn(styles.full, className)}>{children}</div>
          </main>
          <Footer />
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
