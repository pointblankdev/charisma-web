import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';
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
  CardTitle,
} from '@components/ui/card';
import Link from 'next/link';
import { getLand, getLands } from '@lib/db-providers/kv';
import { Button } from '@components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  getContractSource,
  getDecimals,
  getSymbol,
  getTokenURI,
  getTotalSupply,
  getTransferFunction,
} from '@lib/stacks-api';
import { setLandMetadata } from '@lib/user-api';
import { track } from '@vercel/analytics';
import { useAccount } from '@micro-stacks/react';
import { useOpenContractDeploy } from '@micro-stacks/react';
import { useToast } from '@components/ui/use-toast';
import _ from 'lodash';

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
  description: z.string().max(100),
  totalSupply: z.coerce.number().positive(),
  decimals: z.coerce.number().int().min(0).max(18),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

const CreatePoolPage = ({ whitelistedContracts }: any) => {
  const { toast } = useToast();
  const { stxAddress } = useAccount();
  const defaultValues: Partial<ProposalFormValues> = {
    contractAddress: '',
  };

  const { openContractDeploy } = useOpenContractDeploy();

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues,
    mode: 'onChange',
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
      description,
    } = form.getValues();
    const safeName = `list-${name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')}`;
    const sourceCode = await getContractSource({
      contractAddress: contractAddress.split('.')[0],
      contractName: contractAddress.split('.')[1],
    });
    const assetIdentifier = sourceCode.source
      .split('define-fungible-token')[1]
      .split(' ')[1]
      .split(')')[0];

    const transferFunction = await getTransferFunction(contractAddress);

    const proposalName = `${stxAddress}.${safeName}`;

    const landMetadata = {
      sip: 16,
      name: name,
      image: image,
      cardImage: cardImage,
      description: {
        type: 'string',
        description: description,
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
        transferFunction: transferFunction,
      },
      attributes: [
        {
          trait_type: 'difficulty',
          display_type: 'number',
          value: Math.floor(totalSupply / Math.pow(10, 5)),
        },
      ],
      properties: {
        collection: 'Charisma Lands',
        collection_image: 'https://charisma.rocks/lands/img/lands.jpg',
        category: 'image',
        symbol: 'LAND',
        decimals: 6,
      },
    };

    track('CreateNewPool', {
      contractAddress,
      name,
      description,
      image,
      cardImage,
      proposalName,
      isWhitelisted,
    });

    if (!isWhitelisted) {
      await openContractDeploy({
        contractName: safeName,
        codeBody: template,
        onCancel: () => {
          toast({
            title: 'Transaction Canceled',
            description: 'You canceled the transaction.',
          });
        },
        onFinish: async (result) => {
          await setLandMetadata(contractAddress, landMetadata);
          toast({
            title: 'Transaction Broadcasted',
            description: JSON.stringify(result, null, 2),
          });
        },
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

  const meta = {
    title: 'Charisma | Staking',
    description: `Stake memecoins. Earn Yield. It's that simple.`,
  };

  return (
    <Layout>
      <Page meta={meta} fullViewport>
        <SkipNavContent>
          <section className="py-12 lg:py-24 bg-gradient-to-b from-black via-gray-900 to-black min-h-screen">
            <div className="container max-w-5xl mx-auto">
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  <h1 className="text-4xl font-bold text-center text-white mb-8">
                    Create a New Stake-to-Earn Pool
                  </h1>
                  <Form {...form}>
                    <form onChange={handleChange}>
                      <fieldset className="space-y-6">
                        <FormField
                          control={form.control}
                          name="contractAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Memecoin Contract Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token"
                                  {...field}
                                  className="text-white bg-gray-800 border-gray-700"
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
                                <Input
                                  placeholder="Token Name"
                                  {...field}
                                  className="text-white bg-gray-800 border-gray-700"
                                />
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
                                  className="text-white bg-gray-800 border-gray-700"
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
                                <Input
                                  placeholder="https://..."
                                  {...field}
                                  className="text-white bg-gray-800 border-gray-700"
                                />
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
                                <Input
                                  placeholder="https://..."
                                  {...field}
                                  className="text-white bg-gray-800 border-gray-700"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </fieldset>
                    </form>
                    <div className="flex justify-end mt-8">
                      <Button
                        disabled={isWhitelisted}
                        onClick={handleCreatePool}
                        className="bg-accent-500 hover:bg-accent-700 text-white py-2 px-4 rounded-lg"
                      >
                        Create Pool
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </section>
        </SkipNavContent>
      </Page>
    </Layout>
  );
};

export default CreatePoolPage;
