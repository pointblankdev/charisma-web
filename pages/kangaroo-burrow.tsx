
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
import liquidStakedRoo from '@public/liquid-staked-roo.png'
import { Card } from '@components/ui/card';
import kangarooBurrow from '@public/kangaroo-burrow.png'
import DepositRoo from '@components/wishing-well/deposit-roo';

export default function Stake({ data }: Props) {
  const meta = {
    title: 'Charisma | Kangaroo Burrow',
    description: META_DESCRIPTION,
    image: '/kangaroo-burrow.png'
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <Card className='p-0 overflow-hidden bg-black text-primary-foreground border-accent-foreground rounded-xl'>
            <Image alt='Dungeon Scene' src={kangarooBurrow} width="1080" height="605" className='border-b border-accent-foreground' />
            <div className='m-2'>
              <div className='flex justify-between mb-2'>
                <h1 className="self-center font-bold text-md sm:text-2xl">Donate to the Kangaroo Burrow</h1>
                <div className="self-center px-2 my-1 text-xs font-light text-center rounded-full sm:text-lg sm:p-0 sm:px-4">
                  <Image alt='Liquid Staked ROO' src={liquidStakedRoo} width="1080" height="605" className='w-12 h-12' />
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className='flex items-center gap-1 mb-2'>
                      <h1 className="font-bold text-left text-md">About the Kangaroo Burrow</h1>
                      <Info size={16} color='#948f8f' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className='max-w-2xl leading-tight text-white bg-black border-primary'>
                    <h2 className="mb-2 text-lg font-bold">How the Kangaroo Burrow Works:</h2>
                    <ul className="pl-5 mb-4 space-y-2 list-disc text-md">
                      <li>
                        <b>Donate Tokens</b>: Contribute Roo tokens to the Kangaroo Burrow. These contributions are pooled and distributed among all stakers, increasing the overall liquidity and price of sROO.
                      </li>
                      <li>
                        <b>Support the Community</b>: Your donations help sustain the ecosystem, benefiting all participants by enhancing the value of their staked assets.
                      </li>
                    </ul>
                    <p className="mb-4">
                      By donating to the Kangaroo Burrow, you're playing a pivotal role in strengthening the network and boosting the value of the Liquid Staked Roo. It's a win-win: you help the community, and in return, the value of your own staked tokens can increase.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="mb-8 text-xs font-thin leading-tight sm:text-sm">
                The Kangaroo Burrow is not just a donation mechanism; it's an investment in the future of the Kangaroo network. Each donation helps enhance the liquidity and market stability of sROO, making it a more attractive asset for current and future stakers.
              </p>
              <div className='space-y-1'>
                <div className='flex space-x-1'>
                  <DepositRoo amount={1} />
                  <DepositRoo amount={10} />
                  <DepositRoo amount={100} />
                </div>
                <div className='flex space-x-1'>
                  <DepositRoo amount={1000} />
                  <DepositRoo amount={5000} />
                  <DepositRoo amount={10000} />
                </div>
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

