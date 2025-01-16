import { getAllContractTransactions } from '@lib/hiro/stacks-api';
import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

async function fetchWithRetry(contractId: string, retryCount = 0): Promise<any[]> {
    try {
        return await getAllContractTransactions(contractId);
    } catch (error) {
        if (retryCount >= MAX_RETRIES) {
            throw error;
        }

        const delay = INITIAL_DELAY * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(contractId, retryCount + 1);
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any[] | ErrorResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: {
                code: 'method_not_allowed',
                message: 'Only GET method is allowed'
            }
        });
    }

    const { contractId } = req.query;

    if (!contractId || typeof contractId !== 'string') {
        return res.status(400).json({
            error: {
                code: 'invalid_request',
                message: 'Contract ID is required'
            }
        });
    }

    try {
        res.setHeader(
            'Cache-Control',
            'public, s-maxage=86400, stale-while-revalidate=86400'
        );

        const events = await fetchWithRetry(contractId);
        const processedEvents = events.map(event => ({
            block_time: event.block_time,
            block_time_iso: event.block_time_iso,
            sender_address: event.sender_address,
            events: event.events || []
        }));

        res.status(200).json(processedEvents);
    } catch (error) {
        console.error('Error fetching pool transactions:', error);
        res.status(500).json({
            error: {
                code: 'internal_server_error',
                message: 'Failed to fetch pool transactions'
            }
        });
    }
} 