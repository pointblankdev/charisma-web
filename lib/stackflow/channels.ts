import { kv } from '@vercel/kv'
import crypto from 'crypto'

// Key patterns:
// channels:{principal1}:{principal2}:{token} - Channel data
// channels:list:{principal} - Set of channel IDs for a principal
// signatures:{channelId} - Channel signatures
// pending:{channelId} - Pending signatures

interface Channel {
    id: string;
    principal_1: string;
    principal_2: string;
    token: string | null;
    balance_1: string;
    balance_2: string;
    nonce: string;
    expires_at: string | null;
    state: string;
}

interface Signature {
    channel: string;
    balance_1: string;
    balance_2: string;
    nonce: string;
    action: string;
    actor: string;
    secret: string;
    owner_signature: string;
    other_signature: string;
}

interface PendingSignature {
    channel: string;
    balance_1: string;
    balance_2: string;
    nonce: string;
    action: string;
    actor: string;
    hashed_secret: string;
    owner_signature: string;
    other_signature: string;
    depends_on_channel: string;
}

/**
 * Helper: Check if the channel exists.
 */
async function getChannel(principal1: string, principal2: string, token?: string) {
    const channelKey = `channels:${principal1}:${principal2}:${token || 'null'}`
    return await kv.get<Channel>(channelKey)
}

async function getChannelsWith(principal: string) {
    // Get all channel IDs for this principal
    const channelIds = await kv.smembers(`channels:list:${principal}`)

    // Get all channels in parallel
    const channels = await Promise.all(
        channelIds.map(id => kv.get<Channel>(`channels:${id}`))
    )

    return channels.filter(Boolean)
}

/**
 * Insert a new channel.
 */
async function insertChannel(
    principal1: string,
    principal2: string,
    token: string | null,
    balance1: string,
    balance2: string,
    nonce: string,
    expiresAt: string | null,
    state: string
) {
    const channelId = `${principal1}:${principal2}:${Date.now()}`
    const channelKey = `channels:${channelId}`

    const channel: Channel = {
        id: channelId,
        principal_1: principal1,
        principal_2: principal2,
        token,
        balance_1: balance1,
        balance_2: balance2,
        nonce,
        expires_at: expiresAt,
        state
    }

    // Use transaction to ensure consistency
    const pipeline = kv.pipeline()
    pipeline.set(channelKey, channel)
    pipeline.sadd(`channels:list:${principal1}`, channelId)
    pipeline.sadd(`channels:list:${principal2}`, channelId)
    await pipeline.exec()

    return channelId
}

/**
 * Update a channel.
 */
async function updateChannel(
    channelId: string,
    balance1: string,
    balance2: string,
    nonce: number,
    expiresAt: string | null,
    state: string
) {
    const channelKey = `channels:${channelId}`
    const channel = await kv.get<Channel>(channelKey)

    if (!channel) throw new Error('Channel not found')

    const updatedChannel = {
        ...channel,
        balance_1: balance1,
        balance_2: balance2,
        nonce,
        expires_at: expiresAt,
        state
    }

    await kv.set(channelKey, updatedChannel)
}

/**
 * Get the signatures for a channel.
 */
async function getSignatures(channelId: string) {
    return await kv.get<Signature>(`signatures:${channelId}`)
}

async function insertSignatures(
    channelId: string,
    balance1: string,
    balance2: string,
    nonce: string,
    action: string,
    actor: string,
    secret: string,
    ownerSignature: string,
    otherSignature: string
) {
    const signature: Signature = {
        channel: channelId,
        balance_1: balance1,
        balance_2: balance2,
        nonce,
        action,
        actor,
        secret,
        owner_signature: ownerSignature,
        other_signature: otherSignature
    }

    await kv.set(`signatures:${channelId}`, signature)
}

async function insertPendingSignatures(
    channelId: string,
    balance1: string,
    balance2: string,
    nonce: string,
    action: string,
    actor: string,
    hashedSecret: string,
    ownerSignature: string,
    otherSignature: string,
    dependsOnChannel: string,
    dependsOnNonce: string
) {
    const pendingSignature = {
        channel: channelId,
        balance_1: balance1,
        balance_2: balance2,
        nonce,
        action,
        actor,
        hashed_secret: hashedSecret,
        owner_signature: ownerSignature,
        other_signature: otherSignature,
        depends_on_channel: dependsOnChannel,
        depends_on_nonce: dependsOnNonce
    }

    await kv.set(`pending:${channelId}`, pendingSignature)
}

async function confirmSignatures(channelId: string, nonce: string, secret: string) {
    // Get pending signature first
    const pendingSignature = await kv.get<PendingSignature>(`pending:${channelId}`)
    if (!pendingSignature) {
        throw new Error('No matching pending signature found')
    }

    const secretHash = crypto.createHash('sha256').update(secret).digest('hex')
    if (secretHash !== pendingSignature.hashed_secret) {
        throw new Error('Secret does not match the expected hash')
    }

    const signature: Signature = {
        channel: pendingSignature.channel,
        balance_1: pendingSignature.balance_1,
        balance_2: pendingSignature.balance_2,
        nonce: pendingSignature.nonce,
        action: pendingSignature.action,
        actor: pendingSignature.actor,
        secret,
        owner_signature: pendingSignature.owner_signature,
        other_signature: pendingSignature.other_signature
    }

    // Use pipeline instead of atomic
    const pipeline = kv.pipeline()
    pipeline.set(`signatures:${channelId}`, signature)
    pipeline.del(`pending:${channelId}`)
    await pipeline.exec()

    return signature
}

interface NewChannel {
    token: string | null;
    principal_1: string;
    principal_2: string;
    balance_1: string;
    balance_2: string;
    nonce: string;
    expires_at: string | null;
}

// Fetch all channels by scanning the channels:list set
export const fetchChannels = async () => {
    // Get all principal addresses that have channels
    const allPrincipals = await kv.smembers('all:principals')

    // For each principal, get their channel IDs
    const allChannelIds = new Set<string>()
    await Promise.all(
        allPrincipals.map(async (principal) => {
            const channelIds = await kv.smembers(`channels:list:${principal}`)
            channelIds.forEach(id => allChannelIds.add(id))
        })
    )

    // Fetch all channels in parallel
    const channels = await Promise.all(
        Array.from(allChannelIds).map(id =>
            kv.get<Channel>(`channels:${id}`)
        )
    )

    return channels.filter(Boolean)
}

// Add a new channel
export const addChannel = async (channelData: NewChannel) => {
    const {
        token,
        principal_1,
        principal_2,
        balance_1,
        balance_2,
        nonce,
        expires_at,
    } = channelData

    // Generate unique channel ID
    const channelId = `${principal_1}:${principal_2}:${Date.now()}`
    const channelKey = `channels:${channelId}`

    const channel = {
        id: channelId,
        token,
        principal_1,
        principal_2,
        balance_1,
        balance_2,
        nonce,
        expires_at
    }

    // Use pipeline to ensure atomic operations
    const pipeline = kv.pipeline()

    // Store the channel
    pipeline.set(channelKey, channel)

    // Add channel ID to each principal's list
    pipeline.sadd(`channels:list:${principal_1}`, channelId)
    pipeline.sadd(`channels:list:${principal_2}`, channelId)

    // Add principals to global set for scanning
    pipeline.sadd('all:principals', principal_1)
    pipeline.sadd('all:principals', principal_2)

    await pipeline.exec()

    return channel
}

export {
    getChannel,
    getChannelsWith,
    insertChannel,
    updateChannel,
    getSignatures,
    insertSignatures,
    insertPendingSignatures,
    confirmSignatures
}