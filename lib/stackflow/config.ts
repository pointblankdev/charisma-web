// lib/config.ts
import {
    STACKS_MAINNET,
    STACKS_TESTNET,
    STACKS_MOCKNET,
    STACKS_DEVNET,
} from '@stacks/network';

export const CHANNEL_STATE = {
    OPEN: 'open',
    CLOSING: 'closing',
    CLOSED: 'closed',
} as const;

export const ACTION = {
    CLOSE: 0,
    TRANSFER: 1,
    DEPOSIT: 2,
    WITHDRAW: 3,
} as const;

export const CONFIG = {
    OWNER: process.env.OWNER_ADDRESS,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    CONTRACT_NAME: process.env.CONTRACT_NAME,
    API_KEY: process.env.STACKS_API_KEY,
} as const;

export function getNetwork() {
    const networkName = process.env.STACKS_NETWORK;
    let network;

    switch (networkName) {
        case 'mainnet':
            network = STACKS_MAINNET;
            break;
        case 'testnet':
            network = STACKS_TESTNET;
            break;
        case 'mocknet':
            network = STACKS_MOCKNET;
            break;
        case 'devnet':
            network = STACKS_DEVNET;
            break;
        default:
            throw new Error(`Unknown network: ${networkName}`);
    }

    if (process.env.CHAIN_ID) {
        network.chainId = parseInt(process.env.CHAIN_ID);
    }

    if (process.env.API_URL) {
        network.client.baseUrl = process.env.API_URL;
    }

    return network;
}