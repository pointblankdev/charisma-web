import { describe, it, expect } from 'vitest';
import { kv } from '@vercel/kv';
// These helpers should generate the exact keys used by your event handlers.
import { getChannelKey, getSignatureKey } from '@lib/stackflow/utils';
import { fetchChannels, updateChannel } from '../channels';
import { Channel } from '../types';

// These sample principals and token should match those used when events are handled.
const principal1 = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS';
const principal2 = 'SP3619DGWH08262BJAG0NPFHZQDPN4TKMXHC0ZQDN';
const token = null;  // Use a string token here if your channels are token-based

// Compute keys in the same way as the event-handlers.
const channelKey = getChannelKey(principal1, principal2, token || undefined);
const signatureKey = getSignatureKey(channelKey);
const channelListKey1 = `channels:list:${principal1}`;
const channelListKey2 = `channels:list:${principal2}`;

describe('Event Handlers KV Data', () => {
    it('reads channel data stored by event-handlers', async () => {
        const channelData = await kv.get(channelKey);
        console.log(`Channel data for key ${channelKey}:`, channelData);
        // If no data is found, adjust the test data or ensure an event has been handled.
        expect(channelData).toBeDefined();
    });

    it('reads channel signature data stored by event-handlers', async () => {
        const signatureData = await kv.get(signatureKey);
        console.log(`Signature data for key ${signatureKey}:`, signatureData);
        expect(signatureData).toBeDefined();
    });

    it('reads channel list for principal1', async () => {
        const channelList = await kv.smembers(channelListKey1);
        console.log(`Channel list for ${principal1} under key ${channelListKey1}:`, channelList);
        expect(Array.isArray(channelList)).toBe(true);
    });

    it('reads channel list for principal2', async () => {
        const channelList = await kv.smembers(channelListKey2);
        console.log(`Channel list for ${principal2} under key ${channelListKey2}:`, channelList);
        expect(Array.isArray(channelList)).toBe(true);
    });

    it('should read all channels', async () => {
        const allPrincipals = await kv.smembers('all:principals')
        console.log(`All principals:`, allPrincipals);
        expect(Array.isArray(allPrincipals)).toBe(true);

        const allChannels = await fetchChannels();
        console.log(`All channels:`, allChannels);
        expect(Array.isArray(allChannels)).toBe(true);
    });
});

describe('Channel Updater', () => {
    it('updates channel data', async () => {
        const channelData = await kv.get(channelKey) as Channel;
        console.log(`Channel data for key ${channelKey}:`, channelData);
        await updateChannel(
            'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS:SP3619DGWH08262BJAG0NPFHZQDPN4TKMXHC0ZQDN:null',
            1500, //Number(channelData.balance_1),
            100, //Number(channelData.balance_2),
            15, //channelData.nonce,
            channelData.expires_at,
            'open'
        );
        const updatedChannelData = await kv.get(channelKey) as Channel;
        console.log(`Updated channel data for key ${channelKey}:`, updatedChannelData);
    });
});
