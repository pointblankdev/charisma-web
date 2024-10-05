import { cn } from "@lib/utils"
import { Button } from "@components/ui/button"
import { ScrollArea } from "@components/ui/scroll-area"
import { Collection } from "@lib/data/marketplace/collections"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collections: Collection[]
}

export function Sidebar({ className, collections }: SidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="py-4 space-y-4">
        <div className="px-3 py-2">
          <h2 className="px-4 mb-2 text-lg font-semibold tracking-tight">
            Explore
          </h2>
          <div className="space-y-1">
            <Button variant="outline" className="justify-start w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Discover
            </Button>
            <Button disabled variant="ghost" className="justify-start w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
              </svg>
              Popular Creators
            </Button>
            <Button disabled variant="ghost" className="justify-start w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              Categories
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="px-4 mb-2 text-lg font-semibold tracking-tight">
            My NFTs
          </h2>
          <div className="space-y-1">
            <Button disabled variant="ghost" className="justify-start w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Owned
            </Button>
            <Button disabled variant="ghost" className="justify-start w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              Favorited
            </Button>
            <Button disabled variant="ghost" className="justify-start w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Activity
            </Button>
          </div>
        </div>
        <div className="py-2">
          <h2 className="relative text-lg font-semibold tracking-tight px-7">
            Crates
          </h2>
          <ScrollArea className="h-full px-1">
            <div className="p-2 space-y-1">
              {collections?.map((collection, i) => (
                <Button
                  disabled
                  key={`${collection}-${i}`}
                  variant="ghost"
                  className="justify-start w-full font-normal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                  {collection}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}