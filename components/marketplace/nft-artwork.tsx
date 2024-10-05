import Image from "next/image"
import { PlusCircledIcon } from "@radix-ui/react-icons"
import { cn } from "@lib/utils"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@components/ui/context-menu"
import { NFT } from "@lib/data/marketplace/nfts"
import { collections } from "@lib/data/marketplace/collections"

interface NFTArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  nft: NFT
  aspectRatio?: "portrait" | "square"
  width?: number
  height?: number
}

export function NFTArtwork({
  nft,
  aspectRatio = "portrait",
  width,
  height,
  className,
  ...props
}: NFTArtworkProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="overflow-hidden rounded-md">
            <Image
              src={nft.cover}
              alt={nft.name}
              width={width}
              height={height}
              className={cn(
                "h-auto w-auto object-cover transition-all opacity-90 hover:opacity-100",
                aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
              )}
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-40">
          <ContextMenuItem>View Details</ContextMenuItem>
          <ContextMenuItem>Make Offer</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Add to Crate</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>
                <PlusCircledIcon className="w-4 h-4 mr-2" />
                New Create
              </ContextMenuItem>
              <ContextMenuSeparator />
              {collections.map((collection) => (
                <ContextMenuItem key={collection}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-4 h-4 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                  {collection}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem>Share</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className="space-y-1 text-sm">
        <h3 className="font-medium leading-none">{nft.name}</h3>
        <p className="text-xs text-muted-foreground">{nft.artist}</p>
        {/* <p className="text-xs font-medium">{nft.price} CHA</p> */}
      </div>
    </div>
  )
}