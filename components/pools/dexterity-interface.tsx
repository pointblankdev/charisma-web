import { ExternalLink, Verified } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export const DexterityInterface = ({ data }: any) => {
  const [sortOrder] = useState<'asc' | 'desc'>('desc');

  const shortenAddress = (address: string) => {
    if (address === 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS') return 'rozar.btc';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const sortedPools = useMemo(() => {
    return [...data.pools].sort((a, b) => {
      const nameA = a.metadata.name.toUpperCase();
      const nameB = b.metadata.name.toUpperCase();
      if (nameA < nameB) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (nameA > nameB) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data.pools, sortOrder]);

  return (
    <div className="sm:mx-auto sm:px-4">
      <div className="mt-6">
        <div className="relative sm:px-6 pb-4 pt-5 sm:rounded-lg bg-[var(--sidebar)] border border-[var(--accents-7)] overflow-hidden">
          <div className="px-4 mb-4 sm:px-0">
            <h1 className="text-2xl font-bold text-white/95">Dexterity Pools</h1>
            <div className="mb-4 text-sm text-muted-foreground">
              Deploy your own liquidity pool and earn trading fees on every swap.
            </div>
          </div>

          <div className="px-4 overflow-x-auto sm:px-0">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="px-4 py-2">Pool Details</th>
                  <th className="px-4 py-2">Deployer</th>
                </tr>
              </thead>
              <tbody>
                {sortedPools.map((pool: any, index: number) => (
                  <tr key={index} className="border-t border-gray-700/50">
                    <td className="flex items-start px-4 py-4 text-white">
                      <Image
                        src={pool.metadata.image}
                        alt={pool.metadata.name}
                        width={48}
                        height={48}
                        className="object-cover mr-3 rounded-md"
                      />
                      <div>
                        <div className="flex items-center space-x-1 leading-tight">
                          <div className="text-xl leading-none">{pool.metadata.name}</div>
                          <Link
                            href={`https://explorer.stxer.xyz/txid/${pool.contractId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-1"
                          >
                            <ExternalLink size={14} />
                          </Link>
                        </div>
                        <div className="text-sm text-gray-400">{pool.metadata.description}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 space-x-2 text-lg leading-snug text-white">
                      <div className="flex items-center space-x-2">
                        <div>{shortenAddress(pool.contractId.split('.')[0])}</div>
                        {pool.contractId.startsWith('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS') ? (
                          <Verified className="mt-1 mb-1 text-blue-500 size-5" />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DexterityInterface;
