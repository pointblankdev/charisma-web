import { useState } from 'react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Card } from '@components/ui/card';
import { Loader2Icon } from 'lucide-react';
import { setContractMetadata } from '@lib/fetchers/user-api';
import { toast } from '@components/ui/use-toast';

interface MetadataEditFormProps {
    metadata: any;
    contractId: string;
    onMetadataUpdate: (newMetadata: any) => void;
}

export function MetadataEditForm({ metadata, contractId, onMetadataUpdate }: MetadataEditFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: metadata?.name || '',
        symbol: metadata?.symbol || '',
        description: metadata?.description || '',
        image: metadata?.image || '',
        decimals: metadata?.decimals || 6,
        identifier: metadata?.identifier || '',
        properties: {
            lpRebatePercent: metadata?.fee / 10000 || 0,
            externalPoolId: metadata?.externalPoolId || '',
            engineContractId: metadata?.engineContractId || '',
            tokenAContract: metadata?.tokenA.contractId || '',
            tokenBContract: metadata?.tokenB.contractId || '',
            ...metadata?.properties
        }
    });

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePropertyChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            properties: {
                ...prev.properties,
                [field]: value
            }
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const updatedMetadata = {
                ...formData,
                lastUpdated: new Date().toISOString()
            };

            const response: any = await setContractMetadata(contractId, updatedMetadata);

            if (!response.ok) {
                throw new Error('Failed to update metadata');
            }

            const result = await response.json();

            if (result.success && result.metadata) {
                toast({
                    title: 'Success',
                    description: 'Metadata updated successfully',
                });
                onMetadataUpdate(result.metadata);
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (error) {
            console.error('Error updating metadata:', error);
            toast({
                title: 'Error',
                description: 'Failed to update metadata',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Edit Metadata</h3>
            <div className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <Input
                            value={formData.name}
                            onChange={e => handleChange('name', e.target.value)}
                            placeholder="Token Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Decimals</label>
                        <Input
                            type="number"
                            value={formData.decimals}
                            onChange={e => handleChange('decimals', parseInt(e.target.value))}
                            placeholder="Decimals"
                            disabled={true}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Symbol</label>
                        <Input
                            value={formData.symbol}
                            onChange={e => handleChange('symbol', e.target.value)}
                            placeholder="Token Symbol"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Identifier</label>
                        <Input
                            value={formData.identifier}
                            onChange={e => handleChange('identifier', e.target.value)}
                            placeholder="Token Identifier"
                            disabled={true}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input
                        value={formData.description}
                        onChange={e => handleChange('description', e.target.value)}
                        placeholder="Description"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <Input
                        value={formData.image}
                        onChange={e => handleChange('image', e.target.value)}
                        placeholder="Image URL"
                    />
                </div>

                {/* Properties Section */}
                <div className="border-t border-muted-foreground/20 pt-4">
                    <h4 className="text-md font-medium mb-3">Properties</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">LP Rebate Percent</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.properties.lpRebatePercent}
                                onChange={e => handlePropertyChange('lpRebatePercent', parseFloat(e.target.value))}
                                placeholder="LP Rebate Percent"
                                disabled={true}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">External Pool ID</label>
                            <Input
                                value={formData.properties.externalPoolId}
                                onChange={e => handlePropertyChange('externalPoolId', e.target.value)}
                                placeholder="External Pool ID"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Engine Contract ID</label>
                            <Input
                                value={formData.properties.engineContractId}
                                onChange={e => handlePropertyChange('engineContractId', e.target.value)}
                                placeholder="Engine Contract ID"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Token A Contract</label>
                            <Input
                                value={formData.properties.tokenAContract}
                                onChange={e => handlePropertyChange('tokenAContract', e.target.value)}
                                placeholder="Token A Contract"
                                disabled={true}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Token B Contract</label>
                            <Input
                                value={formData.properties.tokenBContract}
                                onChange={e => handlePropertyChange('tokenBContract', e.target.value)}
                                placeholder="Token B Contract"
                                disabled={true}
                            />
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? (
                        <>
                            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        'Update Metadata'
                    )}
                </Button>
            </div>
        </Card>
    );
} 