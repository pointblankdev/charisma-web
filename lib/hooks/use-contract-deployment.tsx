import { useGlobalState } from './global-state-context';
import { Vault } from 'dexterity-sdk';

export function useContractDeployment() {
  const { stxAddress } = useGlobalState();

  const deployContract = async (args: any) => {
    const { metadata, contractName, postConditions, codeBody } = args;
    if (!metadata) {
      alert('Please generate metadata before deploying');
      return;
    }

    const fullContractName = `${stxAddress}.${contractName}`;

    const vault = new Vault({
      contractId: fullContractName,
      ...metadata,
      fee: metadata.properties.lpRebatePercent * 10000,
      liquidity: [
        {
          ...metadata.properties.tokenAMetadata,
          reserves: metadata.properties.initialLiquidityA
        },
        {
          ...metadata.properties.tokenBMetadata,
          reserves: metadata.properties.initialLiquidityB
        }
      ]
    });

    await vault.deployContract()

    // Then update the metadata
    const response = await fetch(`/api/v0/metadata/update/${fullContractName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      throw new Error('Failed to update metadata');
    }
  };

  return { deployContract };
}
