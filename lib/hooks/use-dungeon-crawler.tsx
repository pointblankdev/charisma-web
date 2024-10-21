import { useState, useCallback } from 'react';
import { useInteraction } from './use-interaction';
import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import {
    contractPrincipalCV,
    stringAsciiCV,
    noneCV,
    PostConditionMode,
    optionalCVOf
} from '@stacks/transactions';
import { useGlobalState } from './global-state-context';

const network = new StacksMainnet();

interface DungeonCrawlerHook {
    getInteractionUri: () => Promise<string | null>;
    getActions: () => Promise<string[]>;
    executeAction: (action: string) => Promise<void>;
    loading: boolean;
    error: string | null;
}

export function useDungeonCrawler(contractAddress: string, contractName: string): DungeonCrawlerHook {
    const {
        getInteractionUri,
        getActions,
        loading,
        error
    } = useInteraction(contractAddress, contractName);

    const { stxAddress } = useGlobalState();

    const executeAction = useCallback(async (action: string) => {
        if (!stxAddress) return

        const functionArgs = [
            optionalCVOf(contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'meme-engine-cha-rc3')),
            optionalCVOf(stringAsciiCV("TAP")),
            optionalCVOf(contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'meme-engine-iouwelsh-rc1')),
            optionalCVOf(stringAsciiCV("TAP")),
            optionalCVOf(contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'meme-engine-iouroo-rc1')),
            optionalCVOf(stringAsciiCV("TAP")),
            optionalCVOf(contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'fatigue-rc1')),
            optionalCVOf(stringAsciiCV("BURN")),
            optionalCVOf(contractPrincipalCV(contractAddress, contractName)),
            optionalCVOf(stringAsciiCV(action.toUpperCase())),
            optionalCVOf(contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'hot-potato-rc1')),
            optionalCVOf(stringAsciiCV("PASS")),
            noneCV(),
            noneCV(),
            noneCV(),
            noneCV(),
            noneCV(),
            noneCV(),
        ];

        await openContractCall({
            network,
            contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
            contractName: 'dungeon-crawler-rc4',
            functionName: 'explore',
            functionArgs,
            postConditionMode: PostConditionMode.Allow,
            onFinish: (data) => {
                console.log('Contract call successful', data);
            },
            onCancel: () => {
                console.log('Contract call canceled');
            }
        });
    }, [stxAddress, contractAddress, contractName]);

    return {
        getInteractionUri,
        getActions,
        executeAction,
        loading,
        error
    };
}