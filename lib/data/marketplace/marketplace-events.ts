import Logger from '@lib/logger';
import { MarketplaceService } from './marketplace-service';
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

export const handleMarketplaceEvent = async (event: any, builder: EmbedBuilder) => {
  if (event.type !== 'SmartContractEvent') return builder;

  // Only handle events from the marketplace contract
  if (event.data.contract_identifier !== 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.marketplace-v6')
    return builder;

  const symbol = '🏪';
  const { op, ...data } = event.data.value;

  try {
    switch (op) {
      case 'UNLIST_ASSET':
        await MarketplaceService.removeListing(data.tradables, data['tradable-id']);

        builder.addField({
          name: `${symbol} Asset Unlisted`,
          value: `Contract: ${data.tradables}\nID: ${data['tradable-id']}`
        });
        break;

      case 'ADMIN_UNLIST_ASSET':
        await MarketplaceService.removeListing(data.tradables, data['tradable-id']);

        builder.addField({
          name: `${symbol} Admin Unlisted Asset`,
          value: `Contract: ${data.tradables}\nID: ${data['tradable-id']}`
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
