import { ExternalLink, Verified } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

// Define verified addresses with their BNS names
const VERIFIED_ADDRESSES: Record<string, string> = {
  SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS: 'rozar.btc',
  SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS: 'mooningshark.btc'
};

// Address display component
const AddressDisplay = ({ address }: { address: string }) => {
  const displayText =
    VERIFIED_ADDRESSES[address] || `${address.slice(0, 6)}...${address.slice(-4)}`;
  const isVerified = address in VERIFIED_ADDRESSES;

  return (
    <div className="flex items-center space-x-2">
      <div>{displayText}</div>
      {isVerified && <Verified className="mt-1 mb-1 text-blue-500 size-5" />}
    </div>
  );
};

// Pool row component
const PoolRow = ({ pool }: { pool: any }) => {
  const deployerAddress = pool.contractId.split('.')[0];

  return (
    <tr className="border-t border-gray-700/50">
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
        <AddressDisplay address={deployerAddress} />
      </td>
    </tr>
  );
};

export const DexterityInterface = ({ data }: any) => {
  const [sortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedPools = useMemo(() => {
    return [...data.pools].sort((a, b) => {
      const nameA = a.metadata.name.toUpperCase();
      const nameB = b.metadata.name.toUpperCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
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
                  <PoolRow key={index} pool={pool} />
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
