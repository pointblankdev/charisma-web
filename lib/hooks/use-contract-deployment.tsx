import { network } from '@components/stacks-session/connect';
import { PostConditionMode } from '@stacks/transactions';

export function useContractDeployment(doContractDeploy: any) {
  const deployContract = (args: { contractName: string; codeBody: string; metadata: any }) => {
    const { metadata, contractName, codeBody } = args;
    if (!metadata) {
      alert('Please generate metadata before deploying');
      return;
    }

    doContractDeploy({
      network,
      contractName,
      codeBody,
      clarityVersion: 3,
      postConditionMode: PostConditionMode.Allow,
      onFinish: (result: any) => console.log('Contract deployed:', result)
    });
  };

  return { deployContract };
}
