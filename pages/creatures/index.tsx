import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { cn } from '@lib/utils';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@components/ui/card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { UrlObject } from 'url';
import liquidStakedWelsh from '@public/liquid-staked-welshcorgicoin.png';
import liquidStakedRoo from '@public/liquid-staked-roo.png';
import liquidStakedOdin from '@public/liquid-staked-odin.png';
import { getDeployedIndexes, getTokenURI } from '@lib/stacks-api';
import { Checkbox } from '@components/ui/checkbox';
import { uniq, uniqBy } from 'lodash';
import millify from 'millify';
import { Button } from '@components/ui/button';
import { userSession } from '@components/stacks-session/connect';
import { useConnect } from '@stacks/connect-react';
import { AnchorMode, callReadOnlyFunction, cvToJSON, Pc, PostConditionMode, principalCV, uintCV } from '@stacks/transactions';
import { StacksMainnet } from "@stacks/network";
import useWallet from '@lib/hooks/use-wallet-balances';

const creatures = [
  {
    title: 'Farmers',
    subtitle: 'Honest and hardworking farmers.',
    slug: '/creatures/farmers',
    guild: {
      logo: {
        url: '/stations/fuji-apples.png'
      }
    },
    apps: [
      {
        slug: '/creatures/farmers',
        img: '/stations/apple-orchard.png'
      }
    ],
    cardImage: {
      url: '/creatures/img/1.png'
    },
  },
]


export default function Creatures() {
  const meta = {
    title: 'Charisma | Creatures',
    description: META_DESCRIPTION,
    image: '/creatures/img/1.png'
  };
  const { doContractCall } = useConnect();

  const sender = userSession.isUserSignedIn() && userSession.loadUserData().profile.stxAddress.mainnet

  const [farmers, setFarmers] = useState(0)
  const [power, setPower] = useState(0)
  const [cost, setCost] = useState(0)

  const { getBalanceByKey } = useWallet();

  const lpAmount = getBalanceByKey('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-wcha::lp-token').balance

  function summon() {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'creatures',
      functionName: "summon",
      functionArgs: [
        uintCV(Number((lpAmount.balance / cost).toFixed(0))),
        principalCV('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-wcha')
      ],
      postConditionMode: PostConditionMode.Allow,
      // postConditions: [Pc.principal(sender).willSendEq(1000000).ft("SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-wcha", "lp-token")],
      postConditions: [],
      onFinish: (data) => {
        console.log("onFinish:", data);
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  function unsummon() {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'creatures',
      functionName: "unsummon",
      functionArgs: [uintCV(10), principalCV('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-wcha')],
      postConditionMode: PostConditionMode.Allow,
      // postConditions: [Pc.principal('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.creatures').willSendEq(1000000).ft("SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-wcha", "lp-token")],
      postConditions: [],
      onFinish: (data) => {
        console.log("onFinish:", data);
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  useEffect(() => {
    sender && callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'creatures',
      functionName: "get-balance",
      functionArgs: [uintCV(1), principalCV(sender)],
      senderAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS"
    }).then(response => setFarmers(Number(cvToJSON(response).value.value)))

  }, [sender])

  useEffect(() => {
    sender && callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'creatures',
      functionName: "get-creature-power",
      functionArgs: [uintCV(1)],
      senderAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS"
    }).then(response => setPower(Number(cvToJSON(response).value)))

  }, [sender])

  useEffect(() => {
    sender && callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'creatures',
      functionName: "get-creature-cost",
      functionArgs: [uintCV(1)],
      senderAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS"
    }).then(response => setCost(Number(cvToJSON(response).value)))

  }, [sender])




  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10">
          <div className="grid gap-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            <Card
              className={cn(
                'bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card'
              )}
            >
              <div className="relative flex flex-col items-start text-md p-4 space-y-4 rounded-lg justify-between">
                <div className="space-y-4 text-sm">
                  <h3 className="font-bold text-lg">Creatures</h3>
                  <p>Think of these creatures like little workers you can hire to collect valuable items for you.</p>
                  <p>
                    To get a creature, you first need to put some special tokens (LP tokens) into the system. It's like giving them the resources they need to get started.
                  </p>
                  <p>
                    Once you have deposited the LP tokens, you'll recieve creatures tokens. Your creatures will then automatically start working for you, gathering resources over time.
                  </p>
                  <p>
                    You can tell your creature to bring you the resources they've collected whenever you want. The first type of creature, called the Farmer, is great at collecting Fuji Apples.
                  </p>
                </div>
              </div>
            </Card>
            {creatures.map((creature, i) => {
              return (
                <Card
                  key={i}
                  className={cn(
                    'bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card')}
                >
                  {/* <Link href={`${creature.slug}`} className="w-full"> */}
                  <CardContent className="w-full p-0">
                    <CardHeader className="absolute inset-0 z-20 p-2 h-min backdrop-blur-sm group-hover/card:backdrop-blur-3xl">
                      <div className="flex justify-between align-top">
                        <div className="flex gap-2">
                          <div className="min-w-max">
                            {creature.guild.logo.url ? (
                              <Image
                                src={creature.guild.logo.url}
                                width={40}
                                height={40}
                                alt="guild-logo"
                                className="w-10 h-10 rounded-full grow"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-white border rounded-full" />
                            )}
                          </div>
                          <div className="">
                            <div className="text-sm font-semibold leading-none text-secondary">
                              {creature.title}
                            </div>
                            <div className="mt-1 text-xs leading-tight font-fine text-secondary">
                              {creature.subtitle}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end leading-[1.1] space-y-2">
                          <div className="text-white text-xs font-semibold">{millify(cost)} STX-wCHA Deposited = 1 Farmer</div>
                          <div className="text-white text-xs font-semibold">Farmer Earning Power: {power}</div>
                          {/* <div className='text-white'>${creature.value}</div> */}
                        </div>
                      </div>
                    </CardHeader>
                    <Image
                      src={creature.cardImage.url}
                      height={1200}
                      width={1200}
                      alt="creature-featured-image"
                      className={cn(
                        'w-full object-cover transition-all', // group-hover/card:scale-105',
                        'aspect-[1]',
                        'opacity-80',
                        'group-hover/card:opacity-100',
                        'flex',
                        'z-10',
                        'relative'
                      )}
                    />
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/50 to-transparent opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent from-0% to-black/50 to-69% opacity-90 z-20" />
                  </CardContent>
                  {/* </Link> */}
                  <CardFooter
                    className={cn('z-20 absolute inset-0 top-auto flex p-0 mb-1 opacity-100 transition-all')}
                  >
                    <div className="z-20 p-2 flex w-full justify-between place-items-end">
                      <div className='w-full text-lg px-4'>You command {millify(farmers)} Farmers</div>
                      <div className='flex space-x-2'>
                        <Button className="z-30" variant={'ghost'} onClick={unsummon}>Dismiss</Button>
                        <Button disabled={lpAmount === 0} className="z-30" onClick={summon}>Recruit</Button>
                        <div>{lpAmount === 0 && 'You need STX-wCHA LP Tokens to create Farmers'}</div>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </Layout>
    </Page>
  );
}
