import { buildClient } from '@datocms/cma-client-node';

const API_TOKEN = String(process.env.DATOCMS_FULL_ACCESS_API_TOKEN);

const client = buildClient({ apiToken: API_TOKEN });

const USER_TYPE_ID = '2089918';
const WALLET_TYPE_ID = '2089919'

export function getUserById(id: string): Promise<any> {
    return client.items.find(id)
}

export async function createUser(args: any): Promise<any> {
    return client.items.create({
        item_type: { type: 'item_type', id: USER_TYPE_ID },
        ...args
    })
}

export async function createWallet(args: any): Promise<any> {
    return client.items.create({
        item_type: { type: 'item_type', id: WALLET_TYPE_ID },
        ...args
    })
}

export async function updateUserWithWallet(userId: string, walletId: string): Promise<any> {
    return client.items.update(walletId, {
        user: userId
    })
}