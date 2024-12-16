// pages/contract-deployer.tsx
import { useState } from 'react';
import { Card } from '@components/ui/card';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { useConnect } from '@stacks/connect-react';
import { network } from '@components/stacks-session/connect';
import { PostConditionMode } from '@stacks/transactions';
import Layout from '@components/layout/layout';
import {
  generateContractCode,
  getFullContractName,
  sanitizeContractName
} from '@lib/codegen/dexterity';
import { TokenSelector } from '@components/dexterity/token-selector';
import { PoolConfigurationForm } from '@components/dexterity/pool-configuration-form';
import { MetadataPreview } from '@components/dexterity/metadata-preview';
import { CodePreview } from '@components/dexterity/code-preview';

type WizardStep = 'select-token-a' | 'configure-pool';

export default function ContractDeployer() {
  const [contractCode, setContractCode] = useState('');
  const [contractName, setContractName] = useState('');
  const [fullContractName, setFullContractName] = useState('');
  const [metadata, setMetadata] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>('select-token-a');
  const { stxAddress } = useGlobalState();
  const { doContractDeploy } = useConnect();

  const form = useForm({
    defaultValues: {
      contractName: 'TokenPair',
      tokenAContract: '',
      tokenBContract: '',
      lpTokenName: 'Token Pair LP',
      lpTokenSymbol: 'TPLP',
      lpRebatePercent: 5,
      description: 'Liquidity pool token representing shares in a token pair.'
    }
  });

  const handleTokenASelection = (token: { contractId: string; name?: string; symbol?: string }) => {
    form.setValue('tokenAContract', token.contractId);
    if (token.name && token.symbol) {
      form.setValue('contractName', `${token.symbol}Pair`);
      form.setValue('lpTokenName', `${token.symbol} LP Token`);
      form.setValue('lpTokenSymbol', `${token.symbol}LP`);
      form.setValue(
        'description',
        `Liquidity pool token representing shares in a ${token.name} pair`
      );
    }
    setCurrentStep('configure-pool');
  };

  const generateMetadata = async () => {
    const formData = form.getValues();
    setIsGenerating(true);

    try {
      const response = await fetch('/api/v0/metadata/generate/' + fullContractName, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.lpTokenName,
          symbol: formData.lpTokenSymbol,
          decimals: 6,
          identifier: formData.lpTokenSymbol,
          description: formData.description,
          properties: {
            contractName: formData.contractName,
            tokenAContract: formData.tokenAContract,
            tokenBContract: formData.tokenBContract,
            lpRebatePercent: formData.lpRebatePercent
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate metadata');
      }

      const result = await response.json();
      setMetadata(result.metadata);
    } catch (error) {
      console.error('Error generating metadata:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = () => {
    const data = form.getValues();
    const safeName = sanitizeContractName(data.contractName);
    const fullName = getFullContractName(safeName, stxAddress);
    setContractName(safeName);
    setFullContractName(fullName);

    const code = generateContractCode({
      contractName: data.contractName,
      tokenAContract: data.tokenAContract,
      tokenBContract: data.tokenBContract,
      lpTokenName: data.lpTokenName,
      lpTokenSymbol: data.lpTokenSymbol,
      lpRebatePercent: data.lpRebatePercent
    });

    setContractCode(code);
  };

  const deployContract = async (e: any) => {
    e.preventDefault();
    if (!metadata) {
      alert('Please generate metadata before deploying');
      return;
    }

    doContractDeploy({
      network,
      contractName,
      codeBody: contractCode,
      clarityVersion: 3,
      postConditionMode: PostConditionMode.Deny,
      onFinish: (result: any) => {
        console.log('Contract deployed:', result);
      }
    });
  };

  return (
    <Layout>
      <div className="container max-w-6xl p-6 mx-auto space-y-6">
        <Card className="p-6">
          {currentStep === 'select-token-a' ? (
            <div>
              <div className="max-w-2xl mx-auto">
                <Alert className="flex justify-center mb-6">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4" />
                    <AlertDescription>
                      Select Token A for your liquidity pool. This will be the primary token in your
                      pair.
                    </AlertDescription>
                  </div>
                </Alert>

                <TokenSelector onSelect={handleTokenASelection} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <PoolConfigurationForm
                form={form}
                onSubmit={() => form.handleSubmit(onSubmit)()}
                onGenerateMetadata={generateMetadata}
                onDeploy={deployContract}
                isGenerating={isGenerating}
                hasMetadata={!!metadata}
              />

              <MetadataPreview metadata={metadata} />
            </div>
          )}
        </Card>

        {currentStep === 'configure-pool' && (
          <CodePreview
            code={contractCode}
            showPreview={showCodePreview}
            onTogglePreview={() => setShowCodePreview(!showCodePreview)}
          />
        )}
      </div>
    </Layout>
  );
}
