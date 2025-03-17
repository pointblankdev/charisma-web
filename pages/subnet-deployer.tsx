/**
 * Subnet Deployer Page
 * 
 * This page allows users to deploy subnet wrapper contracts for existing tokens on the Stacks blockchain.
 * The subnet wrapper contracts provide fast off-chain transaction capabilities for tokens.
 * 
 * Integration Architecture:
 * - Uses Signet SDK to handle contract generation and deployment
 * - Signet SDK communicates with the Signet Chrome Extension
 * - The extension uses Dexterity to manage contract generation and deployment
 * - Contract deployment happens on the Stacks blockchain
 * 
 * Flow:
 * 1. User selects a token to wrap
 * 2. User configures subnet parameters (name, version, batch size)
 * 3. Contract code is generated using generateSubnetCode()
 * 4. User deploys the contract using deployTokenSubnet()
 * 5. Deployment status is displayed
 */

import { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import Page from '@components/page';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Card } from '@components/ui/card';
import { Textarea } from '@components/ui/textarea';
import { Badge } from '@components/ui/badge';
import { Slider } from '@components/ui/slider';
import { cn } from '@lib/utils';
import { useGlobal } from '@lib/hooks/global-context';
import { useForm } from 'react-hook-form';
import { Dexterity } from 'dexterity-sdk';
import { Kraxel } from '@lib/kraxel';
import Color, { Palette } from 'color-thief-react';
import {
  Check,
  ChevronDown,
  Clock,
  Coins,
  Info,
  Loader2,
  Search,
  Sparkles,
  Wallet,
  ArrowLeft,
  ChevronRight,
  BarChart3,
  Zap,
  Brain,
  Flame
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';

// Add custom styles at runtime - this CSS will be injected once
const TokenShadowStyles = () => {
  useEffect(() => {
    // Add custom shadow classes if they don't already exist
    if (!document.getElementById('token-shadow-styles')) {
      const style = document.createElement('style');
      style.id = 'token-shadow-styles';
      style.innerHTML = `
        .hover\\:token-shadow:hover {
          box-shadow: 0 10px 205px -3px var(--token-shadow-color, rgba(0,0,0,0.1)), 
                      0 4px 106px -4px var(--token-shadow-color, rgba(0,0,0,0.1)) !important;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      // Cleanup on unmount
      const styleElement = document.getElementById('token-shadow-styles');
      if (styleElement) styleElement.remove();
    };
  }, []);

  return null;
};

interface FormValues {
  tokenContract: string;
  versionName: string;
  versionNumber: string;
  description: string;
  batchSize: number;
}


interface TokenMetadata {
  categories?: string[];
}

interface Token {
  contractId: string;
  name: string;
  symbol: string;
  image?: string;
  decimals: number;
  metadata?: TokenMetadata;
}

// Format price for display
const formatPrice = (priceString: string) => {
  const price = parseFloat(priceString);
  if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (price >= 1) return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (price >= 0.01) return price.toLocaleString('en-US', { maximumFractionDigits: 3 });
  if (price >= 0.0001) return price.toLocaleString('en-US', { maximumFractionDigits: 6 });
  return price.toExponential(2);
};

// Format balance for display
const formatBalance = (balance: number, decimals: number = 6) => {
  const value = balance / Math.pow(10, decimals);
  if (value === 0) return '0';
  if (value < 0.001) return '<0.001';
  return value.toLocaleString('en-US', { maximumFractionDigits: 3 });
};

interface TokenCardProps {
  token: Token;
  onClick: () => void;
  isSelected: boolean;
  price?: string;
}

const TokenCard = ({ token, onClick, isSelected, price = '0' }: TokenCardProps) => {
  const { getBalance } = useGlobal();
  const balance = getBalance?.(token.contractId) || 0;

  const formattedBalance = formatBalance(balance, token.decimals);
  const tokenImageSrc = token.image || '/stx-logo.png';

  return (
    <Palette src={tokenImageSrc} crossOrigin="anonymous" format="hex" colorCount={2}>
      {({ data, loading, error }) => (
        <Card
          className={cn(
            "overflow-hidden transition-all cursor-pointer hover:translate-y-[-4px] hover:token-shadow hover:scale-[1.03] hover:z-10",
            isSelected && "ring-2 ring-primary border-primary"
          )}
          style={{
            "--token-shadow-color": loading || error ? 'rgba(0,0,0,0.25)' : `${data![0]}25`
          } as React.CSSProperties}
          onClick={onClick}
        >
          <div className="relative">
            {/* Token background with dynamic color texture from image */}
            <div
              className="h-20 w-full"
              style={{
                position: 'relative',
                background: loading || error
                  ? 'rgba(193, 18, 31, 0.1)'
                  : `linear-gradient(135deg, ${data![0]}99 0%, ${data![1]}99 100%)`,
              }}
            >
              {/* Subtle pattern overlay */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'url("/bg.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundBlendMode: 'soft-light',
                  mixBlendMode: 'overlay'
                }}
              />
            </div>

            {/* Token Image */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="p-1 bg-card rounded-full shadow-md">
                <Image
                  src={tokenImageSrc}
                  alt={token.name}
                  width={100}
                  height={100}
                  className="rounded-full h-14 w-14"
                />
              </div>
            </div>
          </div>

          {/* Token Info */}
          <div className="pt-10 pb-4 px-4 text-center">
            <h3 className="font-medium text-lg truncate">{token.name}</h3>
            <div className="flex items-center justify-center mt-1">
              <Badge
                variant="outline"
                className="font-mono"
                style={{
                  backgroundColor: loading || error ? 'rgba(var(--primary), 0.05)' : `${data![1]}80`,
                  borderColor: loading || error ? undefined : `${data![0]}40`,
                }}
              >
                {token.symbol}
              </Badge>
            </div>

            {/* Token Stats */}
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center">
                {Number(price) > 0 ? (
                  <span>${formatPrice(price)}</span>
                ) : (
                  <span>No price data</span>
                )}
              </div>

              <div className="flex items-center">
                <Wallet className="h-3 w-3 mr-1" />
                <span>{formattedBalance}</span>
              </div>
            </div>
          </div>

          {/* Selected Indicator */}
          {isSelected && (
            <div className="absolute top-2 right-2">
              <div className="bg-primary text-primary-foreground rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            </div>
          )}
        </Card>
      )}
    </Palette>
  );
};

interface CustomTokenInputProps {
  onSubmit: (token: Token) => void;
}

const CustomTokenInput = ({ onSubmit }: CustomTokenInputProps) => {
  const [contractId, setContractId] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<Token | null>(null);

  const validateToken = async () => {
    if (!contractId) return;

    setIsValidating(true);
    setError(null);

    try {
      // Fetch token data
      const tokenData = await Dexterity.getTokenInfo(contractId);
      setTokenInfo(tokenData as Token);
    } catch (err) {
      setError('Invalid token contract. Please check the contract ID.');
      setTokenInfo(null);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="p-6 border border-primary/20">
      <h3 className="text-lg font-medium mb-4">Add Custom Token</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contractId">Contract ID</Label>
          <div className="flex space-x-2">
            <Input
              id="contractId"
              placeholder="SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.token-name"
              value={contractId}
              onChange={e => setContractId(e.target.value)}
              className={cn(error && "border-red-500")}
            />
            <Button
              onClick={validateToken}
              disabled={!contractId || isValidating}
              variant="outline"
            >
              {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validate"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {tokenInfo && (
          <div className="border rounded-lg overflow-hidden">
            {tokenInfo.image ? (
              <Palette src={tokenInfo.image} crossOrigin="anonymous" format="hex" colorCount={2}>
                {({ data, loading, error }) => (
                  <div
                    className="p-4"
                    style={{
                      background: loading || error
                        ? 'rgba(var(--primary), 0.05)'
                        : `linear-gradient(135deg, ${data![0]}15 0%, ${data![1]}25 100%)`,
                      borderBottom: '1px solid',
                      borderBottomColor: loading || error ? 'rgba(var(--border), 0.2)' : `${data![0]}40`
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Image
                        src={tokenInfo.image!}
                        alt={tokenInfo.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <h4 className="font-medium" style={{ color: loading || error ? undefined : data![0] }}>
                          {tokenInfo.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{tokenInfo.symbol}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Palette>
            ) : (
              <div className="p-4 bg-primary/5 border-b border-border/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Coins className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{tokenInfo.name}</h4>
                    <p className="text-sm text-muted-foreground">{tokenInfo.symbol}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4">
              <Button
                className="w-full"
                onClick={() => onSubmit(tokenInfo)}
              >
                Use This Token
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

interface SubnetTokenSelectorProps {
  tokens: Token[];
  prices: Record<string, string>;
  onTokenSelect: (token: Token) => void;
}

const SubnetTokenSelector = ({ tokens, prices, onTokenSelect }: SubnetTokenSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Token categories
  const categories = [
    { id: 'all', name: 'All Tokens' },
    { id: 'popular', name: 'Popular' },
    { id: 'stablecoins', name: 'Stablecoins' },
    { id: 'defi', name: 'DeFi' },
    { id: 'meme', name: 'Meme' },
  ];

  // Filter tokens based on search and category
  const filteredTokens = tokens.filter(token => {
    const matchesSearch =
      !searchQuery ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.contractId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'popular') return token.metadata?.categories?.includes('popular');
    if (selectedCategory === 'stablecoins') return token.metadata?.categories?.includes('stablecoin');
    if (selectedCategory === 'defi') return token.metadata?.categories?.includes('defi');
    if (selectedCategory === 'meme') return token.metadata?.categories?.includes('meme');

    return true;
  });

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    onTokenSelect(token);
  };

  const handleCustomTokenSubmit = (token: Token) => {
    setShowCustomInput(false);
    handleTokenSelect(token);
  };

  if (showCustomInput) {
    return (
      <div className="space-y-4 overflow-hidden">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => setShowCustomInput(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h3 className="text-lg font-medium">Add Custom Token</h3>
        </div>
        <CustomTokenInput onSubmit={handleCustomTokenSubmit} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            className="pl-10 pr-4 py-2 bg-background/80 border border-primary/20"
            placeholder="Search tokens by name or contract ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex overflow-x-auto py-1 scrollbar-hide">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap mx-1 first:ml-0 rounded-full"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Token Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTokens.map(token => (
          <TokenCard
            key={token.contractId}
            token={token}
            onClick={() => handleTokenSelect(token)}
            isSelected={selectedToken?.contractId === token.contractId}
            price={prices[token.contractId] || '0'}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredTokens.length === 0 && (
        <div className="text-center py-8 border border-dashed rounded-lg border-primary/20">
          <Coins className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No tokens found</h3>
          <p className="mt-1 text-muted-foreground">
            Try a different search term or use a custom token
          </p>
          <Button className="mt-4" variant="outline" onClick={() => setShowCustomInput(true)}>
            Use Custom Token
          </Button>
        </div>
      )}
    </div>
  );
};

interface SubnetConfigurationProps {
  selectedToken: Token;
  prices: Record<string, string>;
  onBack: () => void;
}

const SubnetConfiguration = ({ selectedToken, prices, onBack }: SubnetConfigurationProps) => {
  const { stxAddress } = useGlobal();
  const [showCode, setShowCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [deploymentTxId, setDeploymentTxId] = useState<string | null>(null);
  const [deploymentContractId, setDeploymentContractId] = useState<string | null>(null);

  /**
   * Handles the contract deployment process using Signet SDK
   */
  const handleDeployContract = async () => {
    // Check if wallet is connected
    if (!stxAddress) {
      setDeploymentError("Please connect your wallet to deploy a subnet token");
      setDeploymentStatus('error');
      return;
    }

    // Validate the form before deploying
    const isValid = await form.trigger();
    if (!isValid) {
      setDeploymentError("Please correct the form errors before deploying");
      setDeploymentStatus('error');
      return;
    }

    // Reset state and start deployment process
    setDeploymentStatus('deploying');
    setDeploymentError(null);

    try {
      // Create the contract ID from input values - this will be shown while deployment is in progress
      const fullVersion = `${formValues.versionName}-${formValues.versionNumber}`;
      const contractName = `blaze-${fullVersion.toLowerCase()}`;
      const contractId = `${stxAddress}.${contractName}`;
      setDeploymentContractId(contractId);

      // Prepare subnet parameters for deployment
      const subnetParams = {
        tokenContract: formValues.tokenContract,
        versionName: formValues.versionName,
        versionNumber: formValues.versionNumber,
        batchSize: formValues.batchSize,
        description: formValues.description || `Subnet token for ${selectedToken.name} with fast off-chain transactions`,
      };

      // Deploy the subnet wrapper contract using Signet SDK
      const { deployTokenSubnet } = await import('signet-sdk');
      const result = await deployTokenSubnet(subnetParams);

      // Check if deployment was successful
      if (!result.success) {
        throw new Error(result.error || "Unknown deployment error");
      }

      // Extract the transaction ID and contract ID
      const txId = result.txId;
      if (!txId) {
        throw new Error("Deployment succeeded but no transaction ID was returned");
      }

      // Update UI state with the transaction ID
      setDeploymentTxId(txId);

      // If a contractId was returned, update the state
      if (result.contractId) {
        setDeploymentContractId(result.contractId);
      }

      // Set deployment status to success
      setDeploymentStatus('success');
    } catch (error) {
      // Handle deployment errors
      setDeploymentError(error instanceof Error ? error.message : String(error));
      setDeploymentStatus('error');
    }
  };

  // Initialize form with selected token's values
  const form = useForm<FormValues>({
    defaultValues: {
      tokenContract: selectedToken.contractId,
      versionName: selectedToken.symbol.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      versionNumber: 'v1',
      description: `Subnet token for ${selectedToken.name} with fast off-chain transactions`,
      batchSize: 200,
    }
  });

  const formValues = form.watch();

  // Update generated code when form values change
  useEffect(() => {
    updateGeneratedCode();
  }, [formValues]);

  // Generate code using the Signet SDK
  const updateGeneratedCode = async () => {
    if (!selectedToken || !formValues.versionName || !formValues.versionNumber) {
      setGeneratedCode('');
      return;
    }

    try {
      // Prepare parameters for code generation
      const params = {
        tokenContract: selectedToken.contractId,
        versionName: formValues.versionName,
        versionNumber: formValues.versionNumber,
        batchSize: formValues.batchSize,
        description: formValues.description || `Subnet token for ${selectedToken.name} with fast off-chain transactions`
      };

      // Generate the code using Signet SDK

      const { generateSubnetCode } = await import('signet-sdk');
      const result = await generateSubnetCode(params);

      if (result.success && result.code) {
        setGeneratedCode(result.code);
        setDeploymentContractId(result.contractId);
      } else {
        setGeneratedCode('');
        setDeploymentError(`Failed to generate contract code: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setGeneratedCode('');
      setDeploymentError(`Error generating contract code: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="space-y-6 overflow-hidden">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Configure Token Subnet</h1>
          <p className="text-muted-foreground">
            Customize your token subnet based on {selectedToken.name}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Configuration */}
        <div className="lg:w-2/3 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-8 items-start mb-6">
              {/* Token Card */}
              <div className="lg:w-1/2 w-full">
                <div className="rounded-lg overflow-hidden border-b-2 max-w-[280px] mx-auto">
                  {/* Token header with dynamic texture using primary and secondary colors */}
                  <Palette src={selectedToken.image || '/stx-logo.png'} crossOrigin="anonymous" format="hex" colorCount={2}>
                    {({ data, loading, error }) => (
                      <div
                        className="h-24 w-full relative"
                        style={{
                          background: loading || error
                            ? 'rgba(193, 18, 31, 0.1)'
                            : `linear-gradient(135deg, ${data![0]}25 0%, ${data![1]}45 100%)`,
                        }}
                      >
                        {/* Texture overlay */}
                        <div
                          className="absolute inset-0 opacity-30"
                          style={{
                            backgroundImage: 'url("/bg.png")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundBlendMode: 'soft-light',
                            mixBlendMode: 'overlay'
                          }}
                        />
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-card p-1 rounded-full shadow-md">
                          <Image
                            src={selectedToken.image || '/stx-logo.png'}
                            alt={selectedToken.name}
                            width={64}
                            height={64}
                            className="rounded-full object-cover h-16 w-16"
                          />
                        </div>
                      </div>
                    )}
                  </Palette>
                  <div className="pt-10 px-6 pb-4 text-center">
                    <h2 className="text-xl font-semibold">{selectedToken.name}</h2>
                    <p className="text-muted-foreground text-sm truncate">{selectedToken.contractId}</p>
                  </div>
                </div>
              </div>

              {/* Configuration Fields */}
              <div className="lg:w-1/2 w-full flex-grow">
                <div className="space-y-2 lg:mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="versionName">Subnet Name</Label>
                    <Input
                      id="versionName"
                      {...form.register('versionName', {
                        required: "Subnet name is required",
                        pattern: {
                          value: /^[a-z0-9-]+$/,
                          message: "Only lowercase letters, numbers, and hyphens allowed"
                        },
                        validate: {
                          notEmpty: (value) => value.trim().length > 0 || "Subnet name cannot be empty",
                          minLength: (value) => value.length >= 3 || "Subnet name must be at least 3 characters",
                          noSpaces: (value) => !value.includes(' ') || "Spaces are not allowed in subnet name"
                        }
                      })}
                      placeholder="token-name"
                      className={cn(
                        form.formState.errors.versionName && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {form.formState.errors.versionName ? (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.versionName.message}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        A unique name for your token subnet
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="versionNumber">Version Number</Label>
                    <Input
                      id="versionNumber"
                      {...form.register('versionNumber', {
                        required: "Version number is required",
                        pattern: {
                          value: /^(v|rc)\d+(\.\d+)*$/,
                          message: "Must start with 'v' or 'rc' followed by numbers (e.g., v1, rc1, v1.0)"
                        },
                        validate: {
                          notEmpty: (value) => value.trim().length > 0 || "Version number cannot be empty",
                          minLength: (value) => value.length >= 2 || "Version number must be at least 2 characters"
                        }
                      })}
                      placeholder="v1"
                      className={cn(
                        form.formState.errors.versionNumber && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {form.formState.errors.versionNumber ? (
                      <p className="text-xs text-red-500">
                        {form.formState.errors.versionNumber.message}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Must start with 'v' or 'rc'. Examples: v1, rc1, v1.0.2
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="A token subnet for fast off-chain transactions"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label>Batch Size Limit</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Maximum number of operations that can be processed in a single batch. Higher limits allow more operations at once (higher throughput) but will require more resources depending on contract complexity. Resource limits for reading and writing have hard caps enforced by the Stacks network.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-sm font-medium">{formValues.batchSize}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue('batchSize', 100)}
                    className={cn(
                      'text-xs py-4 font-semibold hover:bg-accent-foreground hover:text-primary-foreground',
                      formValues.batchSize === 100 && 'bg-primary text-primary-foreground'
                    )}
                  >
                    <div className="flex flex-col items-center">
                      <span>Conservative</span>
                      <span className="text-[10px] text-primary-foreground/60">100 ops</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue('batchSize', 200)}
                    className={cn(
                      'text-xs py-4 font-semibold hover:bg-accent-foreground hover:text-primary-foreground',
                      formValues.batchSize === 200 && 'bg-primary text-primary-foreground'
                    )}
                  >
                    <div className="flex flex-col items-center">
                      <span>Balanced</span>
                      <span className="text-[10px] text-primary-foreground/60">200 ops</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue('batchSize', 300)}
                    className={cn(
                      'text-xs py-4 font-semibold hover:bg-accent-foreground hover:text-primary-foreground',
                      formValues.batchSize === 300 && 'bg-primary text-primary-foreground'
                    )}
                  >
                    <div className="flex flex-col items-center">
                      <span>Optimized</span>
                      <span className="text-[10px] text-primary-foreground/60">300 ops</span>
                    </div>
                  </Button>
                </div>

                <Slider
                  min={100}
                  max={300}
                  step={10}
                  value={[formValues.batchSize]}
                  onValueChange={([value]) => {
                    form.setValue('batchSize', value || 200);
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>100</span>
                  <span>200</span>
                  <span>300</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Code Preview Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Contract Preview</h2>
              <Button variant="outline" size="sm" onClick={() => setShowCode(!showCode)}>
                {showCode ? "Hide Code" : "Show Code"}
              </Button>
            </div>

            {showCode && (
              <div className="bg-black/40 p-4 rounded-md overflow-x-auto my-4">
                <pre className="text-sm font-mono text-white/90">{generatedCode}</pre>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <div className="space-y-1 p-3 border border-border rounded-lg">
                <div className="text-sm text-muted-foreground">Contract Name</div>
                <div className="font-medium">{formValues.versionName}</div>
              </div>

              <div className="space-y-1 p-3 border border-border rounded-lg">
                <div className="text-sm text-muted-foreground">Base Token</div>
                <div className="font-medium">{selectedToken.name} ({selectedToken.symbol})</div>
              </div>

              <div className="space-y-1 p-3 border border-border rounded-lg">
                <div className="text-sm text-muted-foreground">Version</div>
                <div className="font-medium">{formValues.versionNumber}</div>
              </div>

              <div className="space-y-1 p-3 border border-border rounded-lg">
                <div className="text-sm text-muted-foreground">Batch Size</div>
                <div className="font-medium">{formValues.batchSize} operations</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Deployment Preview */}
        <div className="lg:w-1/3">
          <div className="sticky top-6 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Deploy Subnet Token</h2>
              <p className="text-muted-foreground mb-6">
                When you're ready, deploy your subnet token to the Stacks blockchain.
              </p>

              <div className="relative overflow-hidden bg-[var(--sidebar)] rounded-lg px-4 py-3 border border-accent/20 shadow-[0_2px_40px_-4px] shadow-accent/10 mb-6">
                <div className="absolute inset-0 bg-gradient-to-b from-background/10 to-background/0" />
                <div className="absolute inset-0 bg-[radial-gradient(at_top_right,_var(--accent)_0%,_transparent_50%)] opacity-20" />
                <div className="relative">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Estimated Cost</h3>
                      <p className="text-sm text-muted-foreground">Platform fees</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-medium">≈ 50 STX</div>
                    </div>
                  </div>
                </div>
              </div>

              {deploymentStatus === 'idle' && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleDeployContract}
                  disabled={!stxAddress}
                >
                  Deploy Subnet Token
                </Button>
              )}

              {deploymentStatus === 'deploying' && (
                <Button className="w-full" size="lg" disabled>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying Subnet...
                </Button>
              )}

              {deploymentStatus === 'success' && (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-md p-4 mb-2">
                    <div className="flex items-center">
                      <Check className="text-green-500 w-5 h-5 mr-2" />
                      <div className="text-sm font-medium">Deployment Successful</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your subnet token has been deployed successfully.
                    </p>
                    {deploymentContractId && (
                      <div className="mt-2 rounded-md bg-green-500/5 p-2 font-mono text-xs overflow-hidden text-ellipsis">
                        {deploymentContractId}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="w-full"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://explorer.stacks.co/txid/${deploymentTxId}`, '_blank')}
                    >
                      View Transaction
                    </Button>

                    {deploymentContractId && (
                      <Button
                        className="w-full"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://explorer.stacks.co/contract/${deploymentContractId}`, '_blank')}
                      >
                        View Contract
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {deploymentStatus === 'error' && (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-md p-4 mb-2">
                    <div className="text-sm font-medium text-red-500">Deployment Failed</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {deploymentError || "There was an error deploying your subnet token."}
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleDeployContract}
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {deploymentStatus === 'idle' && !stxAddress && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Connect your wallet to deploy a subnet token.
                </p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-medium mb-3">Your Subnet Benefits</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="p-1 bg-primary/20 rounded-full mr-2 mt-0.5">
                    <Flame className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">Fast off-chain transactions</span>
                </li>
                <li className="flex items-start">
                  <div className="p-1 bg-primary/20 rounded-full mr-2 mt-0.5">
                    <Sparkles className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">Improved user experience</span>
                </li>
                <li className="flex items-start">
                  <div className="p-1 bg-primary/20 rounded-full mr-2 mt-0.5">
                    <Brain className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">Compatibility with prediction markets</span>
                </li>
                <li className="flex items-start">
                  <div className="p-1 bg-primary/20 rounded-full mr-2 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">Full SIP-010 token compatibility</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Define the featured tokens that will appear in the horizontal carousel
const getFeaturedTokens = (tokens: Token[]): Token[] => {
  const featuredSymbols = ['STX', 'sBTC', 'CHA', 'DMG', 'WELSH'];
  return tokens.filter(token => featuredSymbols.includes(token.symbol));
};

// Define the recent tokens - this would normally be stored in user preferences
const getRecentTokens = (tokens: Token[]): Token[] => {
  // In a real app, this would be fetched from user's history
  const recentSymbols = ['STX', 'CHA', 'WELSH', 'HOOT'];
  return tokens.filter(token => recentSymbols.includes(token.symbol)).slice(0, 5);
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Fetch token prices
    const prices = await Kraxel.getAllTokenPrices();

    // Discover pools (optional for subnet deployer but helpful for price info)
    const blacklist = [
      'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.chdollar',
      'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-runes',
    ] as any;

    await Dexterity.discover({ serialize: true, blacklist });

    // Get all tokens
    const tokens: Token[] = Dexterity.getTokens();

    // Enhance tokens with categories for filtering
    const enhancedTokens = tokens.map(token => {
      const categories: string[] = [];

      // Assign categories based on token attributes
      if (['STX', 'sBTC', 'CHA', 'DMG', 'WELSH'].includes(token.symbol)) {
        categories.push('popular');
      }

      if (['USDA', 'USDT', 'USDC', 'USDh'].includes(token.symbol)) {
        categories.push('stablecoin');
      }

      if (['CHA', 'VELAR', 'ALEX'].includes(token.symbol)) {
        categories.push('defi');
      }

      if (['WELSH', 'PEPE', 'ROO', 'LEO', 'NOT'].includes(token.symbol)) {
        categories.push('meme');
      }

      return {
        ...token,
        metadata: {
          ...token.metadata,
          categories
        }
      };
    });

    return {
      props: {
        prices,
        tokens: enhancedTokens,
      },
      revalidate: 60 // Revalidate every minute
    };
  } catch (error) {
    console.error('Error fetching data for subnet deployer:', error);
    return {
      props: {
        prices: {},
        tokens: [],
      },
      revalidate: 60
    };
  }
};

export default function SubnetDeployerPage({ tokens, prices }: { tokens: Token[], prices: Record<string, string> }) {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  const featuredTokens = getFeaturedTokens(tokens);
  const recentTokens = getRecentTokens(tokens);

  // Add custom shadow styles
  TokenShadowStyles();

  const meta = {
    title: 'Charisma | Subnet Token Deployer',
    description: 'Create your own subnet token for fast off-chain transactions',
    image: 'https://charisma.rocks/charisma-lp-og.png'
  };

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setStep('configure');
  };

  // This function renders the token selection flow
  const renderTokenSelection = () => {
    return (
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-3">Choose Your Subnet Token Base</h1>
          <p className="text-muted-foreground text-lg">
            Select a token that will back your subnet. Users will deposit this token to use your subnet services.
          </p>
        </div>

        {/* Featured/Popular Tokens Carousel */}
        <div className="relative bg-[var(--sidebar)] rounded-xl border border-accent/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 to-background/0" />
          <div className="absolute inset-0 bg-[radial-gradient(at_top_right,_var(--accent)_0%,_transparent_50%)] opacity-20" />
          <div className="relative py-6 px-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
              Featured Tokens
            </h2>

            <div className="flex py-4 pb-2 px-2 -mx-2 scrollbar-hide">
              {featuredTokens.map(token => {
                return (
                  <div key={token.contractId} className="flex-shrink-0 w-32 mx-2">
                    <Color src={token.image || '/stx-logo.png'} crossOrigin="anonymous" format="hex">
                      {({ data, loading, error }) => (
                        <button
                          className="w-full flex flex-col hover:border-b-2 items-center p-4 rounded-lg transition-all hover:-translate-y-1 hover:token-shadow hover:scale-[1.03]"
                          style={{
                            "--token-shadow-color": loading || error ? 'rgba(0,0,0,0.1)' : `${data}20`
                          } as React.CSSProperties}
                          onClick={() => handleTokenSelect(token)}
                        >
                          <Image
                            src={token.image || '/stx-logo.png'}
                            alt={token.name}
                            width={56}
                            height={56}
                            className="rounded-full mb-3"
                          />
                          <span className="font-medium text-center">{token.symbol}</span>
                        </button>
                      )}
                    </Color>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recently Used Tokens */}
        <div className="relative overflow-hidden bg-[var(--sidebar)] rounded-xl border border-accent/10">
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 to-background/0" />
          <div className="absolute inset-0 bg-[radial-gradient(at_top_right,_var(--accent)_0%,_transparent_50%)] opacity-10" />
          <div className="relative py-6 px-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              Recently Used
            </h2>

            <div className="flex flex-wrap gap-2">
              {recentTokens.map(token => {
                const tokenImgSrc = token.image || '/stx-logo.png';
                return (
                  <Palette key={token.contractId} src={tokenImgSrc} crossOrigin="anonymous" format="hex" colorCount={2}>
                    {({ data, loading, error }) => (
                      <button
                        className="hover:border-b flex items-center space-x-2 px-3 py-2 rounded-lg transition-all hover:-translate-y-1 hover:token-shadow hover:scale-[1.03]"
                        style={{
                          "--token-shadow-color": loading || error ? 'rgba(0,0,0,0.1)' : `${data![0]}20`
                        } as React.CSSProperties}
                        onClick={() => handleTokenSelect(token)}
                      >
                        <Image
                          src={tokenImgSrc}
                          alt={token.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span>{token.symbol}</span>
                      </button>
                    )}
                  </Palette>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Token Selector */}
        <div className="relative overflow-hidden bg-[var(--sidebar)] rounded-xl border border-accent/10">
          <div className="relative p-6">
            <SubnetTokenSelector
              tokens={tokens}
              prices={prices}
              onTokenSelect={handleTokenSelect}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Page meta={meta}>
      <div className="container max-w-6xl py-8">
        {step === 'select' ? (
          renderTokenSelection()
        ) : (
          <SubnetConfiguration
            selectedToken={selectedToken!}
            prices={prices}
            onBack={() => setStep('select')}
          />
        )}
      </div>
    </Page>
  );
}