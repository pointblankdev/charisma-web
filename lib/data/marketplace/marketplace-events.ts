import Logger from "@lib/logger";
import { MarketplaceService, MarketplaceListing } from './marketplace-service';
import { kv } from '@vercel/kv';
import { EmbedBuilder } from '@tycrek/discord-hookr/dist/EmbedBuilder';

// Interface for sale events
interface SaleEvent {
  contractId: string;
  tokenId: number;
  price: number;
  commission: number;
  seller: string;
  buyer: string;
  royaltyAddress: string;
  royaltyPercent: number;
  timestamp: number;
  metadata?: {
    name?: string;
    collection?: string;
    attributes?: Record<string, any>;
  };
}

async function saveSaleEvent(sale: SaleEvent): Promise<void> {
  const key = `sale:${sale.contractId}:${sale.tokenId}:${sale.timestamp}`;
  await kv.set(key, sale);
  await kv.sadd(`sales:${sale.contractId}`, key);
  await kv.sadd(`seller:${sale.seller}:sales`, key);
  await kv.sadd(`buyer:${sale.buyer}:purchases`, key);

  // Update collection volume stats
  const stats = await MarketplaceService.getStats();
  const collectionStats = stats.collections[sale.contractId] || { listings: 0, volume: 0 };
  collectionStats.volume += sale.price;
  stats.collections[sale.contractId] = collectionStats;
  stats.totalVolume += sale.price;
  await kv.set('marketplace:stats', stats);
}

export const handleMarketplaceEvent = async (event: any, builder: EmbedBuilder) => {
  if (event.type !== 'SmartContractEvent') return builder;

  // Only handle events from the marketplace contract
  if (event.data.contract_identifier !== 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.marketplace-v6') return builder;

  const symbol = '🏪';
  const { op, ...data } = event.data.value;

  try {
    switch (op) {
      case 'LIST_ASSET':
        const listing: MarketplaceListing = {
          contractId: data.tradables,
          tokenId: data.tradable_id,
          price: data.price,
          commission: data.commission,
          owner: data.sender,
          royaltyAddress: data.royalty_address,
          royaltyPercent: data.royalty_percent,
          timestamp: Date.now(),
          // Metadata will be populated later via updateListingMetadata
          metadata: {}
        };

        await MarketplaceService.createListing(listing);

        builder.addField({
          name: `${symbol} Asset Listed`,
          value: [
            `Contract: ${data.tradables}`,
            `ID: ${data.tradable_id}`,
            `Price: ${data.price / 1000000} STX`, // Convert microSTX to STX for display
            `Commission: ${data.commission / 100}%` // Convert basis points to percentage
          ].join('\n')
        });
        break;

      case 'UNLIST_ASSET':
        await MarketplaceService.removeListing(data.tradables, data.tradable_id);

        builder.addField({
          name: `${symbol} Asset Unlisted`,
          value: `Contract: ${data.tradables}\nID: ${data.tradable_id}`
        });
        break;

      case 'PURCHASE_ASSET':
        // First get the listing details before removal
        const soldListing = await MarketplaceService.getListing(data.tradables, data.tradable_id);

        // Remove the listing
        await MarketplaceService.removeListing(data.tradables, data.tradable_id);

        // Save the sale event
        if (soldListing) {
          const sale: SaleEvent = {
            contractId: data.tradables,
            tokenId: data.tradable_id,
            price: data.price,
            commission: data.commission,
            seller: data.owner,
            buyer: event.data.sender,
            royaltyAddress: data.royalty_address,
            royaltyPercent: data.royalty_percent,
            timestamp: Date.now(),
            metadata: soldListing.metadata
          };

          await saveSaleEvent(sale);
        }

        builder.addField({
          name: `${symbol} Asset Sold`,
          value: [
            `Contract: ${data.tradables}`,
            `ID: ${data.tradable_id}`,
            `Price: ${data.price / 1000000} STX`,
            `Commission: ${data.commission / 100}%`,
            `Royalty: ${data.royalty_percent / 100}%`,
            soldListing?.name ? `Name: ${soldListing.name}` : '',
            soldListing?.collection ? `Collection: ${soldListing.collection}` : ''
          ].filter(Boolean).join('\n')
        });
        break;

      case 'ADMIN_UNLIST_ASSET':
        await MarketplaceService.removeListing(data.tradables, data.tradable_id);

        builder.addField({
          name: `${symbol} Admin Unlisted Asset`,
          value: `Contract: ${data.tradables}\nID: ${data.tradable_id}`
        });
        break;

      default:
        // Log unknown marketplace events
        Logger.debug({ 'Unknown Marketplace Event': event.data });
        builder.addField({
          name: `${symbol} ${op}`,
          value: JSON.stringify(data).slice(0, 300)
        });
    }
  } catch (error: any) {
    Logger.error({ event: event.data });

    builder.addField({
      name: `${symbol} Error Processing ${op}`,
      value: `Failed to process marketplace event: ${error.message}`
    });
  }

  return builder;
};