// pages/api/v0/marketplace/listings/[contractId]/[tokenId].ts
import { MarketplaceService } from '@lib/data/marketplace/marketplace-service';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function ListingAPI(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { contractId, tokenId } = req.query;

  if (!contractId || !tokenId) {
    return res.status(400).json({
      error: {
        code: 'invalid_request',
        message: 'Missing contractId or tokenId'
      }
    });
  }

  switch (req.method) {
    case 'GET':
      return handleGetListing(req, res, contractId as string, parseInt(tokenId as string));
    case 'DELETE':
      return handleDeleteListing(req, res, contractId as string, parseInt(tokenId as string));
    case 'PATCH':
      return handleUpdateListing(req, res, contractId as string, parseInt(tokenId as string));
    default:
      return res.status(405).json({ error: { code: 'method_not_allowed', message: 'Method not allowed' } });
  }
}

async function handleGetListing(
  req: NextApiRequest,
  res: NextApiResponse,
  contractId: string,
  tokenId: number
) {
  try {
    const listing = await MarketplaceService.getListing(contractId, tokenId);

    if (!listing) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Listing not found'
        }
      });
    }

    return res.status(200).json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    return res.status(500).json({
      error: {
        code: 'internal_error',
        message: 'Failed to fetch listing'
      }
    });
  }
}

async function handleDeleteListing(
  req: NextApiRequest,
  res: NextApiResponse,
  contractId: string,
  tokenId: number
) {
  try {
    const success = await MarketplaceService.removeListing(contractId, tokenId);

    if (!success) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Listing not found'
        }
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error removing listing:', error);
    return res.status(500).json({
      error: {
        code: 'internal_error',
        message: 'Failed to remove listing'
      }
    });
  }
}

async function handleUpdateListing(
  req: NextApiRequest,
  res: NextApiResponse,
  contractId: string,
  tokenId: number
) {
  try {
    const updates = req.body;
    const success = await MarketplaceService.updateListingMetadata(
      contractId,
      tokenId,
      updates
    );

    if (!success) {
      return res.status(404).json({
        error: {
          code: 'not_found',
          message: 'Listing not found'
        }
      });
    }

    const updatedListing = await MarketplaceService.getListing(contractId, tokenId);
    return res.status(200).json(updatedListing);
  } catch (error) {
    console.error('Error updating listing:', error);
    return res.status(500).json({
      error: {
        code: 'internal_error',
        message: 'Failed to update listing'
      }
    });
  }
}