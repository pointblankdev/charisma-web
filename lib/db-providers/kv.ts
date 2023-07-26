import { ConfUser } from "@lib/types";
import { nanoid } from 'nanoid';
import { kv } from "@vercel/kv";

export async function getUserByUsername(username: string): Promise<ConfUser> {
    const { name, ticketNumber } = await kv.hmget(`user:${username}`, 'name', 'ticketNumber') as ConfUser;
    return { name, ticketNumber };
}

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
        email,
    );
    return { id, email, ticketNumber, createdAt };
}

export async function getTicketNumberByUserId(id: string): Promise<string | null> {
    return await kv.hget(`id:${id}`, 'ticketNumber');
}

export async function createGitHubUser(user: any): Promise<string> {
    const token = nanoid();
    const key = `github-user:${token}`;

    await kv
        .multi()
        .hmset(key, { 'id': user.id, 'login': user.login, 'name': user.name || '' })
        .expire(key, 60 * 10) // 10m TTL
        .exec();
    return token;
}

export async function updateUserWithGitHubUser(
    id: string,
    token: string,
    ticketNumber: string
): Promise<ConfUser> {
    const { name, username } = await kv.hmget(`github-user:${token}`, 'login', 'name') as ConfUser;
    if (!username) {
        throw new Error('Invalid or expired token');
    }

    const key = `id:${id}`;
    const userKey = `user:${username}`;

    await kv
        .multi()
        .hsetnx(key, 'username', username)
        .hsetnx(key, 'name', name || '')
        // Also save username → data pair
        .hsetnx(userKey, 'name', name || '')
        .hsetnx(userKey, 'ticketNumber', ticketNumber)
        .exec();

    return { username, name };
}