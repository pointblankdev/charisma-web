import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/ui/dialog';
import Page from '@components/page';
import Layout from '@components/layout/layout';
import { cn } from '@lib/utils';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@components/ui/card';
import Link from 'next/link';
import { getLand, getLands, setLand } from '@lib/db-providers/kv';
import { Button } from '@components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { PostConditionMode } from '@stacks/transactions';
import { getContractSource, getDecimals, getLandId, getLastLandId, getSymbol, getTokenURI, getTotalSupply, getTransferFunction } from '@lib/stacks-api';
import { setLandMetadata } from '@lib/user-api';
import energyIcon from '@public/creatures/img/energy.png';
import { track } from '@vercel/analytics';
import { useAccount } from '@micro-stacks/react';
import { useOpenContractDeploy } from '@micro-stacks/react';
import { useToast } from '@components/ui/use-toast';
import _ from 'lodash';
import { Land } from '@lib/db-providers/kv.types';

export const getStaticProps: GetStaticProps<Props> = async () => {
  // get all staking lands from db
  const landContractAddresses = await getLands()

  let lands = []
  const proposals = []
  for (const ca of landContractAddresses) {
    const metadata = await getLand(ca)
    if (metadata.id) {
      lands.push(metadata)
    } else {
      const landId = await getLandId(ca)
      if (landId) {
        metadata.id = landId
        metadata.whitelisted = true
        metadata.wraps.decimals = Number(await getDecimals(ca))
        await setLand(ca, metadata)
        lands.push(metadata)
      } else {
        proposals.push(metadata)
      }
    }
  }

  // if lands have 'cha' in the .wraps.ca, sort them to the top
  lands = _.sortBy(lands, (land) => {
    return land.wraps.ca.includes('cha') ? 0 : 1
  })

  return {
    props: {
      lands,
      proposals
    },
    revalidate: 60
  };
};

type Props = {
  lands: any[];
  proposals: any[];
};

export default function StakingIndex({ lands, proposals }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLands, setFilteredLands] = useState(lands);
  const [activeTab, setActiveTab] = useState('active');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = lands.filter(
      land =>
        land.name.toLowerCase().includes(query) ||
        land.description.description.toLowerCase().includes(query)
    );
    setFilteredLands(filtered);
  };

  const meta = {
    title: 'Charisma | Staking',
    description: `Stake memecoins. Earn Yield. It's that simple.`,
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 space-y-6 sm:container sm:mx-auto sm:py-10">
          {/* Tabs */}
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 font-semibold ${activeTab === 'active' ? 'border-b-2 border-red-500' : ''
                }`}
            >
              Active Proposals
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 font-semibold ${activeTab === 'new' ? 'border-b-2 border-red-500' : ''
                }`}
            >
              New Proposals
            </button>
          </div>

          {/* Active Proposals */}
          {activeTab === 'active' && (
            <div>
              <div className="flex justify-between">
                <div className="flex flex-col justify-between w-full mb-10 md:flex-row">
                  <div className="space-y-1">
                    <h2 className="flex items-end text-4xl font-semibold tracking-tight text-secondary">
                      <>Stake-to-Earn</>
                      <Image
                        alt="energy-icon"
                        src={energyIcon}
                        className="mx-2 rounded-full w-9 h-9"
                      />
                    </h2>
                    <div className="flex items-center text-base text-muted-foreground">
                      The more you stake, the more energy you earn on every
                      block– used to unlock community rewards.
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Input
                      type="text"
                      placeholder="Search tokens..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                <Card
                  className={cn(
                    'bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card'
                  )}
                >
                  <div className="relative flex flex-col items-start justify-between p-4 space-y-4 rounded-lg text-md">
                    <div className="space-y-4 text-sm">
                      <h3 className="text-sm font-bold sm:text-md">Stake Memecoins to Earn</h3>
                      <div className="text-xs font-light">
                        Stake your memecoins in a Stake-to-Earn pool to generate Energy with every block. The more you stake, the more Energy you accumulate, which can be used to unlock exclusive community rewards.
                      </div>
                      <div className="text-xs font-light">
                        Energy is redeemable through Quests, where each memecoin community can offer their own tokens and NFTs on Charisma, purchaseable with Energy.
                      </div>
                    </div>

                    <div className="w-full space-y-2 text-sm">
                      <h3 className="hidden text-xs font-bold sm:flex">Submit your own token for Staking</h3>
                      <div className='flex w-full'>
                        <CreateNewPool whitelistedContracts={lands} />
                      </div>
                    </div>
                  </div>
                </Card>

                {filteredLands.map((land) => {
                  return (
                    <Card
                      key={land.wraps.ca}
                      className={cn(
                        'bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card'
                      )}
                    >
                      <Link href={`staking/${land.wraps.ca}`} className="w-full">
                        <CardContent className="w-full p-0">
                          <CardHeader className="absolute inset-0 z-20 p-2 h-min backdrop-blur-sm group-hover/card:backdrop-blur-3xl">
                            <div className="flex gap-2">
                              <div className="min-w-max">
                                {land.image ? (
                                  <Image
                                    src={land.wraps.image}
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
                                  {land.name}
                                </div>
                                <div className="mt-1 text-xs leading-tight font-fine text-secondary">
                                  {land.description.description}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <Image
                            src={land.cardImage}
                            height={1200}
                            width={600}
                            alt="land-featured-image"
                            className={cn(
                              'w-full object-cover transition-all group-hover/card:scale-105',
                              'aspect-[1/2]',
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
          )}

          {/* New Proposals */}
          {activeTab === 'new' && (
            <div>
              <div className="flex justify-between">
                <div className="mb-10 space-y-1">
                  <h2 className="flex items-end text-4xl font-semibold tracking-tight text-secondary">
                    New Proposals
                  </h2>
                  <div className="flex items-center text-base text-muted-foreground">
                    Proposals for new staking pools that are pending approval.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {proposals.map((land: Land) => {
                  return (
                    <Card
                      key={land.wraps.ca}
                      className={cn(
                        'bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card'
                      )}
                    >
                      <Link href={`staking/${land.wraps.ca}`} className="w-full">
                        <CardContent className="w-full p-0">
                          <CardHeader className="absolute inset-0 z-20 p-2 h-min backdrop-blur-sm group-hover/card:backdrop-blur-3xl">
                            <div className="flex gap-2">
                              <div className="min-w-max">
                                {land.image ? (
                                  <Image
                                    src={land.wraps.image}
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
                                  {land.name}
                                </div>
                                <div className="mt-1 text-xs leading-tight font-fine text-secondary">
                                  {land.description.description}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <Image
                            src={land.cardImage}
                            height={1200}
                            width={600}
                            alt="land-featured-image"
                            className={cn(
                              'w-full object-cover transition-all group-hover/card:scale-105',
                              'aspect-[1/2]',
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
          )}
        </div>
      </Layout>
    </Page>
  );
}

const generateTemplate = ({ contractAddress }: any) => {
  return `(define-public (execute (sender principal))
  (begin
    ;; enable the token for staking
    (try! (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands set-whitelisted '${contractAddress} true))
    (let 
      (
        ;; create a unique id for the staked token
        (land-id (try! (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands get-or-create-land-id '${contractAddress})))
        ;; lookup the total supply of the staked token
        (total-supply (unwrap-panic (contract-call? '${contractAddress} get-total-supply)))
        ;; calculate the initial difficulty based on the total supply
        (land-difficulty (/ total-supply (pow u10 u4)))
      )
      (print {event: "enable-listing", contract: "${contractAddress}", land-id: land-id, total-supply: total-supply, land-difficulty: land-difficulty})
      ;; set initial difficulty based on total supply to normalize energy output
      (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands set-land-difficulty land-id land-difficulty)
    )
  )
)
`;
};

const proposalFormSchema = z.object({
  contractAddress: z.string(),
  name: z.string(),
  symbol: z.string().max(10),
  image: z.string().url(),
  cardImage: z.string().url(),
  description: z.string().max(100), // Limiting to roughly one sentence
  totalSupply: z.coerce.number().positive(),
  decimals: z.coerce.number().int().min(0).max(18) // Most tokens use 18 decimals max
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

const CreateNewPool = ({ whitelistedContracts }: any) => {
  const { toast } = useToast();
  const { stxAddress } = useAccount();
  const defaultValues: Partial<ProposalFormValues> = {
    contractAddress: ''
  };

  const { openContractDeploy } = useOpenContractDeploy();

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues,
    mode: 'onChange'
  });

  const [isWhitelisted, setIsWhitelisted] = useState(false);

  const handleChange = async (e: any) => {
    const contractAddress = form.getValues().contractAddress;
    if (contractAddress && e.target.name === 'contractAddress') {
      try {
        const metadata = await getTokenURI(contractAddress);
        const totalSupply = await getTotalSupply(contractAddress);
        const decimals = await getDecimals(contractAddress);
        const symbol = await getSymbol(contractAddress);
        form.setValue('name', metadata.name);
        form.setValue('description', metadata.description);
        form.setValue('image', metadata.image);
        form.setValue('totalSupply', totalSupply);
        form.setValue('decimals', decimals);
        form.setValue('symbol', symbol);
      } catch (error) {
        console.error(error);
      }
    }
    const isWhitelisted = !!whitelistedContracts.find(
      (wc: any) => wc.ca === form.getValues().contractAddress
    );
    setIsWhitelisted(isWhitelisted);
  };

  const handleCreatePool = async () => {
    const template = generateTemplate(form.getValues());
    const {
      name,
      image,
      cardImage,
      contractAddress,
      symbol,
      totalSupply,
      decimals,
      description
    } = form.getValues();
    const safeName = `list-${name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')}`;
    const sourceCode = await getContractSource({ contractAddress: contractAddress.split('.')[0], contractName: contractAddress.split('.')[1] })
    const assetIdentifier = sourceCode.source.split('define-fungible-token')[1].split(' ')[1].split(')')[0]

    const transferFunction = await getTransferFunction(contractAddress)

    const proposalName = `${stxAddress}.${safeName}`

    const landMetadata = {
      sip: 16,
      name: name,
      image: image,
      cardImage: cardImage,
      description: {
        type: 'string',
        description: description
      },
      proposal: proposalName,
      whitelisted: isWhitelisted,
      wraps: {
        ca: contractAddress,
        name: name,
        description: description,
        image: image,
        asset: assetIdentifier,
        symbol: symbol,
        decimals: Number(decimals),
        totalSupply: Number(totalSupply),
        transferFunction: transferFunction
      },
      attributes: [
        {
          trait_type: 'difficulty',
          display_type: 'number',
          value: Math.floor(totalSupply / Math.pow(10, 5))
        }
      ],
      properties: {
        collection: 'Charisma Lands',
        collection_image: 'https://charisma.rocks/lands/img/lands.jpg',
        category: 'image',
        symbol: 'LAND',
        decimals: 6
      }
    };

    track('CreateNewPool', {
      contractAddress,
      name,
      description,
      image,
      cardImage,
      proposalName,
      isWhitelisted
    });

    if (!isWhitelisted) {
      await openContractDeploy({
        contractName: safeName,
        codeBody: template,
        onCancel: () => {
          toast({
            title: 'Transaction Canceled',
            description: 'You canceled the transaction.'
          });
        },
        onFinish: async result => {
          await setLandMetadata(contractAddress, landMetadata);
          toast({
            title: 'Transaction Broadcasted',
            description: JSON.stringify(result, null, 2)
          });
        }
      });
    }
  };

  const card = form.watch();

  function isValidUrl(string: string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full h-full" onClick={() => track('ViewCreateNewPool')}>
          Create New Pool
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-full p-4 sm:max-w-5xl sm:p-6">
        <DialogHeader>
          <DialogTitle>New Stake-to-Earn Pool</DialogTitle>
        </DialogHeader>
        <DialogDescription className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Card
            className={cn(
              'bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card sm:w-96 w-full'
            )}
          >
            <CardContent className="w-full p-0">
              <CardHeader className="absolute inset-0 z-20 p-2 h-min backdrop-blur-sm group-hover/card:backdrop-blur-3xl">
                <div className="flex gap-2">
                  <div className="min-w-max">
                    {isValidUrl(card.image) ? (
                      <Image
                        src={card.image}
                        width={40}
                        height={40}
                        alt="guild-logo"
                        className="w-10 h-10 border rounded-full grow"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-white border rounded-full" />
                    )}
                  </div>
                  <div className="">
                    <div className="text-sm font-semibold leading-none text-secondary">
                      {card.name}
                    </div>
                    <div className="mt-1 text-xs leading-tight font-fine text-secondary">
                      {card.description}
                    </div>
                  </div>
                </div>
              </CardHeader>
              {isValidUrl(card.cardImage) && (
                <Image
                  src={card.cardImage}
                  height={1200}
                  width={600}
                  alt="land-featured-image"
                  className={cn(
                    'w-full object-cover transition-all group-hover/card:scale-105',
                    'aspect-[1/2]',
                    'opacity-80',
                    'group-hover/card:opacity-100',
                    'flex',
                    'z-10',
                    'relative'
                  )}
                />
              )}
              <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/50 to-transparent opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent from-0% to-black/50 to-69% opacity-90 z-20" />
            </CardContent>
          </Card>
          <div className="grid w-full">
            <Form {...form}>
              <form onChange={handleChange}>
                <fieldset className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="contractAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Memecoin Contract Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token'
                            }
                            {...field}
                            className="text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Token Name" {...field} className="text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (1 sentence)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief description..."
                            {...field}
                            className="text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} className="text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cardImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Image URL (1w by 2h aspect ratio)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} className="text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </fieldset>
              </form>
              <div className="flex justify-end mt-4">
                <Button disabled={isWhitelisted} onClick={handleCreatePool}>
                  Create Pool
                </Button>
              </div>
            </Form>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
