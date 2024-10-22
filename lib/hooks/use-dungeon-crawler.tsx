import { useCallback } from 'react';
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
    explore: (interaction: string, action: string) => Promise<void>;
    interact: (interaction: string, action: string) => Promise<void>;
}

export function useDungeonCrawler(
    contractAddress = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName = 'dungeon-crawler-rc5'
): DungeonCrawlerHook {
    const { stxAddress } = useGlobalState();

    const interact = useCallback(async (interaction: string, action: string) => {
        if (!stxAddress) return;

        const [interactionAddress, interactionName] = interaction.split('.');

        const functionArgs = [
            contractPrincipalCV(interactionAddress, interactionName),
            stringAsciiCV(action)
        ];

        await openContractCall({
            network,
            contractAddress,
            contractName,
            functionName: 'interact',
            functionArgs,
            postConditionMode: PostConditionMode.Allow,
        });
    }, [contractAddress, contractName, stxAddress]);

    const explore = useCallback(async (interaction: string, action: string) => {
        if (!stxAddress) return;

        const functionArgs = [
            optionalCVOf(contractPrincipalCV(interaction.split('.')[0], interaction.split('.')[1])), optionalCVOf(stringAsciiCV(action)),
            noneCV(), noneCV(),
            noneCV(), noneCV(),
            noneCV(), noneCV(),
            noneCV(), noneCV(),
            noneCV(), noneCV(),
            noneCV(), noneCV(),
            noneCV(), noneCV(),
        ];

        await openContractCall({
            network,
            contractAddress,
            contractName,
            functionName: 'explore',
            functionArgs,
            postConditionMode: PostConditionMode.Allow,
        });
    }, [contractAddress, contractName, stxAddress]);

    return {
        explore,
        interact,
    };
}