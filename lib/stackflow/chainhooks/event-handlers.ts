// lib/hooks/events.ts
import { kv } from '@vercel/kv';
import {
    Pc,
    Cl,
    makeContractCall,
    broadcastTransaction
} from '@stacks/transactions';
import { CONFIG, CHANNEL_STATE, ACTION } from '@lib/stackflow/config';
import type { Channel, Signature } from '@lib/stackflow/types';
import { getChannelKey, getSignatureKey } from '@lib/stackflow/utils';
import { network } from '@components/stacks-session/connect';

const EVENTS = {
    FUND_CHANNEL: 'fund-channel',
    CLOSE_CHANNEL: 'close-channel',
    FORCE_CANCEL: 'force-cancel',
    FORCE_CLOSE: 'force-close',
    FINALIZE: 'finalize',
    DEPOSIT: 'deposit',
    WITHDRAW: 'withdraw',
    DISPUTE_CLOSURE: 'dispute-closure',
} as const;

type EventData = {
    channel: {
        'balance-1': string;
        'balance-2': string;
        'expires-at': string;
        nonce: string;
    };
    'channel-key': {
        'principal-1': string;
        'principal-2': string;
        token: string | null;
    };
    sender?: string;
    'my-signature'?: string;
    'their-signature'?: string;
};

async function processEvent(
    eventType: keyof typeof EVENTS,
    processor: (data: EventData) => Promise<void>,
    apply: any[]
) {
    if (!apply || !Array.isArray(apply)) {
        throw new Error('Invalid payload structure');
    }

    try {
        for (const block of apply) {
            const transactions = block.transactions || [];
            for (const tx of transactions) {
                const events = tx.metadata?.receipt?.events || [];
                for (const event of events) {
                    if (
                        event.type === 'SmartContractEvent' &&
                        event.data?.value?.event === eventType
                    ) {
                        const {
                            'channel-key': {
                                'principal-1': principal1,
                                'principal-2': principal2,
                            },
                        } = event.data.value;

                        // Skip if not involving owner
                        if (principal1 !== CONFIG.OWNER && principal2 !== CONFIG.OWNER) {
                            console.info('Ignoring event not involving owner');
                            continue;
                        }

                        console.log('Chainhooks Event:', event.data.value);
                        await processor(event.data.value);
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error processing ${eventType} event:`, error);
        throw error;
    }
}

async function handleFundChannel(data: EventData) {
    const {
        channel: { 'balance-1': balance1, 'balance-2': balance2, 'expires-at': expiresAt, nonce },
        'channel-key': { 'principal-1': principal1, 'principal-2': principal2, token },
        sender
    } = data;

    const channelKey = getChannelKey(principal1, principal2, token || undefined);
    const channel = await kv.get<Channel>(channelKey);

    if (channel) {
        const isSender1 = sender === principal1;

        // Check if sender's balance is already non-zero
        if (
            (isSender1 && BigInt(channel.balance_1) > 0n) ||
            (!isSender1 && BigInt(channel.balance_2) > 0n)
        ) {
            console.warn('Channel already funded');
            return;
        }

        // Update channel
        await kv.hset(channelKey, {
            balance_1: balance1,
            balance_2: balance2,
            nonce,
            expires_at: expiresAt,
            state: CHANNEL_STATE.OPEN
        });
    } else {
        // Create new channel
        const newChannel: Channel = {
            id: channelKey,
            principal_1: principal1,
            principal_2: principal2,
            token,
            balance_1: balance1,
            balance_2: balance2,
            nonce,
            expires_at: expiresAt,
            state: CHANNEL_STATE.OPEN
        };

        await kv.set(channelKey, newChannel);
        // Add to principal's channel list
        await kv.sadd(`channels:list:${principal1}`, channelKey);
        await kv.sadd(`channels:list:${principal2}`, channelKey);
    }
}

async function handleCloseChannel(data: EventData) {
    const {
        channel: { 'balance-1': balance1, 'balance-2': balance2, 'expires-at': expiresAt, nonce },
        'channel-key': { 'principal-1': principal1, 'principal-2': principal2, token }
    } = data;

    const channelKey = getChannelKey(principal1, principal2, token || undefined);
    const channel = await kv.get<Channel>(channelKey);

    if (channel) {
        if (channel.state !== CHANNEL_STATE.OPEN) {
            console.warn(`Invalid state for close: ${channel.state}`);
            return;
        }

        await kv.hset(channelKey, {
            balance_1: balance1,
            balance_2: balance2,
            nonce,
            expires_at: expiresAt,
            state: CHANNEL_STATE.CLOSED
        });
    } else {
        const newChannel: Channel = {
            id: channelKey,
            principal_1: principal1,
            principal_2: principal2,
            token,
            balance_1: balance1,
            balance_2: balance2,
            nonce,
            expires_at: expiresAt,
            state: CHANNEL_STATE.CLOSED
        };
        await kv.set(channelKey, newChannel);
    }
}

async function handleForceCancel(data: EventData) {
    const {
        channel: { 'balance-1': balance1, 'balance-2': balance2, 'expires-at': expiresAt, nonce },
        'channel-key': { 'principal-1': principal1, 'principal-2': principal2, token },
        sender
    } = data;

    if (sender === CONFIG.OWNER) {
        console.info('Ignoring force-cancel from owner');
        return;
    }

    const channelKey = getChannelKey(principal1, principal2, token || undefined);
    const channel = await kv.get<Channel>(channelKey);

    if (channel) {
        if (channel.state !== CHANNEL_STATE.OPEN) {
            console.warn(`Invalid state for force-cancel: ${channel.state}`);
            return;
        }

        // Update channel state
        await kv.hset(channelKey, {
            state: CHANNEL_STATE.CLOSING,
            nonce
        });

        // Check signatures and dispute if needed
        const signatures = await kv.get<Signature>(getSignatureKey(channelKey));
        if (signatures) {
            const cancelBalance = CONFIG.OWNER === principal1 ? balance1 : balance2;
            const myBalance = CONFIG.OWNER === principal1 ?
                signatures.balance_1 : signatures.balance_2;
            const theirBalance = CONFIG.OWNER === principal1 ?
                signatures.balance_2 : signatures.balance_1;

            if (
                BigInt(myBalance) > BigInt(cancelBalance) &&
                BigInt(signatures.nonce) > BigInt(nonce)
            ) {
                // Dispute closure logic
                await disputeClosure(token, sender!, myBalance, theirBalance, signatures);
            }
        }
    } else {
        // Create new channel in closing state
        const newChannel: Channel = {
            id: channelKey,
            principal_1: principal1,
            principal_2: principal2,
            token,
            balance_1: balance1,
            balance_2: balance2,
            nonce,
            expires_at: expiresAt,
            state: CHANNEL_STATE.CLOSING
        };
        await kv.set(channelKey, newChannel);
    }
}

// Helper function for dispute closure
async function disputeClosure(
    token: string | null,
    sender: string,
    myBalance: string,
    theirBalance: string,
    signatures: Signature
) {
    const withdrawPc = Pc.principal(CONFIG.CONTRACT_ADDRESS!).willSendGte(
        BigInt(myBalance) + BigInt(theirBalance)
    );

    if (token) {
        // Handle token PC
    } else {
        withdrawPc.ustx();
    }

    const txOptions = {
        contractAddress: CONFIG.CONTRACT_ADDRESS!,
        contractName: CONFIG.CONTRACT_NAME!,
        functionName: 'dispute-closure',
        functionArgs: [
            getTokenCV(token),
            Cl.principal(sender),
            Cl.uint(myBalance),
            Cl.uint(theirBalance),
            Cl.uint(signatures.nonce),
            Cl.uint(signatures.action),
            Cl.bufferFromHex(signatures.owner_signature),
            Cl.bufferFromHex(signatures.other_signature),
            signatures.actor ?
                Cl.some(Cl.principal(signatures.actor)) :
                Cl.none(),
            signatures.secret ?
                Cl.some(Cl.buffer(Uint8Array.from(Buffer.from(signatures.secret, 'hex')))) :
                Cl.none(),
        ],
        postConditions: [withdrawPc] as any,
        senderKey: CONFIG.PRIVATE_KEY!,
        network: network,
    };

    try {
        const transaction = await makeContractCall(txOptions);
        const response: any = await broadcastTransaction({
            transaction,
            network: network,
        });

        if (response.error) {
            throw new Error(`Broadcast error: ${response.error}`);
        }
    } catch (error) {
        console.error('Dispute closure error:', error);
        throw error;
    }
}

// Helper for token CV creation
function getTokenCV(token: string | null) {
    if (!token) return Cl.none();
    const [address, contractName] = token.split('.');
    return Cl.some(Cl.contractPrincipal(address, contractName));
}

// Continuing lib/hooks/events.ts

async function handleForceClose(data: EventData) {
    const {
        channel: { 'balance-1': balance1, 'balance-2': balance2, 'expires-at': expiresAt, nonce },
        'channel-key': { 'principal-1': principal1, 'principal-2': principal2, token },
        sender
    } = data;

    if (sender === CONFIG.OWNER) {
        console.info('Ignoring force-close from owner');
        return;
    }

    const channelKey = getChannelKey(principal1, principal2, token || undefined);
    const channel = await kv.get<Channel>(channelKey);

    if (channel) {
        if (channel.state !== CHANNEL_STATE.OPEN) {
            console.warn(`Invalid state for force-close: ${channel.state}`);
            return;
        }

        // Atomic update
        await kv.hset(channelKey, {
            balance_1: balance1,
            balance_2: balance2,
            nonce,
            expires_at: expiresAt,
            state: CHANNEL_STATE.CLOSING
        });

        // Check signatures
        const signatures = await kv.get<Signature>(getSignatureKey(channelKey));
        if (signatures) {
            const closeBalance = CONFIG.OWNER === principal1 ? balance1 : balance2;
            const signatureBalance = CONFIG.OWNER === principal1 ?
                signatures.balance_1 : signatures.balance_2;

            if (
                BigInt(signatureBalance) > BigInt(closeBalance) &&
                BigInt(signatures.nonce) > BigInt(nonce)
            ) {
                await disputeClosure(token, sender!, signatureBalance, closeBalance, signatures);
            }
        }
    } else {
        // Create new channel in closing state
        const newChannel: Channel = {
            id: channelKey,
            principal_1: principal1,
            principal_2: principal2,
            token,
            balance_1: balance1,
            balance_2: balance2,
            nonce,
            expires_at: expiresAt,
            state: CHANNEL_STATE.CLOSING
        };
        await kv.set(channelKey, newChannel);
    }
}

async function handleFinalize(data: EventData) {
    const {
        channel: { 'balance-1': balance1, 'balance-2': balance2, 'expires-at': expiresAt, nonce },
        'channel-key': { 'principal-1': principal1, 'principal-2': principal2, token }
    } = data;

    const channelKey = getChannelKey(principal1, principal2, token || undefined);
    const channel = await kv.get<Channel>(channelKey);

    if (channel) {
        if (channel.state !== CHANNEL_STATE.CLOSING) {
            console.warn(`Invalid state for finalize: ${channel.state}`);
            return;
        }

        await kv.hset(channelKey, {
            balance_1: balance1,
            balance_2: balance2,
            nonce,
            expires_at: expiresAt,
            state: CHANNEL_STATE.CLOSED
        });
    } else {
        const newChannel: Channel = {
            id: channelKey,
            principal_1: principal1,
            principal_2: principal2,
            token,
            balance_1: balance1,
            balance_2: balance2,
            nonce,
            expires_at: expiresAt,
            state: CHANNEL_STATE.CLOSED
        };
        await kv.set(channelKey, newChannel);
    }
}

async function handleDeposit(data: EventData) {
    const {
        channel: { 'balance-1': balance1, 'balance-2': balance2, 'expires-at': expiresAt, nonce },
        'channel-key': { 'principal-1': principal1, 'principal-2': principal2, token },
        sender,
        'my-signature': mySignature,
        'their-signature': theirSignature
    } = data;

    const channelKey = getChannelKey(principal1, principal2, token || undefined);
    const channel = await kv.get<Channel>(channelKey);

    // Use atomic operations for consistency
    const pipeline = kv.pipeline();

    if (channel) {
        if (channel.state !== CHANNEL_STATE.OPEN) {
            console.warn(`Invalid state for deposit: ${channel.state}`);
            return;
        }

        if (BigInt(nonce) <= BigInt(channel.nonce)) {
            console.warn('Old nonce in deposit event');
            return;
        }

        pipeline.hset(channelKey, {
            balance_1: balance1,
            balance_2: balance2,
            nonce,
            expires_at: expiresAt
        });
    } else {
        const newChannel: Channel = {
            id: channelKey,
            principal_1: principal1,
            principal_2: principal2,
            token,
            balance_1: balance1,
            balance_2: balance2,
            nonce,
            expires_at: expiresAt,
            state: CHANNEL_STATE.OPEN
        };
        pipeline.set(channelKey, newChannel);
    }

    // Store signatures
    const ownerSignature = sender === CONFIG.OWNER ? mySignature : theirSignature;
    const otherSignature = sender === CONFIG.OWNER ? theirSignature : mySignature;

    const signature: Signature = {
        channel: channelKey,
        balance_1: balance1,
        balance_2: balance2,
        nonce,
        action: ACTION.DEPOSIT,
        actor: sender!,
        owner_signature: ownerSignature!,
        other_signature: otherSignature!
    };

    pipeline.set(getSignatureKey(channelKey), signature);
    await pipeline.exec();
}

async function handleWithdraw(data: EventData) {
    const {
        channel: { 'balance-1': balance1, 'balance-2': balance2, 'expires-at': expiresAt, nonce },
        'channel-key': { 'principal-1': principal1, 'principal-2': principal2, token },
        sender,
        'my-signature': mySignature,
        'their-signature': theirSignature
    } = data;

    const channelKey = getChannelKey(principal1, principal2, token || undefined);
    const channel = await kv.get<Channel>(channelKey);

    const pipeline = kv.pipeline();

    if (channel) {
        if (channel.state !== CHANNEL_STATE.OPEN) {
            console.warn(`Invalid state for withdraw: ${channel.state}`);
            return;
        }

        if (BigInt(nonce) <= BigInt(channel.nonce)) {
            console.warn('Old nonce in withdraw event');
            return;
        }

        pipeline.hset(channelKey, {
            balance_1: balance1,
            balance_2: balance2,
            nonce,
            expires_at: expiresAt
        });
    } else {
        const newChannel: Channel = {
            id: channelKey,
            principal_1: principal1,
            principal_2: principal2,
            token,
            balance_1: balance1,
            balance_2: balance2,
            nonce,
            expires_at: expiresAt,
            state: CHANNEL_STATE.OPEN
        };
        pipeline.set(channelKey, newChannel);
    }

    // Store signatures
    const ownerSignature = sender === CONFIG.OWNER ? mySignature : theirSignature;
    const otherSignature = sender === CONFIG.OWNER ? theirSignature : mySignature;

    const signature: Signature = {
        channel: channelKey,
        balance_1: balance1,
        balance_2: balance2,
        nonce,
        action: ACTION.WITHDRAW,
        actor: sender!,
        owner_signature: ownerSignature!,
        other_signature: otherSignature!
    };

    pipeline.set(getSignatureKey(channelKey), signature);
    await pipeline.exec();
}

async function handleDisputeClosure(data: EventData) {
    const {
        channel: { 'balance-1': balance1, 'balance-2': balance2, 'expires-at': expiresAt, nonce },
        'channel-key': { 'principal-1': principal1, 'principal-2': principal2, token }
    } = data;

    const channelKey = getChannelKey(principal1, principal2, token || undefined);
    const channel = await kv.get<Channel>(channelKey);

    if (channel) {
        if (channel.state !== CHANNEL_STATE.CLOSING) {
            console.warn(`Invalid state for dispute: ${channel.state}`);
            return;
        }

        await kv.hset(channelKey, {
            balance_1: balance1,
            balance_2: balance2,
            nonce,
            expires_at: expiresAt,
            state: CHANNEL_STATE.CLOSED
        });
    } else {
        const newChannel: Channel = {
            id: channelKey,
            principal_1: principal1,
            principal_2: principal2,
            token,
            balance_1: balance1,
            balance_2: balance2,
            nonce,
            expires_at: expiresAt,
            state: CHANNEL_STATE.CLOSED
        };
        await kv.set(channelKey, newChannel);
    }
}

// Export all handlers
export {
    EVENTS,
    processEvent,
    handleFundChannel,
    handleCloseChannel,
    handleForceCancel,
    handleForceClose,
    handleFinalize,
    handleDeposit,
    handleWithdraw,
    handleDisputeClosure
};
