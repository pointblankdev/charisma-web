import React from 'react';
import { useEffect, useCallback, useState } from 'react';
import { Drawer, DrawerContent } from '@components/ui/drawer';
import { cn } from '@lib/utils';
import Image from 'next/image';
import { API_URL } from '@lib/constants';
import {
  Copy,
  Download,
  ExternalLink,
  Gift,
  Info,
  Link,
  Loader2,
  PlusCircle,
  Send,
  Share2
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from '@components/ui/context-menu';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  useDraggable,
  useDroppable,
  DragOverEvent
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';
import { usePersistedState } from '@lib/hooks/use-persisted-state';
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs';
import { useToast } from '@components/ui/use-toast';
import { COLLECTIONS } from './collections';
import ListNFTDialog from './list-nft-dialog';
import TokenList from './token-drawer';

interface GlobalDrawerProps {
  open: boolean;
  onClose: () => void;
  userAddress: string;
}

interface NFTItem {
  id: string;
  image: string;
  name: string;
  slot: number;
  contract: string;
  metadata?: {
    image: string;
    name: string;
    // Add other metadata fields as needed
  };
}

interface CollectionState {
  slots: Record<string, number>; // tokenId -> slot mapping
  activeTab: string;
}

interface DraggableSlotProps {
  item: NFTItem | null;
  index: number;
  isDraggedOver: boolean;
}

interface NFTContextMenuProps {
  item: NFTItem;
  children: React.ReactNode;
  onListNFT: () => void;
}

function NFTContextMenu({ item, children, onListNFT }: NFTContextMenuProps) {
  const { toast } = useToast();

  const handleCopyContract = () => {
    navigator.clipboard.writeText(item.contract);
    toast({ title: 'Contract address copied to clipboard', description: item.contract });
  };

  const handleViewOnExplorer = () => {
    window.open(`https://explorer.stacks.co/txid/${item.contract}`, '_blank');
  };

  const handleCopyLink = () => {
    const link = `https://gamma.io/collections/${item.contract}/${item.id}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Link copied to clipboard', description: link });
  };

  const handleCopyImageUrl = () => {
    navigator.clipboard.writeText(item.image);
    toast({ title: 'Image URL copied to clipboard', description: item.image });
  };

  const handleTwitterShare = () => {
    const text = `Check out my ${item.name} from the ${item.contract.split('.')[1]} collection!`;
    const imageUrl = item.image;

    const twitterUrl = new URL('https://twitter.com/intent/tweet');
    twitterUrl.searchParams.append('text', text);
    twitterUrl.searchParams.append('url', imageUrl);
    twitterUrl.searchParams.append('hashtags', 'NFT,Stacks,Bitcoin');
    twitterUrl.searchParams.append('via', 'CharismaBTC');

    window.open(twitterUrl.toString(), '_blank');
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64 bg-black/90 border-white/10 text-white/90 animate-in fade-in-0 zoom-in-95">
        <div className="px-2 py-1.5 text-xs font-semibold text-white/60">
          {item.name}
          <div className="text-[10px] font-normal text-white/40">
            Token #{item.id} • {item.contract.split('.')[1]}
          </div>
        </div>
        <ContextMenuSeparator className="bg-white/10" />

        <ContextMenuItem
          className="hover:bg-white/10 focus:bg-white/10"
          onClick={handleCopyImageUrl}
        >
          <Info className="w-4 h-4 mr-2 opacity-50" />
          Copy Image URL
        </ContextMenuItem>

        <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10" onClick={onListNFT}>
          <PlusCircle className="w-4 h-4 mr-2 opacity-50" />
          List NFT
        </ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger className="hover:bg-white/10 focus:bg-white/10">
            <Share2 className="w-4 h-4 mr-2 opacity-50" />
            Share
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-black/90 border-white/10">
            <ContextMenuItem
              className="hover:bg-white/10 focus:bg-white/10"
              onClick={handleCopyLink}
            >
              <Link className="w-4 h-4 mr-2 opacity-50" />
              Copy Link
            </ContextMenuItem>
            <ContextMenuItem
              className="hover:bg-white/10 focus:bg-white/10"
              onClick={handleTwitterShare}
            >
              <ExternalLink className="w-4 h-4 mr-2 opacity-50" />
              Share to Twitter
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10 text-white/50" disabled>
          <Send className="w-4 h-4 mr-2 opacity-50" />
          Send
          <span className="ml-auto text-[10px] text-white/25">Soon</span>
        </ContextMenuItem>

        <ContextMenuSeparator className="bg-white/10" />

        <ContextMenuItem
          className="hover:bg-white/10 focus:bg-white/10"
          onClick={handleCopyContract}
        >
          <Copy className="w-4 h-4 mr-2 opacity-50" />
          Copy Contract Address
        </ContextMenuItem>

        <ContextMenuItem
          className="hover:bg-white/10 focus:bg-white/10"
          onClick={handleViewOnExplorer}
        >
          <ExternalLink className="w-4 h-4 mr-2 opacity-50" />
          View on Explorer
        </ContextMenuItem>

        <ContextMenuSeparator className="bg-white/10" />

        <ContextMenuSub>
          <ContextMenuSubTrigger className="hover:bg-white/10 focus:bg-white/10">
            <PlusCircle className="w-4 h-4 mr-2 opacity-50" />
            More Actions
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-black/90 border-white/10">
            <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10 text-white/50" disabled>
              <Download className="w-4 h-4 mr-2 opacity-50" />
              Download Metadata
              <span className="ml-auto text-[10px] text-white/25">Soon</span>
            </ContextMenuItem>
            <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10 text-white/50" disabled>
              <Gift className="w-4 h-4 mr-2 opacity-50" />
              Gift NFT
              <span className="ml-auto text-[10px] text-white/25">Soon</span>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}

interface DraggableSlotProps {
  item: NFTItem | null;
  index: number;
  isDraggedOver: boolean;
}

function DraggableSlot({ item, index, isDraggedOver }: DraggableSlotProps) {
  const [isListing, setIsListing] = useState(false);
  const [showListingDialog, setShowListingDialog] = useState(false);

  // Set up draggable
  const { attributes, listeners, setNodeRef: setDraggableRef, isDragging } = useDraggable({
    id: index.toString(),
    data: { item }
  });

  // Set up droppable
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: index.toString()
  });

  // Combine refs for both draggable and droppable
  const ref = (node: HTMLDivElement | null) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  const handleListingStart = useCallback(() => {
    setIsListing(true);
  }, []);

  const slot = (
    <div
      ref={ref}
      {...attributes}
      {...listeners}
      className={cn(
        'relative w-full h-full',
        'border border-white/5',
        'transition-all duration-150',
        'group',
        // Empty slot styling
        !item && 'hover:bg-white/5',
        !item && 'bg-grid-pattern',
        // Dragging states
        isDragging && 'opacity-30',
        isDraggedOver && 'ring-2 ring-primary',
        // Cursor
        item ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
        // Disable dragging when listing
        isListing && 'pointer-events-none'
      )}
    >
      {item && !isDragging && (
        <div
          className={cn(
            'absolute inset-1',
            'rounded-sm overflow-hidden',
            'ring-1 ring-white/10',
            'transition-all duration-150',
            'bg-black/40',
            'group-hover:ring-white/20',
            'group-hover:brightness-110',
            // Add grayscale when listing
            isListing && 'grayscale opacity-50'
          )}
        >
          <Image
            src={item.image}
            alt={item.name}
            className={cn(
              'object-cover',
              'transition-transform duration-150',
              'group-hover:scale-105'
            )}
            fill
            sizes="96px"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />

          {/* Show "Listing" indicator when in listing state */}
          {isListing && (
            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white bg-black/50">
              Listing...
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Don't wrap in context menu if item is currently being listed
  if (!item || isListing) {
    return slot;
  }

  return (
    <>
      <NFTContextMenu item={item} onListNFT={() => setShowListingDialog(true)}>
        {slot}
      </NFTContextMenu>

      <ListNFTDialog
        isOpen={showListingDialog}
        onClose={() => setShowListingDialog(false)}
        item={item}
        onListingStart={handleListingStart}
      />
    </>
  );
}

function DragOverlayContent({ item }: { item: NFTItem }) {
  return (
    <div
      className={cn(
        'w-24 h-24',
        'rounded-sm',
        'shadow-2xl shadow-black/50',
        'transition-transform duration-100',
        'scale-110'
      )}
    >
      <div className="absolute overflow-hidden rounded-sm inset-1 ring-2 ring-primary/50">
        <Image src={item.image} alt={item.name} className="object-cover" fill sizes="96px" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
      </div>
    </div>
  );
}

function DragOverlayPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(children, document.body);
}

export function GlobalDrawer({ open, onClose, userAddress }: GlobalDrawerProps) {
  const fetchedCollections = React.useRef(new Set<string>());
  const { toast } = useToast();
  // Persist inventory state
  const [inventoryState, setInventoryState] = usePersistedState<any>('inventory-state', {
    slots: {},
    activeTab: COLLECTIONS[0].id
  });

  const [collectionsData, setCollectionsData] = useState<Record<string, NFTItem[]>>({});
  const [loadingCollections, setLoadingCollections] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedOverId, setDraggedOverId] = useState<string | null>(null);

  // Filter out collections with no NFTs
  const nonEmptyCollections = COLLECTIONS.filter(collection => {
    const items = collectionsData[collection.id] || [];
    return items.length > 0 || loadingCollections.has(collection.id);
  });

  // Get current collection data
  const currentCollection = COLLECTIONS.find(c => c.id === inventoryState.activeTab)!;
  const currentInventory = collectionsData[currentCollection.id] || [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  );

  const fetchCollection = useCallback(
    async (collection: typeof COLLECTIONS[number]) => {
      if (!userAddress || !open) return;

      // Check if we've already fetched this collection for this user
      const fetchKey = `${collection.id}-${userAddress}`;
      if (fetchedCollections.current.has(fetchKey)) {
        return;
      }

      setLoadingCollections(prev => new Set([...prev, collection.id]));
      fetchedCollections.current.add(fetchKey);

      try {
        const response = await fetch(
          `${API_URL}/api/v0/nfts/list?contractAddress=${collection.contract}&userAddress=${userAddress}`
        );
        const data = await response.json();

        if (data.ownedTokenIds) {
          // Create items first with default images, then update with metadata
          const items = data.ownedTokenIds.map((tokenId: string) => {
            const slot = inventoryState.slots[`${collection.id}-${tokenId}`] ?? -1;
            // Use default image pattern based on collection
            let defaultImage = '';
            if (collection.contract.includes('odins-raven')) {
              defaultImage = `https://charisma.rocks/sip9/odins-raven/img/${tokenId}.gif`;
            } else if (collection.contract.includes('memobots')) {
              defaultImage = `https://charisma.rocks/sip9/memobots/${tokenId}.png`;
            }

            return {
              id: tokenId,
              contract: collection.contract,
              name: `${collection.name} #${tokenId}`,
              slot,
              image: defaultImage
            };
          });

          // Assign slots immediately
          let nextSlot = 0;
          const itemsWithSlots = items.map((item: { slot: number }) => {
            if (item.slot === -1) {
              while (items.some((i: { slot: number }) => i.slot === nextSlot)) {
                nextSlot++;
              }
              item.slot = nextSlot++;
            }
            return item;
          });

          // Update state with initial items
          setCollectionsData(prev => ({
            ...prev,
            [collection.id]: itemsWithSlots
          }));

          // Update slot persistence
          setInventoryState((prev: { slots: any }) => ({
            ...prev,
            slots: {
              ...prev.slots,
              ...Object.fromEntries(
                itemsWithSlots.map((item: { id: any; slot: any }) => [
                  `${collection.id}-${item.id}`,
                  item.slot
                ])
              )
            }
          }));

          // Then fetch metadata in the background
          Promise.all(
            itemsWithSlots.map(async (item: { id: any; name: any; image: any }) => {
              try {
                const metadataResponse = await fetch(
                  `${API_URL}/api/v0/nfts/uri?contractAddress=${collection.contract}&tokenId=${item.id}`
                );
                const metadata = await metadataResponse.json();

                return {
                  ...item,
                  name: metadata.name || item.name,
                  image: metadata.image || item.image,
                  metadata
                };
              } catch (error) {
                console.error(`Error fetching metadata for token ${item.id}:`, error);
                return item; // Keep original item on error
              }
            })
          ).then(itemsWithMetadata => {
            setCollectionsData(prev => ({
              ...prev,
              [collection.id]: itemsWithMetadata
            }));
          });
        }
      } catch (error) {
        console.error(`Error fetching collection ${collection.name}:`, error);
        toast({ title: `Failed to load ${collection.name}` });
        fetchedCollections.current.delete(fetchKey);
      } finally {
        setLoadingCollections(prev => {
          const next = new Set(prev);
          next.delete(collection.id);
          return next;
        });
      }
    },
    [userAddress, open, setInventoryState, inventoryState.slots, toast]
  );

  // Clear fetched collections when drawer closes or user changes
  useEffect(() => {
    if (!open) {
      fetchedCollections.current.clear();
    }
  }, [open, userAddress]);

  useEffect(() => {
    if (open && userAddress) {
      COLLECTIONS.forEach(collection => {
        fetchCollection(collection);
      });
    }
  }, [open, userAddress, fetchCollection]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    setDraggedOverId(event.over?.id.toString() ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString());
      const newIndex = parseInt(over.id.toString());

      setCollectionsData(prev => {
        const collection = { ...prev };
        const items = [...(collection[currentCollection.id] || [])];
        const movedItem = items.find(item => item.slot === oldIndex);
        const targetItem = items.find(item => item.slot === newIndex);

        if (movedItem) {
          movedItem.slot = newIndex;
          if (targetItem) {
            targetItem.slot = oldIndex;
          }
        }

        collection[currentCollection.id] = items;
        return collection;
      });

      // Update persisted slots
      setInventoryState((prev: { slots: any }) => ({
        ...prev,
        slots: {
          ...prev.slots,
          ...Object.fromEntries(
            currentInventory.map(item => [`${currentCollection.id}-${item.id}`, item.slot])
          )
        }
      }));
    }

    setActiveId(null);
    setDraggedOverId(null);
  };

  const activeItem = activeId
    ? currentInventory.find(item => item.slot === parseInt(activeId))
    : null;

  // Render helper for the content based on view mode
  const renderContent = () => {
    if (inventoryState.viewMode === 'tokens') {
      return <TokenList />;
    }

    // NFT Grid Content
    return (
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          className={cn(
            'grid h-full gap-1',
            'grid-cols-[repeat(auto-fill,minmax(6rem,1fr))]',
            'auto-rows-[6rem]',
            'p-0.5',
            'rounded-lg'
          )}
        >
          {/* Existing NFT grid items */}
          {Array.from({ length: 150 }).map((_, index) => (
            <DraggableSlot
              key={`${currentCollection.id}-${index}`}
              index={index}
              item={currentInventory.find(item => item.slot === index) || null}
              isDraggedOver={draggedOverId === index.toString()}
            />
          ))}
        </div>

        <DragOverlayPortal>
          <DragOverlay dropAnimation={null}>
            {activeItem ? <DragOverlayContent item={activeItem} /> : null}
          </DragOverlay>
        </DragOverlayPortal>
      </DndContext>
    );
  };

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="h-[80vh] bg-black/40 backdrop-blur-md border-t border-white/10">
        <div className="flex flex-col h-full">
          {/* Main view mode tabs */}
          <div className="border-b border-white/5">
            <Tabs
              value={inventoryState.viewMode}
              onValueChange={value =>
                setInventoryState((prev: any) => ({ ...prev, viewMode: value }))
              }
              className="w-full px-4 py-2"
            >
              <TabsList className="bg-white/5">
                <TabsTrigger value="tokens" className="text-xs data-[state=active]:bg-white/10">
                  Tokens
                </TabsTrigger>
                <TabsTrigger
                  value="nfts"
                  disabled
                  className="text-xs data-[state=active]:bg-white/10"
                >
                  NFTs
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Collection tabs - only show for NFT view */}
            {inventoryState.viewMode === 'nfts' && (
              <Tabs
                value={inventoryState.activeTab}
                onValueChange={value =>
                  setInventoryState((prev: any) => ({ ...prev, activeTab: value }))
                }
                className="px-4 pb-2 overflow-x-scroll"
              >
                <TabsList className="bg-white/5">
                  {nonEmptyCollections.map(collection => (
                    <TabsTrigger
                      key={collection.id}
                      value={collection.id}
                      className="text-xs data-[state=active]:bg-white/10"
                    >
                      {collection.name}
                      {loadingCollections.has(collection.id) && (
                        <Loader2 className="w-3 h-3 ml-2 animate-spin" />
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>

          {/* Main content area */}
          <div className="relative flex-1 w-full h-full overflow-y-scroll">{renderContent()}</div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function useGlobalDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'i') {
        event.preventDefault();
        toggle();
      }

      if (event.key === 'Escape' && isOpen) {
        close();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle, close, isOpen]);

  return {
    isOpen,
    open,
    close,
    toggle
  };
}
