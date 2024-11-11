import { MarketplaceService } from './marketplace-service';

describe('MarketplaceService', () => {
  test('demonstrates storing and retrieving a listing', async () => {
    const listing = {
      contractId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.odins-raven',
      tokenId: 1,
      price: 100000000, // 100 STX
      commission: 500, // 5%
      owner: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ',
      royaltyAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ',
      royaltyPercent: 500, // 5%
      timestamp: Date.now(),
      name: 'Odin Raven #1',
      collection: 'Odin Ravens',
      metadata: {
        image: 'https://charisma.rocks/sip9/odins-raven/img/1.gif',
        description: 'A rare raven created by Charisma.'
      }
    };

    // Create listing
    await MarketplaceService.createListing(listing);

    // Retrieve listing
    const retrieved = await MarketplaceService.getListing(listing.contractId, listing.tokenId);
    console.log('Retrieved Listing:', retrieved);
  });

  test('demonstrates getting collection listings', async () => {
    const contractId = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.spell-scrolls-fire-bolt';
    const listings = await MarketplaceService.getCollectionListings(contractId);
    console.log('Collection Listings:', listings);
  });

  test('demonstrates getting welsh-punk collection listings', async () => {
    const contractId = 'SP1C2K603TGWJGKPT2Z3WWHA0ARM66D352385TTWH.welsh-punk';
    const listings = await MarketplaceService.getCollectionListings(contractId);
    console.log('Collection Listings:', listings);
  });

  test('demonstrates getting owner listings', async () => {
    const ownerAddress = 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ';
    const listings = await MarketplaceService.getOwnerListings(ownerAddress);
    console.log('Owner Listings:', listings);
  });

  test('demonstrates updating and removing a listing', async () => {
    const contractId = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.odins-raven';
    const tokenId = 1;

    // Update metadata
    const updated = await MarketplaceService.updateListingMetadata(contractId, tokenId, {
      metadata: {
        description: 'Updated description for this rare raven'
      }
    });
    console.log('Listing Updated:', updated);

    // Remove listing
    const removed = await MarketplaceService.removeListing(contractId, tokenId);
    console.log('Listing Removed:', removed);

    // Verify removal
    const listing = await MarketplaceService.getListing(contractId, tokenId);
    console.log('Listing after removal:', listing); // Should be null
  });

  test('demonstrates getting marketplace stats', async () => {
    const stats = await MarketplaceService.getStats();
    console.log('Marketplace Stats:', stats);
  });

  // remove listing from stats
  test('demonstrates removing listing from stats', async () => {
    const contractId = 'SP1C2K603TGWJGKPT2Z3WWHA0ARM66D352385TTWH.welsh-punk';
    const listing = await MarketplaceService.getListing(contractId, 35);
    // await MarketplaceService.updateStatsOnRemove(listing as any);
    const stats = await MarketplaceService.getStats();
    console.log('Marketplace Stats:', stats);
  });
});
