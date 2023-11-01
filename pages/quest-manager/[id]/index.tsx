import { GetStaticProps } from "next"
import Image from "next/image"
import { Button } from "@components/ui/button"
import { Separator } from "@components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@components/ui/tabs"
import Layout from "@components/layout"
import { getQuestById } from "@lib/db-providers/dato"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { Input } from "@components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { getAllGuilds, getAllNetworks, getQuestImageUrls } from "@lib/cms-providers/dato"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select"
import { useEffect, useState } from "react"
import { checkQuestStxRewards, getQuestActivationBlock, getQuestExpirationBlock, getQuestMaxCompletions, getStxProtocolFeePercentage, getStxQuestRewardsDeposited } from "@lib/stacks-api"
import { userSession } from '@components/stacks-session/connect';
import { useConnect } from "@stacks/connect-react"
import {
  AnchorMode,
  Pc,
  PostConditionMode,
  principalCV,
  uintCV,
} from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";
import { updateQuest } from "@lib/user-api"
import { Textarea } from "@components/ui/textarea"
// import DepositForm from "@components/quest-manager/deposit-form"

const questFormSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  objectives: z.string(),
  cardImage: z.string().optional(),
  questBgImage: z.string().optional(),
  guild: z.string(),
  contract_identifier: z.string(),
  method: z.string(),
  activation: z.coerce.number(),
  expiration: z.coerce.number(),
  maxcompletions: z.coerce.number(),
  reward_stx: z.coerce.number(),
  network: z.string(),
})

type QuestFormValues = z.infer<typeof questFormSchema>

export default function QuestEditor({ quest, networks, guilds, cardImage, questBgImage }: any) {

  const [feePercentage, setFeePercentage] = useState(0)
  const [questRewardsDeposited, setQuestRewardsDeposited] = useState(0)

  const defaultValues: Partial<QuestFormValues> = {
    ...quest,
  }

  const form = useForm<QuestFormValues>({
    resolver: zodResolver(questFormSchema),
    defaultValues,
    mode: "onChange",
  })

  const onSubmit = async (data: QuestFormValues) => {
    // convert quest.description from a single string with line breaks to an array of strings
    data.description = JSON.stringify(data.description.split('\n\n'))
    data.objectives = JSON.stringify([{ text: data.objectives, metric: '0/1' }])
    const response = await updateQuest(data)
    console.log(response)
  };

  const uploadImage = async () => {
    const response = await updateQuest({ id: form.getValues().id, cardImage: form.getValues().cardImage })
    console.log(response)
  }

  const { doContractCall } = useConnect();

  const updateQuestMaxCompletions = () => {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "dme017-quest-helper",
      functionName: "set-quest-max-completion",
      functionArgs: [uintCV(Number(quest?.questid || 0)), uintCV(Number(form.getValues().maxcompletions))],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data) => {
        console.log("onFinish:", data);
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  const updateQuestStxRewards = () => {
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "dme017-quest-helper",
      functionName: "set-quest-stx-rewards",
      functionArgs: [uintCV(Number(quest?.questid || 0)), uintCV(Number(form.getValues().reward_stx))],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data) => {
        console.log("onFinish:", data);
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  const depositQuestRewards = () => {
    const profile = userSession.loadUserData().profile
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "dme017-quest-helper",
      functionName: "deposit-quest-rewards",
      functionArgs: [uintCV(Number(quest?.questid || 0))],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [Pc.principal(profile.stxAddress.mainnet).willSendLte(form.getValues().reward_stx * form.getValues().maxcompletions * feePercentage).ustx()],
      onFinish: (data) => {
        console.log("onFinish:", data);
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  // function to create random number between 1000 and 9999
  const randomQuestId = () => {
    return Math.floor(Math.random() * 9999) + 1000;
  }

  const claimQuestId = () => {
    const profile = userSession.loadUserData().profile
    const newQuestId = randomQuestId()
    doContractCall({
      network: new StacksMainnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
      contractName: "dme016-quest-ownership",
      functionName: "set-owner",
      functionArgs: [uintCV(newQuestId), principalCV(profile.stxAddress.mainnet)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: async (data) => {
        console.log("onFinish:", data);
        const response = await updateQuest({ id: quest.id, questid: newQuestId })
        console.log(response)
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  useEffect(() => {
    const profile = userSession.loadUserData().profile
    typeof quest?.questid === 'number' && getQuestActivationBlock(profile.stxAddress.mainnet, Number(quest?.questid)).then(res => {
      if (!res.success) {

        console.warn(res)
      } else {

        // console.log(res)
        form.setValue('activation', res.value.value)
      }
    })
    typeof quest?.questid === 'number' && getQuestExpirationBlock(profile.stxAddress.mainnet, Number(quest?.questid)).then(res => {
      if (!res.success) {

        console.warn(res)
      } else {

        // console.log(res)
        form.setValue('expiration', res.value.value)
      }
    })

    typeof quest?.questid === 'number' && checkQuestStxRewards(profile.stxAddress.mainnet, Number(quest?.questid)).then(res => {
      if (!res.success) {

        console.warn(res)
      } else {

        console.log(res)
        form.setValue('reward_stx', res.value.value)
      }
    })
    typeof quest?.questid === 'number' && getQuestMaxCompletions(profile.stxAddress.mainnet, Number(quest?.questid)).then(res => {
      if (!res.success) {

        console.warn(res)
      } else {

        // console.log(res)
        form.setValue('maxcompletions', res.value.value)
      }
    })
    typeof quest?.questid === 'number' && getStxProtocolFeePercentage(profile.stxAddress.mainnet).then(res => {
      if (!res.success) {

        console.warn(res)
      } else {

        setFeePercentage(1 + (res.value.value / 100))
      }
    })
    typeof quest?.questid === 'number' && getStxQuestRewardsDeposited(profile.stxAddress.mainnet, Number(quest?.questid)).then(res => {
      if (!res.success) {

        console.warn(res)
      } else {

        setQuestRewardsDeposited(res.value.value / 1000000)
      }
    })
  }, [form, quest?.questid])


  return (
    <Layout>
      <div className="my-4 space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="Objectives" className="flex-1">
              <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
                <div className="block sm:justify-between sm:w-full sm:flex w-full">
                  <div className="flex items-center w-full">
                    <h2 className="text-lg font-semibold whitespace-nowrap">{quest?.title}</h2>
                    {typeof quest?.questid === 'number' ? <div className="text-muted-foreground mx-2 text-sm"> #{quest?.questid}</div> : <Button type="button" className="text-sm text-primary-foreground h-5 px-2 mx-2" onClick={claimQuestId}>Create Quest ID</Button>}
                    <div className="w-full mx-6 text-sm text-right whitespace-nowrap"><span className="text-muted-foreground">Total Deposits:</span> {questRewardsDeposited} STX</div>
                  </div>
                  <div className="grid gap-2 mt-2 sm:mt-0 ">
                    <TabsList className="justify-between">
                      <TabsTrigger value="Objectives">
                        <span className="sr-only">Objectives</span>
                        Objectives
                      </TabsTrigger>
                      <TabsTrigger value="Duration">
                        <span className="sr-only">Duration</span>
                        Duration
                      </TabsTrigger>
                      <TabsTrigger value="Rewards">
                        <span className="sr-only">Rewards</span>
                        Rewards
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>
              </div>
              <Separator />
              <TabsContent value="Objectives" className="mt-0 border-0 p-0">
                <div className="container my-4 space-y-4">
                  <FormField
                    control={form.control}
                    name="network"
                    render={({ field }) => (
                      <FormItem className="grow">
                        <FormLabel>Network</FormLabel>
                        <FormControl>
                          <Select {...field}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a network" />
                            </SelectTrigger>
                            <SelectContent>
                              {networks?.map((network: any) => {
                                return (
                                  <SelectItem value={network.id} key={network.id}>
                                    <div className='flex space-x-2'>
                                      <Image src={network.icon.url} width={24} height={24} alt={'Network logo'} className="rounded-full" />
                                      <div>{network.name}</div>
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contract_identifier"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Contract Identifier</FormLabel>
                        <FormControl>
                          <Input placeholder={'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.dme005-token-faucet-v0'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Method</FormLabel>
                        <FormControl>
                          <Input placeholder={'claim'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder={'title'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl>
                          <Input placeholder={'subtitle'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guild"
                    render={({ field }) => (
                      <FormItem className="grow">
                        <FormLabel>Guild</FormLabel>
                        <FormControl>
                          <Select {...field}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a guild" />
                            </SelectTrigger>
                            <SelectContent>
                              {guilds?.map((guild: any) => {
                                return (
                                  <SelectItem value={guild.id} key={guild.id}>
                                    <div className='flex space-x-2'>
                                      <Image src={guild.logo.url} width={24} height={24} alt={'Guild logo'} className="rounded-full" />
                                      <div>{guild.name}</div>
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder={'description'} {...field} className="h-48" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="objectives"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Objective</FormLabel>
                        <FormControl>
                          <Input placeholder={'objectives'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>

                      <div className="flex items-end space-x-4">
                        <FormField
                          control={form.control}
                          name="cardImage"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>Card Image</FormLabel>
                              <FormControl>
                                <Input placeholder={'Publicly available URL of image to upload'} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" onClick={uploadImage} className="text-sm text-primary-foreground">Upload</Button>
                      </div>
                      {cardImage && <Image src={cardImage.url} width={400} height={400} alt={cardImage.alt} className="w-full rounded-lg cursor-pointer border mt-4" />}

                    </div>
                    <div>

                      <div className="flex items-end space-x-4">
                        <FormField
                          control={form.control}
                          name="questBgImage"
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormLabel>Background Image</FormLabel>
                              <FormControl>
                                <Input placeholder={'Publicly available URL of image to upload'} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" onClick={uploadImage} className="text-sm text-primary-foreground">Upload</Button>
                      </div>
                      {questBgImage && <Image src={questBgImage.url} width={400} height={400} alt={cardImage.alt} className="w-full rounded-lg cursor-pointer border mt-4" />}

                    </div>
                    <div className="container flex justify-end">
                      <Button type="submit" className="my-4 w-full h-16">
                        Update Quest
                      </Button>
                    </div>
                  </div>

                </div>
              </TabsContent>
              <TabsContent value="Duration" className="mt-0 border-0 p-0">
                <div className="container my-4 space-y-4">
                  <div className="flex items-end space-x-4">
                    <FormField
                      control={form.control}
                      name="activation"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Activation Block</FormLabel>
                          <FormControl>
                            <Input placeholder={'Block height the quest will start.'} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" className="text-sm text-primary-foreground">Update</Button>
                  </div>
                  <div className="flex items-end space-x-4">
                    <FormField
                      control={form.control}
                      name="expiration"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Expiration Block</FormLabel>
                          <FormControl>
                            <Input placeholder={'Block height the quest will end. Leave as default value for unlimited duration.'} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" className="text-sm text-primary-foreground">Update</Button>
                  </div>

                </div>
              </TabsContent>
              <TabsContent value="Rewards" className="mt-0 border-0 p-0">
                <div className="container my-4 space-y-4">

                  <div className="flex items-end space-x-4">
                    <FormField
                      control={form.control}
                      name="reward_stx"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Token Rewards (µSTX)</FormLabel>
                          <FormControl>
                            <Input placeholder={'Amount of STX tokens a user will get for completing the quest. Units are in micro-STX. There are 1,000,000 µSTX per 1 STX.'} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" className="text-sm text-primary-foreground" onClick={updateQuestStxRewards}>Update</Button>
                    <Button type="button" className="text-sm text-primary-foreground whitespace-nowrap" onClick={depositQuestRewards}>Deposit {(form.watch().reward_stx * form.watch().maxcompletions * feePercentage) / 1000000} STX</Button>
                  </div>

                  {/* <DepositForm /> */}

                  <div className="flex items-end space-x-4">
                    <FormField
                      control={form.control}
                      name="maxcompletions"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Maximum Number of Completions</FormLabel>
                          <FormControl>
                            <Input placeholder={'Total amount of times can be completed by all users. Individually, users can only complete the quest once.'} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" className="text-sm text-primary-foreground" onClick={updateQuestMaxCompletions}>Update</Button>
                  </div>

                  <p className="text-sm font-medium">Total cost to fund quest:
                    <span>{(form.watch().reward_stx * form.watch().maxcompletions * feePercentage) / 1000000} STX</span>
                  </p>

                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </Layout>
  )
}

type Props = any

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {

  const quest = await getQuestById(params?.id as string)
  const networks = await getAllNetworks()
  const guilds = await getAllGuilds()
  const imageUrls = await getQuestImageUrls(params?.id as string)

  // convert quest.description from a array of string to a single string with line breaks
  quest.description = JSON.parse(quest.description).join('\n\n')

  quest.objectives = JSON.parse(quest.objectives)[0].text


  return {
    props: {
      quest,
      networks,
      guilds,
      ...imageUrls
    },
    revalidate: 60
  };
};

export const getStaticPaths = () => {
  return {
    paths: [
      { params: { id: '169311427' } },
    ],
    fallback: true
  };
}

