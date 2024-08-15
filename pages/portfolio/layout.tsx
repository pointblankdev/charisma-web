import { Separator } from "@components/ui/separator"
import { SidebarNav } from "@components/settings/sidebar-nav"
import Layout from "@components/layout/layout"
import Page from "@components/page"
import Link from "next/link"
import { META_DESCRIPTION } from "@lib/constants"

const meta = {
  title: 'Charisma | Settings',
  description: META_DESCRIPTION
};

const sidebarNavItems = [
  {
    title: "Fungible Tokens",
    href: "/portfolio/fungible-tokens",
  },
  {
    title: "Profile",
    href: "/portfolio/profile",
  },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (

    <Page meta={meta} fullViewport>
      <Layout>
        <div className="sm:container sm:mx-auto sm:py-10 space-y-6 m-2">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-semibold tracking-tight text-secondary">Portfolio</h2>
            <p className="text-muted-foreground text-sm">
              View, manage and grow your bag on Charisma.
            </p>
          </div>
          {/* <Separator className="my-6" /> */}
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            {/* <aside className="lg:w-1/5">
              <SidebarNav items={sidebarNavItems} />
            </aside> */}
            <div className="flex-1">
              {children}
            </div>
          </div>
        </div>
      </Layout>
    </Page >
  )
}
