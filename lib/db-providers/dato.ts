import { buildClient } from '@datocms/cma-client-node';

const API_TOKEN = String(process.env.DATOCMS_FULL_ACCESS_API_TOKEN);

const client = buildClient({ apiToken: API_TOKEN });

const USER_TYPE_ID = '2089918';
const WALLET_TYPE_ID = '2089919';
const QUEST_TYPE_ID = '2152523';
const SESSION_TYPE_ID = '2161208';

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

export async function updateWalletAmount(walletId: string, charisma: number): Promise<any> {
    return client.items.update(walletId, { charisma })
}

export async function updateWalletBNS(walletId: string, bns: string): Promise<any> {
    return client.items.update(walletId, { bns })
}

export async function createQuestDraft(args: any): Promise<any> {
    return client.items.create({
        item_type: { type: 'item_type', id: QUEST_TYPE_ID },
        ...args
    })
}

export async function createQuestSession(args: any): Promise<any> {
    return client.items.create({
        item_type: { type: 'item_type', id: SESSION_TYPE_ID },
        ...args
    })
}

export function getQuestById(id: string): Promise<any> {
    return client.items.find(id)
}

export async function getQuestsByOwner(address: string) {
    const query = {
        filter: {
            type: 'quest',
            fields: {
                owner: { eq: address }
            },
        },
    };

    const records = await client.items.list(query);
    return records;
}
