import { useState } from 'react';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { Textarea } from '@components/ui/textarea';
import { ImageUpload } from '@components/ui/image-upload';
import { Loader2Icon } from 'lucide-react';
import { Token } from 'dexterity-sdk';
import { Card } from '@components/ui/card';
import { setContractMetadata, uploadImage } from '@lib/fetchers/user-api';
import { toast } from '@components/ui/use-toast';

interface TokenMetadataFormProps {
    token: Token;
    onMetadataUpdate: (metadata: any) => void;
}

export function TokenMetadataForm({ token }: TokenMetadataFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: token.name,
        symbol: token.symbol,
        description: token.description || '',
        image: token.image || '',
        decimals: token.decimals,
        identifier: token.identifier || token.symbol || '',
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response: any = await setContractMetadata(token.contractId, formData);

            if (!response.ok) {
                throw new Error('Failed to update metadata');
            }

            toast({
                title: "Success",
                description: "Token metadata has been updated",
            });
        } catch (error) {
            console.error('Error saving metadata:', error);
            toast({
                title: "Error",
                description: "Failed to update token metadata",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Update Token Metadata</h2>
            <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <Input
                            value={formData.name}
                            onChange={e => handleChange('name', e.target.value)}
                            placeholder="Token Name"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                            Display name for the token
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Symbol</label>
                        <Input
                            value={formData.symbol}
                            onChange={e => handleChange('symbol', e.target.value)}
                            placeholder="Token Symbol"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                            Trading symbol for the token
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Identifier</label>
                        <Input
                            value={formData.identifier}
                            onChange={e => handleChange('identifier', e.target.value)}
                            placeholder="Token Identifier"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                            Unique identifier for the token
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                        value={formData.description}
                        onChange={e => handleChange('description', e.target.value)}
                        placeholder="Token Description"
                        rows={4}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Token Image</label>
                    <ImageUpload
                        value={formData.image}
                        onChange={url => handleChange('image', url)}
                        onUpload={async (file: Blob) => {
                            try {
                                const formData = new FormData();
                                formData.append('file', file);
                                formData.append('contractId', token.contractId);

                                const response = await uploadImage(formData);
                                if (!response.ok) throw new Error('Failed to upload image');

                                const { url } = await response.json();
                                return url;
                            } catch (error) {
                                console.error('Error uploading image:', error);
                                toast({
                                    title: "Error",
                                    description: "Failed to upload image",
                                    variant: "destructive"
                                });
                                return '';
                            }
                        }}
                        onRemove={() => handleChange('image', '')}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Decimals</label>
                    <Input
                        type="number"
                        value={formData.decimals}
                        onChange={e => handleChange('decimals', parseInt(e.target.value))}
                        placeholder="Token Decimals"
                        disabled
                    />
                    <p className="mt-1 text-sm text-muted-foreground">
                        Decimals cannot be changed after token creation
                    </p>
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