
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
import { getAccountBalance, getNameFromAddress, getWooTitleBeltContractEvents } from '@lib/stacks-api';
import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { userSession } from '@components/stacks-session/connect';
import millify from 'millify';
import { StacksMainnet } from "@stacks/network";
import { AnchorMode, Pc, PostConditionMode, uintCV } from '@stacks/transactions';
import { useConnect } from '@stacks/connect-react';

export default function Woooooo({ data }: Props) {
  const meta = {
    title: 'Charisma | WELSH + ROO = Woooooo!',
    description: META_DESCRIPTION,
    image: '/woo-og.png'
  };

  console.log(data.woooRecord)

  const { doContractCall } = useConnect();

  const titleBeltHolder = data.bns || data.titleBeltHolder

  const [sWelshBalance, setSWelshBalance] = useState(0)
  const [sRooBalance, setSRooBalance] = useState(0)
  const [woooBalance, setWoooBalance] = useState(0)
  const [woooRecord, setWoooRecord] = useState(data.woooRecord)

  function challenge() {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "dme022-wooo-title-belt-nft",
      functionName: "challenge-title-holder",
      functionArgs: [],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [
        Pc.principal(data.titleBeltHolder).willSendAsset().nft('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dme022-wooo-title-belt-nft::wooo-title-belt', uintCV(0))
      ],
      onFinish: (data) => {
        console.log("onFinish:", data);
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  useEffect(() => {
    try {
      const profile = userSession.loadUserData().profile
      console.log(profile.stxAddress.mainnet)
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
              </div>
              <div className='flex flex-wrap justify-around my-8 space-x-2'>
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
                <div className='px-2'>
                  {/* <div className='text-xs whitespace-nowrap'>ARE YOU READY TO RUMBLE?</div> */}
                  <Button className='w-full' variant={'secondary'} onClick={challenge}>🥊 Challenge Title Holder</Button>
                  <div className='pt-1 mt-1 text-xs leading-snug text-center'>Current Title Belt Holder</div>
                  <div className='py-0 -mt-2 text-2xl text-center border-4 rounded-md'>{titleBeltHolder}</div>
                  <div className='w-full'>
                    <div className='pt-1 mt-1 text-xs leading-snug text-center'>WOOO Record</div>
                    <div className='py-0 -mt-2 text-2xl text-center border-4 rounded-md'>{woooRecord / 10000}</div>
                  </div>
                </div>
              </div>
              <div className='my-16 space-y-2'>
                <div className='flex flex-wrap space-x-2 space-y-8 sm:space-y-0 sm:flex-nowrap'>
                  <div className='w-full'>
                    <div className='flex justify-center space-x-1'>
                      <div className='text-xs text-center font-fine'>Crafting Costs:</div>
                      <div className='text-xs text-center font-fine'>1k sWELSH +  4.2 sROO</div>
                    </div>
                    <CraftWoo amount={100000} />
                    <div className='flex justify-center space-x-1'>
                      <div className='text-xs text-center font-fine'>You'll Receive:</div>
                      <div className='text-xs text-center font-fine'>9.999 WOOO</div>
                    </div>
                  </div>
                  <div className='w-full'>
                    <div className='flex justify-center space-x-1'>
                      <div className='text-xs text-center font-fine'>Salvage Costs:</div>
                      <div className='text-xs text-center font-fine'>10 WOOO</div>
                    </div>
                    <SalvageWoo amount={100000} />
                    <div className='flex justify-center space-x-1'>
                      <div className='text-xs text-center font-fine'>You'll Receive:</div>
                      <div className='text-xs text-center font-fine'>999 sWELSH +  4.158 sROO</div>
                    </div>
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
    const result = await getWooTitleBeltContractEvents() as any
    const repr = result.results[0].contract_log.value.repr
    const woooRecord = Number(repr.split(' ')[2].slice(1, -1))
    const titleBeltHolder = repr.split(' ')[4].slice(1, -2)
    const bns = await getNameFromAddress(titleBeltHolder)

    return {
      props: {
        data: {
          titleBeltHolder: titleBeltHolder,
          bns: bns.names[0],
          woooRecord: woooRecord
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
