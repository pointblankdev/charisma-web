import { GetStaticProps } from 'next';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { Kraxel } from '@lib/kraxel';
import Link from 'next/link';
import DexterityInterface from '@components/pools/dexterity-interface';
import { ContractId, Dexterity } from 'dexterity-sdk';
import _ from 'lodash';

Dexterity.configure({ apiKeyRotation: 'loop', parallelRequests: 10 })

const blacklist = [
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.chdollar',
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-runes',
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.uahdmg',
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-lp-token',
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.stx-lp-token'
] as ContractId[];

const tokenImages: Record<string, string> = {
  'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token': 'https://app.arkadiko.finance/assets/tokens/usda.svg',
};

export const getStaticProps: GetStaticProps<any> = async () => {
  // Get contracts and prices in parallel using cached functions
  const [vaults, prices] = await Promise.all([
    Dexterity.discover({ blacklist, serialize: true }),
    Kraxel.getAllTokenPrices(),
  ]);

  const uniqueVaults = _.uniqBy(vaults, 'contractId');

  // patch missing images
  uniqueVaults.forEach((vault) => {
    vault.liquidity?.forEach((liquidityItem) => {
      if (!liquidityItem?.image && liquidityItem?.contractId) {
        liquidityItem.image = tokenImages[liquidityItem.contractId];
      }
    });
  });

  return {
    props: {
      data: { prices, vaults: uniqueVaults }
    },
    revalidate: 60
  };
};

export default function DexterityPoolsPage({ data }: any) {
  const meta = {
    title: 'Charisma | Dexterity Pools',
    description: 'View and manage self-listed liquidity pools on the Charisma DEX',
    image: 'https://charisma.rocks/pools-screenshot.png'
  };

  return (
    <Page meta={meta} fullViewport>
      <div className="flex flex-col w-full max-w-[3000px] mx-auto">
        {/* <div className="flex flex-col items-start justify-between mt-4 sm:flex-row sm:items-center sm:mt-6">
          <div className="w-full">
            <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Earn Yield 💰
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground/90">
              Collect swap fees by depositing your tokens into a secure vault.
            </p>
          </div>

          <div className="flex flex-col items-end w-full mt-4 sm:mt-0">
            <Link href="/deployer">
              <div className="inline-block px-6 py-1.5 mx-1 text-white rounded-lg bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
                Create New Pool
              </div>
            </Link>
            <div className="mt-2 text-sm text-center text-muted-foreground">
              Earn trading fees by creating your own liquidity pool
            </div>
          </div>
        </div> */}

        <DexterityInterface data={data} />

        <div className="justify-center w-full p-1 m-1 text-center">
          <Link className="w-full text-sm text-center" href="/deployer">
            Want to create your own liquidity pool and earn trading fees?
          </Link>
        </div>
      </div>
    </Page>
  );
}
