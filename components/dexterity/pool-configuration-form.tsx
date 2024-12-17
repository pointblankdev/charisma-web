import { Form, FormControl, FormField, FormItem, FormLabel } from '@components/ui/form';
import { Input } from '@components/ui/input';
import { Slider } from '@components/ui/slider';
import { Button } from '@components/ui/button';
import { ImagePlus, Share, Info } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { Alert, AlertDescription } from '@components/ui/alert';
import { Card } from '@components/ui/card';

interface TokenMetadata {
  decimals: number;
  name?: string;
  symbol?: string;
}

interface PoolConfigurationFormProps {
  form: UseFormReturn<any>;
  onSubmit: () => void;
  onGenerateMetadata: () => void;
  onDeploy: (e: any) => void;
  isGenerating: boolean;
  hasMetadata: boolean;
  tokenAMetadata?: TokenMetadata;
  tokenBMetadata?: TokenMetadata;
}

export function PoolConfigurationForm({
  form,
  onSubmit,
  onGenerateMetadata,
  onDeploy,
  isGenerating,
  hasMetadata,
  tokenAMetadata,
  tokenBMetadata
}: PoolConfigurationFormProps) {
  // Convert a human-readable value to contract value (multiplied by 10^decimals)
  const toContractValue = (value: number, decimals: number) => {
    return Math.round(value * Math.pow(10, decimals));
  };

  // Convert a contract value to human-readable value (divided by 10^decimals)
  const fromContractValue = (value: number, decimals: number) => {
    return value / Math.pow(10, decimals);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>Configure your liquidity pool parameters and token B.</AlertDescription>
      </Alert>

      <Form {...form}>
        <form onChange={onSubmit} className="space-y-6">
          {/* Basic Configuration */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lpTokenName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter token name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lpTokenSymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter token symbol" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter token description" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Token Configuration */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tokenAContract"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token A Contract</FormLabel>
                      <FormControl>
                        <Input placeholder="Principal" disabled {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tokenBContract"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token B Contract</FormLabel>
                      <FormControl>
                        <Input placeholder="Principal" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="lpRebatePercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LP Rebate Percentage</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={0.01}
                          max={99.99}
                          step={0.01}
                          value={[parseFloat(field.value)]}
                          onValueChange={([value]: any) => field.onChange(value.toString())}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0.01%</span>
                          <span>{parseFloat(field.value).toFixed(2)}%</span>
                          <span>99.99%</span>
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Initial Liquidity */}
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Initial Liquidity</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="initialLiquidityA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Initial Token A Amount{' '}
                        {tokenAMetadata?.symbol ? `(${tokenAMetadata.symbol})` : ''}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="Enter amount"
                          value={
                            tokenAMetadata
                              ? fromContractValue(field.value || 0, tokenAMetadata.decimals)
                              : field.value || ''
                          }
                          onChange={e => {
                            const value = parseFloat(e.target.value);
                            if (tokenAMetadata && !isNaN(value)) {
                              field.onChange(toContractValue(value, tokenAMetadata.decimals));
                            } else {
                              field.onChange(0);
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="initialLiquidityB"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Initial Token B Amount{' '}
                        {tokenBMetadata?.symbol ? `(${tokenBMetadata.symbol})` : ''}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="Enter amount"
                          value={
                            tokenBMetadata
                              ? fromContractValue(field.value || 0, tokenBMetadata.decimals)
                              : field.value || ''
                          }
                          onChange={e => {
                            const value = parseFloat(e.target.value);
                            if (tokenBMetadata && !isNaN(value)) {
                              field.onChange(toContractValue(value, tokenBMetadata.decimals));
                            } else {
                              field.onChange(0);
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onGenerateMetadata}
              disabled={isGenerating}
              className="w-full"
            >
              <ImagePlus className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Metadata'}
            </Button>

            <Button type="button" onClick={onDeploy} disabled={!hasMetadata} className="w-full">
              <Share className="w-4 h-4 mr-2" />
              Deploy Contract
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
