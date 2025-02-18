import { BlazeTransferService, BlazeBalanceService } from "./node";
import { generateBlazeSignature, getBlazeContractForToken } from "./helpers";
import { fetchCallReadOnlyFunction, Cl, ClarityType, UIntCV } from "@stacks/transactions";
import { STACKS_MAINNET } from "@stacks/network";
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

describe('Blaze Balance Management Tests', () => {
    const mockToken = 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token';
    const mockContract = getBlazeContractForToken(mockToken);
    const testAddresses = [
        'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
        'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ',
        'SP3619DGWH08262BJAG0NPFHZQDPN4TKMXHC0ZQDN'
    ];

    // Helper function to get on-chain balance
    async function getOnChainBalance(contract: string, address: string): Promise<number> {
        const [contractAddress, contractName] = contract.split('.');
        const options = {
            contractAddress,
            contractName,
            functionName: 'get-balance',
            functionArgs: [Cl.principal(address)],
            network: STACKS_MAINNET,
            senderAddress: address
        };

        const result = await fetchCallReadOnlyFunction(options);
        if (result.type === ClarityType.UInt) {
            return Number(result.value);
        }
        return 0;
    }

    // Helper function to inspect balances
    async function inspectBalances(addresses: string[]) {
        const results = [];
        for (const address of addresses) {
            const offChainBalance = await BlazeBalanceService.getBalance(mockContract, address);
            const onChainBalance = await getOnChainBalance(mockContract, address);
            results.push({
                address,
                offChainBalance,
                onChainBalance,
                difference: offChainBalance - onChainBalance
            });
        }
        return results;
    }

    // Helper function to reset balances to on-chain state
    async function resetBalances(addresses: string[]) {
        const updates = [];
        for (const address of addresses) {
            const onChainBalance = await getOnChainBalance(mockContract, address);
            updates.push({ address, amount: onChainBalance });
        }
        await BlazeBalanceService.updateBalances(mockContract, updates);
    }

    it('should inspect balances and show differences', async () => {
        const balanceInfo = await inspectBalances(testAddresses);
        console.log('Balance Inspection Results:');
        balanceInfo.forEach(({ address, offChainBalance, onChainBalance, difference }) => {
            console.log(`Address: ${address}`);
            console.log(`  Off-chain balance: ${offChainBalance}`);
            console.log(`  On-chain balance: ${onChainBalance}`);
            console.log(`  Difference: ${difference}`);
            console.log('---');
        });
    });

    it('should reset off-chain balances to match on-chain state', async () => {
        // First inspect current state
        const beforeReset = await inspectBalances(testAddresses);
        console.log('Before Reset:');
        beforeReset.forEach(info => console.log(info));

        // Reset balances
        await resetBalances(testAddresses);

        // Verify after reset
        const afterReset = await inspectBalances(testAddresses);
        console.log('After Reset:');
        afterReset.forEach(info => console.log(info));

        // Verify all differences are now 0
        afterReset.forEach(({ difference }) => {
            expect(difference).toBe(0);
        });
    });

    it('should handle invalid addresses gracefully', async () => {
        const invalidAddress = 'SP000INVALID000ADDRESS';

        // Should return 0 for invalid address
        const offChainBalance = await BlazeBalanceService.getBalance(mockContract, invalidAddress);
        expect(offChainBalance).toBe(0);

        // Should not throw when trying to reset invalid address
        await expect(resetBalances([invalidAddress])).resolves.not.toThrow();
    });

    it('should batch update multiple balances atomically', async () => {
        const updates = testAddresses.map((address, index) => ({
            address,
            amount: (index + 1) * 1000000 // 1 token = 1000000
        }));

        // Update balances
        await BlazeBalanceService.updateBalances(mockContract, updates);

        // Verify all balances were updated
        for (const { address, amount } of updates) {
            const balance = await BlazeBalanceService.getBalance(mockContract, address);
            expect(balance).toBe(amount);
        }

        // Reset back to on-chain state
        await resetBalances(testAddresses);
    });
});