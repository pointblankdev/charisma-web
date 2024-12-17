import { network } from '@components/stacks-session/connect';
import { useConnect } from '@stacks/connect-react';
import { PostConditionMode } from '@stacks/transactions';

export function useContractDeployment() {
  const { doContractDeploy } = useConnect();

  const deployContract = (args: {
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

    doContractDeploy({
      network,
      contractName,
      codeBody,
      clarityVersion: 3,
      postConditionMode: PostConditionMode.Deny,
      postConditions,
      onFinish: (result: any) => console.log('Contract deployed:', result)
    });
  };

  return { deployContract };
}
