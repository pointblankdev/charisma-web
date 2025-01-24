import { z } from 'zod';
import { kv } from '@vercel/kv';
import _ from 'lodash';

const PropertiesSchema = z.object({
    lpRebatePercent: z.number(),
    externalPoolId: z.string().optional(),
    engineContractId: z.string().optional(),
    tokenAContract: z.string(),
    tokenBContract: z.string()
}).passthrough();

const MetadataSchema = z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
    identifier: z.string(),
    description: z.string(),
    image: z.string(),
    properties: PropertiesSchema.optional()
}).passthrough();

export class MetadataService {
    static async get(contractId: string) {
        const metadata = await kv.get(`sip10:${contractId}`);
        if (!metadata) {
            console.error('Metadata not found', contractId);
        }
        return metadata;
    }

    static async set(contractId: string, metadata: z.infer<typeof MetadataSchema>) {
        try {

            // Get existing metadata if it exists
            const existingMetadata: any = await kv.get(`sip10:${contractId}`);

            // Merge with existing metadata if it exists
            const mergedMetadata = _.merge(existingMetadata, metadata, { lastUpdated: new Date().toISOString() });

            // Validate metadata
            console.log('Validating metadata', mergedMetadata);
            const validatedMetadata = MetadataSchema.parse(mergedMetadata);

            // Save to KV store
            await kv.set(`sip10:${contractId}`, validatedMetadata);

            return {
                success: true,
                contractId,
                metadata: validatedMetadata
            };
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`Validation error: ${error.message}`);
            }
            throw new Error(`Failed to save metadata: ${error}`);
        }
    }
}
