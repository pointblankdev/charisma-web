
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip"
import { Info } from 'lucide-react';
import { Card } from '@components/ui/card';
import woooooo from '@public/woooooo.webp'
import SalvageWoo from '@components/salvage/salvage-woo';
import CraftWoo from '@components/mint/craft-woo';
import { Button } from '@components/ui/button';
import { getAccountBalance, getNameFromAddress, getTitleBeltHoldeBalance, getTitleBeltHolder } from '@lib/stacks-api';
import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { userSession } from '@components/stacks-session/connect';
import millify from 'millify';
import { StacksMainnet } from "@stacks/network";
import { AnchorMode, Pc, PostConditionMode, uintCV } from '@stacks/transactions';
import { useConnect } from '@stacks/connect-react';
import { Input } from '@components/ui/input';

export default function Woooooo({ data }: Props) {
  const meta = {
    title: 'Charisma | WELSH + ROO = WOOO',
    description: META_DESCRIPTION,
    image: '/woo-og.png'
  };

  const [amount, setAmount] = useState('');

  const tokenAmount = Number(amount) * 10000

  const handleTokenAmountChange = (event: any) => {
    const { value } = event.target;
    // Limit input to only allow numbers and to 6 decimal places
    if (/^\d*\.?\d{0,4}$/.test(value)) {
      setAmount(value);
    }
  };

  const { doContractCall } = useConnect();

  const titleBeltHolder = data.bns || data.titleBeltHolder

  const [sWelshBalance, setSWelshBalance] = useState(0)
  const [sRooBalance, setSRooBalance] = useState(0)
  const [woooBalance, setWoooBalance] = useState(0)
  const [woooRecord, setWoooRecord] = useState(data.woooRecord)

  useEffect(() => {
    try {
      const profile = userSession.loadUserData().profile
      getAccountBalance(profile.stxAddress.mainnet).then(balance => {
        setSWelshBalance(balance.fungible_tokens['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-welsh::liquid-staked-welsh'].balance)
        setSRooBalance(balance.fungible_tokens['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-roo::liquid-staked-roo'].balance)
        setWoooBalance(balance.fungible_tokens['SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dme021-wooo-token::wooo'].balance)
      })
    } catch (error) {
      console.error(error)
    }

  }, [userSession])

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <Card className='p-0 overflow-hidden bg-black text-primary-foreground border-accent-foreground rounded-xl'>
            <Image alt='Dungeon Scene' src={woooooo} width="1080" height="605" className='border-b border-accent-foreground' />
            <div className='m-2'>
              <div className='flex justify-between mb-2'>
                <h1 className="self-center font-bold text-md sm:text-2xl">WELSH + ROO = WOOO</h1>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className='flex items-center gap-1 m-2'>
                        <Info size={16} color='#948f8f' />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className='max-w-2xl leading-tight text-white bg-black border-primary'>
                      <h2 className="mb-2 text-lg font-bold">Wooo! Explained:</h2>
                      <p className="mb-4">
                        <strong>Crafting:</strong> WOOO tokens are made by mixing sWELSH and sROO, and that's the only way to make them. This locks up the liquidity of both tokens into one, sort of like an LP token but the weights are fixed by supply, not dollar amount, so there's no risk of impermanent loss.
                      </p>
                      <p className="mb-4">
                        <strong>Salvaging:</strong> You can split your WOOO back into sWELSH and sROO whenever you want. This makes it easy to switch up your strategy without any hassle.
                      </p>
                      <p className="mb-4">
                        <strong>Token Rewards:</strong> You get Charisma tokens rewards for crafting, salvaging, or transferring WOO. We've set it up so the more you do, the more you get back. It's straightforward: help the platform grow and get rewarded for it.
                      </p>
                      <p className="mb-4">
                        <strong>Transactions Fees:</strong> Whether you're crafting, salvaging, or transferring WOO, there's a micro-transaction fee. These fees feed right back into the sWELSH and sROO liquid staking pools, increasing the value of all tokens involved and giving you a direct benefit for being active in the game.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className='flex flex-wrap justify-around mb-8 space-x-2 space-y-8 sm:space-y-0'>
                <div className='px-2'>
                  <div className='text-xl text-center whitespace-nowrap'>Your Account Balances</div>
                  <div className='flex space-x-2'>
                    <div className='w-36'>
                      <div className='pt-1 mt-1 text-xs leading-snug text-center'>sWELSH</div>
                      <div className='py-0 -mt-2 text-2xl text-center border-4 rounded-md'>{millify(sWelshBalance / 1000000)}</div>
                    </div>
                    <div className='w-36'>
                      <div className='pt-1 mt-1 text-xs leading-snug text-center'>sROO</div>
                      <div className='py-0 -mt-2 text-2xl text-center border-4 rounded-md'>{millify(sRooBalance / 1000000)}</div>
                    </div>
                  </div>
                  <div className='w-full'>
                    <div className='pt-1 mt-1 text-xs leading-snug text-center'>WOOO</div>
                    <div className='py-0 -mt-2 text-2xl text-center border-4 rounded-md'>{woooBalance / 10000}</div>
                  </div>
                </div>
              </div>
              <div className='mx-0 mb-8 space-y-2 sm:mx-6'>
                <Input value={amount} onChange={handleTokenAmountChange} placeholder="Enter token amount" className="h-20 mb-2 text-4xl text-center" />
                <div className='flex flex-wrap py-4 space-x-1 space-y-4 sm:py-0 sm:space-y-0 sm:flex-nowrap'>
                  <div className='w-full'>
                    <div className='flex justify-center space-x-1 whitespace-nowrap'>
                      <div className='text-xs text-center font-fine'>Crafting Costs:</div>
                      <div className='text-xs text-center font-fine'>{millify(Number(tokenAmount) / 100, { precision: 6 })} sWELSH +  {millify(4.2 * Number(tokenAmount) / 100000, { precision: 6 })} sROO</div>
                    </div>
                    <CraftWoo amount={Number(tokenAmount)} />
                    <div className='flex justify-center space-x-1 whitespace-nowrap'>
                      <div className='text-xs text-center font-fine'>You'll Receive:</div>
                      <div className='text-xs text-center font-fine'>{millify(0.9999 * Number(tokenAmount) / 10000, { precision: 6 })} WOOO</div>
                    </div>
                  </div>
                  <div className='w-full'>
                    <div className='flex justify-center space-x-1 whitespace-nowrap'>
                      <div className='text-xs text-center font-fine'>Salvage Costs:</div>
                      <div className='text-xs text-center font-fine'>{millify(Number(tokenAmount) / 10000, { precision: 6 })} WOOO</div>
                    </div>
                    <SalvageWoo amount={Number(tokenAmount)} />
                    <div className='flex justify-center space-x-1 whitespace-nowrap'>
                      <div className='text-xs text-center font-fine'>You'll Receive:</div>
                      <div className='text-xs text-center font-fine'>{millify(0.99 * Number(tokenAmount) / 100, { precision: 6 })} sWELSH +  {millify(0.99 * 4.2 * Number(tokenAmount) / 100000, { precision: 6 })} sROO</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex font-thin justify-evenly'>
                <p className="text-sm leading-tight text-center sm:text-md">
                  Crafting Fee: 0.01%
                </p>
                <p className="text-sm leading-tight text-center sm:text-md">
                  Transfer Fee: 0.1%
                </p>
                <p className="text-sm leading-tight text-center sm:text-md">
                  Salvage Fee: 1%
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    </Page>
  );
}

type Props = {
  data: any;
};


export const getStaticProps: GetStaticProps<Props> = async () => {

  try {
    const holder = await getTitleBeltHolder()
    const balance = await getTitleBeltHoldeBalance()
    const bns = await getNameFromAddress(holder.value)

    return {
      props: {
        data: {
          titleBeltHolder: holder.value,
          bns: bns.names[0],
          woooRecord: balance.value
        }
      },
      revalidate: 60
    };

  } catch (error) {
    return {
      props: {
        data: {}
      },
    }
  }
};
