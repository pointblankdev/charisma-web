import { BlazeTransferService } from "./node";
import { generateBlazeSignature } from "./helpers";
import axios from 'axios';
import { kv } from '@vercel/kv';

describe('Blaze Node Queue Tests', () => {
    const mockToken = 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token';
    const mockSender = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS';
    const mockRecipient = 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ';
    const mockAmount = 1000000; // 1 token with 6 decimals
    const mockNonce = 1;

    it('should process queue when batch size is met', async () => {
        // Submit multiple transfers to reach batch size
        const batchSize = 10; // Minimum batch size from the API
        const initialNonce = mockNonce;

        let lastQueueLength = 0;

        for (let i = 0; i < batchSize; i++) {
            const signature = await generateBlazeSignature(
                mockToken,
                mockRecipient,
                mockAmount,
                initialNonce + i
            );

            const response = await axios.post('http://localhost:3000/api/v0/blaze/xfer', {
                signature,
                from: mockSender,
                token: mockToken,
                to: mockRecipient,
                amount: mockAmount,
                nonce: initialNonce + i
            });

            console.log(response.data);
            lastQueueLength = response.data.queueLength;
        }

        // Queue should have been processed at least once
        // expect(lastQueueLength).toBeLessThan(batchSize);
    }, 100000);


    // check queue length
    it('should check queue items', async () => {
        const queueKey = BlazeTransferService.getTransferQueueKey(mockToken);
        const queueLength = await kv.llen(queueKey);
        console.log(queueLength);
        const queueItems = await kv.lrange(queueKey, 0, queueLength - 1);
        console.log(queueItems);
        expect(queueItems.length).toBe(queueLength);
    });

    it('should clear the queue', async () => {
        const queueKey = BlazeTransferService.getTransferQueueKey(mockToken);
        await kv.del(queueKey);
    });
});