import { ContractStepper } from '@components/dexterity/contract-stepper';
import { TokenSelector } from '@components/dexterity/token-selector';
import { TokenSettingsForm } from '@components/dexterity/token-settings.form';
import Layout from '@components/layout/layout';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { sanitizeContractName } from '@lib/codegen/dexterity';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { useContractCode } from '@lib/hooks/use-contract-code';
import { useContractDeployment } from '@lib/hooks/use-contract-deployment';
import { fetchTokenMetadata } from '@lib/hooks/use-token-metadata';
import PricesService from '@lib/server/prices/prices-service';
import { cn } from '@lib/utils';
import { useConnect } from '@stacks/connect-react';
import { WandSparkles } from 'lucide-react';
import { GetStaticProps } from 'next';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

type Props = {
  prices: { [key: string]: number };
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const service = PricesService.getInstance();
  const prices = await service.getAllTokenPrices();
  return {
    props: { prices },
    revalidate: 60
  };
};

export default function ContractDeployer({ prices }: Props) {
  const [currentStep, setCurrentStep] = useState('select-token-a');
  const [showCode, setShowCode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [metadata, setMetadata] = useState(null as any);
  const [tokenAMetadata, setTokenAMetadata] = useState(null as any);
  const [tokenBMetadata, setTokenBMetadata] = useState(null as any);

  const { stxAddress } = useGlobalState();
  const { contractCode, updateContractCode } = useContractCode();
  const { doContractDeploy } = useConnect();
  const { deployContract } = useContractDeployment(doContractDeploy);

  const form = useForm({
    defaultValues: {
      tokenAContract: '',
      tokenBContract: '',
      lpTokenName: '',
      lpTokenSymbol: '',
      lpRebatePercent: 2,
      description: '',
      initialLiquidityA: 1000000,
      initialLiquidityB: 1000000
    }
  });

  const formValues = form.watch();
  const safeTokenName = sanitizeContractName(formValues.lpTokenName);
  const fullContractName = `${stxAddress}.${safeTokenName}`;

  useEffect(() => {
    if (formValues.tokenAContract && formValues.tokenBContract) {
      updateContractCode({
        fullContractName,
        ...formValues
      });
    }
  }, [formValues, fullContractName, stxAddress, updateContractCode]);

  const handleTokenASelection = async (token: any) => {
    form.setValue('tokenAContract', token.contractId);
    form.setValue('lpTokenName', `${token.symbol} LP Token`);
    form.setValue('lpTokenSymbol', `${token.symbol}LP`);
    form.setValue('description', `Liquidity pool token for the ${token.name} pair`);

    const metadata = await fetchTokenMetadata(token.contractId);
    setTokenAMetadata(metadata);
    setCurrentStep('select-token-b');
  };

  const handleTokenBSelection = async (token: any) => {
    form.setValue('tokenBContract', token.contractId);
    const metadata = await fetchTokenMetadata(token.contractId);
    setTokenBMetadata(metadata);
    setCurrentStep('configure-pool');
  };

  const generateMetadata = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/v0/metadata/generate/${fullContractName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formValues.lpTokenName,
          symbol: formValues.lpTokenSymbol,
          decimals: 6,
          identifier: formValues.lpTokenSymbol,
          description: formValues.description,
          properties: {
            contractName: fullContractName,
            tokenAContract: formValues.tokenAContract,
            tokenBContract: formValues.tokenBContract,
            lpRebatePercent: formValues.lpRebatePercent
          }
        })
      });

      if (!response.ok) throw new Error('Failed to generate metadata');
      const result = await response.json();
      setMetadata(result.metadata);
    } catch (err) {
      console.error('Metadata generation error:', err);
      alert('Failed to generate metadata');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeploy = () => {
    deployContract({
      contractName: safeTokenName,
      codeBody: contractCode,
      metadata
    });
  };

  const stepIndex = currentStep === 'select-token-a' ? 0 : currentStep === 'select-token-b' ? 1 : 2;

  return (
    <Layout>
      <div style={{ padding: '1rem' }}>
        <ContractStepper currentStepIndex={stepIndex} />

        {currentStep === 'select-token-a' && <TokenSelector onSelect={handleTokenASelection} />}

        {currentStep === 'select-token-b' && (
          <TokenSelector
            onSelect={handleTokenBSelection}
            excludeToken={formValues.tokenAContract}
          />
        )}

        {currentStep === 'configure-pool' && (
          <TokenSettingsForm
            prices={prices}
            isGenerating={isGenerating}
            metadata={metadata}
            tokenAMetadata={tokenAMetadata}
            tokenBMetadata={tokenBMetadata}
            form={form}
          />
        )}

        {contractCode && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-between space-x-4">
              <Button variant="outline" onClick={() => setShowCode(!showCode)}>
                {showCode ? 'Hide Source Code' : 'Show Source Code'}
              </Button>
              <Button onClick={generateMetadata} variant="outline">
                <WandSparkles className="w-4 h-4 mr-2" /> Generate Metadata
              </Button>
              <Button
                onClick={handleDeploy}
                disabled={!metadata || isGenerating}
                className={cn(
                  'font-medium transition-colors min-w-48',
                  !metadata || isGenerating
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : ''
                )}
              >
                Deploy Liquidity Pool
              </Button>
            </div>
            {showCode && (
              <Card className="p-4">
                <pre>{contractCode}</pre>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
