
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
import liquidStakedOdin from '@public/liquid-staked-odin.png'
import { Card } from '@components/ui/card';
import uppsala from '@public/uppsala-21.png'
import Deposit from '@components/deposit';

export default function App({ data }: Props) {
  const meta = {
    title: 'Charisma | The Temple at Uppsala',
    description: META_DESCRIPTION,
    image: '/uppsala-21.png'
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <Card className='p-0 overflow-hidden bg-black text-primary-foreground border-accent-foreground rounded-xl'>
            <Image alt='Dungeon Scene' src={uppsala} width="1080" height="605" className='border-b border-accent-foreground' />
            <div className='m-2'>
              <div className='flex justify-between mb-2'>
                <h1 className="self-center font-bold text-md sm:text-2xl">Donate to the Temple at Uppsala</h1>
                <div className="self-center px-2 my-1 text-xs font-light text-center rounded-full sm:text-lg sm:p-0 sm:px-4">
                  <Image alt='Liquid Staked ODIN' src={liquidStakedOdin} width="1080" height="605" className='w-12 h-12' />
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className='flex items-center gap-1 mb-2'>
                      <h1 className="font-bold text-left text-md">About the Temple at Uppsala</h1>
                      <Info size={16} color='#948f8f' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className='max-w-2xl leading-tight text-white bg-black border-primary'>
                    <h2 className="mb-2 text-lg font-bold">How the Temple at Uppsala Works:</h2>
                    <ul className="pl-5 mb-4 space-y-2 list-disc text-md">
                      <li>
                        <b>Donate Tokens</b>: Contribute Odin tokens to the Temple at Uppsala. These contributions are pooled and distributed among all stakers, increasing the overall liquidity and price of sODIN.
                      </li>
                      <li>
                        <b>Support the Community</b>: Your donations help sustain the ecosystem, benefiting all participants by enhancing the value of their staked assets.
                      </li>
                    </ul>
                    <p className="mb-4">
                      By donating to the Temple at Uppsala, you're playing a pivotal role in strengthening the network and boosting the value of the Liquid Staked Odin. It's a win-win: you help the community, and in return, the value of your own staked tokens can increase.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="mb-8 text-xs font-thin leading-tight sm:text-sm">
                The Temple at Uppsala is not just a donation mechanism; it's an investment in the future of the Odin network. Each donation helps enhance the liquidity and market stability of sODIN, making it a more attractive asset for current and future stakers.
              </p>
              <div className='space-y-1'>
                <div className='flex space-x-1'>
                  <Deposit amount={1000} stakingContractName={'liquid-staked-odin'} contractPrincipal={"SP2X2Z28NXZVJFCJPBR9Q3NBVYBK3GPX8PXA3R83C.odin-tkn"} contractToken={'odin'} tokenTicker={'ODIN'} />
                  <Deposit amount={10000} stakingContractName={'liquid-staked-odin'} contractPrincipal={"SP2X2Z28NXZVJFCJPBR9Q3NBVYBK3GPX8PXA3R83C.odin-tkn"} contractToken={'odin'} tokenTicker={'ODIN'} />
                  <Deposit amount={100000} stakingContractName={'liquid-staked-odin'} contractPrincipal={"SP2X2Z28NXZVJFCJPBR9Q3NBVYBK3GPX8PXA3R83C.odin-tkn"} contractToken={'odin'} tokenTicker={'ODIN'} />
                </div>
                <div className='flex space-x-1'>
                  <Deposit amount={1000000} stakingContractName={'liquid-staked-odin'} contractPrincipal={"SP2X2Z28NXZVJFCJPBR9Q3NBVYBK3GPX8PXA3R83C.odin-tkn"} contractToken={'odin'} tokenTicker={'ODIN'} />
                  <Deposit amount={10000000} stakingContractName={'liquid-staked-odin'} contractPrincipal={"SP2X2Z28NXZVJFCJPBR9Q3NBVYBK3GPX8PXA3R83C.odin-tkn"} contractToken={'odin'} tokenTicker={'ODIN'} />
                  <Deposit amount={100000000} stakingContractName={'liquid-staked-odin'} contractPrincipal={"SP2X2Z28NXZVJFCJPBR9Q3NBVYBK3GPX8PXA3R83C.odin-tkn"} contractToken={'odin'} tokenTicker={'ODIN'} />
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

