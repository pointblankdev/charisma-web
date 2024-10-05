import Image from "next/image"
import { PlusCircledIcon } from "@radix-ui/react-icons"
import { NFTArtwork } from "@components/marketplace/nft-artwork"
import { NFTEmptyPlaceholder } from "@components/marketplace/nft-empty-placeholder"
import { Sidebar } from "@components/marketplace/sidebar"
import { featuredNFTs, recentlyAddedNFTs, NFT } from "@lib/data/marketplace/nfts"
import { collections } from "@lib/data/marketplace/collections"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { Button } from "@components/ui/button"
import { Separator } from "@components/ui/separator"
import { ScrollArea, ScrollBar } from "@components/ui/scroll-area"
import Page from "@components/page"
import { SkipNavContent } from "@reach/skip-nav"
import Layout from "@components/layout/layout"
import { useMemo } from "react"

export default function NFTMarketplacePage() {
  const metadata = {
    title: "Digital Artists' Gallery",
    description: "Digital art gallery featuring the top artists on Stacks.",
  }

  const allNFTs = useMemo(() => [...featuredNFTs, ...recentlyAddedNFTs], []);

  const digitalArtNFTs = useMemo(() =>
    allNFTs.filter(nft => nft.type === "image" || nft.type === "gif"),
    [allNFTs]);

  const musicVideoNFTs = useMemo(() =>
    allNFTs.filter(nft => nft.type === "video" || nft.type === "audio"),
    [allNFTs]);

  const recentDigitalArtNFTs = useMemo(() =>
    digitalArtNFTs.slice(0, 10), // Assuming we want to show the 10 most recent
    [digitalArtNFTs]);

  const recentAudioVideoNFTs = useMemo(() =>
    musicVideoNFTs.slice(0, 10), // Assuming we want to show the 10 most recent
    [musicVideoNFTs]);

  const renderNFTSection = (title: string, description: string, nfts: NFT[], recent = false) => (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="relative">
        <ScrollArea>
          <div className="flex pb-4 space-x-4">
            {nfts.map((nft) => (
              <NFTArtwork
                key={nft.name}
                nft={nft}
                className={recent ? "w-[150px]" : "w-[250px]"}
                aspectRatio="square"
                width={recent ? 150 : 250}
                height={recent ? 150 : 250}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </>
  );

  return (
    <Page meta={metadata} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="md:hidden">
          <Image
            src="/examples/nft-marketplace-light.png"
            width={1280}
            height={1114}
            alt="NFT Marketplace"
            className="block dark:hidden"
          />
          <Image
            src="/examples/nft-marketplace-dark.png"
            width={1280}
            height={1114}
            alt="NFT Marketplace"
            className="hidden dark:block"
          />
        </div>
        <div className="hidden md:block">
          <div className="border-t">
            <div className="">
              <div className="grid lg:grid-cols-5">
                <Sidebar collections={collections} className="hidden lg:block" />
                <div className="col-span-3 lg:col-span-4 lg:border-l">
                  <div className="h-full px-4 py-6 lg:px-8">
                    <Tabs defaultValue="all" className="h-full space-y-6">
                      <div className="flex items-center space-between">
                        <TabsList>
                          <TabsTrigger value="all" className="relative">
                            All
                          </TabsTrigger>
                          {/* <TabsTrigger value="digital-art">Digital Art</TabsTrigger>
                          <TabsTrigger value="music-video">Audio / Video</TabsTrigger> */}
                        </TabsList>
                        <div className="ml-auto mr-4">
                          {/* <Button>
                            <PlusCircledIcon className="w-4 h-4 mr-2" />
                            Request Listing
                          </Button> */}
                        </div>
                      </div>
                      <TabsContent
                        value="all"
                        className="p-0 border-none outline-none"
                      >
                        {renderNFTSection(
                          "Charisma Picks",
                          "Top picks from our curators. Updated daily.",
                          featuredNFTs
                        )}
                        <div className="mt-6" />
                        {renderNFTSection(
                          "Recently Added",
                          "The latest additions to our gallery.",
                          recentlyAddedNFTs,
                          true
                        )}
                      </TabsContent>
                      <TabsContent
                        value="digital-art"
                        className="h-full flex-col border-none p-0 data-[state=active]:flex"
                      >
                        {digitalArtNFTs.length > 0 ? (
                          <>
                            {renderNFTSection(
                              "Digital Art",
                              "Explore the collection of digital art.",
                              digitalArtNFTs
                            )}
                            <div className="mt-6" />
                            {renderNFTSection(
                              "Recently Added Digital Art",
                              "The latest digital art additions to our gallery.",
                              recentDigitalArtNFTs,
                              true
                            )}
                          </>
                        ) : (
                          <NFTEmptyPlaceholder />
                        )}
                      </TabsContent>
                      <TabsContent
                        value="music-video"
                        className="h-full flex-col border-none p-0 data-[state=active]:flex"
                      >
                        {musicVideoNFTs.length > 0 ? (
                          <>
                            {renderNFTSection(
                              "Audio / Video",
                              "Explore the collection of audio and video art.",
                              musicVideoNFTs
                            )}
                            <div className="mt-6" />
                            {renderNFTSection(
                              "Recently Added Audio / Video",
                              "The latest audio and video additions to our gallery.",
                              recentAudioVideoNFTs,
                              true
                            )}
                          </>
                        ) : (
                          <NFTEmptyPlaceholder />
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </Page>
  )
}