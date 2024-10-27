import { useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import {
    contractPrincipalCV,
    stringAsciiCV,
    noneCV,
    PostConditionMode,
    optionalCVOf,
    Pc
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
    interact: (interaction: any, action: string) => Promise<void>;
}

export function useDungeonCrawler(
    contractAddress = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    contractName = 'dungeon-crawler-rc8'
): DungeonCrawlerHook {
    const { stxAddress } = useGlobalState();

    const interact = useCallback(async (interaction: any, action: string) => {
        if (!stxAddress) return;


        function buildPostConditions(postConditions: any[]) {
            return postConditions?.map(({ principal, contractId, tokenName }: any) => {
                return Pc.principal(principal.replace('tx-sender', stxAddress)).willSendGte(1).ft(contractId, tokenName);
            }) || [];
        }

        const [interactionAddress, interactionName] = interaction.contract.split('.');

        const functionArgs = [
            contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'dungeon-keeper-rc6'),
            contractPrincipalCV(interactionAddress, interactionName),
            stringAsciiCV(action)
        ];

        await openContractCall({
            network,
            contractAddress,
            contractName,
            functionName: 'interact',
            functionArgs,
            postConditionMode: interaction.postConditionMode,
            postConditions: buildPostConditions(interaction.postConditions),
        });
    }, [contractAddress, contractName, stxAddress]);

    const explore = useCallback(async ({ interactions }: ExploreParams) => {
        if (!stxAddress) return;

        const functionArgs = interactions.reduce((args, { contractAddress, action }) => {
            const [principal, name] = contractAddress.split('.');
            args.push(optionalCVOf(contractPrincipalCV(principal, name)));
            args.push(optionalCVOf(stringAsciiCV(action)));
            return args;
        }, [contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'dungeon-keeper-rc6')] as any[]);

        // Fill remaining slots with noneCV if less than 8 interactions are provided
        while (functionArgs.length < 17) {
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
