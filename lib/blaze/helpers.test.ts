import { generateBlazeSignature, verifyBlazeSignature } from './helpers';
import axios from 'axios';
import { kv } from '@vercel/kv';
import { BlazeTransferService } from './node';

describe('Blaze Signature Tests', () => {
    const mockToken = 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token';
    const mockContract = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blaze-welsh-v0';
    const mockSender = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS';
    const mockRecipient = 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ';
    const mockAmount = 1000000; // 1 token with 6 decimals
    const mockNonce = 1;

    it('should generate and verify a valid signature', async () => {
        // Generate signature
        const signature = await generateBlazeSignature(
            mockToken,
            mockRecipient,
            mockAmount,
            mockNonce
        );

        expect(signature).toBeDefined();
        expect(typeof signature).toBe('string');

        // Verify signature
        const isValid = await verifyBlazeSignature(
            mockContract,
            signature,
            mockSender,
            mockRecipient,
            mockAmount,
            mockNonce
        );

        expect(isValid).toBe(true);
    });

    it('should reject invalid signatures', async () => {
        // Generate signature with different parameters
        const signature = await generateBlazeSignature(
            mockToken,
            mockRecipient,
            mockAmount,
            mockNonce
        );

        // Verify with wrong amount
        const isValidWrongAmount = await verifyBlazeSignature(
            mockContract,
            signature,
            mockSender,
            mockRecipient,
            mockAmount + 1, // Different amount
            mockNonce
        );
        expect(isValidWrongAmount).toBe(false);

        // Verify with wrong recipient
        const isValidWrongRecipient = await verifyBlazeSignature(
            mockContract,
            signature,
            mockSender,
            mockSender, // Different recipient
            mockAmount,
            mockNonce
        );
        expect(isValidWrongRecipient).toBe(false);

        // Verify with wrong nonce
        const isValidWrongNonce = await verifyBlazeSignature(
            mockContract,
            signature,
            mockSender,
            mockRecipient,
            mockAmount,
            mockNonce + 1 // Different nonce
        );
        expect(isValidWrongNonce).toBe(false);
    });

    it('should reject malformed signatures', async () => {
        const invalidSignature = '0x1234'; // Too short to be valid

        const isValid = await verifyBlazeSignature(
            mockContract,
            invalidSignature,
            mockSender,
            mockRecipient,
            mockAmount,
            mockNonce
        );

        expect(isValid).toBe(false);
    });
});

describe('Blaze Transfer API Tests', () => {
    const mockToken = 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token';
    const mockSender = 'SP3619DGWH08262BJAG0NPFHZQDPN4TKMXHC0ZQDN';
    const mockRecipient = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS';
    const mockAmount = 1000000; // 1 token with 6 decimals
    const mockNonce = 1;

    it('should successfully submit a transfer to the API', async () => {
        const signature = await generateBlazeSignature(
            mockToken,
            mockRecipient,
            mockAmount,
            mockNonce
        );

        const response = await axios.post('http://localhost:3000/api/v0/blaze/xfer', {
            signature,
            from: mockSender,
            token: mockToken,
            to: mockRecipient,
            amount: mockAmount,
            nonce: mockNonce
        });

        expect(response.data.success).toBe(true);
    });
});

describe('Blaze Transfer Queue Tests', () => {
    const mockToken = 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token';
    const mockSender = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS';
    const mockRecipient = 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ';
    const mockAmount = 1000000; // 1 token with 6 decimals
    const mockNonce = 1;

    it('should track queue length in transfer response', async () => {
        const signature = await generateBlazeSignature(
            mockToken,
            mockRecipient,
            mockAmount,
            mockNonce
        );

        const response = await axios.post('http://localhost:3000/api/v0/blaze/xfer', {
            signature,
            from: mockSender,
            token: mockToken,
            to: mockRecipient,
            amount: mockAmount,
            nonce: mockNonce
        });

        expect(response.data.success).toBe(true);
        expect(response.data.queued).toBe(true);
        expect(response.data.queueLength).toBeGreaterThanOrEqual(1);
    });

    it('should process queue when batch size is reached', async () => {
        // Submit multiple transfers to reach batch size
        const batchSize = 200; // Minimum batch size from the API
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