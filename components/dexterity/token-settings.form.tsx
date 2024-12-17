import React from 'react';
import { Label } from '@components/ui/label';
import { Slider } from '@components/ui/slider';
import { Input } from '@components/ui/input';
import { DollarSign, Info, Layers } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip';
import { Textarea } from '@components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';

type FormValues = {
  tokenAContract: string;
  tokenBContract: string;
  lpTokenName: string;
  lpTokenSymbol: string;
  lpRebatePercent: number;
  description: string;
  initialLiquidityA: number;
  initialLiquidityB: number;
};

type TokenSettingsFormProps = {
  prices: Record<string, number>;
  isGenerating: boolean;
  tokenAMetadata: any;
  tokenBMetadata: any;
  metadata: any;
  form: UseFormReturn<FormValues>;
};

export function TokenSettingsForm(props: TokenSettingsFormProps) {
  const { prices, isGenerating, tokenAMetadata, tokenBMetadata, metadata, form } = props;

  const { watch, setValue } = form;
  const formValues = watch();

  // Calculate token totals in fiat (if prices are available)
  const totalA = tokenAMetadata
    ? (formValues.initialLiquidityA / Math.pow(10, tokenAMetadata.decimals)) *
      (prices[formValues.tokenAContract] || 0)
    : 0;

  const totalB = tokenBMetadata
    ? (formValues.initialLiquidityB / Math.pow(10, tokenBMetadata.decimals)) *
      (prices[formValues.tokenBContract] || 0)
    : 0;

  console.log('TokenSettingsForm', {
    prices,
    isGenerating,
    tokenAMetadata,
    tokenBMetadata,
    metadata,
    form
  });

  // Shimmer Placeholder Component
  const ShimmerPlaceholder = () => (
    <div className="flex items-start animate-pulse">
      <div className="bg-gray-200 rounded w-36 h-36" />
    </div>
  );

  return (
    <div className="grid gap-2 my-2 lg:grid-cols-2">
      {/* Left Card: Token Metadata Overview */}
      <div className="p-6 space-y-6 border rounded-lg bg-background">
        <div className="space-y-2">
          <div className="flex items-start space-x-4">
            {isGenerating ? (
              <ShimmerPlaceholder />
            ) : metadata?.image ? (
              <img
                src={metadata.image}
                alt={formValues.lpTokenName || 'LP Token'}
                className="object-contain rounded-lg w-36 h-36"
              />
            ) : (
              <div className="flex items-center justify-center rounded w-36 h-36 bg-accent">
                <span className="text-xs text-accent-foreground">No Image</span>
              </div>
            )}
            <div className="flex-1 space-y-2">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Token Name</Label>
                <Input
                  value={formValues.lpTokenName}
                  onChange={e => setValue('lpTokenName', e.target.value)}
                  placeholder="Enter token name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Token Symbol</Label>
                <Input
                  value={formValues.lpTokenSymbol}
                  onChange={e => setValue('lpTokenSymbol', e.target.value)}
                  placeholder="Enter token symbol"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-muted-foreground">Description</Label>
            <Textarea
              value={formValues.description}
              onChange={e => setValue('description', e.target.value)}
              placeholder="Enter token description"
              rows={3}
            />
          </div>
        </div>

        {/* LP Rebate Percentage */}
        <div className="pt-4 mt-4 space-y-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Label>LP Rebate Percentage</Label>
            <span className="font-mono text-sm">{formValues.lpRebatePercent}%</span>
          </div>
          <Slider
            min={0.01}
            max={5}
            step={0.01}
            value={[formValues.lpRebatePercent]}
            onValueChange={([val]) => setValue('lpRebatePercent', val)}
          />
          <p className="text-sm text-muted-foreground">
            Percentage of trading fees distributed to liquidity providers.
          </p>
        </div>
      </div>

      {/* Right Card: Initial Liquidity */}
      <div className="p-6 space-y-6 border rounded-lg bg-background">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Initial Liquidity</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 cursor-pointer text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm">
                  Initial liquidity is the amount of each token you add to the pool at its creation.
                  Setting balanced and sufficient amounts for both tokens helps ensure stable
                  pricing and a good trading experience. The values you enter here will define the
                  initial ratio and price for the tokens in the pool.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter the amount of each token you want to deposit. The total value in USD (estimated) is
          shown to help you gauge the scale of your initial liquidity. Consider balancing Token A
          and Token B amounts according to your target price ratio.
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Token A Column */}
          <div className="flex flex-col space-y-2">
            <Label className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>{tokenAMetadata?.symbol || 'Token A'}</span>
            </Label>
            <Input
              type="number"
              step="any"
              value={
                tokenAMetadata
                  ? formValues.initialLiquidityA / Math.pow(10, tokenAMetadata.decimals)
                  : formValues.initialLiquidityA
              }
              onChange={e => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  setValue('initialLiquidityA', value * Math.pow(10, tokenAMetadata.decimals));
                }
              }}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-medium">${totalA.toFixed(2)}</span>
            </p>
          </div>

          {/* Token B Column */}
          <div className="flex flex-col space-y-2">
            <Label className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>{tokenBMetadata?.symbol || 'Token B'}</span>
            </Label>
            <Input
              type="number"
              step="any"
              value={
                tokenBMetadata
                  ? formValues.initialLiquidityB / Math.pow(10, tokenBMetadata.decimals)
                  : formValues.initialLiquidityB
              }
              onChange={e => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  setValue('initialLiquidityB', value * Math.pow(10, tokenBMetadata.decimals));
                }
              }}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-medium">${totalB.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
