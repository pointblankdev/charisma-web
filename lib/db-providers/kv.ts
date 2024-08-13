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

export async function getLands(): Promise<any> {
    return await kv.smembers('lands')
}

export async function addLand(ca: string): Promise<any> {
    return await kv.sadd('lands', ca)
}

export async function removeLand(ca: string): Promise<any> {
    return await kv.srem('lands', ca)
}

export async function getLand(ca: string): Promise<any> {
    return await kv.get(`land:${ca}`);
}

export async function getLandById(id: number): Promise<any> {
    return await kv.get(`land:id:${id}`);
}

export async function setLand(ca: string, data: any): Promise<any> {
    return await kv.set(`land:${ca}`, data);
}

export async function setLandById(id: number, data: any): Promise<any> {
    return await kv.set(`land:id:${id}`, data);
}

export async function setLandWhitelisted(ca: string, whitelisted: boolean): Promise<any> {
    const land = await kv.get(`land:${ca}`) as any;
    land.whitelisted = whitelisted
    return await kv.set(`land:${ca}`, land);
}

export async function getContractMetadata(ca: string): Promise<any> {
    return await kv.get(`ca:${ca}`);
}

export async function setContractMetadata(ca: string, data: any): Promise<void> {
    await kv.set(`ca:${ca}`, data);
}

export async function getGlobalState(key: string): Promise<any> {
    return await kv.get(`global:${key}`);
}

export async function cacheGlobalState(key: string, json: any): Promise<void> {
    await kv.set(`global:${key}`, JSON.stringify(json));
}

export async function getUserState(user: string, key: string): Promise<any> {
    return await kv.get(`user:${user}:${key}`);
}

export async function cacheUserState(user: string, key: string, json: any): Promise<void> {
    await kv.set(`user:${user}:${key}`, JSON.stringify(json));
}

// quests

export async function getQuests(): Promise<any> {
    return await kv.smembers('quests')
}

export async function addQuest(ca: string): Promise<any> {
    return await kv.sadd('quests', ca)
}

export async function removeQuest(ca: string): Promise<any> {
    return await kv.srem('quests', ca)
}

export async function getQuest(ca: string): Promise<any> {
    return await kv.get(`quest:${ca}`);
}

export async function setQuest(ca: string, data: any): Promise<any> {
    return await kv.set(`quest:${ca}`, data);
}

// experience

export async function updateExperienceLeaderboard(playerId: string, experience: number) {
    try {
        await kv.zadd('leaderboard:exp', { score: experience, member: playerId });
    } catch (error) {
        console.error('Error updating player score:', error);
    }
}

export async function getExperienceLeaderboard(startRank: number, endRank: number) {
    try {
        const leaderboard = await kv.zrange('leaderboard:exp', startRank, endRank, { withScores: true });
        console.log('Leaderboard:exp:', leaderboard);
        return leaderboard;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    }
}