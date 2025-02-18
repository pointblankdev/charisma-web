import React, { useEffect } from 'react';
import { Label } from '@components/ui/label';
import { Slider } from '@components/ui/slider';
import { Input } from '@components/ui/input';
import { DollarSign, Info, Layers, WandSparkles, AlertCircle, ImageIcon, Currency } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import { Textarea } from '@components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ImageUpload } from '@components/ui/image-upload';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Alert, AlertDescription } from '@components/ui/alert';
import { cn } from '@lib/utils';
import Image from 'next/image';
import { Checkbox } from '@components/ui/checkbox';

type FormValues = {
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
  isLimitedPalette: boolean;
  isRozarStyle: boolean;
  isMooningSharkStyle: boolean;
  isVinzoStyle: boolean;
};

type TokenSettingsFormProps = {
  prices: Record<string, number>;
  isGenerating: boolean;
  tokenAMetadata: any;
  tokenBMetadata: any;
  metadata: any;
  form: UseFormReturn<FormValues>;
  onMetadataChange: (metadata: any) => void;
  onGenerateImage: () => void;
};

export function TokenSettingsForm({ prices, isGenerating, tokenAMetadata, tokenBMetadata, metadata, form, onMetadataChange, onGenerateImage }: TokenSettingsFormProps) {
  const { watch, setValue } = form;
  const formValues = watch();

  useEffect(() => {
    const formMetadata = {
      name: formValues.lpTokenName,
      symbol: formValues.lpTokenSymbol,
      decimals: 6,
      identifier: formValues.lpTokenSymbol,
      description: formValues.description,
      properties: {
        tokenAContract: formValues.tokenAContract,
        tokenBContract: formValues.tokenBContract,
        lpRebatePercent: formValues.lpRebatePercent,
        tokenAMetadata,
        tokenBMetadata
      },
      ...metadata
    };
    onMetadataChange(formMetadata);
  }, [formValues, tokenAMetadata, tokenBMetadata, onMetadataChange]);

  const formatNumber = (num: number) => {
    if (num < 0.000001) return num.toExponential(6);
    return num.toLocaleString(undefined, {
      maximumFractionDigits: 6,
      minimumFractionDigits: 2
    });
  };

  const getPriceDeviation = () => {
    if (!tokenAMetadata || !tokenBMetadata) return 0;

    const priceA = prices[tokenAMetadata.contractId] || 0;
    const priceB = prices[tokenBMetadata.contractId] || 0;

    if (!priceA || !priceB) return 0;

    const adjustedAmountA = formValues.initialLiquidityA / Math.pow(10, tokenAMetadata.decimals);
    const adjustedAmountB = formValues.initialLiquidityB / Math.pow(10, tokenBMetadata.decimals);

    const marketRatio = priceA / priceB;
    const impliedRatio = (adjustedAmountB * priceB) / (adjustedAmountA * priceA);
    return (impliedRatio - 1) * 100;
  };

  const handleImageUpload = (file: File) => {
    setValue('customImage', file);

    // Create a temporary object URL for immediate display
    const objectUrl = URL.createObjectURL(file);
    onMetadataChange({
      ...metadata,
      image: objectUrl
    });

    // Call generateMetadata to handle the actual upload
    onGenerateImage();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left Panel - Token Identity */}
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:space-x-6">
            {/* Token Image Section */}
            <div className="relative mb-6 md:mb-0 md:w-1/2">
              <div className="group">
                <div
                  className={cn(
                    "relative w-full aspect-square rounded-lg overflow-hidden cursor-pointer",
                    "border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors",
                    "flex items-center justify-center"
                  )}
                  onClick={() => document.getElementById('image-upload')?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file) handleImageUpload(file);
                  }}
                >
                  {isGenerating ? (
                    <div className="absolute inset-0 animate-pulse bg-accent" />
                  ) : metadata?.image ? (
                    <img
                      src={metadata.image}
                      alt={formValues.lpTokenName || 'LP Token'}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-xs">Drop image or click to upload</span>
                    </div>
                  )}

                  <div className={cn(
                    "absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center",
                    metadata?.image ? "opacity-0 group-hover:opacity-100" : "opacity-0"
                  )}>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Textarea
                  value={formValues.imagePrompt}
                  onChange={(e) => setValue('imagePrompt', e.target.value)}
                  placeholder="Image generation prompt..."
                  rows={2}
                  className="text-xs"
                />
              </div>
              <div className="mt-2 gap-2 flex flex-wrap">
                <div className="flex items-center space-x-2 w-max-24">
                  <Checkbox
                    id="limitedPalette"
                    checked={formValues.isLimitedPalette}
                    onCheckedChange={(e) => setValue('isLimitedPalette', !!e)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="limitedPalette" className="text-xs text-muted-foreground bg-muted-foreground/10 px-1 py-0.5 rounded-md">
                    Limit Color Palette
                  </label>
                </div>

                <div className="flex items-center space-x-2 w-max-24">
                  <Checkbox
                    id="rozarStyle"
                    checked={formValues.isRozarStyle}
                    onCheckedChange={(e) => setValue('isRozarStyle', !!e)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="rozarStyle" className="text-xs text-muted-foreground bg-muted-foreground/10 px-1 py-0.5 rounded-md">
                    Rozar Style
                  </label>
                </div>

                <div className="flex items-center space-x-2 w-max-24">
                  <Checkbox
                    id="mooningSharkStyle"
                    checked={formValues.isMooningSharkStyle}
                    onCheckedChange={(e) => setValue('isMooningSharkStyle', !!e)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="mooningSharkStyle" className="text-xs text-muted-foreground bg-muted-foreground/10 px-1 py-0.5 rounded-md">
                    Mooning Shark Style
                  </label>
                </div>

                <div className="flex items-center space-x-2 w-max-24">
                  <Checkbox
                    id="vinzoStyle"
                    checked={formValues.isVinzoStyle}
                    onCheckedChange={(e) => setValue('isVinzoStyle', !!e)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="vinzoStyle" className="text-xs text-muted-foreground bg-muted-foreground/10 px-1 py-0.5 rounded-md">
                    Vinzo Style
                  </label>
                </div>
              </div>


              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                className="hidden"
              />

              <Button
                size="icon"
                variant="ghost"
                onClick={onGenerateImage}
                className="absolute top-2 right-2 rounded-full"
                disabled={isGenerating}
              >
                <WandSparkles className="w-4 h-4" />
              </Button>
            </div>

            {/* Token Details Section */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label>Token Name</Label>
                <Input
                  value={formValues.lpTokenName}
                  onChange={e => setValue('lpTokenName', e.target.value)}
                  placeholder="Enter token name"
                />
              </div>
              <div className="space-y-2">
                <Label>Token Symbol</Label>
                <Input
                  value={formValues.lpTokenSymbol}
                  onChange={e => setValue('lpTokenSymbol', e.target.value)}
                  placeholder="Enter token symbol"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formValues.description}
                  onChange={e => setValue('description', e.target.value)}
                  placeholder="Enter token description"
                  rows={2}
                  className="min-h-[200px]"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Panel - Vault Configuration */}
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="mb-6 text-lg font-medium">Vault Configuration</h3>

          {/* LP Rebate Control */}
          <div className="mb-8 max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Label>LP Rebate Strategy</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        The percentage of trading fees distributed to liquidity providers. Higher percentages protect against arbitrage but reduce protocol revenue.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-medium">{formValues.lpRebatePercent}%</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setValue('lpRebatePercent', 0.25)}
                className={cn(
                  'text-xs py-6 font-semibold hover:bg-accent-foreground hover:text-primary-foreground',
                  formValues.lpRebatePercent === 0.25 && 'bg-primary text-primary-foreground'
                )}
              >
                <div className="flex flex-col items-center">
                  <span>Competitive</span>
                  <span className="text-[10px] text-primary-foreground/60">0.25%</span>
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setValue('lpRebatePercent', 2.5)}
                className={cn(
                  'text-xs py-6 font-semibold hover:bg-accent-foreground hover:text-primary-foreground',
                  formValues.lpRebatePercent === 2.5 && 'bg-primary text-primary-foreground'
                )}
              >
                <div className="flex flex-col items-center">
                  <span>Recommended</span>
                  <span className="text-[10px] text-primary-foreground/60">2.5%</span>
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setValue('lpRebatePercent', 5)}
                className={cn(
                  'text-xs py-6 font-semibold hover:bg-accent-foreground hover:text-primary-foreground',
                  formValues.lpRebatePercent === 5 && 'bg-primary text-primary-foreground'
                )}
              >
                <div className="flex flex-col items-center">
                  <span>Protected</span>
                  <span className="text-[10px] text-primary-foreground/60">5%</span>
                </div>
              </Button>
            </div>

            <Slider
              min={0.01}
              max={5}
              step={0.01}
              value={[formValues.lpRebatePercent]}
              onValueChange={([value]) => setValue('lpRebatePercent', value || 0)}
              className="my-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.01%</span>
              <span>5%</span>
            </div>
          </div>

          {/* Initial Liquidity Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label>Initial Liquidity</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        The initial amount of tokens to seed the liquidity pool. This sets the starting price ratio between the tokens.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Price and TVL Information */}
            <div className="space-y-2 p-4 rounded-lg border border-primary/20">
              {/* Exchange Rate */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Currency className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Exchange Rate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>1 {tokenAMetadata?.symbol || 'Token A'} = </span>
                  <span>{formatNumber(formValues.initialLiquidityB / formValues.initialLiquidityA)}</span>
                  <span>{tokenBMetadata?.symbol || 'Token B'}</span>
                </div>
              </div>

              {/* Price Deviation Warning */}
              {tokenAMetadata && tokenBMetadata && prices[tokenAMetadata.contractId] && prices[tokenBMetadata.contractId] && (
                <>
                  {Math.abs(getPriceDeviation()) > 1 && (
                    <Alert variant={Math.abs(getPriceDeviation()) > 5 ? 'destructive' : 'default'} className="py-2">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription className="text-sm">
                        {Math.abs(getPriceDeviation()) > 5 ? (
                          <>Pool value ratio deviates significantly ({Math.abs(getPriceDeviation()).toFixed(2)}%) from market rate</>
                        ) : (
                          <>Pool value ratio differs slightly ({Math.abs(getPriceDeviation()).toFixed(2)}%) from market rate</>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}

              {/* Total Value Display */}
              <div className="flex items-center justify-between pt-2 border-t border-primary/10">
                <div className="flex items-center space-x-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Total Value Locked</span>
                </div>
                <span className="font-medium">
                  ${(
                    ((formValues.initialLiquidityA / Math.pow(10, tokenAMetadata?.decimals || 0)) * (prices[tokenAMetadata?.contractId] || 0)) +
                    ((formValues.initialLiquidityB / Math.pow(10, tokenBMetadata?.decimals || 0)) * (prices[tokenBMetadata?.contractId] || 0))
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid gap-6">
              {/* Token Inputs */}
              <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
                {/* Token A Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {tokenAMetadata?.symbol || 'Token A'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ≈ ${((formValues.initialLiquidityA / Math.pow(10, tokenAMetadata?.decimals || 0)) * (prices[tokenAMetadata?.contractId] || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={
                        tokenAMetadata
                          ? formValues.initialLiquidityA / Math.pow(10, tokenAMetadata.decimals)
                          : formValues.initialLiquidityA
                      }
                      onChange={e => {
                        const value = Math.max(0, parseFloat(e.target.value));
                        if (!isNaN(value)) {
                          setValue('initialLiquidityA', value * Math.pow(10, tokenAMetadata.decimals));
                        }
                      }}
                      className="font-mono w-48"
                    />
                    <div className="flex items-center space-x-2">
                      <Image
                        src={tokenAMetadata?.image || '/dmg-logo.gif'}
                        alt={tokenAMetadata?.symbol || 'Token A'}
                        width={20}
                        height={20}
                        className="rounded-full -translate-x-9 scale-[1.3]"
                      />
                    </div>
                  </div>
                </div>

                {/* Token B Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {tokenBMetadata?.symbol || 'Token B'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ≈ ${((formValues.initialLiquidityB / Math.pow(10, tokenBMetadata?.decimals || 0)) * (prices[tokenBMetadata?.contractId] || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={
                        tokenBMetadata
                          ? formValues.initialLiquidityB / Math.pow(10, tokenBMetadata.decimals)
                          : formValues.initialLiquidityB
                      }
                      onChange={e => {
                        const value = Math.max(0, parseFloat(e.target.value));
                        if (!isNaN(value)) {
                          setValue('initialLiquidityB', value * Math.pow(10, tokenBMetadata.decimals));
                        }
                      }}
                      className="font-mono w-48"
                    />
                    <div className="flex items-center space-x-2">
                      <Image
                        src={tokenBMetadata?.image || '/dmg-logo.gif'}
                        alt={tokenBMetadata?.symbol || 'Token B'}
                        width={20}
                        height={20}
                        className="rounded-full -translate-x-9 scale-[1.3]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
