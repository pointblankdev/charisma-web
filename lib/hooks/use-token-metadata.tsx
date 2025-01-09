import { getContractMetadata } from '@lib/user-api';

export async function fetchTokenMetadata(contractId: string) {
  if (contractId === '.stx') {
    return { contractId: '.stx', decimals: 6, name: 'Stacks', symbol: 'STX', description: 'STX is the native token of the Stacks blockchain.' };
  }
  const response = await getContractMetadata(contractId);
  if (response.ok) {
    return await response.json();
  }
}
