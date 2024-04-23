
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
import liquidStakedWelsh from '@public/liquid-staked-roo.png'
import { Card } from '@components/ui/card';
import Deposit from '@components/wishing-well/deposit';
import kangarooBurrow from '@public/kangaroo-burrow.png'
import DepositRoo from '@components/wishing-well/deposit-roo';

export default function Stake({ data }: Props) {
  const meta = {
    title: 'Charisma | Kangaroo Burrow',
    description: META_DESCRIPTION
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <Card className='bg-black text-primary-foreground border-accent-foreground p-0 rounded-xl overflow-hidden'>
            <Image alt='Dungeon Scene' src={kangarooBurrow} width="1080" height="605" className='border-b border-accent-foreground' />
            <div className='m-2'>
              <div className='flex justify-between mb-2'>
                <h1 className="text-md sm:text-2xl font-bold self-center">Donate to the Kangaroo Burrow</h1>
                {/* <div className="sm:text-lg text-xs my-1 rounded-full sm:p-0 px-2 sm:px-4 text-center self-center font-light">
                  <Image alt='Liquid Staked Welshcorgicoin' src={liquidStakedWelsh} width="1080" height="605" className='h-12 w-12' />
                </div> */}
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className='flex items-center mb-2 gap-1'>
                      <h1 className="text-md font-bold text-left">About the Kangaroo Burrow</h1>
                      <Info size={16} color='#948f8f' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className='max-w-2xl bg-black text-white border-primary leading-tight'>
                    <h2 className="text-lg font-bold mb-2">How the Kangaroo Burrow Works:</h2>
                    <ul className="list-disc pl-5 mb-4 text-md space-y-2">
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
              <p className="mb-8 text-xs sm:text-sm leading-tight font-thin">
                The Kangaroo Burrow is not just a donation mechanism; it's an investment in the future of the Kangaroo network. Each donation helps enhance the liquidity and market stability of sROO, making it a more attractive asset for current and future stakers.
              </p>
              <div className='space-y-1'>
                <div className='space-x-1 flex'>
                  <DepositRoo amount={1} />
                  <DepositRoo amount={10} />
                  <DepositRoo amount={100} />
                </div>
                {/* <div className='space-x-1 flex'>
                  <DepositRoo amount={1000} />
                  <DepositRoo amount={5000} />
                  <DepositRoo amount={10000} />
                </div> */}
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

