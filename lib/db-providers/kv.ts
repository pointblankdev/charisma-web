import { getLandBalance, getLandId, getNameFromAddress, hasPercentageBalance } from "../../lib/stacks-api";
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

// mobs

export async function getQuests(): Promise<any> {
    return await kv.smembers('mobs')
}

export async function addQuest(ca: string): Promise<any> {
    return await kv.sadd('mobs', ca)
}

export async function removeQuest(ca: string): Promise<any> {
    return await kv.srem('mobs', ca)
}

export async function getQuest(ca: string): Promise<any> {
    return await kv.get(`mob:${ca}`);
}

export async function setQuest(ca: string, data: any): Promise<any> {
    return await kv.set(`mob:${ca}`, data);
}

// mobs

export async function getMobs(): Promise<any> {
    return await kv.smembers('mobs')
}

export async function addMob(ca: string): Promise<any> {
    return await kv.sadd('mobs', ca)
}

export async function removeMob(ca: string): Promise<any> {
    return await kv.srem('mobs', ca)
}

export async function getMob(ca: string): Promise<any> {
    return await kv.get(`mob:${ca}`);
}

export async function setMob(ca: string, data: any): Promise<any> {
    return await kv.set(`mob:${ca}`, data);
}

// experience

export async function updateExperienceLeaderboard(experience: number, jsonData: any) {
    try {
        await kv.zadd('leaderboard:exp', { score: experience, member: jsonData });
    } catch (error) {
        console.error('Error updating player score:', error);
    }
}

export async function getExperienceLeaderboard(startRank: number, endRank: number) {
    try {
        const leaderboard = await kv.zrange('leaderboard:exp', startRank, endRank, { withScores: true, rev: true });
        const resultArray = [];

        for (let i = 0; i < leaderboard.length; i += 2) {
            const memberJson: any = leaderboard[i]; // The stored JSON string
            const experience: any = leaderboard[i + 1]; // The corresponding score
            const data: any = {
                rank: i / 2 + 1,
                address: memberJson.address,
                experience: Number(experience),
            }
            if (memberJson.bns) data.bns = memberJson.bns
            resultArray.push(data);
        }
        return resultArray;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

export async function clearLeaderboard() {
    try {
        return await kv.del('leaderboard:exp');
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    }
}


// rewards

export async function incrementRewardLeaderboard(token: string, amount: number, data: any) {
    try {
        await kv.zincrby(`leaderboard:rewards:${token}`, amount, data);
    } catch (error) {
        console.error('Error updating player score:', error);
    }
}

export async function getRewardLeaderboard(token: string, startRank: number, endRank: number) {
    try {
        const leaderboard = await kv.zrange(`leaderboard:rewards:${token}`, startRank, endRank, { withScores: true, rev: true });
        const resultArray = [];

        for (let i = 0; i < leaderboard.length; i += 2) {
            const address: any = leaderboard[i]; // The stored JSON string
            const amount: any = leaderboard[i + 1]; // The corresponding score
            const data: any = {
                rank: i / 2 + 1,
                address: address,
                amount: Number(amount),
            }
            resultArray.push(data);
        }
        return resultArray;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

export async function clearRewardsLeaderboard(token: string) {
    try {
        return await kv.del(`leaderboard:rewards:${token}`);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    }
}

// tokens

export async function getLandsBalance(contractAddress: string, user: string) {
    return await kv.get(`user:${user}:land:${contractAddress}`) || 0;
}

export async function setLandsBalance(landId: number, user: string) {
    const landBalance = await getLandBalance(landId, user)
    return await kv.set(`user:${user}:land:${landId}`, landBalance);
}