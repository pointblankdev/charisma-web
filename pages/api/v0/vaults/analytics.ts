import { Kraxel } from '@lib/kraxel';
import { Dexterity } from 'dexterity-sdk';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export const dynamic = "force-dynamic";

// Configure Dexterity SDK
await Dexterity.configure({ apiKeyRotation: 'loop', parallelRequests: 10 });
await Dexterity.discover({ reserves: false })

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: {
                code: 'method_not_allowed',
                message: 'Only GET method is allowed'
            }
        });
    }

    try {
        // Set cache headers similar to other endpoints
        // res.setHeader(
        //     'Cache-Control',
        //     'public, s-maxage=86400, stale-while-revalidate=86400'
        // );

        const vaults: any = {}
        const analytics = await Kraxel.getVaultTransactions()
        for (const vault of Dexterity.getVaults()) {
            vaults[vault.contractId] = {
                ...analytics[vault.contractId],
                energyRate: await Kraxel.getEnergyRate(vault.engineContractId)
            }
        }

        // Return a basic response
        const response = {
            vaults,
            status: 'success',
            message: 'Engines endpoint operational'
        };

        return res.status(200).json(response);

    } catch (error) {
        console.error('Error in engines endpoint:', error);
        return res.status(500).json({
            error: {
                code: 'internal_server_error',
                message: 'An unexpected error occurred'
            }
        });
    }
}
