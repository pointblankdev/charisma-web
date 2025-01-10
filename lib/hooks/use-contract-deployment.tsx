import { network } from '@components/stacks-session/connect';
// import { useConnect } from '@stacks/connect-react';
import { PostConditionMode } from '@stacks/transactions';
import { useGlobalState } from './global-state-context';

export function useContractDeployment() {
  // const { doContractDeploy } = useConnect();
  const { stxAddress } = useGlobalState();

  const deployContract = async (args: {
    contractName: string;
    codeBody: string;
    postConditions: any[];
    metadata: any;
  }) => {
    const { metadata, contractName, postConditions, codeBody } = args;
    if (!metadata) {
      alert('Please generate metadata before deploying');
      return;
    }

    // doContractDeploy({
    //   network,
    //   contractName,
    //   codeBody,
    //   clarityVersion: 3,
    //   postConditionMode: PostConditionMode.Deny,
    //   postConditions,
    //   onFinish: (result: any) => console.log('Contract deployed:', result)
    // });

    // Then update the metadata
    const fullContractName = `${stxAddress}.${contractName}`;
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
