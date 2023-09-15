import { createQuestSession, createUser, getUserById, updateUserWithWallet, updateWalletAmount } from "./dato";
import { callReadOnlyFunction, principalCV } from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";
import _, { create } from 'lodash'
import { getAllWallets } from "../cms-providers/dato";

describe('getUserById function', () => {
    it('should return a user for a valid id', async () => {
        const id = '158987222'; // replace with a valid user ID from your system

        // Note: The actual structure and content of the returned user will depend on your specific data model
        // You may need to modify the below expectation to match the actual structure returned by your client
        const user = await getUserById(id);

        console.log(user)

        // Test that the returned user has the expected properties (you may need to customize this part to match your actual data structure)
        expect(user).toHaveProperty('id', id);
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        // ... other expectations based on your actual user structure
    });

    it('should throw an error for an invalid id', async () => {
        const id = 'invalid-user-id'; // replace with an ID that is not present in your system

        // Test that the function throws an error when passed an invalid ID
        await expect(getUserById(id)).rejects.toThrow();
    });

    it('should create a user with an email', async () => {
        const data = { name: "Test Man", email: 'test@gmail.com' }
        const user = await createUser(data)

        console.log(user)

        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
    });

    it('should update a user with an email', async () => {
        const userId = '158987222';
        const walletId = '158986996';
        const wallet = await updateUserWithWallet(userId, walletId)

        console.log(wallet)
    });
});

describe('updateWalletAmount function', () => {
    it('should update wallets', async () => {

        const wallets = await getAllWallets()
        let count = 0

        for (const wallet of _.shuffle(wallets)) {
            count++

            const getBalanceResponse: any = await callReadOnlyFunction({
                network: new StacksMainnet(),
                contractAddress: "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ",
                contractName: "dme000-governance-token",
                functionName: "get-balance",
                functionArgs: [principalCV(wallet.stxaddress)],
                senderAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ'
            });
            const amount = Number(getBalanceResponse.value.value)

            const resp = await updateWalletAmount(wallet.id, amount)

            expect(resp.charisma).toBeGreaterThanOrEqual(0)

            if (count > 49) {
                break;
            }
        }
    }, 100000)

});

describe('create quest session', () => {
    it('should create a quest session', async () => {
        const quest = '169311427'
        const wallet = '160946537'
        const response = await createQuestSession({ quest, wallet, instance: quest + wallet })

        console.log(response)
    })
})
