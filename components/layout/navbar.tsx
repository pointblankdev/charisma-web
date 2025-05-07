import Image from 'next/image';
import Link from 'next/link';
import charisma from '@public/charisma.png';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
} from '@components/ui/navigation-menu';
import { APPS } from '@lib/apps';
import { cn } from '@lib/utils';

export default function Navbar() {
    return (
        <header className="w-full sticky top-0 z-20 backdrop-blur-md bg-card/60 supports-[backdrop-filter]:bg-card/40 border-b border-muted-foreground/10 shadow-sm">
            <div className="container mx-auto flex items-center justify-between h-16 px-4">
                {/* Brand */}
                <Link href="/" className="flex items-center space-x-2">
                    <Image src={charisma} alt="Charisma Logo" width={32} height={32} className="size-6" />
                    <span className="font-semibold tracking-tight text-lg">Charisma</span>
                </Link>

                {/* Navigation */}
                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList>
                        {/* Products Dropdown */}
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid gap-1 p-4 rounded-lg border border-muted-foreground/10 w-72 animate-in fade-in-50 data-[motion=from-start]:slide-in-from-left-52 data-[motion=from-end]:slide-in-from-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion=to-end]:slide-out-to-right-52 origin-top">
                                    {APPS.filter(app => app.isProduct).map((app) => (
                                        <li key={app.href}>
                                            <NavigationMenuLink asChild>
                                                <a
                                                    href={app.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={cn(
                                                        'block rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground',
                                                    )}
                                                >
                                                    {app.title}
                                                </a>
                                            </NavigationMenuLink>
                                        </li>
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        {/* Solutions Dropdown (placeholder links) */}
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
                            <NavigationMenuContent >
                                <ul className="grid gap-1 p-4 rounded-lg border border-muted-foreground/10 w-72 animate-in fade-in-50 data-[motion=from-start]:slide-in-from-left-52 data-[motion=from-end]:slide-in-from-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion=to-end]:slide-out-to-right-52 origin-top">
                                    <li>
                                        <NavigationMenuLink asChild>
                                            <a href="https://blaze.charisma.rocks" className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">
                                                Blaze Protocol
                                            </a>
                                        </NavigationMenuLink>
                                    </li>
                                    <li>
                                        <NavigationMenuLink asChild>
                                            <a href="https://tokens.charisma.rocks" className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">
                                                Token Data API
                                            </a>
                                        </NavigationMenuLink>
                                    </li>
                                    <li>
                                        <NavigationMenuLink asChild>
                                            <a href="https://metadata.charisma.rocks" className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">
                                                Metadata Hosting
                                            </a>
                                        </NavigationMenuLink>
                                    </li>
                                    <li>
                                        <NavigationMenuLink asChild>
                                            <a href='https://charisma-contract-search.vercel.app/' className="block rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground">
                                                Contract Search
                                            </a>
                                        </NavigationMenuLink>
                                    </li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Placeholder for auth or secondary links */}
                <div className="flex items-center space-x-4">
                    <Link href="https://discord.gg/gbdt4YaPwd" className="text-sm font-medium hover:underline hidden md:inline">
                        Discord
                    </Link>
                </div>
            </div>
        </header>
    );
} 