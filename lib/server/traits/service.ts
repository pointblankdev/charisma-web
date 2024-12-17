import { client } from '@lib/stacks-api';
import { kv } from '@vercel/kv';
import _ from 'lodash';

interface ContractsByTraitParams {
  traitAbi: any; // The trait ABI in JSON format
  limit?: number; // Optional limit parameter (default 20, max 50)
  offset?: number; // Optional offset parameter (default 0)
}

export async function getContractsByTrait({
  traitAbi,
  limit = 20,
  offset = 0
}: ContractsByTraitParams): Promise<any> {
  const cacheKey = `contracts-by-trait:${JSON.stringify(traitAbi)}:${limit}:${offset}`;

  try {
    // Try to get from cache first
    // const cachedData = await kv.get(cacheKey);
    // if (cachedData !== null) {
    //   return cachedData as any;
    // }

    // If not in cache, fetch from API
    const response = await client.GET('/extended/v1/contract/by_trait', {
      params: {
        query: {
          trait_abi: JSON.stringify(traitAbi),
          limit: Math.min(limit, 50), // Ensure limit doesn't exceed 50
          offset: Math.max(offset, 0) // Ensure offset isn't negative
        }
      }
    });

    // Cache the result for 1 hour
    // await kv.set(cacheKey, response.data?.results, {
    //   ex: 60 * 60 // 1 hour
    // });

    return _.uniqBy(response.data?.results, 'contract_id');
  } catch (error) {
    console.error('Error fetching contracts by trait:', error);
    throw error;
  }
}

// Helper function to fetch all contracts for a trait
export async function getAllContractsByTrait(traitAbi: any, maxLimit = 1000): Promise<string[]> {
  const contracts: string[] = [];
  const batchSize = 50;
  let offset = 0;
  let hasMore = true;

  while (hasMore && contracts.length < maxLimit) {
    const response = await getContractsByTrait({
      traitAbi,
      limit: Math.min(batchSize, maxLimit - contracts.length),
      offset
    });

    contracts.push(...response.contracts);

    offset += batchSize;
    hasMore = contracts.length < response.total;

    if (contracts.length >= maxLimit) {
      break;
    }
  }

  return contracts;
}

// Example SIP-009 NFT trait for reference
export const DEXTERITY_ABI = {
  maps: [],
  epoch: 'Epoch30',
  functions: [
    {
      args: [
        {
          name: 'amount',
          type: 'uint128'
        },
        {
          name: 'opcode',
          type: {
            optional: {
              buffer: {
                length: 16
              }
            }
          }
        }
      ],
      name: 'execute',
      access: 'public',
      outputs: {
        type: {
          response: {
            ok: {
              tuple: [
                {
                  name: 'dk',
                  type: 'uint128'
                },
                {
                  name: 'dx',
                  type: 'uint128'
                },
                {
                  name: 'dy',
                  type: 'uint128'
                }
              ]
            },
            error: 'uint128'
          }
        }
      }
    },
    {
      args: [
        {
          name: 'amount',
          type: 'uint128'
        },
        {
          name: 'opcode',
          type: {
            optional: {
              buffer: {
                length: 16
              }
            }
          }
        }
      ],
      name: 'quote',
      access: 'read_only',
      outputs: {
        type: {
          response: {
            ok: {
              tuple: [
                {
                  name: 'dk',
                  type: 'uint128'
                },
                {
                  name: 'dx',
                  type: 'uint128'
                },
                {
                  name: 'dy',
                  type: 'uint128'
                }
              ]
            },
            error: 'uint128'
          }
        }
      }
    }
  ],
  variables: [],
  clarity_version: 'Clarity3',
  fungible_tokens: [],
  non_fungible_tokens: []
};

export async function getContractInfo(contractId: string): Promise<any> {
  try {
    const response = await client.GET('/extended/v1/contract/{contract_id}', {
      params: {
        path: { contract_id: contractId }
      }
    });

    return response;
  } catch (error) {
    console.error(`Error fetching contract info for ${contractId}:`, error);
    throw error;
  }
}
