import { type Channel } from '@lib/stackflow/types'

export function identifyBalances(
    principal1: string,
    owner: string,
    balance1: string,
    balance2: string,
    channel: Channel
) {
    const isOwnerFirst = principal1 === owner;

    return {
        myBalance: BigInt(isOwnerFirst ? balance1 : balance2),
        theirBalance: BigInt(isOwnerFirst ? balance2 : balance1),
        myPrevBalance: BigInt(isOwnerFirst ? channel.balance_1 : channel.balance_2),
        theirPrevBalance: BigInt(isOwnerFirst ? channel.balance_2 : channel.balance_1)
    };
}

// Key generation utilities for Vercel KV
export function getChannelKey(principal1: string, principal2: string, token?: string): string {
    return `channels:${principal1}:${principal2}:${token || 'null'}`
}

export function getSignatureKey(channelKey: string): string {
    return `signatures:${channelKey}`
}

export function getPendingKey(channelKey: string): string {
    return `pending:${channelKey}`
}