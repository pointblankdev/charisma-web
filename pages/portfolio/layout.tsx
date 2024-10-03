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
    title: "SIP10 Tokens",
    href: "/portfolio",
  },
  // {
  //   title: "SIP13 Tokens",
  //   href: "/portfolio/sip13",
  // },
  {
    title: "SIP9 Tokens",
    href: "/portfolio/sip9",
  },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (

    <Page meta={meta} fullViewport>
      <Layout>
        <div className="m-2 space-y-6 sm:container sm:mx-auto sm:py-10">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-semibold tracking-tight text-secondary">Portfolio</h2>
            <p className="text-sm text-muted-foreground">
              View, manage and grow your bag on Charisma.
            </p>
          </div>
          {/* <Separator className="my-6" /> */}
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="lg:w-1/5">
              <SidebarNav items={sidebarNavItems} />
            </aside>
            <div className="flex-1">
              {children}
            </div>
          </div>
        </div>
      </Layout>
    </Page >
  )
}
