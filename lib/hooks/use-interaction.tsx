import { useState, useCallback } from 'react';
import { callReadOnlyFunction, cvToValue } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { useGlobalState } from './global-state-context';

const network = new StacksMainnet();

interface InteractionHook {
    getInteractionUri: () => Promise<string | null>;
    getActions: () => Promise<string[]>;
    loading: boolean;
    error: string | null;
}

export function useInteraction(contractAddress: string, contractName: string): InteractionHook {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { stxAddress } = useGlobalState();

    const callContract = useCallback(async (functionName: string, functionArgs: any[] = []) => {
        if (!stxAddress) return;

        setLoading(true);
        setError(null);

        try {
            const result = await callReadOnlyFunction({
                network,
                contractAddress,
                contractName,
                functionName,
                functionArgs,
                senderAddress: stxAddress,
            });

            return result;
        } catch (err) {
            setError((err as Error).message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [stxAddress, contractAddress, contractName]);

    const getInteractionUri = useCallback(async (): Promise<string | null> => {
        const result = await callContract('get-interaction-uri');
        return cvToValue(result!);
    }, [callContract]);

    const getActions = useCallback(async (): Promise<string[]> => {
        const result = await callContract('get-actions');
        return cvToValue(result!);
    }, [callContract]);

    return {
        getInteractionUri,
        getActions,
        loading,
        error,
    };
}