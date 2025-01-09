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
import PricesService from '@lib/server/prices/prices-service';
import { cn } from '@lib/utils';
import { Pc } from '@stacks/transactions';
import { Dexterity } from 'dexterity-sdk';
import { GetStaticProps } from 'next';
import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

type Props = {
  prices: { [key: string]: number };
};

interface FormValues {
  tokenAContract: string;
  tokenBContract: string;
  lpTokenName: string;
  lpTokenSymbol: string;
  lpRebatePercent: number;
  description: string;
  initialLiquidityA: number;
  initialLiquidityB: number;
  imagePrompt: string;
  customImage?: File;
  isCharismafied: boolean;
  isLimitedPalette: boolean;
  isPixelated: boolean;
}

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
  const { deployContract } = useContractDeployment();

  const form = useForm<FormValues>({
    defaultValues: {
      tokenAContract: '',
      tokenBContract: '',
      lpTokenName: '',
      lpTokenSymbol: '',
      lpRebatePercent: 2,
      description: '',
      initialLiquidityA: 1000000,
      initialLiquidityB: 1000000,
      imagePrompt: '',
      isCharismafied: false,
      isLimitedPalette: true,
      isPixelated: false
    }
  });

  const formValues = form.watch();
  const safeTokenName = sanitizeContractName(formValues.lpTokenName);
  const fullContractName = `${stxAddress}.${safeTokenName}`;

  // Calculate post conditions based on initial liquidity
  const postConditions = useMemo(() => {
    if (!formValues.tokenAContract || !formValues.tokenBContract || !tokenAMetadata || !tokenBMetadata) return [];

    const conditions = [];
    const isTokenAStx = formValues.tokenAContract === '.stx';
    const isTokenBStx = formValues.tokenBContract === '.stx';

    try {

      const tokenAmountA = Math.floor(formValues.initialLiquidityA);
      const tokenAmountB = Math.floor(formValues.initialLiquidityB);

      // Handle token A
      if (isTokenAStx) {
        conditions.push(Pc.principal(stxAddress).willSendEq(tokenAmountA).ustx());
      } else {
        conditions.push(
          Pc.principal(stxAddress)
            .willSendEq(tokenAmountA)
            .ft(formValues.tokenAContract as any, tokenAMetadata?.identifier)
        );
      }

      // Handle token B
      if (isTokenBStx) {
        conditions.push(Pc.principal(stxAddress).willSendEq(tokenAmountB).ustx());
      } else {
        conditions.push(
          Pc.principal(stxAddress)
            .willSendEq(tokenAmountB)
            .ft(formValues.tokenBContract as any, tokenBMetadata?.identifier)
        );
      }
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      return [];
    }

    return conditions;
  }, [
    formValues.tokenAContract,
    formValues.tokenBContract,
    formValues.initialLiquidityA,
    formValues.initialLiquidityB,
    stxAddress,
    tokenAMetadata,
    tokenBMetadata
  ]);

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

    const metadata = await Dexterity.getTokenInfo(token.contractId);
    setTokenAMetadata(metadata);
    setCurrentStep('select-token-b');
  };

  const handleTokenBSelection = async (token: any) => {
    form.setValue('tokenBContract', token.contractId);
    const metadata = await Dexterity.getTokenInfo(token.contractId);
    setTokenBMetadata(metadata);

    const tokenA = tokenAMetadata?.symbol || 'Unknown';
    const tokenB = metadata?.symbol || 'Unknown';
    form.setValue('lpTokenName', `${tokenA}-${tokenB} LP Token`);
    form.setValue('lpTokenSymbol', `${tokenA}${tokenB}LP`);
    form.setValue('description', `Liquidity pool token for the ${tokenA}-${tokenB} trading pair`);

    setCurrentStep('configure-pool');
  };

  const handleMetadataChange = (newMetadata: any) => {
    setMetadata(newMetadata);
  };

  const generateMetadata = async () => {
    setIsGenerating(true);
    try {
      const formValues = form.getValues();

      let imageUrl;
      if (formValues.customImage) {
        const formData = new FormData();
        formData.append('file', formValues.customImage);
        const uploadResponse = await fetch('/api/v0/upload', {
          method: 'POST',
          body: formData
        });
        const { url } = await uploadResponse.json();
        imageUrl = url;
      }

      // Build the enhanced prompt
      let enhancedPrompt = formValues.imagePrompt;
      if (formValues.isCharismafied) {
        enhancedPrompt += ". intense manga art style with bold lines and deep contracts";
      }
      if (formValues.isLimitedPalette) {
        enhancedPrompt += ". Use a limited color palette with maximum 2-3 colors";
      }
      if (formValues.isPixelated) {
        enhancedPrompt += ". Create in pixel art style with visible pixels and limited resolution";
      }

      const response = await fetch(`/api/v0/metadata/generate/${fullContractName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metadata,
          imagePrompt: enhancedPrompt,
          customImageUrl: imageUrl
        })
      });

      if (!response.ok) throw new Error('Failed to generate metadata');
      const result = await response.json();

      if (result.success && result.metadata) {
        setMetadata(result.metadata);
      } else {
        throw new Error('Invalid metadata response structure');
      }
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
      postConditions,
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
            onMetadataChange={handleMetadataChange}
            onGenerateImage={generateMetadata}
          />
        )}

        {contractCode && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-between space-x-4">
              <Button variant="outline" onClick={() => setShowCode(!showCode)}>
                {showCode ? 'Hide Source Code' : 'Show Source Code'}
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
