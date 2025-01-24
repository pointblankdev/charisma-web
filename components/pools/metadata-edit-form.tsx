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
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const updatedMetadata = {
                ...metadata,
                ...formData,
                properties: {
                    ...(metadata?.properties || {}),
                    lastUpdated: new Date().toISOString()
                }
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
                <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Input
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                        placeholder="Vault Name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Symbol</label>
                    <Input
                        value={formData.symbol}
                        onChange={e => handleChange('symbol', e.target.value)}
                        placeholder="Token Symbol"
                    />
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