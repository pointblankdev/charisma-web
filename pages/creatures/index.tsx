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
import millify from 'millify';
import { Button } from '@components/ui/button';
import { userSession } from '@components/stacks-session/connect';
import { useConnect } from '@stacks/connect-react';
import { AnchorMode, callReadOnlyFunction, cvToJSON, Pc, PostConditionMode, principalCV, uintCV } from '@stacks/transactions';
import { StacksMainnet } from "@stacks/network";
import useWallet from '@lib/hooks/use-wallet-balances';
import { UrlObject } from 'url';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import tokenfaucet1 from '@public/token-faucet.png'
import liquidStakedWelsh from '@public/liquid-staked-welshcorgicoin.png'
import liquidStakedRoo from '@public/liquid-staked-roo.png'
import liquidStakedOdin from '@public/liquid-staked-odin.png'
import charisma from '@public/charisma.png'
import raven from '@public/raven-of-odin.png'
import odinsRaven from '@public/odins-raven/img/4.gif'



const activities = [
  {
    title: "Charisma Faucet",
    subtitle: "Get free Charisma tokens.",
    ticker: "CHA",
    slug: "/faucet",
    guild: {
      logo: {
        url: "/charisma.png"
      }
    },
    apps: [
      {
        slug: "/faucet",
        img: "/charisma.png"
      }
    ],
    cardImage: {
      url: tokenfaucet1
    },
  },
  {
    title: 'Tranquil Orchard',
    subtitle: 'Grow and harvest Fuji Apples.',
    ticker: 'FUJI',
    slug: '/crafting/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fuji-apples',
    guild: {
      logo: {
        url: '/stations/fuji-apples.png'
      }
    },
    apps: [
      {
        slug: '/crafting/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.fuji-apples',
        img: '/stations/apple-orchard.png'
      }
    ],
    cardImage: {
      url: '/stations/apple-orchard.png'
    },
  },
  {
    guild: {
      logo: {
        url: '/wishing-well-1.png'
      }
    },
    title: 'Wishing Well',
    subtitle: 'Donate to the Corgi Wishing Well',
    cardImage: {
      url: '/wishing-well.png'
    },
    slug: 'wishing-well',
    wip: false,
    apps: [
      { slug: '/stake/welsh', img: liquidStakedWelsh },
    ]
  },
  {
    guild: {
      logo: {
        url: '/kangaroo-borrow-1.png'
      }
    },
    title: 'Kangaroo Burrow',
    subtitle: 'Donate to the Kangaroo Burrow',
    cardImage: {
      url: '/kangaroo-burrow.png'
    },
    slug: 'kangaroo-burrow',
    wip: false,
    apps: [
      { slug: '/stake/roo', img: liquidStakedRoo },
    ]
  },
  {
    guild: {
      logo: {
        url: '/uppsala-21.png'
      }
    },
    title: 'The Temple at Uppsala',
    subtitle: 'Donate to the Temple at Uppsala',
    cardImage: {
      url: '/uppsala-21.png'
    },
    slug: 'apps/uppsala',
    wip: false,
    apps: [
      { slug: '/stake/odin', img: liquidStakedOdin },
    ]
  },
  {
    guild: {
      logo: {
        url: odinsRaven
      }
    },
    title: "Odin's Raven",
    subtitle: 'The Eyes and ears of the Allfather',
    cardImage: {
      url: raven
    },
    slug: 'apps/odins-raven',
    wip: false,
    apps: [
      { slug: '/stake/welsh', img: liquidStakedWelsh },
      { slug: '/stake/odin', img: liquidStakedOdin },
    ]
  },
  {
    guild: {
      logo: {
        url: '/green-room-icon.png'
      }
    },
    title: 'The Green Room',
    subtitle: 'Private faucet for AWC & VIPs',
    cardImage: {
      url: '/green-room-card.png'
    },
    slug: 'apps/the-green-room',
    wip: false,
    apps: [
      { slug: '/faucet', img: charisma },
    ]
  },

]


export default function Creatures() {
  const meta = {
    title: 'Charisma | Creatures',
    description: META_DESCRIPTION,
    image: '/creatures/img/1.png'
  };

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
        url: '/creatures/img/farmers.png'
      },
      requiredToken: 'STX-wCHA LP',
      dailyYield: 7,
      amount: 0,
      tokenContract: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-wcha',
      creaturesRecruitable: 0
    },
    {
      title: 'Blacksmiths',
      subtitle: 'Craftspeople who forge weapons and armor.',
      slug: '/creatures/blacksmiths',
      guild: {
        logo: {
          url: '/stations/fuji-apples.png'
        }
      },
      apps: [
        {
          slug: '/creatures/blacksmiths',
          img: '/stations/apple-orchard.png'
        }
      ],
      cardImage: {
        url: '/creatures/img/blacksmiths.png'
      },
      requiredToken: 'STX-sCHA LP',
      dailyYield: 0,
      amount: 0,
      tokenContract: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-scha',
      creaturesRecruitable: 0
    },
    {
      title: 'Corgi Soldiers',
      subtitle: 'Loyal and fierce warriors.',
      slug: '/creatures/corgi-soldiers',
      guild: {
        logo: {
          url: '/stations/fuji-apples.png'
        }
      },
      apps: [
        {
          slug: '/creatures/corgi-soldiers',
          img: '/stations/apple-orchard.png'
        }
      ],
      cardImage: {
        url: '/creatures/img/corgi-soldiers.png'
      },
      requiredToken: 'STX-iCC LP',
      dailyYield: 0,
      amount: 0,
      tokenContract: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-icc',
      creaturesRecruitable: 0
    },
    // {
    //   title: 'Alchemists',
    //   subtitle: 'Masters of potions and elixirs.',
    //   slug: '/creatures/alchemists',
    //   guild: {
    //     logo: {
    //       url: '/stations/fuji-apples.png'
    //     }
    //   },
    //   apps: [
    //     {
    //       slug: '/creatures/alchemists',
    //       img: '/stations/apple-orchard.png'
    //     }
    //   ],
    //   cardImage: {
    //     url: '/creatures/img/alchemists.png'
    //   },
    //   requiredToken: 'STX-iMM LP',
    //   dailyYield: 0,
    //   amount: 0,
    //   tokenContract: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-imm',
    //   creaturesRecruitable: 0
    // },
  ]


  const { doContractCall } = useConnect();

  const sender = userSession.isUserSignedIn() && userSession.loadUserData().profile.stxAddress.mainnet

  const [amountWChaLP, setAmountWChaLP] = useState(0)
  const [amountSChaLP, setAmountSChaLP] = useState(0)
  const [amountiCCLP, setAmountiCCLP] = useState(0)
  // const [amountiMMLP, setAmountiMMLP] = useState(0)

  const [farmers, setFarmers] = useState(0)
  const [blacksmiths, setBlacksmiths] = useState(0)
  const [corgiSoldiers, setCorgiSoldiers] = useState(0)
  // const [alchemists, setAlchemists] = useState(0)

  const [power, setPower] = useState(0)

  const [farmerCost, setFarmerCost] = useState(0)
  const [blacksmithCost, setBlacksmithCost] = useState(0)
  const [corgiSoldierCost, setCorgiSoldierCost] = useState(0)
  // const [alchemistCost, setAlchemistCost] = useState(0)

  const { getBalanceByKey } = useWallet();

  const farmersToRecruit = Math.floor(amountWChaLP / farmerCost)
  const blacksmithsToRecruit = Math.floor(amountSChaLP / blacksmithCost)
  const corgiSoldiersToRecruit = Math.floor(amountiCCLP / corgiSoldierCost)
  // const alchemistsToRecruit = Math.floor(amountiMMLP / alchemistCost)

  creatures[0].creaturesRecruitable = farmersToRecruit
  creatures[1].creaturesRecruitable = blacksmithsToRecruit
  creatures[2].creaturesRecruitable = corgiSoldiersToRecruit
  // creatures[3].creaturesRecruitable = alchemistsToRecruit

  creatures[0].amount = farmers
  creatures[1].amount = blacksmiths
  creatures[2].amount = corgiSoldiers
  // creatures[3].amount = alchemists

  function recruit(tokenContract: string, amount: number) {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'creatures-energy',
      functionName: "recruit",
      functionArgs: [
        uintCV(amount),
        principalCV(tokenContract)
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

  function dismiss(tokenContract: string, amount: number) {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'creatures-energy',
      functionName: "dismiss",
      functionArgs: [uintCV(amount), principalCV(tokenContract)],
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
      senderAddress: sender
    }).then(response => setFarmers(Number(cvToJSON(response).value.value)))
    sender && callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'creatures',
      functionName: "get-balance",
      functionArgs: [uintCV(2), principalCV(sender)],
      senderAddress: sender
    }).then(response => setBlacksmiths(Number(cvToJSON(response).value.value)))
    sender && callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'creatures',
      functionName: "get-balance",
      functionArgs: [uintCV(3), principalCV(sender)],
      senderAddress: sender
    }).then(response => setCorgiSoldiers(Number(cvToJSON(response).value.value)))
    // sender && callReadOnlyFunction({
    //   network: new StacksMainnet(),
    //   contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
    //   contractName: 'creatures',
    //   functionName: "get-balance",
    //   functionArgs: [uintCV(4), principalCV(sender)],
    //   senderAddress: sender
    // }).then(response => setAlchemists(Number(cvToJSON(response).value.value)))

  }, [sender])

  useEffect(() => {
    sender && callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'creatures',
      functionName: "get-creature-power",
      functionArgs: [uintCV(1)],
      senderAddress: sender
    }).then(response => setPower(Number(cvToJSON(response).value)))

  }, [sender])

  useEffect(() => {
    sender && callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'creatures',
      functionName: "get-creature-cost",
      functionArgs: [uintCV(1)],
      senderAddress: sender
    }).then(response => setFarmerCost(Number(cvToJSON(response).value)))
    sender && callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'creatures',
      functionName: "get-creature-cost",
      functionArgs: [uintCV(2)],
      senderAddress: sender
    }).then(response => setBlacksmithCost(Number(cvToJSON(response).value)))
    sender && callReadOnlyFunction({
      network: new StacksMainnet(),
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: 'creatures',
      functionName: "get-creature-cost",
      functionArgs: [uintCV(3)],
      senderAddress: sender
    }).then(response => setCorgiSoldierCost(Number(cvToJSON(response).value)))
    // sender && callReadOnlyFunction({
    //   network: new StacksMainnet(),
    //   contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
    //   contractName: 'creatures',
    //   functionName: "get-creature-cost",
    //   functionArgs: [uintCV(4)],
    //   senderAddress: sender
    // }).then(response => setAlchemistCost(Number(cvToJSON(response).value)))

  }, [sender])


  useEffect(() => {
    setAmountWChaLP(getBalanceByKey('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-wcha::lp-token').balance)
    setAmountSChaLP(getBalanceByKey('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-scha::lp-token').balance)
    setAmountiCCLP(getBalanceByKey('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-icc::lp-token').balance)
    // setAmountiMMLP(getBalanceByKey('SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx-imm::lp-token').balance)
  }, [getBalanceByKey])




  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="sm:container sm:mx-auto sm:py-10 space-y-6 m-2">
          <div className="space-y-1">
            <h2 className="text-4xl font-semibold tracking-tight text-secondary">Creatures</h2>
            <p className="text-muted-foreground text-base">
              Creatures are SIP13 tokens that represent workers in the Charisma ecosystem. They can be used to perform tasks and earn rewards.
            </p>
          </div>
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
            <Card
              className={cn(
                'bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card'
              )}
            >
              <div className="relative flex flex-col items-start text-md p-4 space-y-4 rounded-lg justify-between">
                <video src='vid/farm-tutorial.mp4' className="w-full rounded-lg" autoPlay loop muted />
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
                          {/* <div className="min-w-max">
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
                          </div> */}
                          <div className="">
                            <div className="text-sm font-semibold leading-none text-secondary">
                              {creature.title}
                            </div>
                            <div className="mt-1 text-xs leading-tight font-fine text-secondary">
                              {creature.subtitle}
                            </div>
                          </div>
                        </div>
                        {creature.dailyYield > 0 && <div className="flex flex-col items-end leading-[1.1] space-y-2">
                          <div className="text-white text-xs font-semibold">1000 {creature.title} earn:</div>
                          <div className="text-white text-xs font-semibold">~${creature.dailyYield} / day</div>
                        </div>}
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
                      <div className='w-full text-base px-4'>You have {millify(creature.amount)} {creature.title}</div>
                      <div className='flex flex-col justify-center space-y-2'>
                        {creature.creaturesRecruitable === 0 && <div className='text-sm font-semibold text-center leading-tight'>You need {creature.requiredToken} tokens to create {creature.title}</div>}
                        <div className='flex space-x-2'>
                          <Button disabled={creature.amount === 0} className="z-30" variant={'ghost'} onClick={() => dismiss(creature.tokenContract, creature.creaturesRecruitable)}>Dismiss</Button>
                          <Button disabled={!(creature.creaturesRecruitable >= 1)} className="z-30" onClick={() => recruit(creature.tokenContract, creature.creaturesRecruitable)}>Recruit</Button>
                        </div>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="space-y-1">
            <h2 className="text-4xl font-semibold tracking-tight text-secondary">Activities</h2>
            <p className="text-muted-foreground text-base">
              Here are some things your can do in the Charisma ecosystem to earn tokens.
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {activities.map((activity: any, i: number) => {
              return (
                <Card
                  key={i}
                  className={cn(
                    'bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card',
                    activity.inactive && 'opacity-25 hover:opacity-60'
                  )}
                >
                  <Link href={`${activity.slug}`} className="w-full">
                    <CardContent className="w-full p-0">
                      <CardHeader className="absolute inset-0 z-20 p-2 h-min backdrop-blur-sm group-hover/card:backdrop-blur-3xl">
                        <div className="flex justify-between align-top">
                          <div className="flex gap-2">
                            <div className="min-w-max">
                              {activity.guild.logo.url ? (
                                <Image
                                  src={activity.guild.logo.url}
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
                                {activity.title}
                              </div>
                              <div className="mt-1 text-xs leading-tight font-fine text-secondary">
                                {activity.subtitle}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end leading-[1.1]">
                            <div className="text-white text-sm font-semibold">{activity.ticker}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <Image
                        src={activity.cardImage.url}
                        height={1200}
                        width={1200}
                        alt="activity-featured-image"
                        className={cn(
                          'w-full object-cover transition-all group-hover/card:scale-105',
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
                  </Link>

                </Card>
              );
            })}

          </div>
        </div>
      </Layout>
    </Page>
  );
}
