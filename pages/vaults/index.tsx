import { GetStaticProps } from 'next';
import Page from '@components/page';
import { Kraxel } from '@lib/kraxel';
import Link from 'next/link';
import DexterityInterface from '@components/pools/dexterity-interface';
import { ContractId, Dexterity, Vault } from 'dexterity-sdk';
import _ from 'lodash';

Dexterity.configure({ apiKeyRotation: 'loop', parallelRequests: 10 })

const blacklist = [
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.chdollar',
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-runes',
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.uahdmg',
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.dmg-lp-token',
  'SP39859AD7RQ6NYK00EJ8HN1DWE40C576FBDGHPA0.stx-lp-token',
  'SP23B2ZSDG9WKWPCKRERP6PV81FWNB4NECV6MKKAC.stxcha-lp-token'
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

  // uniqueVaults.push(
  //   new Vault({
  //     name: "WELSH MEXC Orderbook",
  //     description: "Trade USDT/WELSH on MEXC from Charisma DEX",
  //     contractId: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.welsh-usdt-pool" as ContractId,
  //     symbol: "WELSHUSDT",
  //     image: "https://altcoinsbox.com/wp-content/uploads/2023/01/mexc-logo.png",
  //     externalPoolId: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.welsh-usdt-pool',
  //     liquidity: [
  //       {
  //         contractId: 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-susdt',
  //         name: 'aUSD',
  //         symbol: 'aUSD',
  //         decimals: 8,
  //         identifier: 'bridged-usdt',
  //         description: 'aUSD',
  //         image: 'https://token-images.alexlab.co/token-susdt',
  //         reserves: 992307081182
  //       },
  //       {
  //         contractId: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
  //         name: 'Welshcorgicoin',
  //         symbol: 'WELSH',
  //         decimals: 6,
  //         identifier: 'welshcorgicoin',
  //         description: '$WELSH is the first memecoin built on Stacks blockchain',
  //         image: 'https://raw.githubusercontent.com/Welshcorgicoin/Welshcorgicoin/main/logos/welsh_tokenlogo.png',
  //         reserves: 213416083800000
  //       }
  //     ]
  //   }).toLPToken())

  return {
    props: {
      data: {
        prices,
        vaults: uniqueVaults
      }
    },
    revalidate: 60
  };
};

export default function DexterityPoolsPage({ data }: any) {
  const meta = {
    title: 'Charisma | Liquidity Vaults',
    description: 'View and manage self-listed liquidity vaults on the Charisma DEX',
    image: 'https://charisma.rocks/pools-screenshot.png'
  };

  return (
    <Page meta={meta} fullViewport>
      <div className="flex flex-col w-full max-w-[3000px] mx-auto">
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
