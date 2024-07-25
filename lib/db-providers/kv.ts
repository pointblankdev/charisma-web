import { ConfUser } from "@lib/types";
import { kv } from "@vercel/kv";

export async function getUserById(id: string): Promise<ConfUser> {
    const { name, username, createdAt } = await kv.hmget(
        `id:${id}`,
        'name',
        'username',
        'createdAt'
    ) as ConfUser;
    return { name, username, createdAt: createdAt };
}

export async function createUser(id: string, email: string): Promise<ConfUser> {
    const ticketNumber = await kv.incr('count');
    const createdAt = Date.now();
    await kv.hmset(
        `id:${id}`,
        {
            'email': email,
            'ticketNumber': ticketNumber,
            'createdAt': createdAt
        }
    );
    // add email to subscribers list
    await kv.lpush(
        'subscribers',
        `${id}, ${email}, ${ticketNumber}, ${createdAt}`,
    );
    return { id, email, ticketNumber, createdAt };
}

export async function getTicketNumberByUserId(id: string): Promise<string | null> {
    return await kv.hget(`id:${id}`, 'ticketNumber');
}


export async function createWallet(data: any, did: string): Promise<string> {
    const key = `wallet:${did}`;

    await kv
        .multi()
        .hmset(key, data)
        .expire(key, 60 * 10) // 10m TTL
        .exec();
    return did;
}

export async function updateUserWithWallet(
    id: string,
    did: string,
    ticketNumber: number
): Promise<ConfUser> {
    const data = await kv.hgetall(`wallet:${did}`) as ConfUser;
    if (!data) {
        throw new Error('Invalid or expired token');
    }

    const key = `id:${id}`;

    await kv
        .multi()
        .hsetnx(key, 'wallet', data)
        .hsetnx(key, 'ticketNumber', ticketNumber)
        .exec();

    return data;
}

export async function getContractMetadata(ca: string): Promise<any> {
    return await kv.get(`ca:${ca}`);
}

export async function setContractMetadata(ca: string, data: any): Promise<void> {
    await kv.set(`ca:${ca}`, data);
}

export async function getChainState(contractAddress: string, method: string): Promise<any> {
    return JSON.parse(await kv.get(`chainstate:${contractAddress}:${method}`) || '');
}

export async function cacheChainState(contractAddress: string, method: string, json: any): Promise<void> {
    await kv.set(`chainstate:${contractAddress}:${method}`, JSON.stringify(json));
}