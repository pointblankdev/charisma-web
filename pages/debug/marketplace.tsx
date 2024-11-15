import React, { useState, useMemo } from 'react';
import { GetStaticProps } from 'next';
import { ArrowUpDown, Search, RefreshCw, Eye, Timer, Trash2, Tag, ExternalLink, Edit, Info } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Badge } from '@components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { ScrollArea } from '@components/ui/scroll-area';
import { Label } from '@components/ui/label';
import { MarketplaceService, type MarketplaceListing } from '@lib/data/marketplace/marketplace-service';
import { cn } from '@lib/utils';
import { useCollectionInfo } from 'pages/shop';

interface Props {
  data: {
    listings: MarketplaceListing[];
    lastUpdate: string;
  };
}

const ListingRow = ({ listing, onEdit, onRemove }: { 
  listing: MarketplaceListing; 
  onEdit: (listing: MarketplaceListing) => void;
  onRemove: (contractId: string, tokenId: number) => void;
}) => {
  const collectionInfo = useCollectionInfo(listing.contractId);
  
  return (
    <tr className="border-b">
      <td className="p-2">
        <div className="flex items-center gap-2">
          {listing.metadata?.image && (
            <Image
              src={listing.metadata.image}
              alt={listing.metadata?.name || 'NFT'}
              width={32}
              height={32}
              className="rounded-md"
            />
          )}
          <div>
            <div className="font-medium">{listing.metadata?.name || 'Unknown'}</div>
            <div className="text-xs text-muted-foreground">#{listing.tokenId}</div>
          </div>
        </div>
      </td>
      <td className="p-2">{collectionInfo?.name || listing.contractId.split('.')[1]}</td>
      <td className="p-2 font-mono text-right">{(listing.price / 1_000_000).toLocaleString()} STX</td>
      <td className="p-2 font-mono">
        {listing.owner?.slice(0, 4)}...{listing.owner?.slice(-4)}
      </td>
      <td className="p-2 whitespace-nowrap text-muted-foreground">
        {new Date(listing.timestamp).toLocaleDateString()}
      </td>
      <td className="p-2">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(listing)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(listing.contractId, listing.tokenId)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

const CollectionCard = ({ contractId, listings }: { contractId: string; listings: MarketplaceListing[] }) => {
  const collectionInfo = useCollectionInfo(contractId);
  const totalValue = listings.reduce((sum, l) => sum + l.price, 0) / 1_000_000;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{collectionInfo?.name || contractId.split('.')[1]}</span>
          <Badge variant="outline">{listings.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Value</span>
            <span className="font-mono">{totalValue.toLocaleString()} STX</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Avg Price</span>
            <span className="font-mono">
              {(totalValue / listings.length).toLocaleString()} STX
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  try {
    const listings = await MarketplaceService.getListings();
    return {
      props: {
        data: {
          listings,
          lastUpdate: new Date().toISOString(),
        }
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Failed to fetch marketplace data:', error);
    return {
      props: {
        data: {
          listings: [],
          lastUpdate: new Date().toISOString(),
        }
      },
      revalidate: 60
    };
  }
};

export default function MarketplaceDebug({ data: { listings: initialListings, lastUpdate } }: Props) {
  const [listings, setListings] = useState<MarketplaceListing[]>(initialListings);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [activeTab, setActiveTab] = useState('listings');
  const lastUpdateDate = new Date(lastUpdate);

  const listingsByCollection = useMemo(() => {
    return listings.reduce((acc, listing) => {
      const collection = listing.contractId;
      if (!acc[collection]) acc[collection] = [];
      acc[collection].push(listing);
      return acc;
    }, {} as Record<string, MarketplaceListing[]>);
  }, [listings]);

  const filteredListings = useMemo(() => {
    if (!searchTerm) return listings;
    return listings.filter(listing => 
      listing.contractId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.tokenId.toString().includes(searchTerm)
    );
  }, [listings, searchTerm]);

  const stats = useMemo(() => {
    const total = listings.length;
    const totalValue = listings.reduce((sum, listing) => sum + listing.price, 0);
    const uniqueCollections = new Set(listings.map(l => l.contractId)).size;
    const uniqueOwners = new Set(listings.map(l => l.owner)).size;

    return {
      total,
      totalValue: totalValue / 1_000_000,
      uniqueCollections,
      uniqueOwners
    };
  }, [listings]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetch('/api/revalidate?path=/debug/marketplace');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRemoveListing = async (contractId: string, tokenId: number) => {
    try {
      await MarketplaceService.removeListing(contractId, tokenId);
      toast.success('Listing removed');
      handleRefresh();
    } catch (error) {
      toast.error('Failed to remove listing');
    }
  };

  return (
    <div className="container p-6 mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Marketplace Debug</h1>
          <p className="text-sm text-muted-foreground">Monitor and manage marketplace listings</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="w-4 h-4" />
            Last update: {lastUpdateDate.toLocaleTimeString()}
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 mb-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Tag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Info className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalValue.toLocaleString()} STX</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueCollections}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Unique Sellers</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueOwners}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by collection, name, or token ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-xl"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="listings">All Listings</TabsTrigger>
            <TabsTrigger value="collections">By Collection</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <div className="border rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">Collection</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-left">Owner</th>
                    <th className="p-2 text-left">Listed</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map(listing => (
                    <ListingRow 
                      key={`${listing.contractId}-${listing.tokenId}`} 
                      listing={listing}
                      onEdit={setSelectedListing}
                      onRemove={handleRemoveListing}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="collections">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(listingsByCollection).map(([contractId, listings]) => (
                <CollectionCard 
                  key={contractId} 
                  contractId={contractId} 
                  listings={listings} 
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedListing && (
        <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
          <DialogContent className='h-[600px]'>
            <DialogHeader>
              <DialogTitle>Edit Listing</DialogTitle>
              <DialogDescription>
                {selectedListing.contractId} #{selectedListing.tokenId}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-4">
                <pre className="p-4 font-mono text-sm rounded-lg bg-background">
                  {JSON.stringify(selectedListing, null, 2)}
                </pre>
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedListing(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

