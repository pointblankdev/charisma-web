import { createUser, getUserById, updateUserWithWallet } from "./dato";

describe('getUserById function', () => {
    it('should return a user for a valid id', async () => {
        const id = '158986255'; // replace with a valid user ID from your system

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
        const userId = '158986255';
        const walletId = '158986996';
        const wallet = await updateUserWithWallet(userId, walletId)

        console.log(wallet)
    });
});
