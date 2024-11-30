import { useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import {
  contractPrincipalCV,
  stringAsciiCV,
  noneCV,
  PostConditionMode,
  optionalCVOf,
  Pc
} from '@stacks/transactions';
import { useGlobalState } from './global-state-context';
import { network } from '@components/stacks-session/connect';

interface Interaction {
  contractAddress: string;
  action: string;
}

interface ExploreParams {
  interactions: Interaction[];
}

interface DungeonCrawlerHook {
  explore: (params: ExploreParams) => Promise<void>;
  interact: (metadata: any, action: string) => Promise<void>;
}

export function useDungeonCrawler(
  contractAddress = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
  contractName = 'dungeon-crawler-v0'
): DungeonCrawlerHook {
  const { stxAddress } = useGlobalState();

  const interact = useCallback(
    async (metadata: any, action: string) => {
      if (!stxAddress) return;

      function buildPostConditions(postConditions: any[]) {
        return (
          postConditions?.map(({ principal, contractId, tokenName }: any) => {
            return Pc.principal(principal.replace('tx-sender', stxAddress))
              .willSendGte(1)
              .ft(contractId, tokenName);
          }) || []
        );
      }

      const [interactionAddress, interactionName] = metadata.contract.split('.');

      const functionArgs = [
        contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'charisma-rulebook-v0'),
        contractPrincipalCV(interactionAddress, interactionName),
        stringAsciiCV(action)
      ] as any[];

      await openContractCall({
        network: network,
        contractAddress,
        contractName,
        functionName: 'interact',
        functionArgs,
        postConditionMode: metadata.postConditionMode,
        postConditions: buildPostConditions(metadata.postConditions) as any[]
      });
    },
    [contractAddress, contractName, stxAddress]
  );

  const explore = useCallback(
    async ({ interactions }: ExploreParams) => {
      if (!stxAddress) return;

      const functionArgs = interactions.reduce(
        (args, { contractAddress, action }) => {
          const [principal, name] = contractAddress.split('.');
          args.push(optionalCVOf(contractPrincipalCV(principal, name)));
          args.push(optionalCVOf(stringAsciiCV(action)));
          return args;
        },
        [
          contractPrincipalCV('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', 'charisma-rulebook-v0')
        ] as any[]
      );

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
        postConditionMode: PostConditionMode.Allow
      });
    },
    [contractAddress, contractName, stxAddress]
  );

  return {
    explore,
    interact
  };
}
