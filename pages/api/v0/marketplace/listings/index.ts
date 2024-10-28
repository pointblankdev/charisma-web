// pages/api/v0/marketplace/listings/index.ts
import { MarketplaceService } from '@lib/data/marketplace/marketplace-service';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default async function ListingsAPI(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {
    switch (req.method) {
        case 'GET':
            return handleGetListings(req, res);
        case 'POST':
            return handleCreateListing(req, res);
        default:
            return res.status(405).json({ error: { code: 'method_not_allowed', message: 'Method not allowed' } });
    }
}

async function handleGetListings(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {
    try {
        const { collection, owner } = req.query;

        if (collection) {
            const listings = await MarketplaceService.getCollectionListings(collection as string);
            return res.status(200).json(listings);
        }

        if (owner) {
            const listings = await MarketplaceService.getOwnerListings(owner as string);
            return res.status(200).json(listings);
        }

        const listings = await MarketplaceService.getListings();
        return res.status(200).json(listings);
    } catch (error) {
        console.error('Error fetching listings:', error);
        return res.status(500).json({
            error: {
                code: 'internal_error',
                message: 'Failed to fetch listings'
            }
        });
    }
}

async function handleCreateListing(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {
    try {
        const listing = req.body;

        if (!listing.contractId || !listing.tokenId) {
            return res.status(400).json({
                error: {
                    code: 'invalid_request',
                    message: 'Missing required fields'
                }
            });
        }

        await MarketplaceService.createListing({
            ...listing,
            timestamp: Date.now()
        });

        return res.status(201).json(listing);
    } catch (error) {
        console.error('Error creating listing:', error);
        return res.status(500).json({
            error: {
                code: 'internal_error',
                message: 'Failed to create listing'
            }
        });
    }
}