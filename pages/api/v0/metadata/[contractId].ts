import { NextApiRequest, NextApiResponse } from 'next';
import { MetadataService } from '@lib/metadata/service';
import { verifyMessageSignatureRsv } from '@stacks/encryption';
import { getAddressFromPublicKey } from '@stacks/transactions';

// Helper to validate contract ID format
const isValidContractId = (contractId: string) => {
    return /^S[A-Z0-9]+\.[^\/]+$/.test(contractId);
};

// Helper to extract contract address from contract ID
const getContractAddress = (contractId: string) => {
    return contractId.split('.')[0];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { contractId } = req.query;

    try {
        if (!isValidContractId(contractId as string)) {
            return res.status(400).json({ error: 'Invalid contract ID format' });
        }

        if (req.method === 'POST') {
            // Verify authentication for POST requests
            const signature = req.headers['x-signature'] as string;
            const publicKey = req.headers['x-public-key'] as string;
            const message = contractId as string;

            if (!signature || !publicKey) {
                return res.status(401).json({ error: 'Missing authentication headers' });
            }

            // Verify signature
            const isValid = verifyMessageSignatureRsv({ message, publicKey, signature });

            if (!isValid) {
                return res.status(401).json({ error: 'Invalid signature' });
            }

            // Get the address from the public key
            const signerAddress = getAddressFromPublicKey(publicKey, 'mainnet');
            const contractAddress = getContractAddress(contractId as string);

            // Verify that signer owns the contract
            if (signerAddress !== contractAddress) {
                return res.status(403).json({ error: 'Not authorized to modify this contract metadata' });
            }

            const result = await MetadataService.set(contractId as string, req.body);
            return res.status(200).json(result);
        }

        // GET request
        const metadata = await MetadataService.get(contractId as string);
        return res.status(200).json({
            ...metadata,
            contractId,
        });
    } catch (error) {
        console.error('Failed to handle metadata:', error);
        const message = error instanceof Error ? error.message : 'Failed to handle metadata request';
        return res.status(500).json({ error: message });
    }
} 