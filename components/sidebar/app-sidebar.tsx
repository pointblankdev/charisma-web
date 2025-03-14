import { BookOpen, ChartLine, Coins, ExternalLink, Flame, Github, MessageCircle, Network, TrendingUp } from "lucide-react"
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
import { toggleSession, userSession } from "@components/stacks-session/connect"
import { Button } from "@components/ui/button"
import { LogOut } from "lucide-react"
import { NavUser } from "./nav-user"

// Menu items.
const items = [
    {
        title: "Swap Tokens",
        url: "/swap",
        icon: BsCurrencyExchange,
    },
    {
        title: "Earn Yield",
        url: "/vaults",
        icon: TrendingUp,
    },
    {
        title: "Token Analytics",
        url: "https://kraxel.io/analysis",
        icon: ChartLine,
        external: true,
    },
    {
        title: "Meme Tools",
        url: "/meme-tools",
        icon: MessageCircle,
    },
    {
        title: "The Rulebook",
        url: "/rulebook",
        icon: BookOpen,
    },
    {
        title: "Tokens",
        url: "/tokens",
        icon: Coins,
    },
    {
        title: "Blaze (Preview)",
        url: "https://signet-omega.vercel.app/",
        icon: Flame,
        external: true,
    },
]



export function AppSidebar() {
    const isSignedIn = userSession?.isUserSignedIn();
    const userAddress = isSignedIn ? userSession.loadUserData().profile.stxAddress.mainnet : '';
    const shortAddress = userAddress ? `${userAddress.slice(0, 4)}...${userAddress.slice(-4)}` : '';

    const data = {
        user: {
            name: "Stacks Wallet",
            email: shortAddress,
            avatar: "/stx-logo.png",
        },
    }
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
                                            <span className="text-md"><div className="flex items-center gap-2">{item.title} {item.external ? <ExternalLink className="size-3 mt-0.5" /> : ''}</div></span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            {/* <SidebarFooter>
                <SidebarMenuButton className="group/session">
                    <Link href="#" onClick={toggleSession} className="flex items-center gap-2 px-2 py-2 group-hover/session:text-foreground">
                        <LogOut className="size-4" />
                        <span className="text-md">{isSignedIn ? `Sign Out` : 'Connect Wallet'}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarFooter> */}
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />

        </Sidebar>
    )
}
