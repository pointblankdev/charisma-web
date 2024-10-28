import { kv } from "@vercel/kv";

export interface MarketplaceListing {
    contractId: string;           // NFT contract identifier
    tokenId: number;             // NFT token ID
    price: number;               // Price in STX microunits
    commission: number;          // Commission in basis points (e.g., 500 = 5%)
    owner: string;               // Owner's STX address
    royaltyAddress: string;      // Royalty recipient address
    royaltyPercent: number;      // Royalty percentage in basis points
    timestamp: number;           // When the item was listed
    name?: string;               // NFT name if available
    collection?: string;         // Collection name if available
    metadata?: {                 // Optional metadata
        image?: string;
        description?: string;
        attributes?: Record<string, any>;
    };
}

interface MarketplaceStats {
    totalListings: number;
    totalVolume: number;         // In STX microunits
    activeListings: number;
    collections: {
        [contractId: string]: {
            listings: number;
            volume: number;
        };
    };
}

export class MarketplaceService {
    /**
     * Add a new listing to the database
     */
    static async createListing(listing: MarketplaceListing): Promise<void> {
        const listingKey = `listing:${listing.contractId}:${listing.tokenId}`;

        // Store listing in main listings set
        await kv.set(listingKey, listing);

        // Add to collection index
        await kv.sadd(`collection:${listing.contractId}`, listingKey);

        // Add to owner index
        await kv.sadd(`owner:${listing.owner}`, listingKey);

        // Update stats
        await this.updateStatsOnCreate(listing);
    }

    /**
     * Remove a listing from the database
     */
    static async removeListing(contractId: string, tokenId: number): Promise<boolean> {
        const listingKey = `listing:${contractId}:${tokenId}`;

        // Get listing before deletion for cleanup
        const listing = await this.getListing(contractId, tokenId);
        if (!listing) return false;

        // Remove from main storage
        await kv.del(listingKey);

        // Remove from collection index
        await kv.srem(`collection:${contractId}`, listingKey);

        // Remove from owner index
        await kv.srem(`owner:${listing.owner}`, listingKey);

        // Update stats
        await this.updateStatsOnRemove(listing);

        return true;
    }

    /**
     * Get a specific listing
     */
    static async getListing(contractId: string, tokenId: number): Promise<MarketplaceListing | null> {
        const listing = await kv.get(`listing:${contractId}:${tokenId}`);
        return listing as MarketplaceListing | null;
    }

    /**
     * Get all listings for a collection
     */
    static async getCollectionListings(contractId: string): Promise<MarketplaceListing[]> {
        const listingKeys = await kv.smembers(`collection:${contractId}`);
        const listings = await Promise.all(
            listingKeys.map(key => kv.get(key))
        );
        return listings.filter(Boolean) as MarketplaceListing[];
    }

    /**
     * Get all listings for an owner
     */
    static async getOwnerListings(ownerAddress: string): Promise<MarketplaceListing[]> {
        const listingKeys = await kv.smembers(`owner:${ownerAddress}`);
        const listings = await Promise.all(
            listingKeys.map(key => kv.get(key))
        );
        return listings.filter(Boolean) as MarketplaceListing[];
    }

    /**
     * Get paginated listings
     */
    static async getListings(options: {
        offset?: number;
        limit?: number;
    } = {}): Promise<MarketplaceListing[]> {
        const { offset = 0, limit = 50 } = options;

        // Get all listing keys
        const allKeys = await kv.keys('listing:*');

        // Apply pagination
        const paginatedKeys = allKeys.slice(offset, offset + limit);

        // Fetch listings
        const listings = await Promise.all(
            paginatedKeys.map(key => kv.get(key))
        );

        return listings.filter(Boolean) as MarketplaceListing[];
    }

    /**
     * Get marketplace statistics
     */
    static async getStats(): Promise<MarketplaceStats> {
        const stats = await kv.get('marketplace:stats') as MarketplaceStats;
        return stats || {
            totalListings: 0,
            totalVolume: 0,
            activeListings: 0,
            collections: {}
        };
    }

    /**
     * Update listing metadata
     */
    static async updateListingMetadata(
        contractId: string,
        tokenId: number,
        metadata: Partial<MarketplaceListing>
    ): Promise<boolean> {
        const listingKey = `listing:${contractId}:${tokenId}`;
        const listing = await kv.get(listingKey);

        if (!listing) return false;

        const updatedListing = {
            ...listing,
            ...metadata,
            contractId,
            tokenId,
        };

        await kv.set(listingKey, updatedListing);
        return true;
    }

    /**
     * Update marketplace stats when creating a listing
     */
    private static async updateStatsOnCreate(listing: MarketplaceListing): Promise<void> {
        const stats = await this.getStats();

        // Update collection stats
        const collectionStats = stats.collections[listing.contractId] || { listings: 0, volume: 0 };
        collectionStats.listings++;

        stats.collections[listing.contractId] = collectionStats;
        stats.totalListings++;
        stats.activeListings++;

        await kv.set('marketplace:stats', stats);
    }

    /**
     * Update marketplace stats when removing a listing
     */
    private static async updateStatsOnRemove(listing: MarketplaceListing): Promise<void> {
        const stats = await this.getStats();

        const collectionStats = stats.collections[listing.contractId];
        if (collectionStats) {
            collectionStats.listings--;
            if (collectionStats.listings <= 0) {
                delete stats.collections[listing.contractId];
            }
        }

        stats.activeListings--;

        await kv.set('marketplace:stats', stats);
    }
}