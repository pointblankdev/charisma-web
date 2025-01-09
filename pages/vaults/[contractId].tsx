import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '@components/layout/layout';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { useGlobalState } from '@lib/hooks/global-state-context';
import { setContractMetadata, setVaultMetadata } from '@lib/user-api';
import { ContractId, Dexterity } from 'dexterity-sdk';
import { GetServerSideProps } from 'next';
import { Vault } from 'dexterity-sdk/dist/core/vault';

interface TokenMetadata {
    contractId: string;
    identifier: string;
    name: string;
    symbol: string;
    decimals: number;
    description: string;
    image: string;
    reserves?: number;
}

interface VaultMetadata {
    name: string;
    symbol: string;
    decimals: number;
    identifier: string;
    description: string;
    image: string;
    fee?: number;
    externalPoolId?: string;
    supply?: number;
    contractId?: string;
    contractAddress?: string;
    contractName?: string;
    tokenA?: TokenMetadata;
    tokenB?: TokenMetadata;
    properties?: {
        [key: string]: any;
    };
}

interface Props {
    initialMetadata: VaultMetadata;
    contractId: string;
}

interface AuthState {
    isAuthenticated: boolean;
    password: string;
}

export const getServerSideProps: GetServerSideProps<any> = async (context) => {
    const contractId = context.params?.contractId as ContractId;

    const metadata = await Vault.build(contractId);

    return {
        props: {
            initialMetadata: JSON.parse(JSON.stringify(metadata)),
            contractId
        }
    };

};

export default function VaultMetadataPage({ initialMetadata, contractId }: Props) {
    const router = useRouter();
    const [metadata, setMetadata] = useState<VaultMetadata>(initialMetadata);
    const [isSaving, setIsSaving] = useState(false);
    const { stxAddress } = useGlobalState();
    const [auth, setAuth] = useState<AuthState>({
        isAuthenticated: false,
        password: ''
    });

    const handleMetadataChange = (field: keyof VaultMetadata, value: any) => {
        setMetadata(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePropertyChange = (key: string, value: any) => {
        setMetadata(prev => ({
            ...prev,
            properties: {
                ...prev.properties,
                [key]: value
            }
        }));
    };

    const handleSave = async () => {
        if (!metadata || !contractId) return;

        setIsSaving(true);
        try {
            const response = await setVaultMetadata(contractId, {
                ...metadata,
                properties: {
                    ...metadata.properties,
                    lastUpdated: new Date().toISOString()
                }
            });

            if (!response.ok) {
                throw new Error('Failed to update metadata');
            }

            alert('Metadata updated successfully');
        } catch (error) {
            console.error('Error saving metadata:', error);
            alert('Failed to update metadata');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogin = () => {
        if (auth.password === 'k') {
            setAuth(prev => ({ ...prev, isAuthenticated: true }));
        } else {
            alert('Invalid password');
        }
    };

    const handleTokenChange = (tokenKey: 'tokenA' | 'tokenB', field: keyof TokenMetadata, value: any) => {
        setMetadata(prev => ({
            ...prev,
            [tokenKey]: {
                ...prev[tokenKey],
                [field]: value
            }
        }));
    };

    if (!auth.isAuthenticated) {
        return (
            <Layout>
                <div className="container mx-auto p-4 max-w-md">
                    <Card className="p-6 space-y-6">
                        <h1 className="text-2xl font-bold">Authentication Required</h1>
                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <Input
                                type="password"
                                value={auth.password}
                                onChange={e => setAuth(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Enter password"
                            />
                        </div>
                        <Button onClick={handleLogin} className="w-full">
                            Login
                        </Button>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">Vault Metadata Manager</h1>
                <div className="grid grid-cols-2 gap-6">
                    {/* JSON Preview Panel */}
                    <Card className="p-6">
                        <h2 className="text-lg font-medium mb-4">JSON Preview</h2>
                        <pre className="p-4 rounded-lg overflow-auto max-h-[800px] text-sm">
                            {JSON.stringify(metadata, null, 2)}
                        </pre>
                    </Card>

                    {/* Updated Form Panel */}
                    <Card className="p-6 space-y-6">
                        <div className="space-y-6">
                            <h2 className="text-xl font-medium">Basic Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name</label>
                                    <Input
                                        value={metadata.name}
                                        onChange={e => handleMetadataChange('name', e.target.value)}
                                        placeholder="Vault Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Symbol</label>
                                    <Input
                                        value={metadata.symbol}
                                        onChange={e => handleMetadataChange('symbol', e.target.value)}
                                        placeholder="Token Symbol"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Decimals</label>
                                    <Input
                                        type="number"
                                        value={metadata.decimals}
                                        onChange={e => handleMetadataChange('decimals', parseInt(e.target.value))}
                                        placeholder="Decimals"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Identifier</label>
                                    <Input
                                        value={metadata.identifier}
                                        onChange={e => handleMetadataChange('identifier', e.target.value)}
                                        placeholder="Identifier"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <Input
                                    value={metadata.description}
                                    onChange={e => handleMetadataChange('description', e.target.value)}
                                    placeholder="Description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Image URL</label>
                                <Input
                                    value={metadata.image}
                                    onChange={e => handleMetadataChange('image', e.target.value)}
                                    placeholder="Image URL"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Fee (bps)</label>
                                    <Input
                                        type="number"
                                        value={metadata.fee}
                                        onChange={e => handleMetadataChange('fee', parseInt(e.target.value))}
                                        placeholder="Fee in basis points"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">External Pool ID</label>
                                    <Input
                                        value={metadata.externalPoolId}
                                        onChange={e => handleMetadataChange('externalPoolId', e.target.value)}
                                        placeholder="External Pool ID"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Token A Section */}
                        <div className="pt-6 border-t">
                            <h2 className="text-xl font-medium mb-4">Token A</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Contract ID</label>
                                    <Input
                                        value={metadata.tokenA?.contractId}
                                        onChange={e => handleTokenChange('tokenA', 'contractId', e.target.value)}
                                        placeholder="Token A Contract ID"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Name</label>
                                        <Input
                                            value={metadata.tokenA?.name}
                                            onChange={e => handleTokenChange('tokenA', 'name', e.target.value)}
                                            placeholder="Token A Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Symbol</label>
                                        <Input
                                            value={metadata.tokenA?.symbol}
                                            onChange={e => handleTokenChange('tokenA', 'symbol', e.target.value)}
                                            placeholder="Token A Symbol"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Image URL</label>
                                    <Input
                                        value={metadata.tokenA?.image}
                                        onChange={e => handleTokenChange('tokenA', 'image', e.target.value)}
                                        placeholder="Token A Image URL"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Token B Section - Similar to Token A */}
                        <div className="pt-6 border-t">
                            <h2 className="text-xl font-medium mb-4">Token B</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Contract ID</label>
                                    <Input
                                        value={metadata.tokenB?.contractId}
                                        onChange={e => handleTokenChange('tokenB', 'contractId', e.target.value)}
                                        placeholder="Token B Contract ID"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Name</label>
                                        <Input
                                            value={metadata.tokenB?.name}
                                            onChange={e => handleTokenChange('tokenB', 'name', e.target.value)}
                                            placeholder="Token B Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Symbol</label>
                                        <Input
                                            value={metadata.tokenB?.symbol}
                                            onChange={e => handleTokenChange('tokenB', 'symbol', e.target.value)}
                                            placeholder="Token B Symbol"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Image URL</label>
                                    <Input
                                        value={metadata.tokenB?.image}
                                        onChange={e => handleTokenChange('tokenB', 'image', e.target.value)}
                                        placeholder="Token B Image URL"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !stxAddress}
                                className="min-w-32"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
} 