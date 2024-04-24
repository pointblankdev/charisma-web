
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
import MintWoo from '@components/mint/mint-woo';

export default function Woooooo({ data }: Props) {
  const meta = {
    title: 'Charisma | WELSH + ROO = Woooooo!',
    description: META_DESCRIPTION,
    image: '/woooooo.webp'
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
                <h1 className="self-center font-bold text-md sm:text-2xl">WELSH + ROO = Woooooo!</h1>
                {/* <div className="self-center px-2 my-1 text-xs font-light text-center rounded-full sm:text-lg sm:p-0 sm:px-4">
                  <Image alt='Liquid Staked ROO' src={liquidStakedRoo} width="1080" height="605" className='w-12 h-12' />
                </div> */}
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className='flex items-center gap-1 mb-2'>
                      <h1 className="font-bold text-left text-md">WTF is this shit?</h1>
                      <Info size={16} color='#948f8f' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className='max-w-2xl leading-tight text-white bg-black border-primary'>
                    <h2 className="mb-2 text-lg font-bold">Woooooo! Explained:</h2>
                    <p className="mb-4">
                      <strong>How WOO is Made:</strong> WOO tokens are made by mixing sWELSH and sROO, and that's the only way to make them. This locks up the liquidity of both tokens into one, sort of like an LP token but the weights are fixed by supply, not dollar amount, so there's no risk of impermanent loss.
                    </p>
                    <p className="mb-4">
                      <strong>Splitting Tokens:</strong> You can split your WOO back into sWELSH and sROO whenever you want. This makes it easy to switch up your strategy without any hassle.
                    </p>
                    <p className="mb-4">
                      <strong>Fees on Transactions:</strong> Whether you're minting, burning, or transferring WOO, there's a micro-transaction fee of less than 0.1%. These fees feed right back into the sWELSH and sROO liquid staking pools, increasing the value of all tokens involved and giving you a direct benefit for being active in the game.
                    </p>
                    <p className="mb-4">
                      <strong>Governance with Charisma Tokens:</strong> If you hold Charisma Tokens, you can create and vote on proposals to change the rules of this token, including the fees and rewards. This keeps the power in the hands of the community, ensuring that the people actually using the token decide where it's headed.
                    </p>
                    <p className="mb-4">
                      <strong>Rewards for Your Moves:</strong> You get rewards for minting, burning, or transferring WOO. We've set it up so the more you do, the more you get back. It's straightforward: help the platform grow and get rewarded for it.
                    </p>
                    <p className="mb-4">
                      <strong>Better Trading:</strong> By pulling together liquidity from two different memecoins, WOO smooths out market movement and discourages jeeting from one coin to another. It's better for everyone when things are less choppy.
                    </p>
                    <p className="mb-4">
                      <strong>Keeping It Democratic:</strong> All the big decisions about WOO, like what it's called or how it's divided, are voted on by everyone. The DAO setup means no single person has all the control. It's all about the community.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="mb-8 text-xs font-thin leading-tight sm:text-sm">
                Woooooo! is "minted" through a specific process that involves combining a fixed supply two distinct tokens: sWELSH and sROO. This method ensures that WOO Tokens can only be created by merging these predetermined components and cannot be produced by any other means. This creation mechanism is intended to align both communities' incentives, while combining the liquidity of the two memecoins into one. Additionally, the WOO Token can be "burned" back into it's base tokens, sWELSH and sROO, whenever desired.
              </p>
              <div className='space-y-2'>
                <div className='flex space-x-2'>
                  <div className='w-full'>
                    <MintWoo amount={1000} />
                    <div className='text-xs text-center font-fine'>Costs: 10 sWELSH + 0.042 sROO</div>
                  </div>
                  <div className='w-full'>
                    <MintWoo amount={10000} />
                    <div className='text-xs text-center font-fine'>Costs: 100 sWELSH + 0.42 sROO</div>
                  </div>
                </div>
                <div className='flex space-x-2'>
                  <div className='w-full'>
                    <MintWoo amount={100000} />
                    <div className='text-xs text-center font-fine'>Costs: 1k sWELSH + 4.2 sROO</div>
                  </div>
                  <div className='w-full'>
                    <MintWoo amount={1000000} />
                    <div className='text-xs text-center font-fine'>Costs: 10k sWELSH + 42 sROO</div>
                  </div>
                </div>
              </div>
              <p className="my-8 text-sm font-thin leading-tight text-center sm:text-md">
                ⚠️ Warning: Woooooo! is an experimental token designed to bring together the best of two great memecoin communities. Don't ape in with anything you're not willing to lose, but do have fun and enjoy the ride. Woooooo!
              </p>
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

