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

interface Interaction {
    contractAddress: string;
    action: string;
}

interface ExploreParams {
    interactions: Interaction[];
}

interface DungeonCrawlerHook {
    explore: (params: ExploreParams) => Promise<void>;
    interact: (interaction: string, action: string) => Promise<void>;
}

export function useDungeonCrawler(
    contractAddress = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName = 'dungeon-crawler-rc6'
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

    const explore = useCallback(async ({ interactions }: ExploreParams) => {
        if (!stxAddress) return;

        const functionArgs = interactions.slice(0, 8).reduce((args, { contractAddress, action }) => {
            const [principal, name] = contractAddress.split('.');
            console.log(principal, name);
            args.push(optionalCVOf(contractPrincipalCV(principal, name)));
            args.push(optionalCVOf(stringAsciiCV(action)));
            return args;
        }, [] as any[]);

        // Fill remaining slots with noneCV if less than 8 interactions are provided
        while (functionArgs.length < 16) {
            functionArgs.push(noneCV());
        }

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
