import { BookOpen, ChartLine, Coins, ExternalLink, Flame, LogOut, MessageCircle, Network, Scale, Settings, ShieldAlert, SlidersHorizontal, TrendingUp, Zap } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarRail,
} from "@components/ui/sidebar"
import { BRAND_NAME } from "@lib/constants"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@lib/utils"
import charisma from '@public/charisma.png';
import styles from '../layout/layout.module.css';
import { BsCurrencyExchange } from "react-icons/bs"
import { Button } from "@components/ui/button"
import { SignedIn as ClerkSignedIn, SignedOut as ClerkSignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/router"

const SignedIn = ClerkSignedIn as any
const SignedOut = ClerkSignedOut as any

// Menu items - Web2 focused naming
const items = [
    {
        title: "Exchange",
        url: "/swap",
        icon: BsCurrencyExchange,
    },
    {
        title: "Invest",
        url: "/vaults",
        icon: TrendingUp,
    },
    {
        title: "Assets",
        url: "/tokens",
        icon: Coins,
    },
    {
        title: "Social",
        url: "/meme-tools",
        icon: MessageCircle,
    },
    {
        title: "Community",
        url: "/rulebook",
        icon: BookOpen,
    },
    {
        title: "Liquidity Pool Deployer",
        url: "/deployer",
        icon: Scale,
    },
    {
        title: "Subnet Deployer",
        url: "/subnet-deployer",
        icon: Flame,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
    {
        title: "Analytics",
        url: "https://kraxel.io/analysis",
        icon: ChartLine,
        external: true,
    },
    {
        title: "Download Signet",
        url: "https://signet-omega.vercel.app/download.html",
        icon: Zap,
        external: true,
    },
]


export function AppSidebar() {
    const { signOut } = useClerk();
    const router = useRouter();

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className='mb-2'>
                        <Link href="/" className={cn(styles.logo, 'flex items-center gap-1')}>
                            <Image src={charisma} alt="Logo" width="50" height="50" className="size-4" />
                            <span
                                style={{
                                    color: 'white',
                                    fontSize: '20px',
                                    lineHeight: 1.15,
                                    letterSpacing: '-0.05em',
                                    fontWeight: 700,
                                    textAlign: 'center'
                                }}
                            >
                                {BRAND_NAME}
                            </span>
                        </Link>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url} target={item.external ? '_blank' : ''} >
                                            <item.icon />
                                            <span className="text-md">
                                                <div className="flex items-center gap-2">
                                                    {item.title}
                                                    {item.external ? <ExternalLink className="size-3 mt-0.5" /> : ''}
                                                </div>
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SignedIn>
                <SidebarFooter>
                    <SidebarMenuButton asChild className="group/user contents">
                        <div className="flex flex-col w-full px-3 py-3 gap-3 bg-card/30 hover:bg-card/50 rounded-lg transition-colors border border-border/40">
                            <div className="flex items-center gap-3">
                                <div className="min-w-9 h-9 flex items-center justify-center">
                                    <UserButton
                                        afterSignOutUrl="/"
                                        appearance={{
                                            elements: {
                                                userButtonAvatarBox: "w-8 h-8",
                                                userButtonBox: "w-auto h-auto",
                                                userButtonTrigger: "w-full h-full p-0 focus:outline-none"
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">Account</span>
                                    <span className="text-xs text-muted-foreground">Settings & Profile</span>
                                </div>
                            </div>
                            <div className="w-full grid grid-cols-3 mt-1">
                                <Link
                                    href="/settings"
                                    className="flex items-center justify-center gap-1 text-xs py-1.5 border border-border rounded-l-md bg-card hover:bg-muted transition-colors font-medium"
                                >
                                    <Settings className="size-3 mr-0.5" />
                                    Account
                                </Link>
                                <Link
                                    href="/settings?tab=advanced"
                                    className="flex items-center justify-center gap-1 text-xs py-1.5 border-t border-b border-border bg-card hover:bg-muted transition-colors font-medium"
                                >
                                    <SlidersHorizontal className="size-3 mr-0.5" />
                                    Advanced
                                </Link>
                                <Link
                                    href="/settings?tab=security"
                                    className="flex items-center justify-center gap-1 text-xs py-1.5 border border-border rounded-r-md bg-card hover:bg-muted transition-colors font-medium"
                                >
                                    <ShieldAlert className="size-3 mr-0.5" />
                                    Security
                                </Link>
                            </div>
                        </div>
                    </SidebarMenuButton>
                </SidebarFooter>
            </SignedIn>

            <SignedOut>
                <SidebarFooter>
                    <SidebarMenuButton asChild className="group/auth h-24 border-0">
                        <div className="flex flex-col items-center justify-center gap-2 p-3 bg-card/30 hover:bg-card/50 rounded-lg transition-colors border border-border/40">
                            <p className="text-sm text-muted-foreground">Sign in to access more features</p>
                            <SignInButton mode="modal">
                                <Button className="w-full justify-center gap-2 items-center" size="sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                        <polyline points="10 17 15 12 10 7" />
                                        <line x1="15" y1="12" x2="3" y2="12" />
                                    </svg>
                                    Sign In
                                </Button>
                            </SignInButton>
                        </div>
                    </SidebarMenuButton>
                </SidebarFooter>
            </SignedOut>

            <SidebarRail />
        </Sidebar>
    )
}
