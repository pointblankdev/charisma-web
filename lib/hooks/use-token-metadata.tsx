import { getContractMetadata } from '@lib/user-api';

export async function fetchTokenMetadata(contractId: string) {
  if (contractId === '.stx') {
    return { decimals: 6, name: 'Stacks', symbol: 'STX' };
  }
  const response = await getContractMetadata(contractId);
  if (response.ok) {
    return await response.json();
  }
}
