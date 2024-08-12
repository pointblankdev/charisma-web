import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@components/ui/dialog';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { cn } from '@lib/utils';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card"
import Link from 'next/link';
import { getLand, getLands } from '@lib/db-providers/kv';
import { Button } from '@components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { Input } from "@components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from 'react';
import { getContractSource, getDecimals, getSymbol, getTokenURI, getTotalSupply } from '@lib/stacks-api';
import { useConnect } from '@stacks/connect-react';
import { StacksMainnet } from "@stacks/network";
import { PostConditionMode } from '@stacks/transactions';
import { setLandMetadata } from '@lib/user-api';
import energyIcon from '@public/creatures/img/energy.png';

export const getStaticProps: GetStaticProps<Props> = async () => {
  // get all staking lands from db
  const landContractAddresses = await getLands()

  const lands = []
  for (const ca of landContractAddresses) {
    const metadata = await getLand(ca)
    lands.push(metadata)
  }

  return {
    props: {
      lands
    },
    revalidate: 60000
  };
};

type Props = {
  lands: any[];
};

export default function StakingIndex({ lands }: Props) {

  const meta = {
    title: 'Charisma | Staking',
    description: META_DESCRIPTION,
    image: '/liquid-welsh.png'
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 space-y-6 sm:container sm:mx-auto sm:py-10">
          <div className='flex justify-between'>
            <div className="space-y-1">
              <h2 className="flex items-end text-4xl font-semibold tracking-tight text-secondary"><>Stake-to-Earn</><Image alt='energy-icon' src={energyIcon} className='mx-2 rounded-full w-9 h-9' /></h2>
              <p className="flex items-center text-base text-muted-foreground">
                The more you stake, the more energy you earn on every block– used to unlock community rewards.
              </p>
            </div>
            <CreateNewPool whitelistedContracts={lands} />
          </div>
          <div className='grid gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
            <Card
              className={cn(
                'bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card'
              )}
            >
              <div className="relative flex flex-col items-start text-md p-4 space-y-4 rounded-lg justify-between">
                <div className="space-y-4 text-sm">
                  <h3 className="font-bold text-lg">Stake Memecoins to Earn</h3>
                  <p>
                    Stake your memecoins in a Stake-to-Earn pool to generate Energy with every block. The more you stake, the more Energy you accumulate, which can be used to unlock exclusive community rewards.
                  </p>
                  <p>
                    Energy is redeemable through Quests, where each memecoin community can offer their own tokens and NFTs on Charisma, purchaseable with Energy.
                  </p>
                  <p>
                    In addition, anyone can claim Charisma rewards through Quests, making your staked memecoins a gateway to both unique community offerings and broader ecosystem rewards.
                  </p>
                </div>
              </div>
            </Card>
            {lands.map((land) => {
              return (
                <Card key={land.wraps.ca} className={cn('bg-black text-primary-foreground border-accent-foreground p-0 flex relative overflow-hidden rounded-md group/card')}>
                  <Link href={`staking/${land.wraps.ca}`} className='w-full'>
                    <CardContent className='w-full p-0'>
                      <CardHeader className="absolute inset-0 z-20 p-2 h-min backdrop-blur-sm group-hover/card:backdrop-blur-3xl">
                        <div className='flex gap-2'>
                          <div className='min-w-max'>
                            {land.image ?
                              <Image src={land.wraps.image} width={40} height={40} alt='guild-logo' className='w-10 h-10 border rounded-full grow' />
                              : <div className='w-10 h-10 bg-white border rounded-full' />
                            }
                          </div>
                          <div className=''>
                            <div className='text-sm font-semibold leading-none text-secondary'>
                              {land.name}
                            </div>
                            <div className='mt-1 text-xs leading-tight font-fine text-secondary'>
                              {land.description.description}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <Image
                        src={land.cardImage}
                        height={1200}
                        width={600}
                        alt='land-featured-image'
                        className={cn("w-full object-cover transition-all group-hover/card:scale-105", "aspect-[1/2]", 'opacity-80', 'group-hover/card:opacity-100', 'flex', 'z-10', 'relative')}
                      />
                      <div className='absolute inset-0 z-0 bg-gradient-to-b from-white/50 to-transparent opacity-30' />
                      <div className='absolute inset-0 bg-gradient-to-b from-transparent from-0% to-black/50 to-69% opacity-90 z-20' />
                    </CardContent>
                  </Link>
                </Card>
              )
            })}
          </div>
        </div>
      </Layout>
    </Page>
  );
}



const generateTemplate = ({ contractAddress }: any) => {
  return `(define-public (execute (sender principal))
  (begin
    ;; enable the token for staking
    (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands set-whitelisted '${contractAddress} true)
    (try 
      (
        ;; create a unique id for the staked token
        (land-id (try! (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands get-or-create-land-id '${contractAddress})))
        ;; lookup the total supply of the staked token
        (total-supply (try! (contract-call? '${contractAddress} get-total-supply)))
        ;; calculate the initial difficulty based on the total supply
        (land-difficulty (/ total-supply (pow u10 u6)))
      )
    )
    ;; set initial difficulty based on total supply to normalize energy output
    (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands set-land-difficulty land-id land-difficulty)
  )
)
`}

const proposalFormSchema = z.object({
  contractAddress: z.string(),
  name: z.string(),
  symbol: z.string().max(10),
  image: z.string().url(),
  cardImage: z.string().url(),
  description: z.string().max(100), // Limiting to roughly one sentence
  totalSupply: z.coerce.number().positive(),
  decimals: z.coerce.number().int().min(0).max(18) // Most tokens use 18 decimals max
})

type ProposalFormValues = z.infer<typeof proposalFormSchema>

const CreateNewPool = ({ whitelistedContracts }: any) => {
  const defaultValues: Partial<ProposalFormValues> = {
    contractAddress: "",
  }

  const { doContractDeploy, doContractCall } = useConnect();

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues,
    mode: "onChange",
  })

  const [isWhitelisted, setIsWhitelisted] = useState(false)

  const handleChange = async (e: any) => {
    const contractAddress = form.getValues().contractAddress
    if (contractAddress && e.target.name === 'contractAddress') {
      try {
        const metadata = await getTokenURI(contractAddress)
        const totalSupply = await getTotalSupply(contractAddress)
        const decimals = await getDecimals(contractAddress)
        const symbol = await getSymbol(contractAddress)
        form.setValue('name', metadata.name)
        form.setValue('description', metadata.description)
        form.setValue('image', metadata.image)
        form.setValue('totalSupply', totalSupply)
        form.setValue('decimals', decimals)
        form.setValue('symbol', symbol)
      } catch (error) {
        console.error(error)
      }
    }
    const isWhitelisted = !!whitelistedContracts.find((wc: any) => wc.ca === form.getValues().contractAddress)
    setIsWhitelisted(isWhitelisted)
  };

  const handleCreatePool = async () => {
    const template = generateTemplate(form.getValues())
    const { name, image, cardImage, contractAddress, symbol, totalSupply, decimals, description } = form.getValues()
    const safeName = name.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-")

    const sourceCode = await getContractSource({ contractAddress: contractAddress.split('.')[0], contractName: contractAddress.split('.')[1] })
    const assetIdentifier = sourceCode.source.split('define-fungible-token')[1].split('\n')[0].replace(')', '').trim()
    const proposalName = `pool-proposal-${safeName}`

    const landMetadata = {
      sip: 16,
      name: name,
      image: image,
      cardImage: cardImage,
      description: {
        type: "string",
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
        totalSupply: Number(totalSupply)
      },
      attributes: [
        {
          trait_type: "difficulty",
          display_type: "number",
          value: Math.floor(totalSupply / Math.pow(10, 6))
        }
      ],
      properties: {
        collection: "Charisma Lands",
        collection_image: "https://charisma.rocks/lands/img/lands.jpg",
        category: "image",
        symbol: "LAND",
        decimals: 6
      }
    }

    if (!isWhitelisted) {
      doContractDeploy({
        contractName: proposalName,
        codeBody: template,
        postConditionMode: PostConditionMode.Allow,
        network: new StacksMainnet(),
        onFinish: async () => {
          await setLandMetadata(contractAddress, landMetadata)
        }
      });
    } else {
      await setLandMetadata(contractAddress, landMetadata)
    }
  }


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='h-full bg-primary-foreground/5'>Create New Pool</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Stake-to-Earn Pool</DialogTitle>
        </DialogHeader>
        <DialogDescription className='grid'>
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
                        <Input placeholder={'...'} {...field} className='text-white' />
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
                        <Input placeholder="Token Name" {...field} className='text-white' />
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
                        <Input placeholder="Brief description..." {...field} className='text-white' />
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
                        <Input placeholder="https://..." {...field} className='text-white' />
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
                        <Input placeholder="https://..." {...field} className='text-white' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </fieldset>
            </form>
          </Form>
        </DialogDescription>
        <DialogFooter>
          <Button disabled={isWhitelisted} onClick={handleCreatePool}>Create Pool</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}