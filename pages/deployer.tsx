import { ContractStepper } from '@components/dexterity/contract-stepper';
import { TokenSelector } from '@components/dexterity/token-selector';
import { TokenSettingsForm } from '@components/dexterity/token-settings.form';
import Layout from '@components/layout/layout';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { useGlobalState } from '@lib/hooks/global-state-context';
import PricesService from '@lib/server/prices/prices-service';
import { cn } from '@lib/utils';
import { Dexterity, Vault } from 'dexterity-sdk';
import { GetStaticProps } from 'next';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2Icon } from 'lucide-react';
import { sanitizeContractName } from '@lib/codegen/dexterity';

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
  isRozarStyle: boolean;
  isMooningSharkStyle: boolean;
  isLimitedPalette: boolean;
  isVinzoStyle: boolean;
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);
  const { stxAddress } = useGlobalState();
  const [contractCode, setContractCode] = useState<string>('');

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
      imagePrompt: 'Minimalist, professional logo combining geometric shapes and clean lines',
      isRozarStyle: false,
      isMooningSharkStyle: false,
      isVinzoStyle: false,
      isLimitedPalette: true,
    }
  });

  const formValues = form.watch();
  const safeTokenName = sanitizeContractName(formValues.lpTokenName);
  const fullContractName = `${stxAddress}.${safeTokenName}`;

  useEffect(() => {
    if (formValues.tokenAContract && formValues.tokenBContract) {
      try {
        // Create temporary vault instance for code generation
        const vault = new Vault({
          contractId: fullContractName as any,
          name: formValues.lpTokenName,
          symbol: formValues.lpTokenSymbol,
          description: formValues.description,
          fee: Math.floor((formValues.lpRebatePercent / 100) * 1000000),
          liquidity: [
            {
              ...tokenAMetadata,
              reserves: formValues.initialLiquidityA,
            },
            {
              ...tokenBMetadata,
              reserves: formValues.initialLiquidityB,
            }
          ]
        });

        // Generate contract code
        const code = vault.generateContractCode();
        setContractCode(code);
      } catch (error) {
        console.error('Error generating contract code:', error);
      }
    }
  }, [formValues, fullContractName, tokenAMetadata, tokenBMetadata]);

  const handleTokenASelection = async (token: any) => {
    form.setValue('tokenAContract', token.contractId);
    form.setValue('lpTokenName', `${token.symbol} LP Token`);
    form.setValue('lpTokenSymbol', `${token.symbol}LP`);
    form.setValue('description', `Liquidity vault for the ${token.name} pair`);
    form.setValue('imagePrompt', `Minimalist, professional logo combining geometric shapes and clean lines that represents ${token.name}`);

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
    const tokenAName = tokenAMetadata?.name || 'Unknown';
    const tokenBName = token.name || 'Unknown';

    form.setValue('lpTokenName', `${tokenA}-${tokenB} LP Token`);
    form.setValue('lpTokenSymbol', `${tokenA}-${tokenB}`);
    form.setValue('description', `Liquidity vault for the ${tokenA}-${tokenB} trading pair`);
    form.setValue('imagePrompt', `Minimalist, professional logo that represents a liquidity vault between ${tokenAName} and ${tokenBName}. Combine geometric shapes and clean lines to show the connection between these two tokens`);

    setCurrentStep('configure-vault');
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
      if (formValues.isLimitedPalette) {
        enhancedPrompt += ". Use a limited color palette with maximum 2-3 colors";
      }
      if (formValues.isRozarStyle) {
        enhancedPrompt += ". intense manga art style with bold lines and deep contrast";
      }
      if (formValues.isMooningSharkStyle) {
        enhancedPrompt += ". electric ocean waves, metal band album cover style, minimalist art logo for a token, bold lines";
      }
      if (formValues.isVinzoStyle) {
        enhancedPrompt += ". Create in pixel art style with visible pixels and limited resolution";
      }

      // Include the current metadata state in the API call
      const currentMetadata = {
        name: formValues.lpTokenName,
        symbol: formValues.lpTokenSymbol,
        description: formValues.description,
        identifier: formValues.lpTokenSymbol,
        decimals: 6,
        properties: {
          ...(metadata?.properties || {}),
          tokenAContract: formValues.tokenAContract,
          tokenBContract: formValues.tokenBContract,
          lpRebatePercent: formValues.lpRebatePercent,
          tokenAMetadata,
          tokenBMetadata,
          date: new Date().toISOString()
        },
        ...metadata  // Spread existing metadata last to preserve any other fields
      };

      const response = await fetch(`/api/v0/metadata/generate/${fullContractName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentMetadata,
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

  const handleDeploy = async () => {
    try {
      // Create a new vault instance with the form values
      const vault = new Vault({
        ...metadata,
        contractId: fullContractName as any,
        name: formValues.lpTokenName,
        symbol: formValues.lpTokenSymbol,
        description: formValues.description,
        fee: Math.floor((formValues.lpRebatePercent / 100) * 1000000), // Convert percentage to basis points
        liquidity: [
          {
            ...tokenAMetadata,
            reserves: formValues.initialLiquidityA,
          },
          {
            ...tokenBMetadata,
            reserves: formValues.initialLiquidityB,
          }
        ],
      });

      // Deploy using the vault's deployment method
      await vault.deployContract();

    } catch (error) {
      console.error('Error during deployment:', error);
      alert('Failed to deploy contract or update metadata');
    }
  };

  const handleSaveMetadata = async () => {
    try {
      setIsSavingMetadata(true);
      const formValues = form.getValues();

      const currentMetadata = {
        ...metadata,
        name: formValues.lpTokenName,
        symbol: formValues.lpTokenSymbol,
        description: formValues.description,
        identifier: formValues.lpTokenSymbol,
        decimals: 6,
        properties: {
          ...(metadata?.properties || {}),
          tokenAContract: formValues.tokenAContract,
          tokenBContract: formValues.tokenBContract,
          lpRebatePercent: formValues.lpRebatePercent,
          tokenAMetadata,
          tokenBMetadata,
          date: new Date().toISOString()
        },
      };

      const response = await fetch(`/api/v0/metadata/update/${fullContractName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentMetadata)
      });

      if (!response.ok) throw new Error('Failed to save metadata');
      const result = await response.json();

      if (result.success && result.metadata) {
        setMetadata(result.metadata);
        setHasUnsavedChanges(false);
      } else {
        throw new Error('Invalid metadata response structure');
      }
    } catch (err) {
      console.error('Metadata save error:', err);
      alert('Failed to save metadata');
    } finally {
      setIsSavingMetadata(false);
    }
  };

  useEffect(() => {
    if (metadata) {
      const currentValues = form.getValues();
      const hasChanges =
        currentValues.lpTokenName !== metadata.name ||
        currentValues.lpTokenSymbol !== metadata.symbol ||
        currentValues.description !== metadata.description ||
        currentValues.lpRebatePercent !== metadata.properties?.lpRebatePercent;

      setHasUnsavedChanges(hasChanges);
    }
  }, [form.watch(), metadata]);

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

        {currentStep === 'configure-vault' && (
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
              <div className="flex space-x-2">
                <Button
                  onClick={handleSaveMetadata}
                  disabled={!metadata || isSavingMetadata || !hasUnsavedChanges}
                  variant="outline"
                  className="min-w-32"
                >
                  {isSavingMetadata ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Metadata'
                  )}
                </Button>
                <Button
                  onClick={handleDeploy}
                  disabled={!metadata || isGenerating || hasUnsavedChanges}
                  className={cn(
                    'font-medium transition-colors min-w-48',
                    (!metadata || isGenerating || hasUnsavedChanges)
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : ''
                  )}
                >
                  {hasUnsavedChanges ? 'Save Changes First' : 'Deploy Liquidity Vault'}
                </Button>
              </div>
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
