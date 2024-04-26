
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

export default function Woooooo({ data }: Props) {
  const meta = {
    title: 'Charisma | WELSH + ROO = Woooooo!',
    description: META_DESCRIPTION,
    image: '/woo-og.png'
  };

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
                {/* <div className="self-center px-2 my-1 text-xs font-light text-center rounded-full sm:text-lg sm:p-0 sm:px-4">
                  <Image alt='Liquid Staked ROO' src={liquidStakedRoo} width="1080" height="605" className='w-12 h-12' />
                </div> */}
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className='flex items-center gap-1 mb-2'>
                      <h1 className="font-bold text-left text-md">wtf mate?</h1>
                      <Info size={16} color='#948f8f' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className='max-w-2xl leading-tight text-white bg-black border-primary'>
                    <h2 className="mb-2 text-lg font-bold">Wooo! Explained:</h2>
                    <p className="mb-4">
                      <strong>How WOOO is Made:</strong> WOOO tokens are made by mixing sWELSH and sROO, and that's the only way to make them. This locks up the liquidity of both tokens into one, sort of like an LP token but the weights are fixed by supply, not dollar amount, so there's no risk of impermanent loss.
                    </p>
                    <p className="mb-4">
                      <strong>Splitting Tokens:</strong> You can split your WOOO back into sWELSH and sROO whenever you want. This makes it easy to switch up your strategy without any hassle.
                    </p>
                    <p className="mb-4">
                      <strong>Fees on Transactions:</strong> Whether you're crafting, salvaging, or transferring WOO, there's a micro-transaction fee of less than 0.1%. These fees feed right back into the sWELSH and sROO liquid staking pools, increasing the value of all tokens involved and giving you a direct benefit for being active in the game.
                    </p>
                    <p className="mb-4">
                      <strong>Governance with Charisma Tokens:</strong> If you hold Charisma Tokens, you can create and vote on proposals to change the rules of this token, including the fees and rewards. This keeps the power in the hands of the community, ensuring that the people actually using the token decide where it's headed.
                    </p>
                    <p className="mb-4">
                      <strong>Rewards for Your Moves:</strong> You get Charisma tokens rewards for crafting, salvaging, or transferring WOO. We've set it up so the more you do, the more you get back. It's straightforward: help the platform grow and get rewarded for it.
                    </p>
                    <p className="mb-4">
                      <strong>Better Trading:</strong> By pulling together liquidity from two different memecoins, WOOO smooths out market movement and discourages jeeting from one coin to another. It's better for everyone when things are less choppy.
                    </p>
                    <p className="mb-4">
                      <strong>Keeping It Democratic:</strong> All the big decisions about WOO, like what it's called or how it's divided, are voted on by everyone. The DAO setup means no single person has all the control. It's all about the community.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className='flex justify-around space-x-2'>

                <p className="w-full mb-8 text-xs leading-tight font-md sm:text-sm">
                  Do you have what it takes to be a champion? Whoever claims the title for the most WOOO tokens, can "challenge" the champion. If they win, they claim the Wooo! Champion's Title Belt NFT and get a huge reward of Charisma tokens. Competition begins on 5/1.
                </p>
                <div className='px-2'>
                  <div className='text-xs whitespace-nowrap'>ARE YOU READY TO RUMBLE?</div>
                  <Button disabled className='w-full' variant={'secondary'}>Challenge Title Holder</Button>
                </div>
              </div>
              <div className='space-y-2'>
                <div className=''>
                  <div className='text-xs text-center font-fine'>Components:</div>
                  <div className='text-xs text-center font-fine'>sWELSH + sROO</div>
                </div>
                <div className='flex space-x-2'>
                  <div className='w-full'>
                    <CraftWoo amount={10000} />
                  </div>
                  <div className='w-full'>
                    <CraftWoo amount={100000} />
                  </div>
                  <div className='w-full'>
                    <CraftWoo amount={1000000} />
                  </div>
                </div>
                <div className='flex space-x-2'>
                  <div className='w-full'>
                    <SalvageWoo amount={10000} />
                  </div>
                  <div className='w-full'>
                    <SalvageWoo amount={100000} />
                  </div>
                  <div className='w-full'>
                    <SalvageWoo amount={1000000} />
                  </div>
                </div>
              </div>
              <p className="my-8 text-sm font-light leading-tight text-center sm:text-md">
                ⚠️ Wooo! utilizes micro-transaction to support the WELSH and ROO staking pools. Charisma token rewards will be enabled on 5/1. Hell yeah, brother.
              </p>
              <div className='flex font-thin justify-evenly'>
                <p className="text-sm leading-tight text-center sm:text-md">
                  Crafting Fee: 0.01%
                </p>
                <p className="text-sm leading-tight text-center sm:text-md">
                  Transfer Fee: 0.1%
                </p>
                <p className="text-sm leading-tight text-center sm:text-md">
                  Salvage Fee: 0.1%
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

